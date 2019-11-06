#!/bin/bash

cd /home/centos/node-app/assignment2
sudo cp ./RecipeOnTheGo.service /etc/systemd/system/RecipeOnTheGo.service
sudo systemctl start RecipeOnTheGo
sudo systemctl status RecipeOnTheGo
echo "Started the service"
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/node-app/assignment2/cloudwatch-agent-config.json -s
