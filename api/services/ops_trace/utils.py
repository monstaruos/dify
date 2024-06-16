from contextlib import contextmanager
from datetime import datetime

from extensions.ext_database import db
from models.model import Message


def filter_none_values(data: dict):
    for key, value in data.items():
        if value is None:
            continue
        if isinstance(value, datetime):
            data[key] = value.isoformat()
    return {key: value for key, value in data.items() if value is not None}


def get_message_data(message_id):
    return db.session.query(Message).filter(Message.id == message_id).first()


@contextmanager
def measure_time():
    timing_info = {'start': datetime.now(), 'end': None}
    try:
        yield timing_info
    finally:
        timing_info['end'] = datetime.now()
        print(f"Execution time: {timing_info['end'] - timing_info['start']}")