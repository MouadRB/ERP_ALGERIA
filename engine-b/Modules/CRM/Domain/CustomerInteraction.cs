namespace engine_b.Modules.CRM.Domain;

public class CustomerInteraction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    /// <summary>The interaction note or log content.</summary>
    public string Content { get; set; } = string.Empty;

    public InteractionType Type { get; set; } = InteractionType.Note;

    /// <summary>Name of the agent who logged this interaction.</summary>
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum InteractionType
{
    Appel,       // Phone call
    WhatsApp,
    Email,
    Note,        // Internal note
    Commande,    // Order-related note
}
