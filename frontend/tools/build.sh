#!/bin/bash
echo "let versionId = \"$(date +%s)\";" > version.js;
cat abilities/*.js ai/*.js characters/*.js units/*.js rooms/*.js adventures/*.js > data.js
