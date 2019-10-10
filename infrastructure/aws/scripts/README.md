## Instructions to run script
* Clone repository
* Check if Jq is installed or not, Run command "which Jq"
* If Jq is not installed, install it using command "sudo apt-get install jq"
* Now navigate to script folder using command "cd infrastructure/aws/scripts/"
* To setup network infrastructure run shell script  "./csye6225-aws-networking-setup.sh 'region' 'vpccidr' 'subnetcidr1' 'subnetcidr2' 'subnetcidr1' 'vpcname'"
* Example to create network infrastructure "./csye6225-aws-networking-setup.sh us-east-1 10.0.0.1/16 10.0.1.0/24 10.0.2.0/24 10.0.3.0/24 vpc-test1"
* To Teardown network infrastructure run shell script "./csye6225-aws-networking-teardown.sh 'region' 'vpcname'"
* Example Teardown network infrastructure "./csye6225-aws-networking-teardown.sh us-east-1 vpc-test1"
