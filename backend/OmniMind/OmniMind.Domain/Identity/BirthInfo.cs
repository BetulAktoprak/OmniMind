using OmniMind.Domain.Common;

namespace OmniMind.Domain.Identity;
public class BirthInfo : ValueObject
{
    public DateOnly Date { get; private set; }
    public TimeOnly? Time { get; private set; }

    public BirthInfo(DateOnly date, TimeOnly? time)
    {
        Date = date;
        Time = time;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Date;
        yield return Time;
    }
}
