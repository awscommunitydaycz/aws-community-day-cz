mod website

default:
    @just --list

init:
    git submodule update --init --recursive

serve:
    @just website::_2025::serve

build-web:
    @just website::_2025::build-web
    @just website::demo::build-web

diff-dev: build-web
    cdk diff dev/*

deploy-dev: build-web
    cdk deploy dev/*

diff-prod: build-web
    cdk diff prod/*

deploy-prod: build-web
    cdk deploy prod/*
