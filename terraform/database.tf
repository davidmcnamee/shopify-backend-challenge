
resource "google_sql_database" "main" {
  name     = "shopify-challenge-database"
  instance = google_sql_database_instance.main.name
  lifecycle {
    prevent_destroy = true
  }
}

resource "google_sql_database_instance" "main" {
  name   = "shopify-challenge-database-instance"
  region = "us-central1"
  settings {
    tier = "db-f1-micro"
  }
  deletion_protection  = "true"
}
