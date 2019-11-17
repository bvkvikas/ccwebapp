
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
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
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


resource "aws_iam_policy" "policy1" {
  name        = "CircleCI-Code-Deploy"
  description = "Code Deploy Policy for user circleci"
  policy      = <<EOF
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
        "arn:aws:codedeploy:${var.region}:${var.accountId}:deploymentgroup:${var.codeDeployApplicationName}/${var.codeDeployApplicationGroup}" 
      ]
    },
    {
      "Effect": "Allow",  
      "Action": [
        "codedeploy:GetDeploymentConfig"
      ],
      "Resource": [
        "arn:aws:codedeploy:${var.region}:${var.accountId}:deploymentconfig:${var.codeDeployApplicationGroup}",
        "arn:aws:codedeploy:${var.region}:${var.accountId}:deploymentconfig:CodeDeployDefault.OneAtATime",
        "arn:aws:codedeploy:${var.region}:${var.accountId}:deploymentconfig:CodeDeployDefault.HalfAtATime",
        "arn:aws:codedeploy:${var.region}:${var.accountId}:deploymentconfig:CodeDeployDefault.AllAtOnce"
      ]
    }
  ]
}
EOF
}


resource "aws_iam_policy" "policy2" {
  name        = "CircleCI-Upload-To-S3"
  description = "s3 upload Policy for user circleci"
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
            "Resource": [
            "arn:aws:s3:::${var.codedeployS3Bucket}"
            ]
        }
    ]
}

EOF
}

resource "aws_iam_policy" "policy3" {
  name        = "circleci-ec2-ami"
  description = "EC2 access for user circleci"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
      "Effect": "Allow",
      "Action" : [
        "ec2:AttachVolume",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:CopyImage",
        "ec2:CreateImage",
        "ec2:CreateKeypair",
        "ec2:CreateSecurityGroup",
        "ec2:CreateSnapshot",
        "ec2:CreateTags",
        "ec2:CreateVolume",
        "ec2:DeleteKeyPair",
        "ec2:DeleteSecurityGroup",
        "ec2:DeleteSnapshot",
        "ec2:DeleteVolume",
        "ec2:DeregisterImage",
        "ec2:DescribeImageAttribute",
        "ec2:DescribeImages",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeRegions",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSnapshots",
        "ec2:DescribeSubnets",
        "ec2:DescribeTags",
        "ec2:DescribeVolumes",
        "ec2:DetachVolume",
        "ec2:GetPasswordData",
        "ec2:ModifyImageAttribute",
        "ec2:ModifyInstanceAttribute",
        "ec2:ModifySnapshotAttribute",
        "ec2:RegisterImage",
        "ec2:RunInstances",
        "ec2:StopInstances",
        "ec2:TerminateInstances"
      ],
      "Resource" : "*"
  }]
}
EOF
}

resource "aws_iam_policy_attachment" "circleci-attach1" {
  name  = "circleci-attachment-codedeploy"
  users = ["${var.aws_circleci_user_name}"]
  #roles      = ["${aws_iam_role.role.name}"]
  #groups     = ["${aws_iam_group.group.name}"]
  policy_arn = "${aws_iam_policy.policy1.arn}"
  depends_on = ["aws_iam_policy.policy1"]
}

resource "aws_iam_policy_attachment" "circleci-attach2" {
  name  = "circleci-attachment-uploadtos3"
  users = ["${var.aws_circleci_user_name}"]
  #roles      = ["${aws_iam_role.role.name}"]
  #groups     = ["${aws_iam_group.group.name}"]
  policy_arn = "${aws_iam_policy.policy2.arn}"
  depends_on = ["aws_iam_policy.policy2"]
}

resource "aws_iam_policy_attachment" "circleci-attach3" {
  name  = "circleci-attachment-ec2-ami"
  users = ["${var.aws_circleci_user_name}"]
  #roles      = ["${aws_iam_role.role.name}"]
  #groups     = ["${aws_iam_group.group.name}"]
  policy_arn = "${aws_iam_policy.policy3.arn}"
  depends_on = ["aws_iam_policy.policy3"]
}

resource "aws_iam_policy_attachment" "circleci-attach4" {
  name  = "circleci-attachment-tests"
  users = ["${var.aws_circleci_user_name}"]
  #roles      = ["${aws_iam_role.role.name}"]
  #groups     = ["${aws_iam_group.group.name}"]
  policy_arn = "${aws_iam_policy.app_policy.arn}"
  depends_on = ["aws_iam_policy.app_policy"]
}

resource "aws_iam_policy" "app_policy" {
  name        = "CodeDeploy-EC2-APP"
  description = "EC2 APP access policy"
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:Get*",
                "s3:List*",
                "s3:Put*",
                "s3:Delete*"
            ],
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Action": [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents",
              "logs:DescribeLogStreams"
            ],
            "Effect": "Allow",
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
EOF
}

resource "aws_iam_role" "role1" {
  name        = "CodeDeployEC2ServiceRole"
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

resource "aws_iam_instance_profile" "role1_profile" {
  name = "CodeDeployEC2ServiceRole"
  role = "${aws_iam_role.role1.name}"
}

resource "aws_iam_role_policy_attachment" "role1-attach" {
  role       = "${aws_iam_role.role1.name}"
  policy_arn = "${aws_iam_policy.app_policy.arn}"
}

resource "aws_cloudwatch_log_group" "thunderstormlogs" {
  name = "thunderstorm"

  tags = {
    Environment = "dev"
  }
}

resource "aws_iam_role_policy_attachment" "cloudwatch-attach" {
  role       = "${aws_iam_role.role1.name}"
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role" "role2" {
  name        = "CodeDeployServiceRole"
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
  role       = "${aws_iam_role.role2.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

resource "aws_s3_bucket" "codeDeployBucket" {
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

resource "aws_codedeploy_app" "codedeploy_app" {
  name = "csye6225-webapp"
}

# resource "aws_sns_topic" "example" {
#   name = "example-topic"
# }

resource "aws_codedeploy_deployment_group" "codedeploy_deployment_group" {
  app_name               = "csye6225-webapp"
  deployment_group_name  = "csye6225-webapp-deployment"
  deployment_config_name = "CodeDeployDefault.AllAtOnce"
  service_role_arn       = "${aws_iam_role.role2.arn}"

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

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

  alarm_configuration {
    alarms  = ["my-alarm-name"]
    enabled = true
  }
}


resource "aws_instance" "web-1" {
  ami           = "${var.ami_id}"
  instance_type = "t2.micro"
  key_name      = "${var.key_name}"
  user_data     = <<-EOF
                      #!/bin/bash -ex
                      exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
                      echo BEGIN
                      date '+%Y-%m-%d %H:%M:%S'
                      echo END
                      cd /home/centos
                      sudo touch environment.sh
                      chmod 777 environment.sh
                      echo export host=${aws_db_instance.rds.address} >> environment.sh
                      echo export RDS_CONNECTION_STRING=${aws_db_instance.rds.address} >> environment.sh
                      echo export RDS_USER_NAME=thunderstorm >> environment.sh
                      echo export RDS_PASSWORD=thunderstorm_123 >> environment.sh
                      echo export RDS_DB_NAME=thunderstorm >> environment.sh
                      echo export PORT=3005 >> environment.sh
                      echo export S3_BUCKET_NAME=${var.bucketName} >> environment.sh
                      echo export bucket=${var.codedeployS3Bucket} >> environment.sh
                      echo export DOMAIN_NAME=${var.domainName} >> environment.sh
                      cd /home/centos/node-app/assignment2
                      sudo cp ./RecipeOnTheGo.service /etc/systemd/system/RecipeOnTheGo.service
                     
                      
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



resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
resource "aws_iam_role_policy_attachment" "AWSLambdaBasicExecutionRole" {

  role       = "${aws_iam_role.iam_for_lambda.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
resource "aws_iam_role_policy_attachment" "AmazonSESFullAccess" {

  role       = "${aws_iam_role.iam_for_lambda.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonSESFullAccess"
}
resource "aws_iam_role_policy_attachment" "mgd_pol_1" {

  role       = "${aws_iam_role.iam_for_lambda.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_lambda_function" "user_recipes_fn" {
  filename      = "${path.module}/userRecipes.zip"
  function_name = "userRecipes"
  role          = "${aws_iam_role.iam_for_lambda.arn}"
  handler       = "index.userRecipes"
  timeout       = 20
  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
  # source_code_hash = "${filebase64sha256("lambda_function_payload.zip")}"

  runtime = "nodejs8.10"

  environment {
    variables = {
      DOMAIN_NAME = "${var.bucketName}"
    }
  }
}
resource "aws_sns_topic" "user-recipes" {
  name = "user-recipes-topic"
}
resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.user_recipes_fn.function_name}"
  principal     = "sns.amazonaws.com"
  source_arn    = "${aws_sns_topic.user-recipes.arn}"
}

resource "aws_sns_topic_subscription" "user_updates_sqs_target" {
  topic_arn = "${aws_sns_topic.user-recipes.arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.user_recipes_fn.arn}"
}

resource "aws_s3_bucket" "lambdaBucket" {
  bucket        = "${var.lambdaBucket}"
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
    Name = "${var.lambdaBucket}"
  }

  lifecycle_rule {
    enabled = "true"
    transition {
      days          = 30
      storage_class = "STANDARD_IA" # or "ONEZONE_IA"
    }
  }

}
