import { EraClaimDatesPipe } from './era-claim-dates.pipe';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';

describe('EraClaimDatesPipe', () => {
  it('create an instance', () => {
    const pipe = new EraClaimDatesPipe(new ToShortDisplayDateUtcPipe());

    expect(pipe).toBeTruthy();
  });
  it('should return combined date when claimDates have two valid dates', function () {
    var date1 = "2012-01-01";
    var date2 = "2013-02-01";
    var date1Format = new ToShortDisplayDateUtcPipe().transform(date1);
    var date2Format = new ToShortDisplayDateUtcPipe().transform(date2);
    var claimDates = [{ DateTimeQualifier: "233", Date: date2 }, { DateTimeQualifier: "232", Date: date1 }];

    expect(new EraClaimDatesPipe(new ToShortDisplayDateUtcPipe()).transform(claimDates)).toEqual(date1Format + " - " + date2Format);
});
it('should return start date when claimDates only has valid start date', function () {
    var date1 = "2012-01-01";
    var date2 = "2013-02-01";
    var date1Format = new ToShortDisplayDateUtcPipe().transform("2012-01-01");
    var claimDates = [{ DateTimeQualifier: "234", Date: date2 }, { DateTimeQualifier: "232", Date: date1 }];

    expect(new EraClaimDatesPipe(new ToShortDisplayDateUtcPipe()).transform(claimDates)).toEqual(date1Format);
});
it('should return end date when claimDates only has valid end date', function () {
    var date1 = "2012-01-01";
    var date2 = "2013-02-01";
    var date2Format = new ToShortDisplayDateUtcPipe().transform(date2);
    var claimDates = [{ DateTimeQualifier: "233", Date: date2 }, { DateTimeQualifier: "231", Date: date1 }];

    expect(new EraClaimDatesPipe(new ToShortDisplayDateUtcPipe()).transform(claimDates)).toEqual(date2Format);
});
it('should return first date when claimDates has no valid dates', function () {
    var date1 = "2012-01-01";
    var date2 = "2013-02-01";
    var date2Format = new ToShortDisplayDateUtcPipe().transform(date2);
    var claimDates = [{ DateTimeQualifier: "", Date: date2 }, { DateTimeQualifier: "", Date: date1 }];

    expect(new EraClaimDatesPipe(new ToShortDisplayDateUtcPipe()).transform(claimDates)).toEqual(date2Format);
});
it('should return empty string when claimDates is empty', function () {
    var claimDates = [];

    expect(new EraClaimDatesPipe(new ToShortDisplayDateUtcPipe()).transform(claimDates)).toEqual("");
});
});
