#!/bin/bash

set -e

region=$1
vpccidr=$2
subnetcidr1=$3
subnetcidr2=$4
subnetcidr3=$5
vpcname=$6

if [ -z "$region" ] || [ -z "$vpccidr" ] || [ -z "$subnetcidr1" ] || [ -z "$subnetcidr2" ] || [ -z "$subnetcidr3" ] || [ -z "$vpcname" ]; then
   echo "Invalid arguments provided"
   exit 1
fi


existingvpcid=""
existingvpcid=$( aws ec2 describe-vpcs --filters Name="tag:vpcname",Values="$vpcname" --region "$region" | jq -r '.Vpcs[0].VpcId' )
if [ "$existingvpcid" != "null" ]; then
	echo "VPC with name '$vpcname' already exists with ID : '$existingvpcid'"
	exit 1
fi

vpcid=$( aws ec2 create-vpc --cidr-block "$vpccidr" --region "$region" | jq -r ".Vpc.VpcId" )
aws ec2 create-tags --resources "$vpcid" --region "$region" --tags Key="vpcname",Value="$vpcname"
echo "Created a VPC with ID : $vpcid successfully."
sleep 10


# Get availability zones
az1=$( aws ec2 describe-availability-zones --region "$region" | jq -r ".AvailabilityZones[0].ZoneName" )
az2=$( aws ec2 describe-availability-zones --region "$region" | jq -r ".AvailabilityZones[1].ZoneName" )
az3=$( aws ec2 describe-availability-zones --region "$region" | jq -r ".AvailabilityZones[2].ZoneName" )

echo "Creating Subnets with AZs : $az1, $az2, $az3"

# Create Subnets
subnetId1=$(aws ec2 create-subnet --vpc-id "$vpcid" --cidr-block "$subnetcidr1" --availability-zone "$az1" --region "$region" | jq -r ".Subnet.SubnetId")
subnetId2=$(aws ec2 create-subnet --vpc-id "$vpcid" --cidr-block "$subnetcidr2" --availability-zone "$az2" --region "$region" | jq -r ".Subnet.SubnetId")
subnetId3=$(aws ec2 create-subnet --vpc-id "$vpcid" --cidr-block "$subnetcidr3" --availability-zone "$az3" --region "$region" | jq -r ".Subnet.SubnetId")
aws ec2 create-tags --resources "$subnetId1" --region "$region" --tags Key="vpcname",Value="$vpcname"
aws ec2 create-tags --resources "$subnetId2" --region "$region" --tags Key="vpcname",Value="$vpcname"
aws ec2 create-tags --resources "$subnetId3" --region "$region" --tags Key="vpcname",Value="$vpcname"

echo "Created Subnets with IDs : $subnetId1, $subnetId2, $subnetId3"

# Create Internet Gateway
gatewayId=$(aws ec2 create-internet-gateway --region "$region" | jq -r .InternetGateway.InternetGatewayId )
aws ec2 create-tags --resources "$gatewayId" --region "$region" --tags Key="vpcname",Value="$vpcname"
echo "Created a Gateway with ID: $gatewayId"

aws ec2 attach-internet-gateway --internet-gateway-id "$gatewayId" --vpc-id "$vpcid" --region "$region" 
echo "Attached the Gateway to VPC"

routeTableId=$(aws ec2 create-route-table --vpc-id "$vpcid" --region "$region" | jq -r ".RouteTable.RouteTableId" )
aws ec2 create-tags --resources "$routeTableId" --region "$region" --tags Key="vpcname",Value="$vpcname"
echo "Created a RouteTable with ID : $routeTableId"

# Associate subnets with Route tables
aws ec2 associate-route-table --route-table-id "$routeTableId" --subnet-id "$subnetId1" --region "$region" 
aws ec2 associate-route-table --route-table-id "$routeTableId" --subnet-id "$subnetId2" --region "$region" 
aws ec2 associate-route-table --route-table-id "$routeTableId" --subnet-id "$subnetId3" --region "$region" 

echo "Attached the route table with Subnets"

aws ec2 create-route --route-table-id "$routeTableId" --destination-cidr-block 0.0.0.0/0 --gateway-id "$gatewayId" --region "$region" 

echo "Successfully created all the resources!!"