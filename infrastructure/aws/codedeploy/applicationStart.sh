#!/bin/bash

cd /home/centos/node-app/assignment2
echo "setup env"
echo $PORT
npm start &
echo $! > server.pid