#!/bin/bash

mkdir -p /opt/$1
rm -rf /opt/$1/*.pyc
croncmd="aws s3 sync s3://$1 /opt/$1"
#cat <(crontab -l) <(echo "*/2 * * * * $command") | crontab -
eval $croncmd
