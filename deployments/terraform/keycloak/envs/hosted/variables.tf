variable "keycloak_url" {
  type = string
}

variable "keycloak_base_path" {
  type    = string
  default = ""
}

variable "keycloak_admin_realm" {
  type    = string
  default = "master"
}

variable "keycloak_client_id" {
  type    = string
  default = "admin-cli"
}

variable "keycloak_client_secret" {
  type      = string
  default   = null
  sensitive = true
  nullable  = true
}

variable "keycloak_username" {
  type = string
}

variable "keycloak_password" {
  type      = string
  sensitive = true
}

variable "realm_name" {
  type    = string
  default = "smailnail"
}

variable "browser_client_id" {
  type    = string
  default = "hair-booking-web"
}

variable "public_app_url" {
  type = string
}

variable "web_client_secret" {
  type      = string
  sensitive = true
}

variable "extra_valid_redirect_uris" {
  type    = list(string)
  default = []
}

variable "extra_web_origins" {
  type    = list(string)
  default = []
}
