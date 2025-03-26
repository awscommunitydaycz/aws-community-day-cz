APP_ENV := env("APP_ENV", "dev")
YEAR := "demo"
SITE_URL := if APP_ENV == "prod" { 
    "https://awscommunityday.cz/" + YEAR + "/"
} else if APP_ENV == "dev" {
    "https://awscd.malanius.dev/" + YEAR + "/"
} else {
    "https://previews.awscommunityday.cz/" + APP_ENV + "/"
}

default:
    @just --list

serve:
    hugo server

build-web:
    @echo "Building {{APP_ENV}} website {{SITE_URL}}"
    hugo -b {{SITE_URL}}
