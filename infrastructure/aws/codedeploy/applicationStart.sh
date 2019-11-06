#!/bin/bash

cd /home/centos/node-app/assignment2
nohup node app.js >> app.log 2>&1 &
pwd
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/cloudwatch-agent-config.json -s