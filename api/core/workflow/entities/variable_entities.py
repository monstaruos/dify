from typing import TYPE_CHECKING

from pydantic import BaseModel

if TYPE_CHECKING:
    from core.workflow.entities.variable_pool import ValueType


class VariableSelector(BaseModel):
    """
    Variable Selector.
    """
    variable: str
    value_selector: list[str]


class GlobalVariable(BaseModel):
    """
    Global Variable.
    """
    name: str
    value: str
    value_type: "ValueType"
    is_secret: bool
    exportable: bool
