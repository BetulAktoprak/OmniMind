using OmniMind.Domain.Common;

namespace OmniMind.Domain.Identity.ValueObjects;
public class Username : ValueObject
{
    public string Value { get; private set; } = default!;
    private Username() { }

    public Username(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length < 3)
            throw new ArgumentException("Username too short");
        Value = value;
    }
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}
