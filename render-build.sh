#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
pip install -r requirements.txt
npx puppeteer browsers install chrome
