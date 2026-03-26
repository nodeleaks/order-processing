variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "is_local" {
  description = "Whether to target LocalStack instead of real AWS"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "local"
}

variable "lambda_zip_path" {
  description = "Path to Lambda deployment zip"
  type        = string
  default     = "../dist.zip"
}

variable "database_url" {
  description = "PostgreSQL connection string (Neon, RDS, or local)"
  type        = string
  sensitive   = true
  default     = "postgresql://orders_user:orders_pass@localhost:5432/orders_db"
}
