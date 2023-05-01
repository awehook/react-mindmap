FROM python:3.9.15

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN pip install .
CMD python -m reactmindmap.run
