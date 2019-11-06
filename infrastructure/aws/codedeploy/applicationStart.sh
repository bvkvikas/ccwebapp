#!/bin/bash

cd /home/centos/node-app/assignment2
bash /home/centos/environment.sh
echo "setup env"
echo $PORT
npm start &
echo $! > server.pid