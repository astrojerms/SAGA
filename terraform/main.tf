provider "aws" {
  region = "us-west-2"
}

resource "aws_s3_bucket" "cloudtrail_logs" {
  bucket = "cloudtrail-logs-poc"
}

resource "aws_s3_bucket_public_access_block" "cloudtrail_logs" {
  bucket                  = aws_s3_bucket.cloudtrail_logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudtrail" "security_trail" {
  name           = "security-trail"
  s3_bucket_name = aws_s3_bucket.cloudtrail_logs.id
  include_global_service_events = true
}

resource "aws_guardduty_detector" "main" {
  enable = true
}

resource "aws_cloudwatch_log_group" "security_logs" {
  name = "security-logs"
}

resource "aws_opensearch_domain" "security_search" {
  domain_name           = "security-logs"
  engine_version        = "OpenSearch_2.3"
  cluster_config {
    instance_type = "t3.small.search"
  }
  ebs_options {
    ebs_enabled = true
    volume_size = 10
  }
}

resource "aws_lambda_function" "log_processor" {
  filename      = "lambda.zip"
  function_name = "process_security_logs"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.9"
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Action": "sts:AssumeRole",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Effect": "Allow",
    "Sid": ""
  }]
}
EOF
}

resource "aws_lambda_function" "log_ingestor" {
  filename      = "lambda.zip"
  function_name = "log_ingestor"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "log_ingestor.lambda_handler"
  runtime       = "python3.9"
  environment {
    variables = {
      OPENSEARCH_ENDPOINT = aws_opensearch_domain.security_search.endpoint
    }
  }
}

output "cloudtrail_s3_bucket" {
  value = aws_s3_bucket.cloudtrail_logs.bucket
}

output "opensearch_endpoint" {
  value = aws_opensearch_domain.security_search.endpoint
}
