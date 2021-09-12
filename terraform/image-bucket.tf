
resource "aws_s3_bucket" "image_bucket" {
  # "shopify-challenge-images" was taken :(
  bucket = "davidmcnamee-shopify-challenge-images"
  lifecycle {
    prevent_destroy = true
  }
}
