from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional


@dataclass
class Evernote:
    topicKey: str
    guid: str
    title: str


@dataclass
class Note:
    content: Optional[str]
    deleted: Optional[bool]
    guid: str
    notebookGuid: str
    title: str
    updated: int


@dataclass
class AllNotes:
    notes: List[Note]
    cur: int
    notebooks: Dict


@dataclass
class TopicReference:
    reference: Dict[str, Dict[str, List[str]]]


@dataclass
class Jupyter:
    path: str


@dataclass
class ExtData:
    evernote: Dict[str, Evernote]
    allnotes: AllNotes
    allowCrossLevelSearch: bool
    copyAndPastePlugin: Dict
    TOPIC_REFERENCE: TopicReference
    jupyter: Dict[str, Jupyter]


@dataclass
class Block:
    type: str
    data: str


@dataclass
class Topic:
    key: str
    parentKey: str
    subKeys: List[str]
    collapse: bool
    style: Optional[str]
    blocks: List[Block]


@dataclass
class Theme:
    name: str
    randomColor: bool
    background: str
    highlightColor: str
    marginH: int
    marginV: int
    contentStyle: Dict[str, str]
    linkStyle: Dict[str, str]
    rootTopic: Dict[str, Dict[str, str]]
    primaryTopic: Dict[str, Dict[str, str]]
    normalTopic: Dict[str, Dict[str, str]]


@dataclass
class Config:
    readOnly: bool
    allowUndo: bool
    layoutDir: int
    theme: Theme


@dataclass
class Graph:
    rootTopicKey: str
    editorRootTopicKey: str
    focusKey: str
    extData: ExtData
    topics: List[Topic]
    config: Config
    formatVersion: str

@dataclass
class PartialDataRow:
    jsonStr: str
    version: str
    parentVersion: Optional[str]

@dataclass
class DataRow(PartialDataRow):
    time: datetime