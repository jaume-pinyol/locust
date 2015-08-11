#!/bin/bash
ASGName=$1
REGION=$2
INSTANCES=$(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-name $ASGName --region $REGION | grep -i instanceid  | awk '{ print $2}' | cut -d',' -f1| sed -e 's/"//g')
for i in $INSTANCES;
do
aws ec2 describe-instances --instance-ids $i --region $REGION| grep -i PrivateIpAddress | awk '{ print $2 }' | head -1 | cut -d"," -f1 | cut -f2 -d'"'
done;
