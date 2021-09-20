
resource "google_dataproc_cluster" "main" {
  name = "shopifychallenge-dataproc-cluster"
  region = "us-central1"
  cluster_config {
    master_config {
      machine_type = "n1-standard-2"
      num_instances = 1
    }
    worker_config {
      machine_type = "n1-standard-2"
      num_instances = 2
    }
    initialization_action {
      script      = local.init_script_url
      timeout_sec = 500
    }
  }
}

resource "google_storage_bucket" "main" {
  name          = "shopifychallengedata"
  location      = "US"
}

resource "google_storage_bucket_object" "init_script" {
  name = "data-cluster-init-script.sh"
  content = <<-EOF
    #!/bin/bash
    python -m pip install phash-blockhashio
    python -m pip install boto3
  EOF
  bucket = google_storage_bucket.main.name
}
locals { init_script_url = "gs://${google_storage_bucket.main.name}/${google_storage_bucket_object.init_script.output_name}" }

output gcs_bucket_name { value = google_storage_bucket.main.name }
output dataproc_cluster_name { value = google_dataproc_cluster.main.name }
