import { EraClaimStatusPipe } from './era-claim-status.pipe';
import { TestBed, inject } from '@angular/core/testing';

describe('EraClaimStatusPipe', () => {
  const mockLocalizeService: any = {
    getLocalizedString: (input: string) => input
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EraClaimStatusPipe],
      providers: [ { provide: 'localize', useValue: mockLocalizeService } ]
    });
  });
  
  it('create an instance', inject(['localize'], (localize: any) => {
    let pipe = new EraClaimStatusPipe(localize);

    expect(pipe).toBeTruthy();
  }));
  it('should return correct text when 1', inject(['localize'], (localize: any) => {
    let claimStatus:string = "1";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Processed as Primary");
  }));
  it('should return correct text when 2', inject(['localize'], (localize: any) => {
    let claimStatus:string = "2";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Processed as Secondary");
  }));
  it('should return correct text when 3', inject(['localize'], (localize: any) => {
    let claimStatus:string = "3";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Processed as Tertiary");
  }));
  it('should return correct text when 4', inject(['localize'], (localize: any) => {
    let claimStatus:string = "4";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Denied");
  }));
  it('should return correct text when 19', inject(['localize'], (localize: any) => {
    let claimStatus:string = "19";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Processed as Primary, Forwarded to Additional Payer(s)");
  }));
  it('should return correct text when 20', inject(['localize'], (localize: any) => {
    let claimStatus:string = "20";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Processed as Secondary, Forwarded to Additional Payer(s)");
  }));
  it('should return correct text when 21', inject(['localize'], (localize: any) => {
    let claimStatus:string = "21";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Processed as Tertiary, Forwarded to Additional Payer(s)");
  }));
  it('should return correct text when 22', inject(['localize'], (localize: any) => {
    let claimStatus:string = "22";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Reversal of Previous Payment");
  }));
  it('should return correct text when 23', inject(['localize'], (localize: any) => {
    let claimStatus:string = "23";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Not Our Claim, Forwarded to Additional Payer(s)");
  }));
  it('should return correct text when 25', inject(['localize'], (localize: any) => {
    let claimStatus:string = "25";

    expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("Predetermination Pricing Only - No Payment");
  }));
  it('should return correct text when other', inject(['localize'], (localize: any) => {
    let claimStatus:string = "26";

      expect(new EraClaimStatusPipe(localize).transform(claimStatus)).toEqual("26");
  }));
});