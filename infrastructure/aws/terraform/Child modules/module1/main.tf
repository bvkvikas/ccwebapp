module "my_vpc" {
  source = "../../Networking"

  cidr_block          = "${var.cidr_block}"
  vpcname             = "${var.vpcname}"
  subnet_cidr_block_1 = "${var.subnet_cidr_block_1}"
  subnet_cidr_block_2 = "${var.subnet_cidr_block_2}"
  subnet_cidr_block_3 = "${var.subnet_cidr_block_3}"
  routetableName      = "${var.routetableName}"
  internetGateway     = "${var.internetGateway}"

}

module "my_ec2" {
  source = "../../Application"

  vpc_id             = "${module.my_vpc.vpc_id}"
  subnet2_id         = "${module.my_vpc.public_subnet_id2}"
  subnet3_id         = "${module.my_vpc.public_subnet_id3}"
  ami_id             = "${var.ami_id}"
  codedeployS3Bucket = "${var.codedeployS3Bucket}"
  dbSubnetGroupName  = "${var.dbSubnetGroupName}"
  bucketName         = "${var.bucketName}"
  dynamodbName       = "${var.dynamodbName}"

}
