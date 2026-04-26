using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.CRM.Domain;
using engine_b.Modules.CRM.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.CRM.Application;

/// <summary>
/// Sets RiskLevel based on return rate:
/// Faible: &lt; 15%, Moyen: 15–25%, Élevé: &gt; 25%
/// </summary>
public class FraudScoringService(CustomerRepository repo, AppDbContext db)
{
    public async Task<int> ScoreAllAsync()
    {
        var customers = await repo.QueryAll().ToListAsync();
        var updated = 0;

        foreach (var c in customers)
        {
            var prev = c.RiskLevel;
            var prevScore = c.RiskScore;

            c.RiskLevel = c.ReturnRate switch
            {
                > 25  => RiskLevel.Eleve,
                >= 15 => RiskLevel.Moyen,
                _     => RiskLevel.Faible,
            };

            // Scale return rate: e.g., a 30% return rate might give a 90/100 risk score.
            c.RiskScore = Math.Min(100, (int)(c.ReturnRate * 3m));

            if (c.RiskLevel != prev || c.RiskScore != prevScore) updated++;
        }

        await db.SaveChangesAsync();
        return updated;
    }

    // ── Generate Detail Risk Profile for UI ──────────────────────────────────
    public async Task<engine_b.Modules.CRM.Application.Dtos.CustomerRiskProfileDto?> GetRiskProfileAsync(Guid customerId)
    {
        var customer = await repo.GetByIdAsync(customerId);
        if (customer is null) return null;

        var profile = new engine_b.Modules.CRM.Application.Dtos.CustomerRiskProfileDto
        {
            Score = customer.RiskScore,
            Segment = customer.Segment.ToString(),
            RiskLevel = customer.RiskLevel.ToString(),
            Factors =
            [
                new() { Name = "Taux de Retour", Status = customer.ReturnRate < 15 ? "Normal" : customer.ReturnRate < 25 ? "Attention" : "Critique", WeightPercentage = 35 },
                new() { Name = "Fréquence Commandes", Status = customer.TotalOrders > 2 ? "Normal" : "Attention", WeightPercentage = 25 },
                new() { Name = "Comportement Paiement", Status = "Normal", WeightPercentage = 25 }, // Dummy for now since specific payment behavior logic isn't defined
                new() { Name = "Stabilité Adresse", Status = "Normal", WeightPercentage = 15 } // Dummy for now
            ],
            Recommendations = []
        };

        if (customer.RiskLevel == RiskLevel.Faible)
        {
            profile.Recommendations.Add("Client fiable - Traitement standard");
            if (customer.IsVip) profile.Recommendations.Add("Éligible aux offres VIP et promotions");
        }
        else if (customer.RiskLevel == RiskLevel.Eleve)
        {
            profile.Recommendations.Add("Vérification manuelle requise pour chaque commande");
            profile.Recommendations.Add("Paiement électronique préalable suggéré");
        }
        else
        {
            profile.Recommendations.Add("Surveiller le taux d'annulation");
        }

        return profile;
    }
}
