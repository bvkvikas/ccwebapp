#!/bin/bash

cd /home/centos/node-app/assignment2
nohup node app.js >> app.log 2>&1 &
pwd