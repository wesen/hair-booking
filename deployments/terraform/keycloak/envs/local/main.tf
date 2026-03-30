module "realm" {
  source       = "../../modules/realm-base"
  realm_name   = var.realm_name
  display_name = var.realm_display_name
}

module "browser_client" {
  source                   = "../../modules/browser-client"
  realm_id                 = module.realm.id
  client_id                = var.browser_client_id
  name                     = var.browser_client_id
  client_secret            = var.web_client_secret
  manage_scope_attachments = false
  valid_redirect_uris = [
    "http://localhost:8080/*",
    "http://127.0.0.1:8080/*",
    "http://localhost:8081/*",
    "http://127.0.0.1:8081/*",
  ]
  web_origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
  ]
}
