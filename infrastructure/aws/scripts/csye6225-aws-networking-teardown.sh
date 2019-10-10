#!/bin/bash

set -e

region=$1
vpcname=$2

if [ -z "$region" ] || [ -z "$vpcname" ]; then
   echo "Invalid arguments provided."
   exit 1
fi

echo "Deleting the resources for the VPC $vpcname"

vpcid=""
vpcid=$( aws ec2 describe-vpcs --filters Name="tag:vpcname",Values="$vpcname" --region "$region" | jq -r '.Vpcs[0].VpcId' )
if [ "$vpcid" == "null" ]; then
	echo "VPC with name '$vpcname' does not exist"
	exit 1
fi

internetGatewayId=$(aws ec2 describe-internet-gateways --filters Name="tag:vpcname",Values="$vpcname" | jq -r ".InternetGateways[0].InternetGatewayId")

subnetId1=$(aws ec2 describe-subnets --filters Name="tag:vpcname",Values="$vpcname" | jq -r ".Subnets[0].SubnetId")
subnetId2=$(aws ec2 describe-subnets --filters --filters Name="tag:vpcname",Values="$vpcname" | jq -r ".Subnets[1].SubnetId")
subnetId3=$(aws ec2 describe-subnets --filters --filters Name="tag:vpcname",Values="$vpcname" | jq -r ".Subnets[2].SubnetId")

routeTableId=$(aws ec2 describe-route-tables --filters Name="tag:vpcname",Values="$vpcname" | jq -r ".RouteTables[0].RouteTableId")
associationId1=$(aws ec2 describe-route-tables --filters Name="tag:vpcname",Values="$vpcname" | jq -r ".RouteTables[0].Associations[0].RouteTableAssociationId")
associationId2=$(aws ec2 describe-route-tables --filters Name="tag:vpcname",Values="$vpcname" | jq -r ".RouteTables[0].Associations[1].RouteTableAssociationId")
associationId3=$(aws ec2 describe-route-tables --filters Name="tag:vpcname",Values="$vpcname" | jq -r ".RouteTables[0].Associations[2].RouteTableAssociationId")

aws ec2 disassociate-route-table --association-id "$associationId1"
aws ec2 disassociate-route-table --association-id "$associationId2"
aws ec2 disassociate-route-table --association-id "$associationId3"

# Delete resources
echo "Deleting the Route Table : $routeTableId"
aws ec2 delete-route-table --route-table-id "$routeTableId"

echo "Deleting the subnets : $subnetId3, $subnetId2, $subnetId1"
aws ec2 delete-subnet --subnet-id "$subnetId3"
aws ec2 delete-subnet --subnet-id "$subnetId2"
aws ec2 delete-subnet --subnet-id "$subnetId1"

echo "Deleting the InternetGateway : $internetGatewayId"
aws ec2 detach-internet-gateway --internet-gateway-id "$internetGatewayId" --vpc-id "$vpcid"
aws ec2 delete-internet-gateway --internet-gateway-id "$internetGatewayId"

echo "Deleting the VPC : $vpcid"
aws ec2 delete-vpc --vpc-id "$vpcid"

echo "Deleted all the resources!! Peace!!"