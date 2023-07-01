from datetime import datetime
from typing import Optional

from abc import ABCMeta, abstractmethod
from reactmindmap.databases.model.graph import DataRow


class IDbConnection(metaclass=ABCMeta):

    @abstractmethod
    def pull(self) -> Optional[DataRow]:
        pass

    @abstractmethod
    def push(self, jsonStr: str, timestamp: Optional[datetime]=None, version: Optional[str]=None, parentVersion: Optional[str]=None) -> None:
        pass
