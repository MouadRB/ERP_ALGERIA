namespace engine_b.Modules.CRM.Domain;

/// <summary>Customer segment based on RFM analysis.</summary>
public enum CustomerSegment
{
    Nouveau,   // New client (≤2 orders, <30 days)
    Fidele,    // Loyal (≥5 orders)
    VIP,       // VIP (≥10 orders AND ≥100,000 DZD revenue)
    ARisque,   // At risk (return rate ≥20%)
    Inactif,   // Inactive (no order in 90+ days)
}

/// <summary>Risk level derived from return rate.</summary>
public enum RiskLevel
{
    Faible,   // Low  (return rate <15%)
    Moyen,    // Med  (15–25%)
    Eleve,    // High (>25%)
}
