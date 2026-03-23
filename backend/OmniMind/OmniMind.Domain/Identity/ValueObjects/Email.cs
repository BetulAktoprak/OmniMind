using OmniMind.Domain.Common;

namespace OmniMind.Domain.Identity.ValueObjects;
public class Email : ValueObject
{
    public string Value { get; private set; } = default!;
    private Email() { }
    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.Contains("@"))
            throw new ArgumentException("Invalid email");

        Value = value;
    }
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}
