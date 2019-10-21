
variable "region" {
  type    = "string"
  default = "us-east-1"
}

variable "profile"{
  type = "string"
}

variable "cidr_block" {
  type    = "string"
  default = "10.0.0.0/16"
}


variable "subnet_cidr_block_1" {
  type    = "string"
  default = "10.0.1.0/24"

}

variable "subnet_cidr_block_2" {
  type    = "string"
  default = "10.0.2.0/24"
}

variable "subnet_cidr_block_3" {
  type    = "string"
  default = "10.0.3.0/24"
}

variable "vpcname" {
  type    = "string"
  default = "testvpc"
}

variable "internetGateway"{
  type    = "string"
  default = "testGW"
}

variable "subnet1" {
  type    = "string"
  default = "sub1"
}

variable "subnet2" {
  type    = "string"
  default = "sub2"
}

variable "subnet3" {
  type    = "string"
  default = "sub3"
}

variable "routeTableName"{
   type    = "string"
  default = "routeTable"
}

variable "destination_cidr_block" {
  type    = "string"
  default = "0.0.0.0/0"
}

variable "ami_id" {
  type    = "string"
  default = ""
}

variable "subnetGroupName"{
  type    = "string"
  default = "test-sub-group"
}

variable "dbSecurityGroupName"{
  type    = "string"
  default = "test-sub-group"
}

variable "bucketname"{
  type    = "string"
  default = "dev.thunderstorm.me"
}

variable "ec2instanceName"{
  type    = "string"
  default = "testec2"
}

variable "tableName"{
  type    = "string"
  default = "testtable"
}

