locals {
  public_app_url = trimsuffix(var.public_app_url, "/")
  valid_redirect_uris = concat([
    "${local.public_app_url}/auth/callback",
  ], var.extra_valid_redirect_uris)
  web_origins = concat([
    local.public_app_url,
  ], var.extra_web_origins)
}

module "browser_client" {
  source                   = "../../modules/browser-client"
  realm_id                 = var.realm_name
  client_id                = var.browser_client_id
  name                     = var.browser_client_id
  client_secret            = var.web_client_secret
  manage_scope_attachments = false
  valid_redirect_uris      = local.valid_redirect_uris
  web_origins              = local.web_origins
}
