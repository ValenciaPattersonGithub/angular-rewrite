import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraHasFinancialInformation'
})
export class EraHasFinancialInformationPipe implements PipeTransform {
  transform(era: FullEraDto): any {
    return era.TransactionType ||
      era.PaymentMethod ||
      era.TotalProviderPayment ||
      era.PaymentDate ||
      era.TransactionSetControlNumber ||
      era.SenderBankNumber ||
      era.SenderAccountNumber ||
      era.ReceiverBankNumber  ||
      era.ReceiverAccountNumber;
  }
}
