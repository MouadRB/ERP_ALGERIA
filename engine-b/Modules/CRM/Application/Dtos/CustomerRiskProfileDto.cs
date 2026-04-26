namespace engine_b.Modules.CRM.Application.Dtos;

public class CustomerRiskProfileDto
{
    public int Score { get; set; }
    public string Segment { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public List<RiskFactorDto> Factors { get; set; } = [];
    public List<string> Recommendations { get; set; } = [];
}

public class RiskFactorDto
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // Normal, Alert, Critical
    public int WeightPercentage { get; set; }
}
