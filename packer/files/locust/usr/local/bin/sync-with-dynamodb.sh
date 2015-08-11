#!/bin/bash

results=$(aws dynamodb  scan --table-name $1 --output json --region eu-west-1)

array=( $(echo $results | sed 's/key//g' | sed 's/ value /=/g') )

for var in ${array[@]};
do
         echo ${var}>>/opt/artifactory/prana.properties
done

cat <(crontab -l) <(echo "*/2 * * * * $command") | crontab -

TEST="locustfile.py"
