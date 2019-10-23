provider "aws" {
  region = "${var.region}"
}

resource "aws_vpc" "vpc12" {
  cidr_block                     = "${var.cidr_block}"
  enable_dns_hostnames           = true
  enable_classiclink_dns_support = false
  tags = {
    vpcname = "${var.vpcname}"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "subnet1" {
  vpc_id            = "${aws_vpc.vpc12.id}"
  cidr_block        = "${var.subnet_cidr_block_1}"
  availability_zone = "${data.aws_availability_zones.available.names[0]}"
  tags = {
    vpcname = "${var.vpcname}"
  }
}

resource "aws_subnet" "subnet2" {
  vpc_id            = "${aws_vpc.vpc12.id}"
  cidr_block        = "${var.subnet_cidr_block_2}"
  availability_zone = "${data.aws_availability_zones.available.names[1]}"
  tags = {
    vpcname = "${var.vpcname}"
  }
}

resource "aws_subnet" "subnet3" {
  vpc_id            = "${aws_vpc.vpc12.id}"
  cidr_block        = "${var.subnet_cidr_block_3}"
  availability_zone = "${data.aws_availability_zones.available.names[2]}"
  tags = {
    vpcname = "${var.vpcname}"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = "${aws_vpc.vpc12.id}"
  tags = {
    vpcname = "${var.vpcname}"
  }
}

resource "aws_route_table" "routetable" {
  vpc_id = "${aws_vpc.vpc12.id}"
  tags = {
    vpcname = "${var.vpcname}"
  }
}

resource "aws_route_table_association" "r1" {
  subnet_id      = "${aws_subnet.subnet1.id}"
  route_table_id = "${aws_route_table.routetable.id}"
}

resource "aws_route_table_association" "r2" {
  subnet_id      = "${aws_subnet.subnet2.id}"
  route_table_id = "${aws_route_table.routetable.id}"
}

resource "aws_route_table_association" "r3" {
  subnet_id      = "${aws_subnet.subnet3.id}"
  route_table_id = "${aws_route_table.routetable.id}"
}

resource "aws_route" "route" {
  route_table_id         = "${aws_route_table.routetable.id}"
  destination_cidr_block = "${var.destination_cidr_block}"
  gateway_id             = "${aws_internet_gateway.gw.id}"
}
resource "aws_security_group" "application_security_group" {
  name        = "application_security_group"
  description = "Application security group"
  vpc_id      = "${aws_vpc.vpc12.id}"

  ingress {
    from_port   = 3005
    to_port     = 3005
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

  }
}
resource "aws_db_subnet_group" "rds_sn" {
  name       = "rds_subnet_group"
  subnet_ids = ["${aws_subnet.subnet2.id}", "${aws_subnet.subnet3.id}"]

  tags = {
    Name = "DB subnet group"
  }
}
# resource "aws_db_security_group" "rds_sg" {
#   name = "rds_sg"
#   ingress {
#     security_group_name = "${aws_security_group.application_security_group.name}"
#   }
#   tags = {
#     Name = "RDS security group"
#   }
# }

resource "aws_db_instance" "rds" {
  allocated_storage    = 20
  identifier           = "csye6225-fall2019"
  multi_az             = false
  db_subnet_group_name = "${aws_db_subnet_group.rds_sn.name}"
  engine               = "postgres"
  engine_version       = "11.5"
  instance_class       = "db.t2.micro"
  name                 = "thunderstorm"
  username             = "thunderstorm"
  password             = "thunderstorm_123"

}

resource "aws_s3_bucket" "s3" {

  bucket = "dev.recipeonthego.me"
  acl    = "private"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "aws:kms"
      }
    }
  }
  tags = {
    Name        = "dev.recipeonthego.me"
    Environment = "dev"
  }
}

resource "aws_instance" "instance" {
  ami           = "${var.ami_id}"
  instance_type = "t2.micro"
  root_block_device {
    volume_type = "gp2"
    volume_size = 20
  }
  tags = {
    Name = "terraform_ec2_instance"
  }
}
