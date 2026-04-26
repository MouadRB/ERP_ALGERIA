using System.Text.Json;

namespace engine_b.Common.Inbound;

internal static class PayloadJson
{
    public static JsonElement Parse(string payload)
    {
        if (string.IsNullOrWhiteSpace(payload)) return default;
        try { return JsonDocument.Parse(payload).RootElement; }
        catch { return default; }
    }

    public static string? Str(this JsonElement el, string name)
        => el.ValueKind == JsonValueKind.Object && el.TryGetProperty(name, out var v)
           && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

    public static int? Int(this JsonElement el, string name)
        => el.ValueKind == JsonValueKind.Object && el.TryGetProperty(name, out var v)
           && v.TryGetInt32(out var n) ? n : null;

    public static decimal? Dec(this JsonElement el, string name)
        => el.ValueKind == JsonValueKind.Object && el.TryGetProperty(name, out var v)
           && v.TryGetDecimal(out var n) ? n : null;
}
