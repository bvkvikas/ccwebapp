region              = "us-east-1"
cidr_block          = "10.0.0.0/16"
subnet_cidr_block_1 = "10.0.1.0/24"
subnet_cidr_block_2 = "10.0.2.0/24"
subnet_cidr_block_3 = "10.0.3.0/24"

####### VERIFY YOUR BUCKET NAME.THIS IS WHERE YOUR IMAGES WILL GO
bucketName = "dev.thunderstorm334.me"

###VERIFY YOUR AMI ID.MAKE SURE YOU USE THE LATEST AMI
ami_id          = "ami-0b358ee740e499838"
vpcname         = "vpc-terraformtest"
subnet1         = "m1-subnet1"
subnet2         = "m1-subnet2"
subnet3         = "m1-subnet3"
routetableName  = "m1-routetable"
internetGateway = "m1-internetGateway"
######GIVE YOUR KEY FROM AMI KEY VALUES. 
key_name = "devami"
######GIVE YOUR CODEDEPLOY BUCKET NAME. NEED TO GIVE THE SAMME IN CIRCLECI
codedeployS3Bucket = "codedeploy.thunderstorm334.me"
######GIVE YOUR LAMBDA BUCKET NAME. NEED TO GIVE THE SAMME IN CIRCLECI
lambdaBucket = "lambda.thunderstorm334.me"
######GIVE YOUR DOMAIN NAME
domainName             = "dev.thunderstorm.me"
aws_circleci_user_name = "circleci"
TTL                    = 5
