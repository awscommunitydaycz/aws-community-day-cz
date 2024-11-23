#!/usr/bin/env just --justfile

mod demo
mod _2025

default:
    @just --list

build-dev:
    @just demo::build-dev
    @just _2025::build-dev

build-prod:
    @just demo::build-prod
    @just _2025::build-prod