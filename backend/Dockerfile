FROM python:3.9.15

WORKDIR /app
COPY requirements.txt .
RUN pip install -i https://pypi.doubanio.com/simple/  -r requirements.txt
COPY . .
CMD python evernoteClient.py
