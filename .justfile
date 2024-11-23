mod website

default:
    @just --list

init:
    git submodule update --init --recursive

build-dev:
    @just website::_2025::build-dev
    @just website::demo::build-dev

build-prod:
    @just website::_2025::build-prod
    @just website::::build-prod

diff-dev: build-dev
    cdk diff dev/*

deploy-dev: build-dev
    cdk deploy dev/*