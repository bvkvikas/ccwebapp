#!/bin/bash

# sudo systemctl stop tomcat.service

# sudo rm -rf /opt/tomcat/webapps/docs  /opt/tomcat/webapps/examples /opt/tomcat/webapps/host-manager  /opt/tomcat/webapps/manager /opt/tomcat/webapps/ROOT

# sudo chown tomcat:tomcat /opt/tomcat/webapps/ROOT.war

# # cleanup log files
# sudo rm -rf /opt/tomcat/logs/catalina*
# sudo rm -rf /opt/tomcat/logs/*.log
# sudo rm -rf /opt/tomcat/logs/*.txt


cd /home/centos/node-app/assignment2
npm install > ./npm-install.log 2>&1
wget https://s3.amazonaws.com/amazoncloudwatch-agent/centos/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/node-app/assignment2/cloudwatch-agent-config.json -s