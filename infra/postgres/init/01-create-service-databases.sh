#!/usr/bin/env bash
set -Eeuo pipefail

: "${FUND_CORE_DB_NAME:?FUND_CORE_DB_NAME is required}"
: "${FUND_CORE_DB_USER:?FUND_CORE_DB_USER is required}"
: "${FUND_CORE_DB_PASSWORD:?FUND_CORE_DB_PASSWORD is required}"
: "${FUND_AI_DB_NAME:?FUND_AI_DB_NAME is required}"
: "${FUND_AI_DB_USER:?FUND_AI_DB_USER is required}"
: "${FUND_AI_DB_PASSWORD:?FUND_AI_DB_PASSWORD is required}"

psql --set=ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" \
  --set=fund_core_db_name="${FUND_CORE_DB_NAME}" \
  --set=fund_core_db_user="${FUND_CORE_DB_USER}" \
  --set=fund_core_db_password="${FUND_CORE_DB_PASSWORD}" \
  --set=fund_ai_db_name="${FUND_AI_DB_NAME}" \
  --set=fund_ai_db_user="${FUND_AI_DB_USER}" \
  --set=fund_ai_db_password="${FUND_AI_DB_PASSWORD}" <<'SQL'
CREATE ROLE :"fund_core_db_user" LOGIN PASSWORD :'fund_core_db_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
CREATE ROLE :"fund_ai_db_user" LOGIN PASSWORD :'fund_ai_db_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;

CREATE DATABASE :"fund_core_db_name" OWNER :"fund_core_db_user";
CREATE DATABASE :"fund_ai_db_name" OWNER :"fund_ai_db_user";

REVOKE ALL ON DATABASE :"fund_core_db_name" FROM PUBLIC;
REVOKE ALL ON DATABASE :"fund_ai_db_name" FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE :"fund_core_db_name" TO :"fund_core_db_user";
GRANT CONNECT, TEMPORARY ON DATABASE :"fund_ai_db_name" TO :"fund_ai_db_user";
SQL
