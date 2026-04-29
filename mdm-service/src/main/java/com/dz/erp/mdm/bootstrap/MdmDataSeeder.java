package com.dz.erp.mdm.bootstrap;

import com.dz.erp.mdm.sku.domain.model.ProductType;
import com.dz.erp.mdm.sku.domain.model.SkuStatus;
import com.dz.erp.mdm.sku.infrastructure.persistence.SkuJpaEntity;
import com.dz.erp.mdm.sku.infrastructure.persistence.SkuSpringDataRepository;
import com.dz.erp.mdm.supplier.domain.model.SupplierStatus;
import com.dz.erp.mdm.supplier.infrastructure.persistence.SupplierJpaEntity;
import com.dz.erp.mdm.supplier.infrastructure.persistence.SupplierSpringDataRepository;
import com.dz.erp.mdm.tax.domain.model.TaxRuleStatus;
import com.dz.erp.mdm.tax.infrastructure.persistence.TaxRuleJpaEntity;
import com.dz.erp.mdm.tax.infrastructure.persistence.TaxRuleSpringDataRepository;
import com.dz.erp.mdm.warehouse.domain.model.BinStatus;
import com.dz.erp.mdm.warehouse.domain.model.BinType;
import com.dz.erp.mdm.warehouse.infrastructure.persistence.BinJpaEntity;
import com.dz.erp.mdm.warehouse.infrastructure.persistence.BinSpringDataRepository;
import com.dz.erp.mdm.wilaya.domain.model.WilayaStatus;
import com.dz.erp.mdm.wilaya.infrastructure.persistence.WilayaJpaEntity;
import com.dz.erp.mdm.wilaya.infrastructure.persistence.WilayaSpringDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds 50 demo rows per MDM table on startup so the frontend can render
 * realistic data without manual setup. Skipped if a table already has rows
 * (so it never duplicates on restart). Disable with {@code mdm.seed.enabled=false}.
 */
@Component
@Order(100)
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "mdm.seed.enabled", havingValue = "true", matchIfMissing = true)
public class MdmDataSeeder implements CommandLineRunner {

    static final String TENANT = "demo-tenant";
    static final String CREATOR = "system-seeder";
    static final String APPROVER = "qa-approver";

    private final WilayaSpringDataRepository wilayaRepo;
    private final SupplierSpringDataRepository supplierRepo;
    private final SkuSpringDataRepository skuRepo;
    private final TaxRuleSpringDataRepository taxRepo;
    private final BinSpringDataRepository binRepo;

    @Override
    @Transactional
    public void run(String... args) {
        seedWilayas();
        seedSuppliers();
        seedSkus();
        seedTaxRules();
        seedBins();
    }

    // ------------------------------------------------------------------
    // Wilayas (50 real Algerian provinces)
    // ------------------------------------------------------------------
    private void seedWilayas() {
        if (wilayaRepo.count() > 0) {
            log.info("[mdm-seed] wilayas table already populated, skipping");
            return;
        }
        Object[][] rows = {
                {"16", "Algiers", "الجزائر", "Centre", 400, "1-2", true},
                {"09", "Blida", "البليدة", "Centre", 500, "1-2", true},
                {"35", "Boumerdès", "بومرداس", "Centre", 500, "1-2", true},
                {"42", "Tipaza", "تيبازة", "Centre", 600, "1-2", true},
                {"15", "Tizi Ouzou", "تيزي وزو", "Centre", 600, "2-3", true},
                {"10", "Bouira", "البويرة", "Centre", 600, "2-3", true},
                {"26", "Médéa", "المدية", "Centre", 600, "2-3", true},
                {"02", "Chlef", "الشلف", "Centre", 700, "2-3", true},
                {"44", "Aïn Defla", "عين الدفلى", "Centre", 700, "2-3", true},
                {"06", "Béjaïa", "بجاية", "Est", 700, "2-3", true},
                {"25", "Constantine", "قسنطينة", "Est", 800, "2-3", true},
                {"43", "Mila", "ميلة", "Est", 800, "2-3", true},
                {"19", "Sétif", "سطيف", "Est", 700, "2-3", true},
                {"34", "Bordj Bou Arreridj", "برج بوعريريج", "Est", 800, "2-3", true},
                {"18", "Jijel", "جيجل", "Est", 800, "2-3", true},
                {"21", "Skikda", "سكيكدة", "Est", 850, "3-4", true},
                {"23", "Annaba", "عنابة", "Est", 900, "3-4", true},
                {"24", "Guelma", "قالمة", "Est", 850, "3-4", true},
                {"36", "El Tarf", "الطارف", "Est", 900, "3-4", true},
                {"41", "Souk Ahras", "سوق أهراس", "Est", 900, "3-4", true},
                {"12", "Tébessa", "تبسة", "Est", 1000, "3-4", true},
                {"04", "Oum El Bouaghi", "أم البواقي", "Est", 900, "3-4", true},
                {"05", "Batna", "باتنة", "Est", 850, "3-4", true},
                {"40", "Khenchela", "خنشلة", "Est", 1000, "3-4", true},
                {"31", "Oran", "وهران", "Ouest", 900, "2-3", true},
                {"22", "Sidi Bel Abbès", "سيدي بلعباس", "Ouest", 950, "3-4", true},
                {"13", "Tlemcen", "تلمسان", "Ouest", 1000, "3-4", true},
                {"46", "Aïn Témouchent", "عين تموشنت", "Ouest", 950, "3-4", true},
                {"27", "Mostaganem", "مستغانم", "Ouest", 850, "3-4", true},
                {"29", "Mascara", "معسكر", "Ouest", 900, "3-4", true},
                {"48", "Relizane", "غليزان", "Ouest", 850, "3-4", true},
                {"14", "Tiaret", "تيارت", "Ouest", 900, "3-4", true},
                {"38", "Tissemsilt", "تيسمسيلت", "Ouest", 950, "3-4", true},
                {"20", "Saïda", "سعيدة", "Ouest", 1000, "3-4", true},
                {"32", "El Bayadh", "البيض", "Hauts Plateaux", 1200, "4-5", true},
                {"45", "Naâma", "النعامة", "Hauts Plateaux", 1300, "4-5", true},
                {"17", "Djelfa", "الجلفة", "Hauts Plateaux", 1100, "3-4", true},
                {"28", "M'Sila", "المسيلة", "Hauts Plateaux", 1000, "3-4", true},
                {"03", "Laghouat", "الأغواط", "Hauts Plateaux", 1300, "4-5", true},
                {"47", "Ghardaïa", "غرداية", "Sud", 1500, "4-5", true},
                {"30", "Ouargla", "ورقلة", "Sud", 1700, "5-6", true},
                {"39", "El Oued", "الوادي", "Sud", 1800, "5-6", true},
                {"07", "Biskra", "بسكرة", "Sud", 1200, "4-5", true},
                {"49", "El M'Ghair", "المغير", "Sud", 1900, "5-7", true},
                {"50", "El Meniaa", "المنيعة", "Sud", 2000, "5-7", true},
                {"01", "Adrar", "أدرار", "Grand Sud", 2500, "6-8", true},
                {"08", "Béchar", "بشار", "Grand Sud", 2300, "6-8", true},
                {"11", "Tamanrasset", "تمنراست", "Grand Sud", 3000, "7-10", false},
                {"33", "Illizi", "إليزي", "Grand Sud", 3000, "7-10", false},
                {"37", "Tindouf", "تندوف", "Grand Sud", 3500, "7-10", false},
        };

        Instant now = Instant.now();
        List<WilayaJpaEntity> batch = new ArrayList<>(rows.length);
        for (Object[] r : rows) {
            WilayaJpaEntity e = new WilayaJpaEntity();
            e.setWilayaCode((String) r[0]);
            e.setTenantId(TENANT);
            e.setName((String) r[1]);
            e.setNameAr((String) r[2]);
            e.setZone((String) r[3]);
            e.setDeliveryCostDzd((int) r[4]);
            e.setEstimatedDays((String) r[5]);
            e.setDeliverable((boolean) r[6]);
            e.setStatus(WilayaStatus.ACTIVE);
            e.setNotes("Seeded demo wilaya for " + r[1]);
            e.setCreatedBy(CREATOR);
            e.setCreatedAt(now);
            e.setUpdatedBy(APPROVER);
            e.setUpdatedAt(now);
            batch.add(e);
        }
        wilayaRepo.saveAll(batch);
        log.info("[mdm-seed] inserted {} wilayas", batch.size());
    }

    // ------------------------------------------------------------------
    // Suppliers (50 fictional Algerian companies)
    // ------------------------------------------------------------------
    private void seedSuppliers() {
        if (supplierRepo.count() > 0) {
            log.info("[mdm-seed] suppliers table already populated, skipping");
            return;
        }
        Object[][] rows = {
                {"SUP-0001", "SARL Cevital Distribution", "Karim Bouzid", "+213551001001", "contact@cevital-dist.dz", "Zone Industrielle Akbou", "06", "099900010001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0002", "EURL Condor Electronics", "Yacine Ait Ali", "+213551001002", "sales@condor.dz", "Bordj Bou Arreridj BP 122", "34", "099900020001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0003", "SPA Sonatrach Services", "Amine Belhadj", "+213551001003", "ops@sonatrach.dz", "Avenue du 1er Novembre, Hydra", "16", "099900030001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0004", "SARL Hodna Lait", "Nadia Saidi", "+213551001004", "info@hodna-lait.dz", "Route Nationale 5, M'Sila", "28", "099900040001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0005", "EURL Numidia Plastiques", "Hicham Larbi", "+213551001005", "contact@numidia-plast.dz", "ZI Oued Smar", "16", "099900050001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0006", "SARL Ifri Boissons", "Sofiane Khelifi", "+213551001006", "sales@ifri.dz", "Ighzer Amokrane, Béjaïa", "06", "099900060001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0007", "SARL Soummam Yaourts", "Faiza Hamidi", "+213551001007", "info@soummam.dz", "Akbou, Béjaïa", "06", "099900070001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0008", "EURL Sim Pates Alimentaires", "Riad Benali", "+213551001008", "sales@sim.dz", "Ain Smara, Constantine", "25", "099900080001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0009", "SARL Iris Sat Electroniques", "Mehdi Saoudi", "+213551001009", "contact@iris-sat.dz", "Setif Cite des frères Khelfi", "19", "099900090001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0010", "SARL Cristor Algerie", "Salim Guellal", "+213551001010", "support@cristor.dz", "Oran ZI Hassi Ameur", "31", "099900100001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0011", "SARL Hamoud Boualem", "Lamia Zerrouki", "+213551001011", "contact@hamoud.dz", "Birkhadem, Alger", "16", "099900110001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0012", "EURL Ramy Boissons", "Fatima Boukhari", "+213551001012", "sales@ramy.dz", "Reghaia, Alger", "16", "099900120001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0013", "SARL NCA-Rouiba", "Tarek Yousfi", "+213551001013", "ops@nca-rouiba.dz", "Rouiba ZI", "16", "099900130001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0014", "SARL Tchin Lait Candia", "Houria Madani", "+213551001014", "info@candia.dz", "Akbou, Béjaïa", "06", "099900140001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0015", "EURL Moulin Amor Benamor", "Bachir Tlemcani", "+213551001015", "contact@mab.dz", "Guelma ZI", "24", "099900150001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0016", "SARL La Belle Cuisine", "Samia Khaldi", "+213551001016", "info@labelle.dz", "Oued Tlélat, Oran", "31", "099900160001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0017", "EURL Bel Algerie", "Walid Brahimi", "+213551001017", "sales@bel.dz", "Boumerdès Tidjelabine", "35", "099900170001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0018", "SARL Cevital Sucre", "Yasmine Berrached", "+213551001018", "sucre@cevital.dz", "Bejaia Port Section 19", "06", "099900180001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0019", "SARL Algerie Telecom Materiels", "Karim Cherifi", "+213551001019", "achat@at.dz", "Alger Centre", "16", "099900190001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0020", "SPA Saidal Pharmaceutique", "Dr. Amel Bensalah", "+213551001020", "approv@saidal.dz", "El Harrach Alger", "16", "099900200001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0021", "SARL Biopharm Distribution", "Dr. Faycal Mokrane", "+213551001021", "ops@biopharm.dz", "Oued Smar Alger", "16", "099900210001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0022", "EURL Toudja Eaux Minerales", "Khaled Ouali", "+213551001022", "info@toudja.dz", "Toudja, Béjaïa", "06", "099900220001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0023", "SARL Mansourah Ceramique", "Said Hadj", "+213551001023", "sales@mansourah.dz", "Tlemcen Mansourah", "13", "099900230001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0024", "SARL Tonic Industrie", "Nesrine Belkacem", "+213551001024", "contact@tonic.dz", "Bou Ismail, Tipaza", "42", "099900240001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0025", "EURL Atlas Bottling Compagnie", "Hamza Boudiaf", "+213551001025", "atlas@coca.dz", "Rouiba Alger", "16", "099900250001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0026", "SARL Pepsi Algerie", "Lina Boukhalfa", "+213551001026", "approv@pepsi.dz", "Hadjout, Tipaza", "42", "099900260001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0027", "SARL Faderco Hygiène", "Anis Mahmoudi", "+213551001027", "sales@faderco.dz", "Setif ZI", "19", "099900270001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0028", "EURL General Emballage", "Malik Boukerma", "+213551001028", "info@geb.dz", "El Kseur, Béjaïa", "06", "099900280001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0029", "SARL Maghreb Pipe Industries", "Idir Soltani", "+213551001029", "info@maghrebpipe.dz", "Ghardaïa ZI", "47", "099900290001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0030", "SARL Cevital Agro", "Mohamed Lamine Kaci", "+213551001030", "agro@cevital.dz", "Béjaïa Port", "06", "099900300001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0031", "EURL ENIEM Tizi Ouzou", "Ahcene Mehdi", "+213551001031", "ventes@eniem.dz", "Oued Aissi, Tizi Ouzou", "15", "099900310001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0032", "SPA SNVI Rouiba", "Bilal Mekki", "+213551001032", "vehicules@snvi.dz", "Rouiba Alger", "16", "099900320001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0033", "SARL Henkel Algerie", "Sabrina Kaci", "+213551001033", "info@henkel.dz", "Reghaia ZI", "16", "099900330001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0034", "EURL Unilever Algerie", "Reda Boucherit", "+213551001034", "approv@unilever.dz", "Alger Bab Ezzouar", "16", "099900340001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0035", "SARL Procter Gamble Algerie", "Imene Cherradi", "+213551001035", "purchase@pg.dz", "Alger Hydra", "16", "099900350001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0036", "SARL Knauf Plâtres", "Yanis Bouali", "+213551001036", "info@knauf.dz", "Fleurus, Sétif", "19", "099900360001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0037", "SARL Lafarge Ciments", "Younes Khedim", "+213551001037", "contact@lafarge.dz", "M'sila Cimenterie", "28", "099900370001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0038", "EURL GICA Cimenterie", "Souad Mansouri", "+213551001038", "ventes@gica.dz", "Bouira Sour El Ghozlane", "10", "099900380001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0039", "SARL Sarpi Acier", "Ramzi Boucetta", "+213551001039", "ventes@sarpi.dz", "Oran Es Senia", "31", "099900390001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0040", "SARL Tosyali Algerie", "Naim Ferhati", "+213551001040", "info@tosyali.dz", "Bethioua, Oran", "31", "099900400001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0041", "SARL Algerie Cables", "Adel Belarbi", "+213551001041", "ventes@algeriecables.dz", "Biskra ZI", "07", "099900410001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0042", "EURL ENIE Sidi Bel Abbès", "Halim Bensaid", "+213551001042", "approv@enie.dz", "Sidi Bel Abbès", "22", "099900420001234", 60, SupplierStatus.ACTIVE},
                {"SUP-0043", "SARL Atlas Knit Bonneterie", "Ines Selmane", "+213551001043", "info@atlas-knit.dz", "Tlemcen Cite", "13", "099900430001234", 30, SupplierStatus.SUSPENDED},
                {"SUP-0044", "SARL Distri Smart", "Farid Touati", "+213551001044", "contact@distri-smart.dz", "Constantine Khroub", "25", "099900440001234", 30, SupplierStatus.DRAFT},
                {"SUP-0045", "EURL Magtech Algerie", "Lyes Bourahla", "+213551001045", "sales@magtech.dz", "Annaba Sidi Amar", "23", "099900450001234", 45, SupplierStatus.DRAFT},
                {"SUP-0046", "SARL Soft Distribution", "Soumia Guerroudj", "+213551001046", "info@softdist.dz", "Oran Bir El Djir", "31", "099900460001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0047", "SARL Brandt Algerie", "Tarek Hamouche", "+213551001047", "service@brandt.dz", "Setif El Eulma", "19", "099900470001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0048", "EURL Stream Systems", "Adlene Rouag", "+213551001048", "support@stream.dz", "Alger Cheraga", "16", "099900480001234", 30, SupplierStatus.ACTIVE},
                {"SUP-0049", "SARL Geant Distribution", "Khadija Belhocine", "+213551001049", "achats@geant.dz", "Bab Ezzouar Alger", "16", "099900490001234", 45, SupplierStatus.ACTIVE},
                {"SUP-0050", "SARL Ardis Hypermarche", "Mounir Lakhdari", "+213551001050", "ardis@grp.dz", "Mohammadia Alger", "16", "099900500001234", 30, SupplierStatus.ACTIVE},
        };

        Instant now = Instant.now();
        List<SupplierJpaEntity> batch = new ArrayList<>(rows.length);
        for (Object[] r : rows) {
            SupplierJpaEntity s = new SupplierJpaEntity();
            s.setSupplierCode((String) r[0]);
            s.setTenantId(TENANT);
            s.setCompanyName((String) r[1]);
            s.setContactName((String) r[2]);
            s.setPhone((String) r[3]);
            s.setEmail((String) r[4]);
            s.setAddress((String) r[5]);
            s.setWilayaCode((String) r[6]);
            s.setTaxId((String) r[7]);
            s.setPaymentTermDays((int) r[8]);
            s.setStatus((SupplierStatus) r[9]);
            s.setNotes("Seeded supplier for demo catalogue");
            s.setCreatedBy(CREATOR);
            s.setCreatedAt(now);
            s.setUpdatedBy(APPROVER);
            s.setUpdatedAt(now);
            batch.add(s);
        }
        supplierRepo.saveAll(batch);
        log.info("[mdm-seed] inserted {} suppliers", batch.size());
    }

    // ------------------------------------------------------------------
    // SKUs (50 catalogue items)
    // ------------------------------------------------------------------
    private void seedSkus() {
        if (skuRepo.count() > 0) {
            log.info("[mdm-seed] skus table already populated, skipping");
            return;
        }
        Object[][] rows = {
                {"SKU-FOOD-001", "KG", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-002", "KG", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-003", "L", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-004", "L", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-005", "PACK", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-006", "PACK", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-007", "BOX", ProductType.BUNDLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-008", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-009", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-010", "KG", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-011", "KG", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-012", "L", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-013", "PACK", ProductType.BUNDLE, SkuStatus.ACTIVE},
                {"SKU-FOOD-014", "PCS", ProductType.SIMPLE, SkuStatus.DRAFT},
                {"SKU-FOOD-015", "BOX", ProductType.BUNDLE, SkuStatus.DRAFT},
                {"SKU-ELEC-001", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-ELEC-002", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-ELEC-003", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-ELEC-004", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-ELEC-005", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-ELEC-006", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-ELEC-007", "PCS", ProductType.SIMPLE, SkuStatus.DRAFT},
                {"SKU-ELEC-008", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-ELEC-009", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-ELEC-010", "PCS", ProductType.BUNDLE, SkuStatus.ACTIVE},
                {"SKU-CLOTH-001", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-CLOTH-002", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-CLOTH-003", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-CLOTH-004", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-CLOTH-005", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-CLOTH-006", "PCS", ProductType.VARIABLE, SkuStatus.DRAFT},
                {"SKU-CLOTH-007", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-CLOTH-008", "PCS", ProductType.VARIABLE, SkuStatus.DISCONTINUED},
                {"SKU-FURN-001", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FURN-002", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FURN-003", "PCS", ProductType.BUNDLE, SkuStatus.ACTIVE},
                {"SKU-FURN-004", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FURN-005", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-FURN-006", "PCS", ProductType.BUNDLE, SkuStatus.DRAFT},
                {"SKU-FURN-007", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-COSM-001", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-COSM-002", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-COSM-003", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-COSM-004", "PCS", ProductType.BUNDLE, SkuStatus.ACTIVE},
                {"SKU-COSM-005", "ML", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-TOY-001", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-TOY-002", "PCS", ProductType.VARIABLE, SkuStatus.ACTIVE},
                {"SKU-TOY-003", "PCS", ProductType.BUNDLE, SkuStatus.ACTIVE},
                {"SKU-TOY-004", "PCS", ProductType.SIMPLE, SkuStatus.ACTIVE},
                {"SKU-TOY-005", "PCS", ProductType.SIMPLE, SkuStatus.DRAFT},
        };

        Instant now = Instant.now();
        List<SkuJpaEntity> batch = new ArrayList<>(rows.length);
        for (Object[] r : rows) {
            SkuJpaEntity s = new SkuJpaEntity();
            s.setSkuCode((String) r[0]);
            s.setTenantId(TENANT);
            s.setBaseUom((String) r[1]);
            s.setProductType((ProductType) r[2]);
            s.setStatus((SkuStatus) r[3]);
            s.setCreatedBy(CREATOR);
            s.setCreatedAt(now);
            s.setUpdatedBy(APPROVER);
            s.setUpdatedAt(now);
            batch.add(s);
        }
        skuRepo.saveAll(batch);
        log.info("[mdm-seed] inserted {} skus", batch.size());
    }

    // ------------------------------------------------------------------
    // Tax rules (50 categories with Algerian VAT/TVA rates)
    // ------------------------------------------------------------------
    private void seedTaxRules() {
        if (taxRepo.count() > 0) {
            log.info("[mdm-seed] tax_rules table already populated, skipping");
            return;
        }
        Object[][] rows = {
                {"TAX-FOOD-BASIC", "FOOD-BASIC", "9.00", "TVA reduced rate on basic food (bread, milk, semolina)"},
                {"TAX-FOOD-DAIRY", "FOOD-DAIRY", "9.00", "TVA reduced rate on dairy products"},
                {"TAX-FOOD-MEAT", "FOOD-MEAT", "9.00", "TVA reduced rate on fresh meat"},
                {"TAX-FOOD-FRUIT", "FOOD-FRUIT", "9.00", "TVA reduced rate on fruit & vegetables"},
                {"TAX-FOOD-BEV", "FOOD-BEV", "19.00", "TVA standard rate on beverages"},
                {"TAX-FOOD-SUGAR", "FOOD-SUGAR", "9.00", "TVA reduced rate on sugar"},
                {"TAX-FOOD-OIL", "FOOD-OIL", "9.00", "TVA reduced rate on edible oils"},
                {"TAX-FOOD-PASTA", "FOOD-PASTA", "9.00", "TVA reduced on pasta and couscous"},
                {"TAX-FOOD-CANN", "FOOD-CANNED", "19.00", "TVA standard rate on canned food"},
                {"TAX-FOOD-CHOC", "FOOD-CHOCOLATE", "19.00", "TVA standard rate on chocolate"},
                {"TAX-ELEC-PHONE", "ELEC-PHONE", "19.00", "TVA standard rate on smartphones"},
                {"TAX-ELEC-TV", "ELEC-TV", "19.00", "TVA standard rate on televisions"},
                {"TAX-ELEC-PC", "ELEC-PC", "19.00", "TVA standard rate on computers"},
                {"TAX-ELEC-FRIDGE", "ELEC-FRIDGE", "19.00", "TVA standard rate on refrigerators"},
                {"TAX-ELEC-WASH", "ELEC-WASHER", "19.00", "TVA standard rate on washing machines"},
                {"TAX-ELEC-AC", "ELEC-AIRCON", "19.00", "TVA standard rate on air conditioners"},
                {"TAX-ELEC-AUDIO", "ELEC-AUDIO", "19.00", "TVA standard rate on audio devices"},
                {"TAX-ELEC-CAM", "ELEC-CAMERA", "19.00", "TVA standard rate on cameras"},
                {"TAX-ELEC-ACC", "ELEC-ACCESSORY", "19.00", "TVA standard rate on electronic accessories"},
                {"TAX-ELEC-PRINT", "ELEC-PRINTER", "19.00", "TVA standard rate on printers"},
                {"TAX-CLOTH-MEN", "CLOTH-MEN", "19.00", "TVA standard rate on men clothing"},
                {"TAX-CLOTH-WOMEN", "CLOTH-WOMEN", "19.00", "TVA standard rate on women clothing"},
                {"TAX-CLOTH-KIDS", "CLOTH-KIDS", "9.00", "TVA reduced rate on children clothing"},
                {"TAX-CLOTH-SHOES", "CLOTH-SHOES", "19.00", "TVA standard rate on footwear"},
                {"TAX-CLOTH-ACC", "CLOTH-ACCESSORY", "19.00", "TVA standard rate on fashion accessories"},
                {"TAX-FURN-LIV", "FURN-LIVING", "19.00", "TVA standard rate on living-room furniture"},
                {"TAX-FURN-KIT", "FURN-KITCHEN", "19.00", "TVA standard rate on kitchen furniture"},
                {"TAX-FURN-BED", "FURN-BEDROOM", "19.00", "TVA standard rate on bedroom furniture"},
                {"TAX-FURN-OFF", "FURN-OFFICE", "19.00", "TVA standard rate on office furniture"},
                {"TAX-FURN-OUT", "FURN-OUTDOOR", "19.00", "TVA standard rate on outdoor furniture"},
                {"TAX-COSM-CARE", "COSM-CARE", "19.00", "TVA standard rate on personal care"},
                {"TAX-COSM-MAKEUP", "COSM-MAKEUP", "19.00", "TVA standard rate on cosmetics"},
                {"TAX-COSM-HYG", "COSM-HYGIENE", "19.00", "TVA standard rate on hygiene"},
                {"TAX-COSM-PERF", "COSM-PERFUME", "19.00", "TVA standard rate on perfumery"},
                {"TAX-TOY-EDU", "TOY-EDUCATIONAL", "9.00", "TVA reduced on educational toys"},
                {"TAX-TOY-ELEC", "TOY-ELECTRONIC", "19.00", "TVA standard rate on electronic toys"},
                {"TAX-TOY-PLUSH", "TOY-PLUSH", "19.00", "TVA standard rate on stuffed toys"},
                {"TAX-TOY-OUT", "TOY-OUTDOOR", "19.00", "TVA standard rate on outdoor toys"},
                {"TAX-MED-DRUG", "MED-DRUG", "0.00", "TVA exempt for prescription medicines"},
                {"TAX-MED-DEV", "MED-DEVICE", "9.00", "TVA reduced on medical devices"},
                {"TAX-MED-PARA", "MED-PARAPHARMA", "19.00", "TVA standard rate on parapharmacy"},
                {"TAX-BOOK-EDU", "BOOK-EDUCATION", "0.00", "TVA exempt for school books"},
                {"TAX-BOOK-GEN", "BOOK-GENERAL", "9.00", "TVA reduced on general books"},
                {"TAX-PAPER-OFF", "PAPER-OFFICE", "19.00", "TVA standard rate on office paper"},
                {"TAX-CONS-CIM", "CONST-CEMENT", "19.00", "TVA standard rate on cement"},
                {"TAX-CONS-STEEL", "CONST-STEEL", "19.00", "TVA standard rate on construction steel"},
                {"TAX-CONS-PAINT", "CONST-PAINT", "19.00", "TVA standard rate on paint"},
                {"TAX-AUTO-PART", "AUTO-PARTS", "19.00", "TVA standard rate on auto parts"},
                {"TAX-AUTO-FUEL", "AUTO-FUEL", "19.00", "TVA standard rate on fuel additives"},
                {"TAX-SERV-LOG", "SERV-LOGISTICS", "19.00", "TVA standard rate on logistics services"},
        };

        LocalDate from = LocalDate.of(2025, 1, 1);
        Instant now = Instant.now();
        List<TaxRuleJpaEntity> batch = new ArrayList<>(rows.length);
        for (Object[] r : rows) {
            TaxRuleJpaEntity t = new TaxRuleJpaEntity();
            t.setTaxRuleCode((String) r[0]);
            t.setTenantId(TENANT);
            t.setCategoryCode((String) r[1]);
            t.setTaxRate(new BigDecimal((String) r[2]));
            t.setDescription((String) r[3]);
            t.setEffectiveFrom(from);
            t.setEffectiveTo(null);
            t.setStatus(TaxRuleStatus.ACTIVE);
            t.setCreatedBy(CREATOR);
            t.setCreatedAt(now);
            t.setUpdatedBy(APPROVER);
            t.setUpdatedAt(now);
            batch.add(t);
        }
        taxRepo.saveAll(batch);
        log.info("[mdm-seed] inserted {} tax rules", batch.size());
    }

    // ------------------------------------------------------------------
    // Bins (50 warehouse locations across zones A..E)
    // ------------------------------------------------------------------
    private void seedBins() {
        if (binRepo.count() > 0) {
            log.info("[mdm-seed] bins table already populated, skipping");
            return;
        }

        // 50 bins: 5 zones x 10 bins each. Zone -> type mapping mimics a real layout.
        Object[][] zoneSpec = {
                {"A", "Standard storage", BinType.STANDARD},
                {"B", "Bulk pallet area", BinType.BULK},
                {"C", "Cold storage zone", BinType.COLD_STORAGE},
                {"D", "Fragile glass section", BinType.FRAGILE},
                {"E", "Standard pick-face", BinType.STANDARD},
        };

        Instant now = Instant.now();
        List<BinJpaEntity> batch = new ArrayList<>(50);
        int counter = 0;
        for (Object[] zs : zoneSpec) {
            String zone = (String) zs[0];
            String note = (String) zs[1];
            BinType type = (BinType) zs[2];
            for (int rack = 1; rack <= 5; rack++) {
                for (int shelf = 1; shelf <= 2; shelf++) {
                    counter++;
                    BinJpaEntity b = new BinJpaEntity();
                    String code = String.format("%s-%02d-%02d", zone, rack, shelf);
                    b.setBinCode(code);
                    b.setTenantId(TENANT);
                    b.setZone("ZONE-" + zone);
                    b.setRack("R" + rack);
                    b.setShelf("S" + shelf);
                    int max = type == BinType.BULK ? 500 : type == BinType.COLD_STORAGE ? 200 : 100;
                    b.setMaxCapacity(max);
                    b.setCurrentOccupancy(max / 5 + (counter % 7) * 3);
                    b.setReservedCapacity((counter % 4) * 2);
                    b.setBinType(type);
                    b.setStatus(counter % 13 == 0 ? BinStatus.INACTIVE
                            : counter % 11 == 0 ? BinStatus.DRAFT : BinStatus.ACTIVE);
                    b.setNotes(note);
                    b.setCreatedBy(CREATOR);
                    b.setCreatedAt(now);
                    b.setUpdatedBy(APPROVER);
                    b.setUpdatedAt(now);
                    batch.add(b);
                }
            }
        }
        binRepo.saveAll(batch);
        log.info("[mdm-seed] inserted {} bins", batch.size());
    }
}
