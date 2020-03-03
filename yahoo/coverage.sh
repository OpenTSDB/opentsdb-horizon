#!/bin/bash

[ -z "$SOURCE_DIR" ] && SOURCE_DIR=`pwd`
echo $SOURCE_DIR
cp -R ${SOURCE_DIR}/coverage ${SOURCE_DIR}/artifacts/

