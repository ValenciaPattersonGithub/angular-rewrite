import { Pipe, PipeTransform, Inject } from '@angular/core';

@Pipe({
  name: 'eraPaymentMethod'
})
export class EraPaymentMethodPipe implements PipeTransform {
  constructor(@Inject('localize') private localize){}
  transform(paymentMethod: string): any {
    switch (paymentMethod) {
      case ("ACH"):
          return this.localize.getLocalizedString("ACH");
      case ("BOP"):
          return this.localize.getLocalizedString("Financial Institution Option");
      case ("CHK"):
          return this.localize.getLocalizedString("Check");
      case ("FWT"):
          return this.localize.getLocalizedString("Federal Reserve Funds/Wire Transfer");
      case ("NON"):
          return this.localize.getLocalizedString("Non-Payment Data");
      default:
          return paymentMethod;
  }
  }

}
