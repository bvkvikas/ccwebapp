module "module1" {
  source = "../"

region              = "${var.region}"
cidr_block          = "${var.cidr_block}"
vpcname             = "${var.vpcname}"
subnet_cidr_block_1 = "${var.subnet_cidr_block_1}"
subnet_cidr_block_2 = "${var.subnet_cidr_block_2}"
subnet_cidr_block_3 = "${var.subnet_cidr_block_3}"
subnet1             = "${var.subnet1}"
subnet2             = "${var.subnet2}"
subnet3             = "${var.subnet3}"
routeTableName      = "${var.routeTableName}"
internetGateway     = "${var.internetGateway}" 
subnetGroupName     = "${var.subnetGroupName}"
dbSecurityGroupName = "${var.dbSecurityGroupName}"
bucketname          = "${var.bucketname}"
ec2instanceName     = "${var.ec2instanceName}"
tableName           = "${var.tableName}"
ami_id              = "${var.ami_id}"

}