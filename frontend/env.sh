#!/bin/sh
# line endings must be \n, not \r\n !
echo "window.__env__ = {" > ./env-config.js
cat .env | while read line
    do
        eval Eline=$line
        echo $Eline
    done | awk -F '=' '{ print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' >> ./env-config.js
echo "}" >> ./env-config.js
