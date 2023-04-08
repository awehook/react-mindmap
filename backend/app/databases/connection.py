from typing import Optional

class DbConnection:
    def pull(self) -> Optional[dict]:
        raise NotImplemented

    def push(self, json: str) -> None:
        raise NotImplemented