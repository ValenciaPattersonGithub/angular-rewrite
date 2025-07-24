import { EraTransactionTypePipe } from './era-transaction-type.pipe';
import { TestBed, inject } from '@angular/core/testing';

describe('EraClaimStatusPipe', () => {
  const mockLocalizeService: any = {
    getLocalizedString: (input: string) => input
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EraTransactionTypePipe],
      providers: [ { provide: 'localize', useValue: mockLocalizeService } ]
    });
  });
  
  it('create an instance', inject(['localize'], (localize: any) => {
    let pipe = new EraTransactionTypePipe(localize);

    expect(pipe).toBeTruthy();
  }));
  it('should return correct text when C', inject(['localize'], (localize: any) => {
    let transactionType:string ="C";

    expect(new EraTransactionTypePipe(localize).transform(transactionType)).toEqual("Payment Accompanies Remittance Advice");
  }));
  it('should return correct text when D', inject(['localize'], (localize: any) => {
    let transactionType:string = "D";

    expect(new EraTransactionTypePipe(localize).transform(transactionType)).toEqual("Make Payment Only");
  }));
  it('should return correct text when H', inject(['localize'], (localize: any) => {
    let transactionType:string = "H";

    expect(new EraTransactionTypePipe(localize).transform(transactionType)).toEqual("Notification Only");
  }));
  it('should return correct text when I', inject(['localize'], (localize: any) => {
    let transactionType:string = "I";

    expect(new EraTransactionTypePipe(localize).transform(transactionType)).toEqual("Remittance Information Only");
  }));
  it('should return correct text when P', inject(['localize'], (localize: any) => {
    let transactionType:string = "P";

    expect(new EraTransactionTypePipe(localize).transform(transactionType)).toEqual("Prenotification of Future Transfers");
  }));
  it('should return correct text when U', inject(['localize'], (localize: any) => {
    let transactionType:string = "U";

    expect(new EraTransactionTypePipe(localize).transform(transactionType)).toEqual("Split Payment and Remittance");
  }));
  it('should return correct text when X', inject(['localize'], (localize: any) => {
    let transactionType:string = "X";

    expect(new EraTransactionTypePipe(localize).transform(transactionType)).toEqual("Handling Party's Option to Split Payment and Remittance");
  }));
  it('should return default text when other', inject(['localize'], (localize: any) => {
    let transactionType:string = "Z";

    expect(new EraTransactionTypePipe(localize).transform(transactionType)).toEqual("Z");
  }));
});
