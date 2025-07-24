import { Pipe, PipeTransform } from '@angular/core';
import { EraStatementDate } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-statement-date';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';

@Pipe({
  name: 'eraClaimDates',
})
export class EraClaimDatesPipe implements PipeTransform {
  constructor(private toShortDisplayDateUtcPipe: ToShortDisplayDateUtcPipe){}
  transform(claimDates: EraStatementDate[], ...args: any[]): any {
    const start = claimDates.find((date) => date.DateTimeQualifier === "232");
    const end = claimDates.find((date) => date.DateTimeQualifier === "233" );
    if (start && end) {
        return this.toShortDisplayDateUtcPipe.transform(start.Date) + " - " + this.toShortDisplayDateUtcPipe.transform(end.Date);
    }
    if (start) {
        return this.toShortDisplayDateUtcPipe.transform(start.Date);
    }
    if (end) {
        return this.toShortDisplayDateUtcPipe.transform(end.Date);
    }
    return claimDates && claimDates[0] && claimDates[0].Date ? this.toShortDisplayDateUtcPipe.transform(claimDates[0].Date) : "";
  }

}
