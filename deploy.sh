#!/bin/bash
#
# Builds and deploys the project to github pages
#
# Usage:
#   ./deploy.sh

# Build jekyll static site
jekyll build

# Clean build repo and copy _site compiled files over
rm -rf ../alex-espinoza.github.io/*
cp -r _site/* ../alex-espinoza.github.io

# Commit and push
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
cd ../alex-espinoza.github.io
git checkout master
git add -A
git commit -m "Updated site at $timestamp"
git push origin master
