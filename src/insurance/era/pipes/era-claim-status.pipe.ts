import { Pipe, PipeTransform, Inject } from '@angular/core';

@Pipe({
  name: 'eraClaimStatus'
})
export class EraClaimStatusPipe implements PipeTransform {
  constructor(@Inject('localize') private localize: any){}

  transform(claimStatus: string): any {
    switch (claimStatus) {
      case ("1"):
        return this.localize.getLocalizedString("Processed as Primary");
      case ("2"):
        return this.localize.getLocalizedString("Processed as Secondary");
      case ("3"):
        return this.localize.getLocalizedString("Processed as Tertiary");
      case ("4"):
        return this.localize.getLocalizedString("Denied");
      case ("19"):
        return this.localize.getLocalizedString("Processed as Primary, Forwarded to Additional Payer(s)");
      case ("20"):
        return this.localize.getLocalizedString("Processed as Secondary, Forwarded to Additional Payer(s)");
      case ("21"):
        return this.localize.getLocalizedString("Processed as Tertiary, Forwarded to Additional Payer(s)");
      case ("22"):
        return this.localize.getLocalizedString("Reversal of Previous Payment");
      case ("23"):
        return this.localize.getLocalizedString("Not Our Claim, Forwarded to Additional Payer(s)");
      case ("25"):
        return this.localize.getLocalizedString("Predetermination Pricing Only - No Payment");
      default:
        return claimStatus;
    }
  }
}
