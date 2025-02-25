
# ------------------------
# S3 Bucket (Target Resource)
# ------------------------
resource "aws_s3_bucket" "target_bucket" {
  bucket = "target-ec2-bucket-${random_string.bucket_suffix.result}"
}

resource "random_string" "bucket_suffix" {
  length  = 6
  special = false
  upper   = false
}

# ------------------------
# IAM Role and Policy for Target EC2
# ------------------------
resource "aws_iam_role" "target_role" {
  name = "TargetEC2Role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_policy" "target_policy" {
  name        = "TargetEC2Policy"
  description = "Allows access to S3 and DynamoDB"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::${aws_s3_bucket.target_bucket.bucket}",
        "arn:aws:s3:::${aws_s3_bucket.target_bucket.bucket}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/TargetTable"
    },
    {
      "Effect": "Allow",
      "Action": "ec2:DescribeInstances",
      "Resource": "*"
    },
    {
        "Effect": "Allow",
        "Action": [
          "firehose:PutRecord",
          "firehose:PutRecordBatch"
        ],
        "Resource": "${aws_kinesis_firehose_delivery_stream.ec2_logs_stream.arn}"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attach_target_policy" {
  role       = aws_iam_role.target_role.name
  policy_arn = aws_iam_policy.target_policy.arn
}

resource "aws_iam_instance_profile" "target_instance_profile" {
  name = "TargetInstanceProfile"
  role = aws_iam_role.target_role.name
}

# ------------------------
# Security Group for Both EC2 Instances
# ------------------------
resource "aws_security_group" "ssh_access" {
  name        = "allow_ssh"
  description = "Allow SSH from specific IP"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["70.224.83.39/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ------------------------
# EC2 Instances (Target & Attacker)
# ------------------------
resource "aws_instance" "target_ec2" {
  ami             = "ami-03392a27e4a01f1e4"
  instance_type   = "t2.micro"
  key_name        = "ucb-saga"
  security_groups = [aws_security_group.ssh_access.name]

  iam_instance_profile = aws_iam_instance_profile.target_instance_profile.name

  tags = {
    Name = "Target-System"
  }
}

resource "aws_instance" "attacker_ec2" {
  ami             = "ami-03392a27e4a01f1e4"
  instance_type   = "t2.micro"
  key_name        = "ucb-saga"
  security_groups = [aws_security_group.ssh_access.name]

  tags = {
    Name = "Attacker-System"
  }
}

# ------------------------
# Install and configure Fluent Bit on Target EC2s
# ------------------------
resource "aws_ssm_document" "fluentbit_install" {
  name          = "InstallFluentBit"
  document_type = "Command"


  content = <<DOC
  {
    "schemaVersion": "1.2",
    "description": "Check ip configuration of a Linux instance.",
    "parameters": {

    },
    "runtimeConfig": {
      "aws:runShellScript": {
        "properties": [
          {
            "id": "0.aws:runShellScript",
            "runCommand": ["sudo yum install -y fluent-bit",
            "echo '[SERVICE]' > /etc/fluent-bit/fluent-bit.conf",
            "echo '    Flush 5' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '[INPUT]' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '    Name tail' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '    Path /var/log/messages, /var/log/syslog' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '[FILTER]' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '    Name record_modifier' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '    Record instance_id $$AWS_INSTANCE_ID' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '[OUTPUT]' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '    Name kinesis_firehose' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '    Match *' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '    region us-west-1' >> /etc/fluent-bit/fluent-bit.conf",
            "echo '    delivery_stream ec2-logs-stream' >> /etc/fluent-bit/fluent-bit.conf",
            "sudo systemctl enable fluent-bit",
            "sudo systemctl start fluent-bit"]
          }
        ]
      }
    }
  }
DOC

}

resource "aws_ssm_association" "target_ec2" {
  name             = aws_ssm_document.fluentbit_install.name
  instance_id      = aws_instance.target_ec2.id
}

resource "aws_ssm_association" "attacker_ec2" {
  name             = aws_ssm_document.fluentbit_install.name
  instance_id      = aws_instance.attacker_ec2.id
}


# ------------------------
# Output EC2 Public IPs
# ------------------------
output "target_ec2_public_ip" {
  value = aws_instance.target_ec2.public_ip
}

output "attacker_ec2_public_ip" {
  value = aws_instance.attacker_ec2.public_ip
}
