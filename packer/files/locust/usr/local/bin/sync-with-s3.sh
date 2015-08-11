#!/bin/bash

mkdir -p /opt/$1
croncmd="aws s3 sync s3://$1 /opt/locust-tests"
#cat <(crontab -l) <(echo "*/2 * * * * $command") | crontab -
eval $croncmd
