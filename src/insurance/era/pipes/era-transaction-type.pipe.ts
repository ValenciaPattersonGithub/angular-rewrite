import { Pipe, PipeTransform, Inject } from '@angular/core';

@Pipe({
  name: 'eraTransactionType'
})
export class EraTransactionTypePipe implements PipeTransform {
  constructor(@Inject('localize') private localize){}
  transform(transactionType: string): string {
    switch (transactionType) {
      case ("C"):
        return this.localize.getLocalizedString("Payment Accompanies Remittance Advice");
      case ("D"):
        return this.localize.getLocalizedString("Make Payment Only");
      case ("H"):
        return this.localize.getLocalizedString("Notification Only");
      case ("I"):
        return this.localize.getLocalizedString("Remittance Information Only");
      case ("P"):
        return this.localize.getLocalizedString("Prenotification of Future Transfers");
      case ("U"):
        return this.localize.getLocalizedString("Split Payment and Remittance");
      case ("X"):
        return this.localize.getLocalizedString("Handling Party's Option to Split Payment and Remittance");
      default:
        return transactionType;
    }
  }
}
