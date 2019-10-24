
variable "region" {
  type    = "string"
  default = "us-east-1"
}

variable "vpc_id" {
  type    = "string"
  default = ""
}

variable "subnet2_id" {
  type    = "string"
  default = ""
}
variable "subnet3_id" {
  type    = "string"
  default = ""
}

variable "subnet_ids" {
  type    = "list"
  default = ["test-subnet2","test-subnet3"]
}

variable "key_name" {
  type    = "string"
  default = ""
}


#Application Stack reference Variable

variable "ami_id" {
  type    = "string"
  default = ""
}


variable "dbSubnetGroupName" {
  type    = "string"
  default = "test-dbSubnetGroup"
}


variable "bucketName" {
  type    = "string"
  default = "dev.thunderstorm.me"
}


variable "ec2instanceName" {
  type    = "string"
  default = "test-ec2instance"
}


variable "dynamodbName" {
  type    = "string"
  default = "test-table"
}
