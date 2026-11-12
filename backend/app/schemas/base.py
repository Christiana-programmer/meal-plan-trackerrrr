import re

from pydantic import BaseModel, ConfigDict


def to_camel(value: str) -> str:
    return re.sub(r"_([a-z])", lambda match: match.group(1).upper(), value)


class ApiSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        populate_by_name=True,
    )
