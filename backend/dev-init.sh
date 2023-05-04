#!/bin/bash
python -m .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pip install -r requirements-dev.txt