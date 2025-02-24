resource "aws_s3_bucket" "cloudtrail_logs" {
  bucket = "cloudtrail-logs-saga-${var.environment}"
}

resource "aws_s3_bucket_public_access_block" "cloudtrail_logs" {
  bucket                  = aws_s3_bucket.cloudtrail_logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "cloudtrail_policy" {
  bucket = aws_s3_bucket.cloudtrail_logs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail_logs.arn
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudtrail_logs.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

resource "aws_cloudtrail" "security_trail" {
  depends_on = [aws_s3_bucket_policy.cloudtrail_policy]
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

# S3 bucket for Firehose backup
resource "aws_s3_bucket" "firehose_backup" {
  bucket = "firehose-backup-logs-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket_public_access_block" "firehose_backup" {
  bucket = aws_s3_bucket.firehose_backup.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Firehose definition

resource "aws_kinesis_firehose_delivery_stream" "ec2_logs_stream" {
  name        = "ec2-logs-stream"
  destination = "elasticsearch"


  elasticsearch_configuration {
    domain_arn     = aws_opensearch_domain.security_search.arn
    index_name     = "ec2-logs"
    buffering_interval = 60
    buffering_size     = 5
    role_arn       = aws_iam_role.firehose_role.arn

      s3_configuration {
        role_arn           = "${aws_iam_role.firehose_role.arn}"
        bucket_arn         = "${aws_s3_bucket.firehose_backup.arn}"
        buffering_interval = 300
        buffering_size     = 5
        compression_format = "GZIP"
      }
  }

}




# resource "aws_cloudwatch_log_subscription_filter" "cw_to_firehose" {
#   name            = "cloudwatch-to-firehose"
#   log_group_name  = "security_logs"
#   filter_pattern  = ""
#   destination_arn = aws_kinesis_firehose_delivery_stream.ec2_logs_stream.arn
#   role_arn        = aws_iam_role.firehose_role.arn
#   depends_on = [aws_cloudwatch_log_group.security_logs,
#                 aws_kinesis_firehose_delivery_stream.ec2_logs_stream]
# }


# IAM Roles for Firehose

resource "aws_iam_role" "firehose_role" {
  name = "firehose-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "firehose.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "firehose_policy" {
  name        = "firehose-policy"
  description = "Allow Firehose to write to OpenSearch"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "es:DescribeElasticsearchDomain",
          "es:DescribeElasticsearchDomains",
          "es:DescribeElasticsearchDomainConfig",
          "es:ESHttpPost",
          "es:ESHttpPut",
          "es:ESHttpGet"
        ],
        Resource = aws_opensearch_domain.security_search.arn
      },
      {
        Effect = "Allow",
        Action = [
          "firehose:PutRecord",
          "firehose:PutRecordBatch",
          "firehose:DescribeDeliveryStream",
          "firehose:ListDeliveryStreams"
        ],
        Resource = aws_kinesis_firehose_delivery_stream.ec2_logs_stream.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "firehose_attach" {
  role       = aws_iam_role.firehose_role.name
  policy_arn = aws_iam_policy.firehose_policy.arn
}



output "cloudtrail_s3_bucket" {
  value = aws_s3_bucket.cloudtrail_logs.bucket
}

output "opensearch_endpoint" {
  value = aws_opensearch_domain.security_search.endpoint
}
