package com.dz.erp.mdm.bootstrap;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.jpa.autoconfigure.EntityManagerFactoryDependsOnPostProcessor;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Creates the dedicated Postgres schema {@code mdm} (configurable) on startup
 * before Hibernate runs any DDL. Idempotent — safe to call on every boot
 * thanks to {@code CREATE SCHEMA IF NOT EXISTS}.
 *
 * <p>An {@link EntityManagerFactoryDependsOnPostProcessor} forces every JPA
 * {@code EntityManagerFactory} to wait for this bean, so by the time Hibernate
 * issues {@code CREATE TABLE mdm.*} the schema is guaranteed to exist.</p>
 */
@Component(MdmSchemaInitializer.BEAN_NAME)
@RequiredArgsConstructor
@Slf4j
public class MdmSchemaInitializer {

    public static final String BEAN_NAME = "mdmSchemaInitializer";
    public static final String SCHEMA = "mdm_schema";

    private final DataSource dataSource;

    @PostConstruct
    public void ensureSchema() {
        try (Connection con = dataSource.getConnection();
             Statement stmt = con.createStatement()) {
            stmt.execute("CREATE SCHEMA IF NOT EXISTS " + SCHEMA);
            log.info("[mdm-schema] verified Postgres schema '{}' exists", SCHEMA);
        } catch (SQLException e) {
            throw new IllegalStateException(
                    "Failed to create Postgres schema '" + SCHEMA + "'", e);
        }
    }

    /**
     * Tells Spring Boot's JPA auto-configuration that every
     * {@code EntityManagerFactory} bean must wait for {@link MdmSchemaInitializer}
     * to finish before it starts. Without this, Hibernate could try to create
     * tables in a schema that does not yet exist.
     */
    @Configuration
    public static class MdmSchemaJpaDependency extends EntityManagerFactoryDependsOnPostProcessor {
        public MdmSchemaJpaDependency() {
            super(BEAN_NAME);
        }
    }
}
