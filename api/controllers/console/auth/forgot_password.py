import base64
import logging
import secrets

from flask import request
from flask_restful import Resource, reqparse

from configs import dify_config
from constants.languages import languages
from controllers.console import api
from controllers.console.auth.error import (
    EmailCodeError,
    InvalidEmailError,
    InvalidTokenError,
    PasswordMismatchError,
    PasswordResetRateLimitExceededError,
)
from controllers.console.error import NotAllowedRegister
from controllers.console.setup import setup_required
from extensions.ext_database import db
from libs.helper import email, get_remote_ip
from libs.password import hash_password, valid_password
from models.account import Account
from services.account_service import AccountService
from services.errors.account import RateLimitExceededError


class ForgotPasswordSendEmailApi(Resource):
    @setup_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("email", type=email, required=True, location="json")
        args = parser.parse_args()

        account = Account.query.filter_by(email=args["email"]).first()
        token = None
        if account is None:
            if dify_config.ALLOW_REGISTER:
                token = AccountService.send_reset_password_email(email=args["email"])
            else:
                raise NotAllowedRegister()
        elif account:
            try:
                token = AccountService.send_reset_password_email(account=account, email=args["email"])
            except RateLimitExceededError:
                logging.warning(f"Rate limit exceeded for email: {args['email']}")
                raise PasswordResetRateLimitExceededError()

        return {"result": "success", "data": token}


class ForgotPasswordCheckApi(Resource):
    @setup_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("email", type=str, required=True, location="json")
        parser.add_argument("code", type=str, required=True, location="json")
        parser.add_argument("token", type=str, required=True, nullable=False, location="json")
        args = parser.parse_args()

        user_email = args["email"]

        token_data = AccountService.get_reset_password_data(args["token"])
        if token_data is None:
            raise InvalidTokenError()

        if user_email != token_data.get("email"):
            raise InvalidEmailError()

        if args["code"] != token_data.get("code"):
            raise EmailCodeError()

        return {"is_valid": True, "email": token_data.get("email")}


class ForgotPasswordResetApi(Resource):
    @setup_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("token", type=str, required=True, nullable=False, location="json")
        parser.add_argument("new_password", type=valid_password, required=True, nullable=False, location="json")
        parser.add_argument("password_confirm", type=valid_password, required=True, nullable=False, location="json")
        args = parser.parse_args()

        new_password = args["new_password"]
        password_confirm = args["password_confirm"]

        if str(new_password).strip() != str(password_confirm).strip():
            raise PasswordMismatchError()

        token = args["token"]
        reset_data = AccountService.get_reset_password_data(token)

        if reset_data is None:
            raise InvalidTokenError()

        AccountService.revoke_reset_password_token(token)

        salt = secrets.token_bytes(16)
        base64_salt = base64.b64encode(salt).decode()

        password_hashed = hash_password(new_password, salt)
        base64_password_hashed = base64.b64encode(password_hashed).decode()

        account = Account.query.filter_by(email=reset_data.get("email")).first()
        if account:
            account.password = base64_password_hashed
            account.password_salt = base64_salt
            db.session.commit()
        else:
            account = AccountService.create_account_and_tenant(
                email=reset_data.get("email"),
                name=reset_data.get("email"),
                password=password_confirm,
                interface_language=languages[0],
            )

        token = AccountService.login(account, ip_address=get_remote_ip(request))

        return {"result": "success", "data": token}


api.add_resource(ForgotPasswordSendEmailApi, "/forgot-password")
api.add_resource(ForgotPasswordCheckApi, "/forgot-password/validity")
api.add_resource(ForgotPasswordResetApi, "/forgot-password/resets")
