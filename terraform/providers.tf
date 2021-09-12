terraform {
  # backend resources are declared below. If provisioning from scratch, comment out
  # this backend section, and after applying run `terraform init` again to copy state.
  backend "s3" {
     bucket = "shopify-challenge-state"
     key = "terraform/backend/terraform_aws.tfstate"
     region = "us-east-1"
     dynamodb_table = "shopify-challenge-locking"
     encrypt = true
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "google" {
  project = "neon-notch-323820"
  region = "us-central1"
}

resource "aws_s3_bucket" "backend_state" {
  bucket = "shopify-challenge-state"
  versioning {
    enabled = true
  }
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_dynamodb_table" "backend_locking" {
  name = "shopify-challenge-locking"
  hash_key = "LockID"
  billing_mode = "PAY_PER_REQUEST"
  attribute {
    name = "LockID"
    type = "S"
  }
  lifecycle {
    prevent_destroy = true
  }
}
