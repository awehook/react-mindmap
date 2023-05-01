from typing import Optional, TypeVar

U = TypeVar('U')

def nn(obj: Optional[U]) -> U:
    assert obj is not None
    return obj