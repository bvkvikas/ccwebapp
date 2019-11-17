#!/bin/bash


cd /home/centos/node-app/assignment2
sudo cp ./RecipeOnTheGo.service /etc/systemd/system/RecipeOnTheGo.service
sudo systemctl start RecipeOnTheGo
sudo systemctl status RecipeOnTheGo
echo "Started the service"
