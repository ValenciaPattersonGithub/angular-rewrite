import { EraHasFinancialInformationPipe } from './era-has-financial-information.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraHasFinancialInformationPipe', () => {
  it('create an instance', () => {
    const pipe = new EraHasFinancialInformationPipe();

    expect(pipe).toBeTruthy();
  });
  it('should return true when TransactionType', function () {
    let era:FullEraDto = { TransactionType: "value" };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PaymentMethod', function () {
    let era:FullEraDto = { PaymentMethod: "value" };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when TotalProviderPayment', function () {
    let era:FullEraDto = { TotalProviderPayment: 12 };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PaymentDate', function () {
    let era:FullEraDto = { PaymentDate: "value" };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when TransactionSetControlNumber', function () {
    let era:FullEraDto = { TransactionSetControlNumber: "value" };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when SenderBankNumber', function () {
    let era:FullEraDto = { SenderBankNumber: "value" };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when SenderAccountNumber', function () {
    let era:FullEraDto = { SenderAccountNumber: "value" };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when ReceiverBankNumber', function () {
    let era:FullEraDto = { ReceiverBankNumber: "value" };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when ReceiverAccountNumber', function () {
    let era:FullEraDto = { ReceiverAccountNumber: "value" };

    expect(new EraHasFinancialInformationPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return undefined when none', function () {
    let era:FullEraDto = {};

    expect(new EraHasFinancialInformationPipe().transform(era)).toEqual(undefined);
  });
});
