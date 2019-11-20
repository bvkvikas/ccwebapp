#!/bin/bash


cd /home/centos/node-app/assignment2
sudo cp ./RecipeOnTheGo.service /etc/systemd/system/RecipeOnTheGo.service
sudo systemctl daemon-reload
sudo systemctl start RecipeOnTheGo
sudo systemctl status RecipeOnTheGo > /tmp/appstart.txt
echo "Started the service"
