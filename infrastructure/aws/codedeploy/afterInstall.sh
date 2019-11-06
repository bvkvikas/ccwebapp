#!/bin/bash

# sudo systemctl stop tomcat.service

# sudo rm -rf /opt/tomcat/webapps/docs  /opt/tomcat/webapps/examples /opt/tomcat/webapps/host-manager  /opt/tomcat/webapps/manager /opt/tomcat/webapps/ROOT

# sudo chown tomcat:tomcat /opt/tomcat/webapps/ROOT.war

# # cleanup log files
# sudo rm -rf /opt/tomcat/logs/catalina*
# sudo rm -rf /opt/tomcat/logs/*.log
# sudo rm -rf /opt/tomcat/logs/*.txt

echo host=${aws_db_instance.rds.address} >> .env
echo RDS_CONNECTION_STRING=${aws_db_instance.rds.address} >> .env
echo RDS_USER_NAME=thunderstorm >> .env
echo RDS_PASSWORD=thunderstorm_123 >> .env
echo RDS_DB_NAME=thunderstorm >> .env
echo PORT=3005 >> .env
echo S3_BUCKET_NAME=${var.bucketName} >> .env
echo bucket=${var.codedeployS3Bucket} >> .env
chmod 777 .env
cd /home/centos/node-app/assignment2
npm install > ./npm-install.log 2>&1
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/node-app/assignment2/cloudwatch-agent-config.json -s