#!/bin/bash
set -e

sudo yum clean all
sleep 1
sudo yum -y install nc rsyslog unzip chkconfig vim wget sysstat git
sleep 1

#For security reasons update usermode https://alas.aws.amazon.com/ALAS-2015-572.html
sudo yum update -y usermode

# Install AWS tools
sudo yum -y install aws-amitools-ec2.noarch wget aws-cli.noarch gcc gcc-c++
sleep 1

sudo chmod 644 /etc/sysctl.conf
sudo chown root:root /etc/sysctl.conf

sudo chmod 755 /usr/local/bin/*

#Install pip
#sudo pip install --upgrade pip
sudo pip install pyzmq
#sudo pip install locustio

sudo pip install https://github.com/jaume-pinyol/locust/zipball/master
cd /tmp && tar -xzvf locust.tar.gz
cd locust
sudo python setup.py build
sudo python setup.py install


sleep 1
