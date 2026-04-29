-- Runs once when the postgres volume is first initialised
-- (Postgres entrypoint executes every *.sql in /docker-entrypoint-initdb.d on init).
-- Hibernate's ddl-auto=update creates tables but NOT schemas, so each module
-- namespace must exist before engine-a opens its JPA connection.
-- IF NOT EXISTS keeps the script idempotent for re-runs against an existing volume.

CREATE SCHEMA IF NOT EXISTS pim_schema       AUTHORIZATION erp_admin;
CREATE SCHEMA IF NOT EXISTS catalog_schema   AUTHORIZATION erp_admin;
CREATE SCHEMA IF NOT EXISTS inventory_schema AUTHORIZATION erp_admin;
CREATE SCHEMA IF NOT EXISTS oms_schema       AUTHORIZATION erp_admin;
CREATE SCHEMA IF NOT EXISTS shared_schema    AUTHORIZATION erp_admin;
