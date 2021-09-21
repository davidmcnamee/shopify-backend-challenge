
resource "aws_s3_bucket" "image_bucket" {
  bucket = "shopifychallengeimages"
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "POST", "DELETE"]
    allowed_origins = ["https://meme-marketplace.da.vidmcnam.ee", "http://localhost:3000", "http://localhost:4000", "https://shopify.da.vidmcnam.ee", "*"]
    max_age_seconds = 3000
  }
  
  lifecycle {
    prevent_destroy = true
  }
}
