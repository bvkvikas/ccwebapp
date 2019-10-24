
resource "aws_security_group" "application_security_group" {
  name        = "application_security_group"
  description = "Application security group"
  vpc_id      = "${var.vpc_id}"

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
  subnet_ids = ["${var.subnet2_id}", "${var.subnet3_id}"]

  tags = {
    Name = "${var.dbSubnetGroupName}"
  }
}


resource "aws_security_group" "database" {
  name        = "database_security_group"
  vpc_id      = "${var.vpc_id}"
  description = "allow incoming database connection"
  ingress {
    from_port       = 5432
    protocol        = "tcp"
    security_groups = ["${aws_security_group.application_security_group.id}"]
    to_port         = 5432
    cidr_blocks     = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "rds" {
  allocated_storage      = 20
  identifier             = "csye6225-fall2019"
  multi_az               = false
  db_subnet_group_name   = "${aws_db_subnet_group.rds_sn.name}"
  engine                 = "postgres"
  engine_version         = "11.5"
  instance_class         = "db.t2.micro"
  name                   = "thunderstorm"
  username               = "thunderstorm"
  password               = "thunderstorm_123"
  vpc_security_group_ids = ["${aws_security_group.database.id}"]
  skip_final_snapshot    = true
  publicly_accessible    = true

}

resource "aws_s3_bucket" "s3" {

  bucket        = "${var.bucketName}"
  acl           = "private"
  force_destroy = true

  lifecycle_rule {
    enabled = true
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "aws:kms"
      }
    }
  }
  tags = {
    Name        = "${var.bucketName}"
    Environment = "dev"
  }
}

resource "aws_instance" "instance" {
  ami           = "${var.ami_id}"
  instance_type = "t2.micro"
  key_name      = "${var.key_name}"

  ebs_block_device {
    device_name           = "/dev/sda1"
    volume_type           = "gp2"
    volume_size           = 20
    delete_on_termination = true
  }
  tags = {
    Name = "${var.ec2instanceName}"
  }
  vpc_security_group_ids      = ["${aws_security_group.application_security_group.id}"]
  associate_public_ip_address = true
  source_dest_check           = false
  subnet_id                   = "${var.subnet2_id}"
}

resource "aws_dynamodb_table" "basic-dynamodb-table" {
  name           = "csye6225"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "id"


  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "${var.dynamodbName}"
    Environment = "dev"
  }
}
