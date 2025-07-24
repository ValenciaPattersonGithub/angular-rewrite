import { EraPaymentMethodPipe } from './era-payment-method.pipe';
import { TestBed, inject } from '@angular/core/testing';

describe('EraClaimStatusPipe', () => {
  const mockLocalizeService: any = {
    getLocalizedString: (input: string) => input
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EraPaymentMethodPipe],
      providers: [ { provide: 'localize', useValue: mockLocalizeService } ]
    });
  });
  
  it('create an instance', inject(['localize'], (localize: any) => {
    let pipe = new EraPaymentMethodPipe(localize);

    expect(pipe).toBeTruthy();
  }));
  it('should return correct text when ACH', inject(['localize'], (localize: any) => {
    let paymentMethod:string = "ACH";

    expect(new EraPaymentMethodPipe(localize).transform(paymentMethod)).toEqual("ACH");
  }));
  it('should return correct text when BOP', inject(['localize'], (localize: any) => {
    let paymentMethod:string = "BOP";

    expect(new EraPaymentMethodPipe(localize).transform(paymentMethod)).toEqual("Financial Institution Option");
  }));
  it('should return correct text when CHK', inject(['localize'], (localize: any) => {
    let paymentMethod:string = "CHK";

    expect(new EraPaymentMethodPipe(localize).transform(paymentMethod)).toEqual("Check");
  }));
  it('should return correct text when FWT', inject(['localize'], (localize: any) => {
    let paymentMethod:string = "FWT";

    expect(new EraPaymentMethodPipe(localize).transform(paymentMethod)).toEqual("Federal Reserve Funds/Wire Transfer");
  }));
  it('should return correct text when NON', inject(['localize'], (localize: any) => {
    let paymentMethod:string = "NON";

    expect(new EraPaymentMethodPipe(localize).transform(paymentMethod)).toEqual("Non-Payment Data");
  }));
  it('should return default text when other', inject(['localize'], (localize: any) => {
    let paymentMethod:string = "OTH";

    expect(new EraPaymentMethodPipe(localize).transform(paymentMethod)).toEqual("OTH");
  }));
});
