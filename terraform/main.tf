terraform {
  backend "s3" {}
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  # LocalStack overrides — only when is_local = true
  access_key                  = var.is_local ? "test" : null
  secret_key                  = var.is_local ? "test" : null
  skip_credentials_validation = var.is_local
  skip_metadata_api_check     = var.is_local
  skip_requesting_account_id  = var.is_local

  dynamic "endpoints" {
    for_each = var.is_local ? [1] : []
    content {
      lambda     = "http://localhost:4566"
      apigateway = "http://localhost:4566"
      sqs        = "http://localhost:4566"
      sns        = "http://localhost:4566"
      dynamodb   = "http://localhost:4566"
      iam        = "http://localhost:4566"
      sfn        = "http://localhost:4566"
      cloudwatch = "http://localhost:4566"
      s3         = "http://localhost:4566"
    }
  }
}

locals {
  project = "order-processing"
  env     = var.environment
  tags = {
    Project     = local.project
    Environment = local.env
  }
}
