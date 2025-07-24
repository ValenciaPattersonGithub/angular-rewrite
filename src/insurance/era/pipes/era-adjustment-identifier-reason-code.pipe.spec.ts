import { EraAdjustmentIdentifierReasonCodePipe } from './era-adjustment-identifier-reason-code.pipe';
import { TestBed, inject } from '@angular/core/testing';

describe('EraAdjustmentIdentifierReasonCodePipe', () => {
  const mockLocalizeService: any = {
    getLocalizedString: (input: string) => input
  };

//   reference https://x12.org/codes/provider-adjustment-reason-codes

  var reasonDescriptions=[];
  var reasonCodes = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EraAdjustmentIdentifierReasonCodePipe],
      providers: [ { provide: 'localize', useValue: mockLocalizeService } ]
    });
    reasonDescriptions = [
        'Card interchange fee amount',
        'Advanced or accelerated payment recoupment amount',
        'Claim transmission fee amount', 
        'Real-time adjudication resulting in a payment that will follow separately', 
        'Penalty amount withheld due to reports that were not filed', 
        'Penalty amount withheld due to reports that were filed incorrectly', 
        'Non-Internal Revenue Service third-party withholding amount unrelated to a federal payment levy program', 
        'Penalty Withholding for Bankruptcy/Termination', 
        'The amount of the late charge, late claim filing penalty, or Medicare late cost report penalty', 
        'Late filing interest penalty assessment amount', 
        'Provider refund amount', 
        'Early payment allowance amount', 
        'Claim transmission fee amount', 
        'Loan repayment amount', 
        'Advanced or accelerated payment amount', 
        'Rebate amount', 
        'Recovery amount', 
        'Bad debt amount', 
        'Bonus amount',
        'Capitation interest amount',
        'Adjustment amount, detailed information is provided separately to explain the adjustment', 
        'Capitation payment amount', 
        'Withholding amount', 
        'Non-claim related balance forward amount', 
        'Allocation of prepaid funds against which deductions are drawn as services are provided', 
        'Claim-related balance forward amount', 
        'Hemophilia clotting factor add-on payment amount', 
        'Incentive payment amount', 
        'Internal Revenue Service 1099 withholding amount', 
        'Lump sum based on an interim rate', 
        'Amount not reimbursed based on a demonstration program or other limitation that prevents issuance of payment', 
        'Penalty amount', 
        'Interest amount', 
        'Internal Revenue Service non-1099 withholding amount', 
        'Affiliated provider(s) offset amount', 
        'Periodic Interim Payment (PIP) lump sum amount', 
        'Final payment or settlement amount', 
        'Retroactive adjustment amount', 
        'Student loan garnishment amount', 
        'Third party liability determination amount', 
        'Overpayment recovery amount', 
        'Non-Internal Revenue Service withholding amount related to a federal payment levy program'
    ];

    reasonCodes = [
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '50',
        '51',
        '72',
        '90',
        'AH',
        'AM',
        'AP',
        'B2',
        'B3',
        'BD',
        'BN',
        'CR',
        'CS',
        'CT',
        'E3',
        'FB',
        'FC',
        'FR',
        'HM',
        'IP',
        'IR',
        'IS',
        'J1',
        'L3',
        'L6',
        'LE',
        'OB',
        'PI',
        'PL',
        'RA',
        'SL',
        'TL',
        'WO',
        'WU']
  });
  
  it('create an instance', inject(['localize'], (localize: any) => {
    let pipe = new EraAdjustmentIdentifierReasonCodePipe(localize);

    expect(pipe).toBeTruthy();
  }));
  
  it('should return proper value when give code', inject(['localize'], (localize: any) => {
    for(var i = 0; i < reasonCodes.length; i++) {
      expect(new EraAdjustmentIdentifierReasonCodePipe(localize).transform(reasonCodes[i])).toEqual(reasonDescriptions[i]);
    }
  }));

  it('should return ReasonCode if no match in list', inject(['localize'], (localize: any) => {
    expect(new EraAdjustmentIdentifierReasonCodePipe(localize).transform('09:09-10')).toEqual('09');    
  }));
  
  it('should return null description value reasonCode is null', inject(['localize'], (localize: any) => {
    expect(new EraAdjustmentIdentifierReasonCodePipe(localize).transform(null)).toBe(null)   
  }));
});