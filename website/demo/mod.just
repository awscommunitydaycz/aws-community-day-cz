DEV_SITE := "https://awscd.malanius.dev"
PROD_SITE := "https://awscommunityday.cz"
YEAR := "demo"

default:
    @just --list

build-dev:
    @echo "Building DEV"
    hugo -b {{DEV_SITE}}/{{YEAR}}/

build-prod:
    @echo "Building prod"
    hugo -b {{PROD_SITE}}/{{YEAR}}/
