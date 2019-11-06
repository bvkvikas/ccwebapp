#!/bin/bash

cd /home/centos/node-app/assignment2
echo host=${aws_db_instance.rds.address} >> /etc/profile
echo RDS_CONNECTION_STRING=${aws_db_instance.rds.address} >> /etc/profile
echo RDS_USER_NAME=thunderstorm >> .env
echo RDS_PASSWORD=thunderstorm_123 >> .env
echo RDS_DB_NAME=thunderstorm >> .env
echo PORT=3005 >> .env
echo S3_BUCKET_NAME=${var.bucketName} >> .env
echo bucket=${var.codedeployS3Bucket} >> .env
npm start > ./app.log 2>&1
pwd