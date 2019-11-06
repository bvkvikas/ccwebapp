
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
  default = ["test-subnet2", "test-subnet3"]
}





variable "dbSubnetGroupName" {
  type    = "string"
  default = "test-dbSubnetGroup"
}


variable "bucketName" {
  type    = "string"
  default = "dev.thunderstorm.me"
}

variable "test_bucketName" {
  type    = "string"
  default = "dev.thunderstorm12.me"
}

variable "ec2instanceName" {
  type    = "string"
  default = "test-ec2instance"
}


variable "dynamodbName" {
  type    = "string"
  default = "test-table"
}



variable "codedeployS3Bucket" {
  type    = "string"
  default = "blah"
}
variable "accountId" {
  type    = "string"
  default = "blah"
}

variable "codeDeployApplicationName" {
  type    = "string"
  default = "blah"
}

variable "codeDeployApplicationGroup" {
  type    = "string"
  default = "blah"
}


variable "ami_id" {
  type    = "string"
  default = ""
}
variable "key_name" {
  type    = "string"
  default = ""
}

variable "aws_circleci_user_name" {
  type = "string"
}
