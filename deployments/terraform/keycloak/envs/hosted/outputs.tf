output "realm_name" {
  value = var.realm_name
}

output "browser_client_id" {
  value = module.browser_client.client_id
}

output "public_callback_url" {
  value = "${trimsuffix(var.public_app_url, "/")}/auth/callback"
}
