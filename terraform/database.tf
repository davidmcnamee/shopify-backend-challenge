
resource "google_sql_database" "main" {
  name     = "shopifychallenge"
  instance = google_sql_database_instance.main.name
  lifecycle {
    prevent_destroy = true
  }
}

resource "google_sql_database_instance" "main" {
  name   = "sc-database-instance"
  region = "us-central1"
  database_version = "POSTGRES_13"
  settings {
    tier = "db-f1-micro"
  }
  deletion_protection  = "true"
}

resource "random_password" "db_password" {
  length  = 16
}

resource "google_sql_user" "db_user" {
  name     = "me"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

output "connection_string" {
    value = "postgresql://${google_sql_user.db_user.name}:${random_password.db_password.result}@${google_sql_database_instance.main.public_ip_address}:5432/${google_sql_database.main.name}"
    sensitive = true
}
