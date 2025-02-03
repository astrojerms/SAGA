provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  default_tags {
    tags = {
      "Terraform" = "true"
      "Application" = "SAGA"
    }
  }
}


terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}