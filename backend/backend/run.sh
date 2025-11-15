#!/usr/bin/env bash
set -euo pipefail
export FLASK_APP=app
export FLASK_ENV=development
python -m flask run --host=127.0.0.1 --port=5000 --debug
