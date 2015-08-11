#!/bin/bash

LOCUST_TAG="Locust"
MASTER_HOST_TAG="master-asg"
TEST_FOLDER="/opt/locust-tests"
REGION=
LOCUST_LOG=/var/log/locust.log

INSTANCE_ID="`wget -qO- http://instance-data/latest/meta-data/instance-id`"
REGION="`wget -qO- http://instance-data/latest/meta-data/placement/availability-zone | sed -e 's:\([0-9][0-9]*\)[a-z]*\$:\\1:'`"
LOCUST_TAG_VALUE="`aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=$LOCUST_TAG" --region $REGION --output=text | cut -f5`"
LOCUST_ARGS=""
echo $LOCUST_TAG_VALUE

if [ "$LOCUST_TAG_VALUE" == "slave" ]; then
  MASTER_HOST_TAG_VALUE="`aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=$MASTER_HOST_TAG" --region $REGION --output=text | cut -f5`"
  LOCUST_MASTER_IP=$(/usr/local/bin/get_asg_instances.sh $MASTER_HOST_TAG_VALUE $REGION)
  LOCUST_ARGS="--test-folder $TEST_FOLDER --slave --master-host=$LOCUST_MASTER_IP --host=www.example.com"
else
  LOCUST_ARGS="--test-folder $TEST_FOLDER --master --host=www.example.com"
fi
echo "ARGS $LOCUST_ARGS"

ulimit -n 102400
ulimit -l 131072
ulimit -c "unlimited"
echo 1 > /proc/sys/net/ipv4/tcp_tw_reuse
nohup /usr/local/bin/locust $LOCUST_ARGS > $LOCUST_LOG &
