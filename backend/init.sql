DROP TABLE IF EXISTS mindmap;
CREATE TABLE mindmap
(
    time datetime NOT NULL,
    json text NOT NULL,
    version CHAR(32) NOT NULL,
    parentVersion CHAR(32) NULL
)