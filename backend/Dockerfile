FROM python:latest

WORKDIR /app
COPY . /app
RUN pip install -i https://pypi.doubanio.com/simple/  -r requirements.txt
CMD python evernoteClient.py
