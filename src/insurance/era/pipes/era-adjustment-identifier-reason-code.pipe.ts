import { Pipe, PipeTransform, Inject } from '@angular/core';

@Pipe({
  name: 'eraAdjustmentIdentifierReasonCode'
})
export class EraAdjustmentIdentifierReasonCodePipe implements PipeTransform {
  constructor(@Inject('localize') private localize){}
  transform(identifier: string, ...args: any[]): any {
    if(!identifier) return identifier;
    const code = identifier.split(':')[0];
    if(code == '01')
      return this.localize.getLocalizedString('Card interchange fee amount');
    if(code == '02')
      return this.localize.getLocalizedString('Advanced or accelerated payment recoupment amount');
    if(code == '03')
      return this.localize.getLocalizedString('Claim transmission fee amount');
    if(code == '04')
      return this.localize.getLocalizedString('Real-time adjudication resulting in a payment that will follow separately');
    if(code == '05')
      return this.localize.getLocalizedString('Penalty amount withheld due to reports that were not filed');
    if(code == '06')
      return this.localize.getLocalizedString('Penalty amount withheld due to reports that were filed incorrectly');
    if(code == '07')
      return this.localize.getLocalizedString('Non-Internal Revenue Service third-party withholding amount unrelated to a federal payment levy program');
    if(code == '08')
      return this.localize.getLocalizedString('Penalty Withholding for Bankruptcy/Termination');    
    if(code == '50')
      return this.localize.getLocalizedString('The amount of the late charge, late claim filing penalty, or Medicare late cost report penalty');
    if(code == '51')
      return this.localize.getLocalizedString('Late filing interest penalty assessment amount');
    if(code == '72')
      return this.localize.getLocalizedString('Provider refund amount');
    if(code == '90')
      return this.localize.getLocalizedString('Early payment allowance amount');
    if(code == 'AH')
      return this.localize.getLocalizedString('Claim transmission fee amount');
    if(code == 'AM')
      return this.localize.getLocalizedString('Loan repayment amount');
    if(code == 'AP')
      return this.localize.getLocalizedString('Advanced or accelerated payment amount');
    if(code == 'B2')
      return this.localize.getLocalizedString('Rebate amount');
    if(code == 'B3')
      return this.localize.getLocalizedString('Recovery amount');
    if(code == 'BD')
      return this.localize.getLocalizedString('Bad debt amount');
    if(code == 'BN')
      return this.localize.getLocalizedString('Bonus amount'); 
    if(code == 'C5')
      return this.localize.getLocalizedString('Temporary Allowance');   //NOTE this is no longer in list
    if(code == 'CR')
      return this.localize.getLocalizedString('Capitation interest amount');
    if(code == 'CS')
      return this.localize.getLocalizedString('Adjustment amount, detailed information is provided separately to explain the adjustment');
    if(code == 'CT')
      return this.localize.getLocalizedString('Capitation payment amount');
    if(code == 'CV')
       return this.localize.getLocalizedString('Capital Passthru');  //NOTE this is no longer in list
    if(code == 'CW')
      return this.localize.getLocalizedString('Certified Registered Nurse Anesthetist Passthru');  //NOTE this is no longer in list
    if(code == 'DM')
      return this.localize.getLocalizedString('Direct Medical Education Passthru');  //NOTE this is no longer in list
    if(code == 'E3')
      return this.localize.getLocalizedString('Withholding amount');
    if(code == 'FB')
      return this.localize.getLocalizedString('Non-claim related balance forward amount');
    if(code == 'FC')
      return this.localize.getLocalizedString('Allocation of prepaid funds against which deductions are drawn as services are provided');
    if(code == 'FR')
      return this.localize.getLocalizedString('Claim-related balance forward amount');
    if(code == 'GO')
      return this.localize.getLocalizedString('Graduate Medical Education Passthru');  //NOTE this is no longer in list
    if(code == 'HM')
      return this.localize.getLocalizedString('Hemophilia clotting factor add-on payment amount');
    if(code == 'IP')
      return this.localize.getLocalizedString('Incentive payment amount');
    if(code == 'IR')
      return this.localize.getLocalizedString('Internal Revenue Service 1099 withholding amount');
    if(code == 'IS')
      return this.localize.getLocalizedString('Lump sum based on an interim rate');
    if(code == 'J1')
      return this.localize.getLocalizedString('Amount not reimbursed based on a demonstration program or other limitation that prevents issuance of payment');
    if(code == 'L3')
      return this.localize.getLocalizedString('Penalty amount');
    if(code == 'L6')
      return this.localize.getLocalizedString('Interest amount');
    if(code == 'LE')
      return this.localize.getLocalizedString('Internal Revenue Service non-1099 withholding amount');
    if(code == 'LS')
      return this.localize.getLocalizedString('Lump Sum');  //NOTE this is no longer in list
    if(code == 'OA')
      return this.localize.getLocalizedString('Organ Acquisition Passthru');  //NOTE this is no longer in list
    if(code == 'OB')
      return this.localize.getLocalizedString('Affiliated provider(s) offset amount');
    if(code == 'PI')
      return this.localize.getLocalizedString('Periodic Interim Payment (PIP) lump sum amount');
    if(code == 'PL')
      return this.localize.getLocalizedString('Final payment or settlement amount');
    if(code == 'RA')
      return this.localize.getLocalizedString('Retroactive adjustment amount');
    if(code == 'RE')
      return this.localize.getLocalizedString('Return on Equity');//NOTE this is no longer in list
    if(code == 'SL')
      return this.localize.getLocalizedString('Student loan garnishment amount');
    if(code == 'TL')
      return this.localize.getLocalizedString('Third party liability determination amount');
    if(code == 'WO')
      return this.localize.getLocalizedString('Overpayment recovery amount');
    if(code == 'WU')
      return this.localize.getLocalizedString('Non-Internal Revenue Service withholding amount related to a federal payment levy program');
    return code;
  }

}
