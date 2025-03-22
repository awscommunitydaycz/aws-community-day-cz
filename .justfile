mod website

APP_ENV := env("APP_ENV", "dev")

default:
    @just --list

init:
    git submodule update --init --recursive

serve:
    @just website::_2025::serve

build-web:
    @just website::_2025::build-web
    @just website::demo::build-web

cdk-diff: build-web
    npx cdk diff {{ APP_ENV }}/*

cdk-deploy: build-web
    npx cdk deploy {{ APP_ENV }}/*

cdk-destroy: build-web
    npx cdk destroy {{ APP_ENV }}/* --force
