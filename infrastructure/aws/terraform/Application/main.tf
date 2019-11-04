
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





data "template_file" "userIamPolicy" {
  template = "${file("${path.module}/userIamPolicy.json")}"
}

resource "aws_iam_user" "Circleci" {
  name = "Circleci"
}

resource "aws_iam_user_policy" "circleci_policy" {
  user   = "${aws_iam_user.Circleci.name}"
  policy = "${data.template_file.userIamPolicy.rendered}"
}


resource "aws_s3_bucket" "codeDeployS3Bucket" {
  bucket        = "${var.codedeployS3Bucket}"
  acl           = "private"
  force_destroy = true
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "aws:kms"
      }
    }
  }
  tags = {
    Name = "${var.codedeployS3Bucket}"
  }

  lifecycle_rule {
    enabled = "true"
    transition {
      days          = 30
      storage_class = "STANDARD_IA" # or "ONEZONE_IA"
    }
  }

}

# resource "aws_s3_bucket_policy" "codeDeployS3BucketPolicy" {
#   bucket = "${aws_s3_bucket.codeDeployS3Bucket.id}"

#   policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Id": "codeDeployS3BucketPolicy",
#   "Statement": [
#     {
#       "Sid": "IPAllow",
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": "s3:*",
#       "Resource": "arn:aws:s3:::${var.codedeployS3Bucket}/*"
#     }
#   ]
# }
# EOF
# }

resource "aws_iam_policy" "CircleCI-Upload-To-S3" {
  name        = "CircleCI-Upload-To-S3"
  description = "CircleCI-Upload-To-S3"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${var.codedeployS3Bucket}/*"
    }
  ]
}
EOF
}


resource "aws_iam_policy" "CircleCI-Code-Deploy" {
  name        = "CircleCI-Code-Deploy"
  description = "CircleCI-Code-Deploy"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:RegisterApplicationRevision",
        "codedeploy:GetApplicationRevision"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.region}:${var.accountId}:application:${var.codeDeployApplicationName}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:CreateDeployment",
        "codedeploy:GetDeployment"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:GetDeploymentConfig"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.region}:${var.accountId}:deploymentconfig:CodeDeployDefault.OneAtATime",
        "arn:aws:codedeploy:${var.region}:${var.accountId}:deploymentconfig:CodeDeployDefault.HalfAtATime",
        "arn:aws:codedeploy:${var.region}:${var.accountId}:deploymentconfig:CodeDeployDefault.AllAtOnce"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_user_policy_attachment" "attachCircleCICodeDeployPolicyToCircleCiUser" {
  user       = "${aws_iam_user.Circleci.name}"
  policy_arn = "${aws_iam_policy.CircleCI-Code-Deploy.arn}"

}
resource "aws_iam_user_policy_attachment" "attachCircleS3PolicyToCircleCiUser" {
  user       = "${aws_iam_user.Circleci.name}"
  policy_arn = "${aws_iam_policy.CircleCI-Upload-To-S3.arn}"
}

resource "aws_iam_policy" "CodeDeployEC2S3" {
  name        = "CodeDeployEC2S3"
  description = "CodeDeployEC2S3"

  policy = <<EOF
{
   "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::${var.codedeployS3Bucket}/*"
        },
        {
          "Action": [
                "s3:Get*",
                "s3:List*"
              ],
              "Effect": "Allow",
              "Resource": ["arn:aws:s3:::${var.codedeployS3Bucket}/*",
                          "arn:aws:s3:::aws-codedeploy-us-east-2/*",
                          "arn:aws:s3:::aws-codedeploy-us-east-1/*"]
              
        }
    ]
}
EOF
}

resource "aws_iam_role" "CodeDeployEC2ServiceRole1" {
  name        = "CodeDeployEC2ServiceRole1"
  description = "Allows EC2 instances to call AWS services on your behalf"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "ec2.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "role1-attach" {
  role       = "${aws_iam_role.CodeDeployEC2ServiceRole1.name}"
  policy_arn = "${aws_iam_policy.CodeDeployEC2S3.arn}"
}
resource "aws_iam_instance_profile" "role1_profile" {
  name = "CodeDeployEC2ServiceRole"
  role = "${aws_iam_role.CodeDeployEC2ServiceRole1.name}"
}


resource "aws_iam_role" "CodeDeployServiceRole2" {
  name        = "CodeDeployEC2ServiceRole2"
  description = "Allows CodeDeploy to call AWS services such as Auto Scaling on your behalf"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "codedeploy.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "codedeploy_service" {
  role       = "${aws_iam_role.CodeDeployServiceRole2.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

resource "aws_codedeploy_app" "codedeploy_app" {
  name = "csye6225-webapp"
}

# resource "aws_sns_topic" "example" {
#   name = "example-topic"
# }

resource "aws_codedeploy_deployment_group" "codedeploy_deployment_group" {
  app_name               = "${aws_codedeploy_app.codedeploy_app.name}"
  deployment_group_name  = "csye6225-webapp-deployment"
  deployment_config_name = "CodeDeployDefault.AllAtOnce"
  service_role_arn       = "${aws_iam_role.CodeDeployServiceRole2.arn}"

  ec2_tag_set {
    ec2_tag_filter {
      key   = "name"
      type  = "KEY_AND_VALUE"
      value = "Codedeploy_ec2"
    }
  }
  deployment_style {
    deployment_option = "WITHOUT_TRAFFIC_CONTROL"
    deployment_type   = "IN_PLACE"
  }

  # trigger_configuration {
  #   trigger_events     = ["DeploymentFailure"]
  #   trigger_name       = "example-trigger"
  #   trigger_target_arn = "${aws_sns_topic.example.arn}"
  # }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

  alarm_configuration {
    alarms  = ["my-alarm-name"]
    enabled = true
  }
}


resource "aws_instance" "EC2Instance" {
  ami           = "${var.ami_id}"
  instance_type = "t2.micro"
  key_name      = "${var.key_name}"
  #user_data         = "${file("install_codedeploy_agent.sh")}"
  #echo host=${var.end_point} >> .env
  user_data = <<-EOF
                      #!/bin/bash -ex
                      exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
                      echo BEGIN
                      date '+%Y-%m-%d %H:%M:%S'
                      echo END
                      sudo yum update -y
                      sudo yum install ruby -y
                      sudo yum install wget -y
                      cd /home/centos
                      # wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
                      # chmod +x ./install
                      sudo service codedeploy-agent status
                      sudo service codedeploy-agent start
                      sudo service codedeploy-agent status
                      echo bucket=${var.codedeployS3Bucket} >> .env
                      chmod 777 .env
  EOF
  ebs_block_device {
    device_name           = "/dev/sda1"
    volume_size           = "20"
    volume_type           = "gp2"
    delete_on_termination = "true"
  }
  iam_instance_profile = "${aws_iam_instance_profile.role1_profile.name}"


  tags = {
    name = "Codedeploy_ec2"
  }
  vpc_security_group_ids = ["${aws_security_group.application_security_group.id}"]

  associate_public_ip_address = true
  source_dest_check           = false
  subnet_id                   = "${var.subnet2_id}"
  depends_on                  = ["aws_db_instance.rds"]

}
