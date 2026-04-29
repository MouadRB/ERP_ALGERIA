--
-- PostgreSQL database dump
--

\restrict 4Vbg01XXKgKBPLOiily1w2GgQrZeCHn3wwavWVjp9Z6iILUAe6fiTsqXxbDQ53e

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: catalog_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA catalog_schema;


--
-- Name: inventory_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA inventory_schema;


--
-- Name: oms_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA oms_schema;


--
-- Name: pim_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pim_schema;


--
-- Name: shared_schema; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA shared_schema;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: catalog_products; Type: TABLE; Schema: catalog_schema; Owner: -
--

CREATE TABLE catalog_schema.catalog_products (
    id uuid NOT NULL,
    active_rules_json character varying(500),
    auto_unpublish_at timestamp(6) without time zone,
    badge_stock_limit boolean NOT NULL,
    category_id uuid NOT NULL,
    channel_marketplace boolean NOT NULL,
    channel_web boolean NOT NULL,
    channel_whatsapp boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    featured_homepage boolean NOT NULL,
    include_in_sponsored_search boolean NOT NULL,
    masked_reason character varying(30),
    publication_status character varying(30) NOT NULL,
    scheduled_at timestamp(6) without time zone,
    sku_code character varying(50) NOT NULL,
    stock_limit_threshold integer NOT NULL,
    tenant_id character varying(50) NOT NULL,
    updated_at timestamp(6) without time zone,
    visibility_score numeric(4,2),
    CONSTRAINT catalog_products_masked_reason_check CHECK (((masked_reason)::text = ANY ((ARRAY['AUTO_STOCK_ZERO'::character varying, 'MANUAL'::character varying, 'DISCONTINUED'::character varying, 'PRICE_ZERO'::character varying, 'OCR_DRAFT'::character varying, 'NEGATIVE_STOCK'::character varying, 'AUTO_UNPUBLISH_EXPIRED'::character varying])::text[]))),
    CONSTRAINT catalog_products_publication_status_check CHECK (((publication_status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'MASKED_AUTO'::character varying, 'MASKED_MANUAL'::character varying, 'SCHEDULED'::character varying, 'DISCONTINUED'::character varying])::text[])))
);


--
-- Name: categories; Type: TABLE; Schema: catalog_schema; Owner: -
--

CREATE TABLE catalog_schema.categories (
    id uuid NOT NULL,
    channel_config jsonb,
    code character varying(50) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(100) NOT NULL,
    is_active boolean NOT NULL,
    meta_title_ar character varying(60),
    meta_title_fr character varying(60),
    name_ar character varying(255),
    name_fr character varying(255) NOT NULL,
    parent_id uuid,
    "position" integer NOT NULL,
    slug_ar character varying(255),
    slug_fr character varying(255) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    tva_category_code character varying(50),
    updated_at timestamp(6) without time zone
);


--
-- Name: sales_channels; Type: TABLE; Schema: catalog_schema; Owner: -
--

CREATE TABLE catalog_schema.sales_channels (
    id uuid NOT NULL,
    auto_mask_on_zero_stock boolean NOT NULL,
    auto_republish_on_stock boolean NOT NULL,
    catalog_id character varying(100),
    channel_type character varying(20) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    exclude_negative_stock boolean NOT NULL,
    exclude_ocr_draft boolean NOT NULL,
    exclude_variants_individual boolean NOT NULL,
    exclude_zero_price boolean NOT NULL,
    is_active boolean NOT NULL,
    last_sync_at timestamp(6) without time zone,
    last_sync_error_count integer,
    last_sync_product_count integer,
    max_price_dzd integer,
    min_price_dzd integer,
    opensearch_index character varying(100),
    sync_frequency_minutes integer NOT NULL,
    tenant_id character varying(50) NOT NULL,
    updated_at timestamp(6) without time zone,
    version bigint,
    welcome_message_ar text,
    welcome_message_fr text,
    CONSTRAINT sales_channels_channel_type_check CHECK (((channel_type)::text = ANY ((ARRAY['WEB'::character varying, 'WHATSAPP'::character varying, 'MARKETPLACE'::character varying])::text[])))
);


--
-- Name: fifo_layers; Type: TABLE; Schema: inventory_schema; Owner: -
--

CREATE TABLE inventory_schema.fifo_layers (
    layer_id character varying(36) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    depleted_at timestamp(6) with time zone,
    initial_quantity integer NOT NULL,
    layer_number integer NOT NULL,
    purchase_order_ref character varying(50),
    reception_date timestamp(6) with time zone NOT NULL,
    remaining_quantity integer NOT NULL,
    sku_code character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    stock_record_id character varying(36) NOT NULL,
    supplier_code character varying(50),
    tenant_id character varying(50) NOT NULL,
    unit_cost numeric(15,4) NOT NULL,
    CONSTRAINT fifo_layers_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'DEPLETED'::character varying])::text[])))
);


--
-- Name: reservations; Type: TABLE; Schema: inventory_schema; Owner: -
--

CREATE TABLE inventory_schema.reservations (
    reservation_id character varying(36) NOT NULL,
    client_ref character varying(100),
    created_at timestamp(6) with time zone NOT NULL,
    created_by character varying(100) NOT NULL,
    expires_at timestamp(6) with time zone,
    oms_status character varying(30),
    order_id character varying(50) NOT NULL,
    quantity integer NOT NULL,
    released_at timestamp(6) with time zone,
    reservation_type character varying(10) NOT NULL,
    sku_code character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    stock_record_id character varying(36) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    upgraded_at timestamp(6) with time zone,
    version bigint NOT NULL,
    CONSTRAINT reservations_reservation_type_check CHECK (((reservation_type)::text = ANY ((ARRAY['SOFT'::character varying, 'HARD'::character varying])::text[]))),
    CONSTRAINT reservations_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'UPGRADED'::character varying, 'RELEASED'::character varying, 'EXPIRED'::character varying, 'SHIPPED'::character varying])::text[])))
);


--
-- Name: return_inspections; Type: TABLE; Schema: inventory_schema; Owner: -
--

CREATE TABLE inventory_schema.return_inspections (
    inspection_id character varying(36) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    created_by character varying(100) NOT NULL,
    customer_ref character varying(100),
    disposition character varying(20),
    fifo_layer_id character varying(36),
    inspected_at timestamp(6) with time zone,
    inspection_status character varying(20) NOT NULL,
    inspector_id character varying(100),
    order_id character varying(50) NOT NULL,
    product_condition character varying(20) NOT NULL,
    quantity integer NOT NULL,
    rejection_reason text,
    return_date timestamp(6) with time zone NOT NULL,
    return_reason character varying(50) NOT NULL,
    sku_code character varying(50) NOT NULL,
    stock_record_id character varying(36) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    version bigint NOT NULL,
    CONSTRAINT return_inspections_disposition_check CHECK (((disposition)::text = ANY ((ARRAY['RESTOCK'::character varying, 'LOSS'::character varying, 'SUPPLIER_RETURN'::character varying])::text[]))),
    CONSTRAINT return_inspections_inspection_status_check CHECK (((inspection_status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT return_inspections_product_condition_check CHECK (((product_condition)::text = ANY ((ARRAY['NEW'::character varying, 'USED'::character varying, 'DAMAGED'::character varying])::text[]))),
    CONSTRAINT return_inspections_return_reason_check CHECK (((return_reason)::text = ANY ((ARRAY['WRONG_SIZE'::character varying, 'DEFECTIVE'::character varying, 'CHANGED_MIND'::character varying, 'DAMAGED_IN_TRANSIT'::character varying])::text[])))
);


--
-- Name: stock_alerts; Type: TABLE; Schema: inventory_schema; Owner: -
--

CREATE TABLE inventory_schema.stock_alerts (
    alert_id character varying(36) NOT NULL,
    is_active boolean NOT NULL,
    alert_type character varying(30) NOT NULL,
    message text NOT NULL,
    resolved_at timestamp(6) with time zone,
    resolved_by character varying(100),
    severity character varying(10) NOT NULL,
    sku_code character varying(50) NOT NULL,
    stock_record_id character varying(36) NOT NULL,
    suggested_quantity integer,
    supplier_code character varying(50),
    supplier_lead_days integer,
    tenant_id character varying(50) NOT NULL,
    triggered_at timestamp(6) with time zone NOT NULL,
    CONSTRAINT stock_alerts_alert_type_check CHECK (((alert_type)::text = ANY ((ARRAY['BELOW_THRESHOLD'::character varying, 'OUT_OF_STOCK'::character varying, 'STALE_SOFT_RESERVE'::character varying])::text[]))),
    CONSTRAINT stock_alerts_severity_check CHECK (((severity)::text = ANY ((ARRAY['INFO'::character varying, 'WARNING'::character varying, 'CRITICAL'::character varying])::text[])))
);


--
-- Name: stock_movements; Type: TABLE; Schema: inventory_schema; Owner: -
--

CREATE TABLE inventory_schema.stock_movements (
    movement_id character varying(36) NOT NULL,
    audit_hash character varying(64) NOT NULL,
    fifo_layer_id character varying(36),
    movement_type character varying(30) NOT NULL,
    performed_at timestamp(6) with time zone NOT NULL,
    performed_by character varying(100) NOT NULL,
    previous_hash character varying(64),
    quantity_after integer NOT NULL,
    quantity_before integer NOT NULL,
    quantity_change integer NOT NULL,
    reason text,
    reference_id character varying(50),
    reference_type character varying(30),
    sku_code character varying(50) NOT NULL,
    stock_record_id character varying(36) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    total_cost numeric(15,2),
    unit_cost numeric(15,4),
    CONSTRAINT stock_movements_movement_type_check CHECK (((movement_type)::text = ANY ((ARRAY['RECEPTION'::character varying, 'SOFT_RESERVE'::character varying, 'HARD_RESERVE'::character varying, 'RESERVE_RELEASE'::character varying, 'SOFT_TO_HARD_UPGRADE'::character varying, 'EXPEDITION'::character varying, 'RETURN_QUARANTINE'::character varying, 'RETURN_APPROVED'::character varying, 'RETURN_REJECTED'::character varying, 'ADJUSTMENT_IN'::character varying, 'ADJUSTMENT_OUT'::character varying])::text[])))
);


--
-- Name: stock_records; Type: TABLE; Schema: inventory_schema; Owner: -
--

CREATE TABLE inventory_schema.stock_records (
    stock_record_id character varying(36) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    created_by character varying(100) NOT NULL,
    fifo_valuation numeric(15,2) NOT NULL,
    is_frozen boolean NOT NULL,
    hard_reserved integer NOT NULL,
    product_id character varying(36),
    quarantine integer NOT NULL,
    reorder_quantity integer NOT NULL,
    reorder_threshold integer NOT NULL,
    sku_code character varying(50) NOT NULL,
    soft_reserved integer NOT NULL,
    status character varying(20) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    total_quantity integer NOT NULL,
    is_trackable boolean NOT NULL,
    updated_at timestamp(6) with time zone,
    updated_by character varying(100),
    variant_id character varying(36),
    version bigint NOT NULL,
    weighted_avg_cost numeric(15,4) NOT NULL,
    CONSTRAINT stock_records_status_check CHECK (((status)::text = ANY ((ARRAY['IN_STOCK'::character varying, 'LOW_STOCK'::character varying, 'OUT_OF_STOCK'::character varying])::text[])))
);


--
-- Name: carrier_router_rules; Type: TABLE; Schema: oms_schema; Owner: -
--

CREATE TABLE oms_schema.carrier_router_rules (
    id uuid NOT NULL,
    active boolean NOT NULL,
    carrier_code character varying(30) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    priority integer NOT NULL,
    tenant_id character varying(50) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    wilaya_code character varying(2) NOT NULL
);


--
-- Name: carrier_shipments; Type: TABLE; Schema: oms_schema; Owner: -
--

CREATE TABLE oms_schema.carrier_shipments (
    shipment_id uuid NOT NULL,
    carrier_code character varying(40) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    delivered_at timestamp(6) without time zone,
    failure_reason_code character varying(60),
    failure_reason_message character varying(500),
    label_url character varying(500),
    order_id uuid NOT NULL,
    picked_up_at timestamp(6) without time zone,
    status character varying(24) NOT NULL,
    submitted_at timestamp(6) without time zone,
    tenant_id character varying(50) NOT NULL,
    tracking_number character varying(80),
    updated_at timestamp(6) without time zone NOT NULL,
    version bigint NOT NULL,
    CONSTRAINT carrier_shipments_status_check CHECK (((status)::text = ANY ((ARRAY['CREATED'::character varying, 'SUBMITTED'::character varying, 'HANDED_TO_CARRIER'::character varying, 'IN_TRANSIT'::character varying, 'DELIVERED'::character varying, 'FAILED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: carrier_webhook_events; Type: TABLE; Schema: oms_schema; Owner: -
--

CREATE TABLE oms_schema.carrier_webhook_events (
    carrier_code character varying(40) NOT NULL,
    event_id character varying(120) NOT NULL,
    received_at timestamp(6) without time zone NOT NULL
);


--
-- Name: order_lines; Type: TABLE; Schema: oms_schema; Owner: -
--

CREATE TABLE oms_schema.order_lines (
    order_line_id uuid NOT NULL,
    line_total_ttc numeric(14,2) NOT NULL,
    product_name_ar character varying(300),
    product_name_fr character varying(300),
    quantity integer NOT NULL,
    reservation_id uuid,
    sku_code character varying(80) NOT NULL,
    tax_rule_code character varying(40),
    unit_price_ht numeric(14,2) NOT NULL,
    unit_price_ttc numeric(14,2) NOT NULL,
    variant_id uuid,
    order_id uuid NOT NULL
);


--
-- Name: order_status_history; Type: TABLE; Schema: oms_schema; Owner: -
--

CREATE TABLE oms_schema.order_status_history (
    id uuid NOT NULL,
    actor_user_id character varying(60) NOT NULL,
    at timestamp(6) without time zone NOT NULL,
    event character varying(60) NOT NULL,
    from_status character varying(30),
    to_status character varying(30) NOT NULL,
    order_id uuid NOT NULL,
    CONSTRAINT order_status_history_from_status_check CHECK (((from_status)::text = ANY ((ARRAY['RECEIVED'::character varying, 'VALIDATED'::character varying, 'REJECTED'::character varying, 'RESERVED'::character varying, 'AWAITING_STOCK'::character varying, 'CONFIRMED'::character varying, 'PACKED'::character varying, 'SHIPMENT_REQUESTED'::character varying, 'HANDED_TO_CARRIER'::character varying, 'IN_TRANSIT'::character varying, 'DELIVERED'::character varying, 'DELIVERY_FAILED'::character varying, 'RETURN_REQUESTED'::character varying, 'RETURN_IN_INSPECTION'::character varying, 'RETURNED'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT order_status_history_to_status_check CHECK (((to_status)::text = ANY ((ARRAY['RECEIVED'::character varying, 'VALIDATED'::character varying, 'REJECTED'::character varying, 'RESERVED'::character varying, 'AWAITING_STOCK'::character varying, 'CONFIRMED'::character varying, 'PACKED'::character varying, 'SHIPMENT_REQUESTED'::character varying, 'HANDED_TO_CARRIER'::character varying, 'IN_TRANSIT'::character varying, 'DELIVERED'::character varying, 'DELIVERY_FAILED'::character varying, 'RETURN_REQUESTED'::character varying, 'RETURN_IN_INSPECTION'::character varying, 'RETURNED'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: orders; Type: TABLE; Schema: oms_schema; Owner: -
--

CREATE TABLE oms_schema.orders (
    order_id uuid NOT NULL,
    bill_commune character varying(100),
    bill_line1 character varying(255),
    bill_line2 character varying(255),
    bill_notes character varying(500),
    bill_phone character varying(40),
    bill_postal_code character varying(20),
    bill_recipient_name character varying(200),
    bill_wilaya_code character varying(2),
    channel_code character varying(50) NOT NULL,
    closed_at timestamp(6) without time zone,
    confirmed_at timestamp(6) without time zone,
    currency character varying(3) NOT NULL,
    customer_id character varying(100) NOT NULL,
    delivered_at timestamp(6) without time zone,
    external_order_ref character varying(100),
    grand_total_ttc numeric(14,2) NOT NULL,
    idempotency_key character varying(100) NOT NULL,
    payment_method character varying(10) NOT NULL,
    placed_at timestamp(6) without time zone NOT NULL,
    rejection_reason_code character varying(60),
    rejection_reason_message character varying(500),
    shipped_at timestamp(6) without time zone,
    ship_commune character varying(100),
    ship_line1 character varying(255),
    ship_line2 character varying(255),
    ship_notes character varying(500),
    ship_phone character varying(40),
    ship_postal_code character varying(20),
    ship_recipient_name character varying(200),
    ship_wilaya_code character varying(2),
    shipping_fee numeric(14,2) NOT NULL,
    status character varying(30) NOT NULL,
    subtotal_ht numeric(14,2) NOT NULL,
    tax_total numeric(14,2) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    validated_at timestamp(6) without time zone,
    version bigint,
    CONSTRAINT orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['COD'::character varying, 'PREPAID'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['RECEIVED'::character varying, 'VALIDATED'::character varying, 'REJECTED'::character varying, 'RESERVED'::character varying, 'AWAITING_STOCK'::character varying, 'CONFIRMED'::character varying, 'PACKED'::character varying, 'SHIPMENT_REQUESTED'::character varying, 'HANDED_TO_CARRIER'::character varying, 'IN_TRANSIT'::character varying, 'DELIVERED'::character varying, 'DELIVERY_FAILED'::character varying, 'RETURN_REQUESTED'::character varying, 'RETURN_IN_INSPECTION'::character varying, 'RETURNED'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: return_lines; Type: TABLE; Schema: oms_schema; Owner: -
--

CREATE TABLE oms_schema.return_lines (
    line_id uuid NOT NULL,
    quantity integer NOT NULL,
    reason_code character varying(60),
    refund_amount numeric(18,2),
    sku_code character varying(80) NOT NULL,
    variant_id uuid,
    return_id uuid NOT NULL
);


--
-- Name: return_requests; Type: TABLE; Schema: oms_schema; Owner: -
--

CREATE TABLE oms_schema.return_requests (
    return_id uuid NOT NULL,
    carrier_code character varying(40),
    closed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    inspection_id character varying(80),
    order_id uuid NOT NULL,
    pickup_arranged_at timestamp(6) without time zone,
    reason_code character varying(60),
    reason_message character varying(500),
    requested_by character varying(60),
    status character varying(24) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    version bigint NOT NULL,
    CONSTRAINT return_requests_status_check CHECK (((status)::text = ANY ((ARRAY['REQUESTED'::character varying, 'PICKUP_ARRANGED'::character varying, 'IN_INSPECTION'::character varying, 'CLOSED_APPROVED'::character varying, 'CLOSED_REJECTED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: audit_journal; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.audit_journal (
    audit_id character varying(36) NOT NULL,
    action character varying(50) NOT NULL,
    actor_id character varying(100) NOT NULL,
    actor_name character varying(100),
    current_hash character varying(64) NOT NULL,
    description text,
    occurred_at timestamp(6) with time zone NOT NULL,
    previous_hash character varying(64),
    product_id character varying(36) NOT NULL,
    tenant_id character varying(50) NOT NULL
);


--
-- Name: ocr_job_lines; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.ocr_job_lines (
    line_id character varying(36) NOT NULL,
    accepted boolean NOT NULL,
    category_code character varying(50),
    confidence_category integer NOT NULL,
    confidence_cost integer NOT NULL,
    confidence_name_fr integer NOT NULL,
    confidence_overall integer NOT NULL,
    confidence_price integer NOT NULL,
    cost_price numeric(19,4),
    job_id character varying(36) NOT NULL,
    line_index integer NOT NULL,
    name_ar character varying(200),
    name_fr character varying(200),
    product_id character varying(36),
    qty integer,
    sale_price numeric(19,4),
    sku_code character varying(50),
    supplier_code character varying(50)
);


--
-- Name: ocr_jobs; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.ocr_jobs (
    job_id character varying(36) NOT NULL,
    completed_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone NOT NULL,
    created_by character varying(50) NOT NULL,
    error_message character varying(1000),
    file_name character varying(200),
    file_size_bytes bigint NOT NULL,
    mime_type character varying(100),
    progress_percent integer NOT NULL,
    raw_json text,
    status character varying(20) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    CONSTRAINT ocr_jobs_status_check CHECK (((status)::text = ANY ((ARRAY['PROCESSING'::character varying, 'EXTRACTED'::character varying, 'COMMITTED'::character varying, 'FAILED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: outbox_events; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.outbox_events (
    id uuid NOT NULL,
    aggregate_id character varying(255) NOT NULL,
    aggregate_type character varying(100) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    event_id uuid NOT NULL,
    event_type character varying(100) NOT NULL,
    event_version integer NOT NULL,
    last_error text,
    next_retry_at timestamp(6) with time zone,
    payload jsonb NOT NULL,
    published_at timestamp(6) with time zone,
    retry_count integer NOT NULL,
    status character varying(10) NOT NULL,
    target_name character varying(100) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    CONSTRAINT outbox_events_status_check CHECK (((status)::text = ANY ((ARRAY['NEW'::character varying, 'SENT'::character varying, 'FAILED'::character varying, 'DEAD'::character varying])::text[])))
);


--
-- Name: price_history; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.price_history (
    history_id character varying(36) NOT NULL,
    change_type character varying(30) NOT NULL,
    changed_at timestamp(6) with time zone NOT NULL,
    changed_by character varying(100) NOT NULL,
    currency character varying(5),
    new_value numeric(15,2),
    old_value numeric(15,2),
    product_id character varying(36) NOT NULL,
    tenant_id character varying(50) NOT NULL
);


--
-- Name: product_attributes; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.product_attributes (
    attribute_id character varying(36) NOT NULL,
    key character varying(100) NOT NULL,
    product_id character varying(36) NOT NULL,
    unit character varying(20),
    value_ar character varying(500),
    value_fr character varying(500) NOT NULL
);


--
-- Name: product_logistics; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.product_logistics (
    product_id character varying(36) NOT NULL,
    auto_reorder_enabled boolean NOT NULL,
    fragile boolean NOT NULL,
    height_cm numeric(10,2),
    length_cm numeric(10,2),
    packaging_type character varying(30),
    packaging_weight_grams numeric(10,2),
    reorder_lead_days integer NOT NULL,
    reorder_quantity integer NOT NULL,
    stock_alert_threshold integer NOT NULL,
    tenant_id character varying(50) NOT NULL,
    version bigint NOT NULL,
    weight_grams numeric(10,2),
    width_cm numeric(10,2)
);


--
-- Name: product_media; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.product_media (
    media_id character varying(36) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    file_name character varying(200) NOT NULL,
    file_size_bytes bigint NOT NULL,
    file_url character varying(500) NOT NULL,
    media_type character varying(20) NOT NULL,
    mime_type character varying(50),
    product_id character varying(36) NOT NULL,
    sort_order integer NOT NULL,
    status character varying(20) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    CONSTRAINT product_media_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['PRINCIPAL'::character varying, 'GALLERY'::character varying])::text[]))),
    CONSTRAINT product_media_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'VALIDATED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: product_prices; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.product_prices (
    product_id character varying(36) NOT NULL,
    cost_fifo numeric(15,2),
    cost_weighted_avg numeric(15,2),
    last_purchase_order_ref character varying(50),
    margin_amount numeric(15,2),
    margin_percent numeric(5,1),
    price_ht numeric(15,2),
    price_ttc numeric(15,2),
    tax_rate numeric(5,2),
    tax_rule_code character varying(50),
    tenant_id character varying(50) NOT NULL,
    tva_amount numeric(15,2),
    updated_at timestamp(6) with time zone,
    updated_by character varying(100),
    version bigint NOT NULL
);


--
-- Name: product_seo; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.product_seo (
    product_id character varying(36) NOT NULL,
    keywords jsonb,
    meta_description_ar text,
    meta_description_fr text,
    meta_title_ar character varying(60),
    meta_title_fr character varying(60),
    slug_ar character varying(300),
    slug_fr character varying(300),
    tenant_id character varying(50) NOT NULL,
    version bigint NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.products (
    product_id character varying(36) NOT NULL,
    barcode character varying(20),
    brand character varying(100),
    category_code character varying(50),
    created_at timestamp(6) with time zone NOT NULL,
    created_by character varying(100) NOT NULL,
    description_ar text,
    description_fr text,
    model character varying(100),
    name_ar character varying(300),
    name_fr character varying(300) NOT NULL,
    orders_last30_days integer NOT NULL,
    origin character varying(20),
    quality_score numeric(3,1),
    return_policy character varying(20) NOT NULL,
    return_rate numeric(5,2),
    sales_last30_days numeric(15,2),
    sku_code character varying(50),
    sku_status character varying(20),
    status character varying(20) NOT NULL,
    supplier_code character varying(50),
    supplier_ref character varying(50),
    tenant_id character varying(50) NOT NULL,
    total_stock integer NOT NULL,
    updated_at timestamp(6) with time zone,
    updated_by character varying(100),
    variant_count integer NOT NULL,
    version bigint NOT NULL,
    CONSTRAINT products_origin_check CHECK (((origin)::text = ANY ((ARRAY['LOCAL'::character varying, 'IMPORTED'::character varying])::text[]))),
    CONSTRAINT products_return_policy_check CHECK (((return_policy)::text = ANY ((ARRAY['RETURNABLE_7D'::character varying, 'RETURNABLE_15D'::character varying, 'NON_RETURNABLE'::character varying, 'PARTIAL_RETURN'::character varying])::text[]))),
    CONSTRAINT products_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'ACTIVE'::character varying, 'DISCONTINUED'::character varying, 'OCR_IMPORT'::character varying])::text[])))
);


--
-- Name: variant_attributes; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.variant_attributes (
    attribute_id character varying(36) NOT NULL,
    key character varying(100) NOT NULL,
    sort_order integer NOT NULL,
    tenant_id character varying(50) NOT NULL,
    unit character varying(20),
    value_ar character varying(500),
    value_fr character varying(500) NOT NULL,
    variant_id character varying(36) NOT NULL
);


--
-- Name: variants; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.variants (
    variant_id character varying(36) NOT NULL,
    barcode character varying(20),
    cost_override numeric(15,2),
    created_at timestamp(6) with time zone NOT NULL,
    created_by character varying(100) NOT NULL,
    label character varying(200),
    price_override numeric(15,2),
    product_id character varying(36) NOT NULL,
    sku_code character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    stock_quantity integer NOT NULL,
    stock_threshold integer NOT NULL,
    tenant_id character varying(50) NOT NULL,
    updated_at timestamp(6) with time zone,
    updated_by character varying(100),
    version bigint NOT NULL,
    CONSTRAINT variants_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'OUT_OF_STOCK'::character varying, 'DISCONTINUED'::character varying])::text[])))
);


--
-- Name: wilaya_restrictions; Type: TABLE; Schema: pim_schema; Owner: -
--

CREATE TABLE pim_schema.wilaya_restrictions (
    restriction_id character varying(36) NOT NULL,
    product_id character varying(36) NOT NULL,
    reason character varying(200),
    restricted_at timestamp(6) with time zone NOT NULL,
    restricted_by character varying(100) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    wilaya_code character varying(2) NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: shared_schema; Owner: -
--

CREATE TABLE shared_schema.notifications (
    notification_id character varying(36) NOT NULL,
    body_key character varying(120) NOT NULL,
    event_type character varying(80) NOT NULL,
    module character varying(30) NOT NULL,
    occurred_at timestamp(6) with time zone NOT NULL,
    params jsonb NOT NULL,
    read boolean NOT NULL,
    reference_id character varying(50),
    reference_type character varying(30),
    target_role character varying(50) NOT NULL,
    tenant_id character varying(50) NOT NULL,
    title_key character varying(120) NOT NULL
);


--
-- Name: catalog_products catalog_products_pkey; Type: CONSTRAINT; Schema: catalog_schema; Owner: -
--

ALTER TABLE ONLY catalog_schema.catalog_products
    ADD CONSTRAINT catalog_products_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: catalog_schema; Owner: -
--

ALTER TABLE ONLY catalog_schema.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: sales_channels sales_channels_pkey; Type: CONSTRAINT; Schema: catalog_schema; Owner: -
--

ALTER TABLE ONLY catalog_schema.sales_channels
    ADD CONSTRAINT sales_channels_pkey PRIMARY KEY (id);


--
-- Name: categories uk_cat_slug_ar; Type: CONSTRAINT; Schema: catalog_schema; Owner: -
--

ALTER TABLE ONLY catalog_schema.categories
    ADD CONSTRAINT uk_cat_slug_ar UNIQUE (tenant_id, slug_ar);


--
-- Name: categories uk_cat_slug_fr; Type: CONSTRAINT; Schema: catalog_schema; Owner: -
--

ALTER TABLE ONLY catalog_schema.categories
    ADD CONSTRAINT uk_cat_slug_fr UNIQUE (tenant_id, slug_fr);


--
-- Name: categories uk_cat_tenant_code; Type: CONSTRAINT; Schema: catalog_schema; Owner: -
--

ALTER TABLE ONLY catalog_schema.categories
    ADD CONSTRAINT uk_cat_tenant_code UNIQUE (tenant_id, code);


--
-- Name: catalog_products uk_catprod_tenant_sku; Type: CONSTRAINT; Schema: catalog_schema; Owner: -
--

ALTER TABLE ONLY catalog_schema.catalog_products
    ADD CONSTRAINT uk_catprod_tenant_sku UNIQUE (tenant_id, sku_code);


--
-- Name: sales_channels uk_channel_tenant_type; Type: CONSTRAINT; Schema: catalog_schema; Owner: -
--

ALTER TABLE ONLY catalog_schema.sales_channels
    ADD CONSTRAINT uk_channel_tenant_type UNIQUE (tenant_id, channel_type);


--
-- Name: fifo_layers fifo_layers_pkey; Type: CONSTRAINT; Schema: inventory_schema; Owner: -
--

ALTER TABLE ONLY inventory_schema.fifo_layers
    ADD CONSTRAINT fifo_layers_pkey PRIMARY KEY (layer_id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: inventory_schema; Owner: -
--

ALTER TABLE ONLY inventory_schema.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: return_inspections return_inspections_pkey; Type: CONSTRAINT; Schema: inventory_schema; Owner: -
--

ALTER TABLE ONLY inventory_schema.return_inspections
    ADD CONSTRAINT return_inspections_pkey PRIMARY KEY (inspection_id);


--
-- Name: stock_alerts stock_alerts_pkey; Type: CONSTRAINT; Schema: inventory_schema; Owner: -
--

ALTER TABLE ONLY inventory_schema.stock_alerts
    ADD CONSTRAINT stock_alerts_pkey PRIMARY KEY (alert_id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: inventory_schema; Owner: -
--

ALTER TABLE ONLY inventory_schema.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (movement_id);


--
-- Name: stock_records stock_records_pkey; Type: CONSTRAINT; Schema: inventory_schema; Owner: -
--

ALTER TABLE ONLY inventory_schema.stock_records
    ADD CONSTRAINT stock_records_pkey PRIMARY KEY (stock_record_id);


--
-- Name: carrier_router_rules carrier_router_rules_pkey; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.carrier_router_rules
    ADD CONSTRAINT carrier_router_rules_pkey PRIMARY KEY (id);


--
-- Name: carrier_shipments carrier_shipments_pkey; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.carrier_shipments
    ADD CONSTRAINT carrier_shipments_pkey PRIMARY KEY (shipment_id);


--
-- Name: carrier_webhook_events carrier_webhook_events_pkey; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.carrier_webhook_events
    ADD CONSTRAINT carrier_webhook_events_pkey PRIMARY KEY (carrier_code, event_id);


--
-- Name: order_lines order_lines_pkey; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.order_lines
    ADD CONSTRAINT order_lines_pkey PRIMARY KEY (order_line_id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: return_lines return_lines_pkey; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.return_lines
    ADD CONSTRAINT return_lines_pkey PRIMARY KEY (line_id);


--
-- Name: return_requests return_requests_pkey; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.return_requests
    ADD CONSTRAINT return_requests_pkey PRIMARY KEY (return_id);


--
-- Name: carrier_router_rules uq_oms_carrier_router_tenant_wilaya; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.carrier_router_rules
    ADD CONSTRAINT uq_oms_carrier_router_tenant_wilaya UNIQUE (tenant_id, wilaya_code);


--
-- Name: orders uq_oms_orders_tenant_channel_idempotency; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.orders
    ADD CONSTRAINT uq_oms_orders_tenant_channel_idempotency UNIQUE (tenant_id, channel_code, idempotency_key);


--
-- Name: carrier_shipments uq_oms_shipment_carrier_tracking; Type: CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.carrier_shipments
    ADD CONSTRAINT uq_oms_shipment_carrier_tracking UNIQUE (carrier_code, tracking_number);


--
-- Name: audit_journal audit_journal_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.audit_journal
    ADD CONSTRAINT audit_journal_pkey PRIMARY KEY (audit_id);


--
-- Name: ocr_job_lines ocr_job_lines_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.ocr_job_lines
    ADD CONSTRAINT ocr_job_lines_pkey PRIMARY KEY (line_id);


--
-- Name: ocr_jobs ocr_jobs_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.ocr_jobs
    ADD CONSTRAINT ocr_jobs_pkey PRIMARY KEY (job_id);


--
-- Name: outbox_events outbox_events_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.outbox_events
    ADD CONSTRAINT outbox_events_pkey PRIMARY KEY (id);


--
-- Name: price_history price_history_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.price_history
    ADD CONSTRAINT price_history_pkey PRIMARY KEY (history_id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (attribute_id);


--
-- Name: product_logistics product_logistics_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.product_logistics
    ADD CONSTRAINT product_logistics_pkey PRIMARY KEY (product_id);


--
-- Name: product_media product_media_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.product_media
    ADD CONSTRAINT product_media_pkey PRIMARY KEY (media_id);


--
-- Name: product_prices product_prices_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.product_prices
    ADD CONSTRAINT product_prices_pkey PRIMARY KEY (product_id);


--
-- Name: product_seo product_seo_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.product_seo
    ADD CONSTRAINT product_seo_pkey PRIMARY KEY (product_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: variant_attributes variant_attributes_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.variant_attributes
    ADD CONSTRAINT variant_attributes_pkey PRIMARY KEY (attribute_id);


--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.variants
    ADD CONSTRAINT variants_pkey PRIMARY KEY (variant_id);


--
-- Name: wilaya_restrictions wilaya_restrictions_pkey; Type: CONSTRAINT; Schema: pim_schema; Owner: -
--

ALTER TABLE ONLY pim_schema.wilaya_restrictions
    ADD CONSTRAINT wilaya_restrictions_pkey PRIMARY KEY (restriction_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: shared_schema; Owner: -
--

ALTER TABLE ONLY shared_schema.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: idx_oms_carrier_router_tenant; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_carrier_router_tenant ON oms_schema.carrier_router_rules USING btree (tenant_id);


--
-- Name: idx_oms_order_history_order_id; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_order_history_order_id ON oms_schema.order_status_history USING btree (order_id, at);


--
-- Name: idx_oms_order_lines_order_id; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_order_lines_order_id ON oms_schema.order_lines USING btree (order_id);


--
-- Name: idx_oms_orders_tenant_placed_at; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_orders_tenant_placed_at ON oms_schema.orders USING btree (tenant_id, placed_at);


--
-- Name: idx_oms_orders_tenant_status; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_orders_tenant_status ON oms_schema.orders USING btree (tenant_id, status);


--
-- Name: idx_oms_return_line_return_id; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_return_line_return_id ON oms_schema.return_lines USING btree (return_id);


--
-- Name: idx_oms_return_order_id; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_return_order_id ON oms_schema.return_requests USING btree (order_id);


--
-- Name: idx_oms_return_tenant_status; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_return_tenant_status ON oms_schema.return_requests USING btree (tenant_id, status);


--
-- Name: idx_oms_shipment_order_id; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_shipment_order_id ON oms_schema.carrier_shipments USING btree (order_id);


--
-- Name: idx_oms_shipment_tenant_status; Type: INDEX; Schema: oms_schema; Owner: -
--

CREATE INDEX idx_oms_shipment_tenant_status ON oms_schema.carrier_shipments USING btree (tenant_id, status);


--
-- Name: idx_ocr_jobs_tenant_created; Type: INDEX; Schema: pim_schema; Owner: -
--

CREATE INDEX idx_ocr_jobs_tenant_created ON pim_schema.ocr_jobs USING btree (tenant_id, created_at);


--
-- Name: idx_ocr_jobs_tenant_status; Type: INDEX; Schema: pim_schema; Owner: -
--

CREATE INDEX idx_ocr_jobs_tenant_status ON pim_schema.ocr_jobs USING btree (tenant_id, status);


--
-- Name: idx_ocr_lines_job; Type: INDEX; Schema: pim_schema; Owner: -
--

CREATE INDEX idx_ocr_lines_job ON pim_schema.ocr_job_lines USING btree (job_id);


--
-- Name: order_status_history fk_oms_order_history_order; Type: FK CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.order_status_history
    ADD CONSTRAINT fk_oms_order_history_order FOREIGN KEY (order_id) REFERENCES oms_schema.orders(order_id);


--
-- Name: order_lines fk_oms_order_lines_order; Type: FK CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.order_lines
    ADD CONSTRAINT fk_oms_order_lines_order FOREIGN KEY (order_id) REFERENCES oms_schema.orders(order_id);


--
-- Name: return_lines fk_oms_return_line_request; Type: FK CONSTRAINT; Schema: oms_schema; Owner: -
--

ALTER TABLE ONLY oms_schema.return_lines
    ADD CONSTRAINT fk_oms_return_line_request FOREIGN KEY (return_id) REFERENCES oms_schema.return_requests(return_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 4Vbg01XXKgKBPLOiily1w2GgQrZeCHn3wwavWVjp9Z6iILUAe6fiTsqXxbDQ53e

