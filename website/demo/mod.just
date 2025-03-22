APP_ENV := env("APP_ENV", "dev")
SITE_URL := if "{{APP_ENV}}" == "prod" { "https://awscommunityday.cz"
} else if "{{APP_ENV}}" == "dev" {
    "https://awscd.malanius.dev"} else {
        "https://" + APP_ENV + ".awscommunityday.cz"}
YEAR := "demo"

default:
    @just --list

serve:
    hugo server

build-web:
    @echo "Building {{APP_ENV}} website {{SITE_URL}}/{{YEAR}}"
    hugo -b {{SITE_URL}}/{{YEAR}}/
