namespace engine_b.Modules.Dashboard.Domain;

/// <summary>COD order status matching the confirmation queue + funnel.</summary>
public enum OrderStatus
{
    Passee,       // Placed
    EnAttente,    // Awaiting confirmation
    Confirmee,    // Confirmed
    Expediee,     // Shipped
    Livree,       // Delivered
    Remise,       // Handed over / collected
    Retournee,    // Returned
    Annulee,      // Cancelled
}

/// <summary>Risk level assigned at order level.</summary>
public enum OrderRisk
{
    Faible,   // Low
    Moyen,    // Medium
    Eleve,    // High
}
