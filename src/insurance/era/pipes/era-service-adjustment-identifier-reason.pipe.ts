import { Inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'eraServiceAdjustmentIdentifierReason'
})
export class EraServiceAdjustmentIdentifierReasonPipe implements PipeTransform {
    constructor(@Inject('localize') private localize) { }
    transform(identifier: string, ...args: any[]): any {
        if (!identifier) return identifier;
        let code = identifier.split(':')[0];
        if (code == '1')
           return this.localize.getLocalizedString('Deductible Amount')
        if (code == '2')
            return this.localize.getLocalizedString('Coinsurance Amount')
        if (code == '3')
            return this.localize.getLocalizedString('Co-payment Amount');
        if (code == '4')
            return this.localize.getLocalizedString('The procedure code is inconsistent with the modifier used. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '5')
            return this.localize.getLocalizedString('The procedure code/type of bill is inconsistent with the place of service. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '6')
            return this.localize.getLocalizedString('The procedure/revenue code is inconsistent with the patient\'s age.Usage: Refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment Information REF), if present.');
        if (code == '7')
            return this.localize.getLocalizedString('The procedure/revenue code is inconsistent with the patient\'s gender.Usage: Refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment Information REF), if present.');
        if (code == '8')
            return this.localize.getLocalizedString('The procedure code is inconsistent with the provider type/specialty (taxonomy). Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '9')
            return this.localize.getLocalizedString('The diagnosis is inconsistent with the patient\'s age.Usage: Refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment Information REF), if present.');
        if (code == '01')
            return this.localize.getLocalizedString('Deductible Amount')
        if (code == '02')
            return this.localize.getLocalizedString('Coinsurance Amount')
        if (code == '03')
            return this.localize.getLocalizedString('Co-payment Amount');
        if (code == '04')
            return this.localize.getLocalizedString('The procedure code is inconsistent with the modifier used. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '05')
            return this.localize.getLocalizedString('The procedure code/type of bill is inconsistent with the place of service. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '06')
            return this.localize.getLocalizedString('The procedure/revenue code is inconsistent with the patient\'s age.Usage: Refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment Information REF), if present.');
        if (code == '07')
            return this.localize.getLocalizedString('The procedure/revenue code is inconsistent with the patient\'s gender.Usage: Refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment Information REF), if present.');
        if (code == '08')
            return this.localize.getLocalizedString('The procedure code is inconsistent with the provider type/specialty (taxonomy). Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '09')
            return this.localize.getLocalizedString('The diagnosis is inconsistent with the patient\'s age.Usage: Refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment Information REF), if present.');
        if (code == '10')
            return this.localize.getLocalizedString('The diagnosis is inconsistent with the patient\'s gender.Usage: Refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment Information REF), if present.');
        if (code == '11')
            return this.localize.getLocalizedString('The diagnosis is inconsistent with the procedure. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '12')
            return this.localize.getLocalizedString('The diagnosis is inconsistent with the provider type. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '13')
            return this.localize.getLocalizedString('The date of death precedes the date of service.');
        if (code == '14')
            return this.localize.getLocalizedString('The date of birth follows the date of service.');
        if (code == '16')
            return this.localize.getLocalizedString('Claim/service lacks information or has submission/billing error(s). Usage: Do not use this code for claims attachment(s)/other documentation. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.) Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '18')
            return this.localize.getLocalizedString('Exact duplicate claim/service (Use only with Group Code OA except where state workers\' compensation regulations requires CO)');
        if (code == '19')
            return this.localize.getLocalizedString('This is a work-related injury/illness and thus the liability of the Worker\'s Compensation Carrier.');
        if (code == '20')
            return this.localize.getLocalizedString('This injury/illness is covered by the liability carrier.');
        if (code == '21')
            return this.localize.getLocalizedString('This injury/illness is the liability of the no-fault carrier.');
        if (code == '22')
            return this.localize.getLocalizedString('This care may be covered by another payer per coordination of benefits.');
        if (code == '23')
            return this.localize.getLocalizedString('The impact of prior payer(s) adjudication including payments and/or adjustments. (Use only with Group Code OA)');
        if (code == '24')
            return this.localize.getLocalizedString('Charges are covered under a capitation agreement/managed care plan.');
        if (code == '26')
            return this.localize.getLocalizedString('Expenses incurred prior to coverage.');
        if (code == '27')
            return this.localize.getLocalizedString('Expenses incurred after coverage terminated.');
        if (code == '29')
            return this.localize.getLocalizedString('The time limit for filing has expired.');
        if (code == '31')
            return this.localize.getLocalizedString('Patient cannot be identified as our insured.');
        if (code == '32')
            return this.localize.getLocalizedString('Our records indicate the patient is not an eligible dependent.');
        if (code == '33')
            return this.localize.getLocalizedString('Insured has no dependent coverage.');
        if (code == '34')
            return this.localize.getLocalizedString('Insured has no coverage for newborns.');
        if (code == '35')
            return this.localize.getLocalizedString('Lifetime benefit maximum has been reached.');
        if (code == '39')
            return this.localize.getLocalizedString('Services denied at the time authorization/pre-certification was requested.');
        if (code == '40')
            return this.localize.getLocalizedString('Charges do not meet qualifications for emergent/urgent care. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '44')
            return this.localize.getLocalizedString('Prompt-pay discount.');
        if (code == '45')
            return this.localize.getLocalizedString('Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement. Usage: This adjustment amount cannot equal the total service or claim charge amount; and must not duplicate provider adjustment amounts (payments and contractual reductions) that have resulted from prior payer(s) adjudication. (Use only with Group Codes PR or CO depending upon liability)');
        if (code == '49')
            return this.localize.getLocalizedString('This is a non-covered service because it is a routine/preventive exam or a diagnostic/screening procedure done in conjunction with a routine/preventive exam. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '50')
            return this.localize.getLocalizedString('These are non-covered services because this is not deemed a \'medical necessity\' by the payer. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '51')
            return this.localize.getLocalizedString('These are non-covered services because this is a pre-existing condition. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '53')
            return this.localize.getLocalizedString('Services by an immediate relative or a member of the same household are not covered.');
        if (code == '54')
            return this.localize.getLocalizedString('Multiple physicians/assistants are not covered in this case. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '55')
            return this.localize.getLocalizedString('Procedure/treatment/drug is deemed experimental/investigational by the payer. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '56')
            return this.localize.getLocalizedString('Procedure/treatment has not been deemed \'proven to be effective\' by the payer. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '58')
            return this.localize.getLocalizedString('Treatment was deemed by the payer to have been rendered in an inappropriate or invalid place of service. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '59')
            return this.localize.getLocalizedString('Processed based on multiple or concurrent procedure rules. (For example multiple surgery or diagnostic imaging, concurrent anesthesia.) Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '60')
            return this.localize.getLocalizedString('Charges for outpatient services are not covered when performed within a period of time prior to or after inpatient services.');
        if (code == '61')
            return this.localize.getLocalizedString('Adjusted for failure to obtain second surgical opinion');
        if (code == '66')
            return this.localize.getLocalizedString('Blood Deductible.');
        if (code == '69')
            return this.localize.getLocalizedString('Day outlier amount.');
        if (code == '70')
            return this.localize.getLocalizedString('Cost outlier - Adjustment to compensate for additional costs.');
        if (code == '74')
            return this.localize.getLocalizedString('Indirect Medical Education Adjustment.');
        if (code == '75')
            return this.localize.getLocalizedString('Direct Medical Education Adjustment.');
        if (code == '76')
            return this.localize.getLocalizedString('Disproportionate Share Adjustment.');
        if (code == '78')
            return this.localize.getLocalizedString('Non-Covered days/Room charge adjustment.');
        if (code == '85')
            return this.localize.getLocalizedString('Patient Interest Adjustment (Use Only Group code PR)');
        if (code == '89')
            return this.localize.getLocalizedString('Professional fees removed from charges.');
        if (code == '90')
            return this.localize.getLocalizedString('Ingredient cost adjustment. Usage: To be used for pharmaceuticals only.');
        if (code == '91')
            return this.localize.getLocalizedString('Dispensing fee adjustment.');
        if (code == '94')
            return this.localize.getLocalizedString('Processed in Excess of charges.');
        if (code == '95')
            return this.localize.getLocalizedString('Plan procedures not followed.');
        if (code == '96')
            return this.localize.getLocalizedString('Non-covered charge(s). At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.) Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '97')
            return this.localize.getLocalizedString('The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '100')
            return this.localize.getLocalizedString('Payment made to patient/insured/responsible party.');
        if (code == '101')
            return this.localize.getLocalizedString('Predetermination: anticipated payment upon completion of services or claim adjudication.');
        if (code == '102')
            return this.localize.getLocalizedString('Major Medical Adjustment.');
        if (code == '103')
            return this.localize.getLocalizedString('Provider promotional discount (e.g., Senior citizen discount).');
        if (code == '104')
            return this.localize.getLocalizedString('Managed care withholding.');
        if (code == '105')
            return this.localize.getLocalizedString('Tax withholding.');
        if (code == '106')
            return this.localize.getLocalizedString('Patient payment option/election not in effect.');
        if (code == '107')
            return this.localize.getLocalizedString('The related or qualifying claim/service was not identified on this claim. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '108')
            return this.localize.getLocalizedString('Rent/purchase guidelines were not met. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '109')
            return this.localize.getLocalizedString('Claim/service not covered by this payer/contractor. You must send the claim/service to the correct payer/contractor.');
        if (code == '110')
            return this.localize.getLocalizedString('Billing date predates service date.');
        if (code == '111')
            return this.localize.getLocalizedString('Not covered unless the provider accepts assignment.');
        if (code == '112')
            return this.localize.getLocalizedString('Service not furnished directly to the patient and/or not documented.');
        if (code == '114')
            return this.localize.getLocalizedString('Procedure/product not approved by the Food and Drug Administration.');
        if (code == '115')
            return this.localize.getLocalizedString('Procedure postponed, canceled, or delayed.');
        if (code == '116')
            return this.localize.getLocalizedString('The advance indemnification notice signed by the patient did not comply with requirements.');
        if (code == '117')
            return this.localize.getLocalizedString('Transportation is only covered to the closest facility that can provide the necessary care.');
        if (code == '118')
            return this.localize.getLocalizedString('ESRD network support adjustment.');
        if (code == '119')
            return this.localize.getLocalizedString('Benefit maximum for this time period or occurrence has been reached.');
        if (code == '121')
            return this.localize.getLocalizedString('Indemnification adjustment - compensation for outstanding member responsibility.');
        if (code == '122')
            return this.localize.getLocalizedString('Psychiatric reduction.');
        if (code == '128')
            return this.localize.getLocalizedString('Newborn\'s services are covered in the mother\'s Allowance.');
        if (code == '129')
            return this.localize.getLocalizedString('Prior processing information appears incorrect. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == '130')
            return this.localize.getLocalizedString('Claim submission fee.');
        if (code == '131')
            return this.localize.getLocalizedString('Claim specific negotiated discount.');
        if (code == '132')
            return this.localize.getLocalizedString('Prearranged demonstration project adjustment.');
        if (code == '133')
            return this.localize.getLocalizedString('The disposition of this service line is pending further review. (Use only with Group Code OA). Usage: Use of this code requires a reversal and correction when the service line is finalized (use only in Loop 2110 CAS segment of the 835 or Loop 2430 of the 837).');
        if (code == '134')
            return this.localize.getLocalizedString('Technical fees removed from charges.');
        if (code == '135')
            return this.localize.getLocalizedString('Interim bills cannot be processed.');
        if (code == '136')
            return this.localize.getLocalizedString('Failure to follow prior payer\'s coverage rules. (Use only with Group Code OA) ');
        if (code == '137')
            return this.localize.getLocalizedString('Regulatory Surcharges, Assessments, Allowances or Health Related Taxes.');
        if (code == '139')
            return this.localize.getLocalizedString('Contracted funding agreement - Subscriber is employed by the provider of services. Use only with Group Code CO.');
        if (code == '140')
            return this.localize.getLocalizedString('Patient/Insured health identification number and name do not match.');
        if (code == '142')
            return this.localize.getLocalizedString('Monthly Medicaid patient liability amount.');
        if (code == '143')
            return this.localize.getLocalizedString('Portion of payment deferred.');
        if (code == '144')
            return this.localize.getLocalizedString('Incentive adjustment, e.g. preferred product/service.');
        if (code == '146')
            return this.localize.getLocalizedString('Diagnosis was invalid for the date(s) of service reported.');
        if (code == '147')
            return this.localize.getLocalizedString('Provider contracted/negotiated rate expired or not on file.');
        if (code == '148')
            return this.localize.getLocalizedString('Information from another provider was not provided or was insufficient/incomplete. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == '149')
            return this.localize.getLocalizedString('Lifetime benefit maximum has been reached for this service/benefit category.');
        if (code == '150')
            return this.localize.getLocalizedString('Payer deems the information submitted does not support this level of service.');
        if (code == '151')
            return this.localize.getLocalizedString('Payment adjusted because the payer deems the information submitted does not support this many/frequency of services.');
        if (code == '152')
            return this.localize.getLocalizedString('Payer deems the information submitted does not support this length of service. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '153')
            return this.localize.getLocalizedString('Payer deems the information submitted does not support this dosage.');
        if (code == '154')
            return this.localize.getLocalizedString('Payer deems the information submitted does not support this day\'s supply.');
        if (code == '155')
            return this.localize.getLocalizedString('Patient refused the service/procedure.');
        if (code == '157')
            return this.localize.getLocalizedString('Service/procedure was provided as a result of an act of war.');
        if (code == '158')
            return this.localize.getLocalizedString('Service/procedure was provided outside of the United States.');
        if (code == '159')
            return this.localize.getLocalizedString('Service/procedure was provided as a result of terrorism.');
        if (code == '160')
            return this.localize.getLocalizedString('Injury/illness was the result of an activity that is a benefit exclusion.');
        if (code == '161')
            return this.localize.getLocalizedString('Provider performance bonus');
        if (code == '163')
            return this.localize.getLocalizedString('Attachment/other documentation referenced on the claim was not received.');
        if (code == '164')
            return this.localize.getLocalizedString('Attachment/other documentation referenced on the claim was not received in a timely fashion.');
        if (code == '166')
            return this.localize.getLocalizedString('These services were submitted after this payers responsibility for processing claims under this plan ended.');
        if (code == '167')
            return this.localize.getLocalizedString('This (these) diagnosis(es) is (are) not covered. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '169')
            return this.localize.getLocalizedString('Alternate benefit has been provided.');
        if (code == '170')
            return this.localize.getLocalizedString('Payment is denied when performed/billed by this type of provider. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '171')
            return this.localize.getLocalizedString('Payment is denied when performed/billed by this type of provider in this type of facility. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '172')
            return this.localize.getLocalizedString('Payment is adjusted when performed/billed by a provider of this specialty. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '173')
            return this.localize.getLocalizedString('Service/equipment was not prescribed by a physician.');
        if (code == '174')
            return this.localize.getLocalizedString('Service was not prescribed prior to delivery.');
        if (code == '175')
            return this.localize.getLocalizedString('Prescription is incomplete.');
        if (code == '176')
            return this.localize.getLocalizedString('Prescription is not current.');
        if (code == '177')
            return this.localize.getLocalizedString('Patient has not met the required eligibility requirements.');
        if (code == '178')
            return this.localize.getLocalizedString('Patient has not met the required spend down requirements.');
        if (code == '179')
            return this.localize.getLocalizedString('Patient has not met the required waiting requirements. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '180')
            return this.localize.getLocalizedString('Patient has not met the required residency requirements.');
        if (code == '181')
            return this.localize.getLocalizedString('Procedure code was invalid on the date of service.');
        if (code == '182')
            return this.localize.getLocalizedString('Procedure modifier was invalid on the date of service.');
        if (code == '183')
            return this.localize.getLocalizedString('The referring provider is not eligible to refer the service billed. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '184')
            return this.localize.getLocalizedString('The prescribing/ordering provider is not eligible to prescribe/order the service billed. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '185')
            return this.localize.getLocalizedString('The rendering provider is not eligible to perform the service billed. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '186')
            return this.localize.getLocalizedString('Level of care change adjustment.');
        if (code == '187')
            return this.localize.getLocalizedString('Consumer Spending Account payments (includes but is not limited to Flexible Spending Account, Health Savings Account, Health Reimbursement Account, etc.)');
        if (code == '188')
            return this.localize.getLocalizedString('This product/procedure is only covered when used according to FDA recommendations.');
        if (code == '189')
            return this.localize.getLocalizedString('\'Not otherwise classified\' or \'unlisted\' procedure code (CPT/HCPCS) was billed when there is a specific procedure code for this procedure/service');
        if (code == '190')
            return this.localize.getLocalizedString('Payment is included in the allowance for a Skilled Nursing Facility (SNF) qualified stay.');
        if (code == '192')
            return this.localize.getLocalizedString('Non standard adjustment code from paper remittance. Usage: This code is to be used by providers/payers providing Coordination of Benefits information to another payer in the 837 transaction only. This code is only used when the non-standard code cannot be reasonably mapped to an existing Claims Adjustment Reason Code, specifically Deductible, Coinsurance and Co-payment.');
        if (code == '193')
            return this.localize.getLocalizedString('Original payment decision is being maintained. Upon review, it was determined that this claim was processed properly.');
        if (code == '194')
            return this.localize.getLocalizedString('Anesthesia performed by the operating physician, the assistant surgeon or the attending physician.');
        if (code == '195')
            return this.localize.getLocalizedString('Refund issued to an erroneous priority payer for this claim/service.');
        if (code == '197')
            return this.localize.getLocalizedString('Precertification/authorization/notification/pre-treatment absent.');
        if (code == '198')
            return this.localize.getLocalizedString('Precertification/notification/authorization/pre-treatment exceeded.');
        if (code == '199')
            return this.localize.getLocalizedString('Revenue code and Procedure code do not match.');
        if (code == '200')
            return this.localize.getLocalizedString('Expenses incurred during lapse in coverage');
        if (code == '201')
            return this.localize.getLocalizedString('Patient is responsible for amount of this claim/service through \'set aside arrangement\' or other agreement. (Use only with Group Code PR) At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == '202')
            return this.localize.getLocalizedString('Non-covered personal comfort or convenience services.');
        if (code == '203')
            return this.localize.getLocalizedString('Discontinued or reduced service.');
        if (code == '204')
            return this.localize.getLocalizedString('This service/equipment/drug is not covered under the patient\'s current benefit plan');
        if (code == '205')
            return this.localize.getLocalizedString('Pharmacy discount card processing fee');
        if (code == '206')
            return this.localize.getLocalizedString('National Provider Identifier - missing.');
        if (code == '207')
            return this.localize.getLocalizedString('National Provider identifier - Invalid format');
        if (code == '208')
            return this.localize.getLocalizedString('National Provider Identifier - Not matched.');
        if (code == '209')
            return this.localize.getLocalizedString('Per regulatory or other agreement. The provider cannot collect this amount from the patient. However, this amount may be billed to subsequent payer. Refund to patient if collected. (Use only with Group code OA)');
        if (code == '210')
            return this.localize.getLocalizedString('Payment adjusted because pre-certification/authorization not received in a timely fashion');
        if (code == '211')
            return this.localize.getLocalizedString('National Drug Codes (NDC) not eligible for rebate, are not covered.');
        if (code == '212')
            return this.localize.getLocalizedString('Administrative surcharges are not covered');
        if (code == '213')
            return this.localize.getLocalizedString('Non-compliance with the physician self referral prohibition legislation or payer policy.');
        if (code == '215')
            return this.localize.getLocalizedString('Based on subrogation of a third party settlement');
        if (code == '216')
            return this.localize.getLocalizedString('Based on the findings of a review organization');
        if (code == '219')
            return this.localize.getLocalizedString('Based on extent of injury. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment (Loop 2100 Other Claim Related Information REF qualifier \'IG\') for the jurisdictional regulation. If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF).');
        if (code == '222')
            return this.localize.getLocalizedString('Exceeds the contracted maximum number of hours/days/units by this provider for this period. This is not patient specific. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '223')
            return this.localize.getLocalizedString('Adjustment code for mandated federal, state or local law/regulation that is not already covered by another code and is mandated before a new code can be created.');
        if (code == '224')
            return this.localize.getLocalizedString('Patient identification compromised by identity theft. Identity verification required for processing this and future claims.');
        if (code == '225')
            return this.localize.getLocalizedString('Penalty or Interest Payment by Payer (Only used for plan to plan encounter reporting within the 837)');
        if (code == '226')
            return this.localize.getLocalizedString('Information requested from the Billing/Rendering Provider was not provided or not provided timely or was insufficient/incomplete. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == '227')
            return this.localize.getLocalizedString('Information requested from the patient/insured/responsible party was not provided or was insufficient/incomplete. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == '228')
            return this.localize.getLocalizedString('Denied for failure of this provider, another provider or the subscriber to supply requested information to a previous payer for their adjudication');
        if (code == '229')
            return this.localize.getLocalizedString('Partial charge amount not considered by Medicare due to the initial claim Type of Bill being 12X. Usage: This code can only be used in the 837 transaction to convey Coordination of Benefits information when the secondary payer\'s cost avoidance policy allows providers to bypass claim submission to a prior payer. (Use only with Group Code PR) ');
        if (code == '231')
            return this.localize.getLocalizedString('Mutually exclusive procedures cannot be done in the same day/setting. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '232')
            return this.localize.getLocalizedString('Institutional Transfer Amount. Usage: Applies to institutional claims only and explains the DRG amount difference when the patient care crosses multiple institutions.');
        if (code == '233')
            return this.localize.getLocalizedString('Services/charges related to the treatment of a hospital-acquired condition or preventable medical error.');
        if (code == '234')
            return this.localize.getLocalizedString('This procedure is not paid separately. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == '235')
            return this.localize.getLocalizedString('Sales Tax');
        if (code == '236')
            return this.localize.getLocalizedString('This procedure or procedure/modifier combination is not compatible with another procedure or procedure/modifier combination provided on the same day according to the National Correct Coding Initiative or workers compensation state regulations/ fee schedule requirements.');
        if (code == '237')
            return this.localize.getLocalizedString('Legislated/Regulatory Penalty. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == '238')
            return this.localize.getLocalizedString('Claim spans eligible and ineligible periods of coverage, this is the reduction for the ineligible period. (Use only with Group Code PR)');
        if (code == '239')
            return this.localize.getLocalizedString('Claim spans eligible and ineligible periods of coverage. Rebill separate claims.');
        if (code == '240')
            return this.localize.getLocalizedString('The diagnosis is inconsistent with the patient\'s birth weight.Usage: Refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment Information REF), if present.');
        if (code == '241')
            return this.localize.getLocalizedString('Low Income Subsidy (LIS) Co-payment Amount');
        if (code == '242')
            return this.localize.getLocalizedString('Services not provided by network/primary care providers.');
        if (code == '243')
            return this.localize.getLocalizedString('Services not authorized by network/primary care providers.');
        if (code == '245')
            return this.localize.getLocalizedString('Provider performance program withhold.');
        if (code == '246')
            return this.localize.getLocalizedString('This non-payable code is for required reporting only.');
        if (code == '247')
            return this.localize.getLocalizedString('Deductible for Professional service rendered in an Institutional setting and billed on an Institutional claim.');
        if (code == '248')
            return this.localize.getLocalizedString('Coinsurance for Professional service rendered in an Institutional setting and billed on an Institutional claim.');
        if (code == '249')
            return this.localize.getLocalizedString('This claim has been identified as a readmission. (Use only with Group Code CO)');
        if (code == '250')
            return this.localize.getLocalizedString('The attachment/other documentation that was received was the incorrect attachment/document. The expected attachment/document is still missing. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT).');
        if (code == '251')
            return this.localize.getLocalizedString('The attachment/other documentation that was received was incomplete or deficient. The necessary information is still needed to process the claim. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT).');
        if (code == '252')
            return this.localize.getLocalizedString('An attachment/other documentation is required to adjudicate this claim/service. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT).');
        if (code == '253')
            return this.localize.getLocalizedString('Sequestration - reduction in federal payment');
        if (code == '254')
            return this.localize.getLocalizedString('Claim received by the dental plan, but benefits not available under this plan. Submit these services to the patient\'s medical plan for further consideration.');
        if (code == '256')
                return this.localize.getLocalizedString('Service not payable per managed care contract.');
        if (code == '257')
            return this.localize.getLocalizedString('The disposition of the claim/service is undetermined during the premium payment grace period, per Health Insurance Exchange requirements. This claim/service will be reversed and corrected when the grace period ends (due to premium payment or lack of premium payment). (Use only with Group Code OA)');
        if (code == '258')
            return this.localize.getLocalizedString('Claim/service not covered when patient is in custody/incarcerated. Applicable federal, state or local authority may cover the claim/service.');
        if (code == '259')
            return this.localize.getLocalizedString('Additional payment for Dental/Vision service utilization.');
        if (code == '260')
            return this.localize.getLocalizedString('Processed under Medicaid ACA Enhanced Fee Schedule');
        if (code == '261')
            return this.localize.getLocalizedString('The procedure or service is inconsistent with the patient\'s history.');
if (code == '262')
            return this.localize.getLocalizedString('Adjustment for delivery cost. Usage: To be used for pharmaceuticals only.');
        if (code == '263')
            return this.localize.getLocalizedString('Adjustment for shipping cost. Usage: To be used for pharmaceuticals only.');
        if (code == '264')
            return this.localize.getLocalizedString('Adjustment for postage cost. Usage: To be used for pharmaceuticals only.');
        if (code == '265')
            return this.localize.getLocalizedString('Adjustment for administrative cost. Usage: To be used for pharmaceuticals only.');
        if (code == '266')
            return this.localize.getLocalizedString('Adjustment for compound preparation cost. Usage: To be used for pharmaceuticals only.');
        if (code == '267')
            return this.localize.getLocalizedString('Claim/service spans multiple months. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == '268')
            return this.localize.getLocalizedString('The Claim spans two calendar years. Please resubmit one claim per calendar year.');
        if (code == '269')
            return this.localize.getLocalizedString('Anesthesia not covered for this service/procedure. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '270')
            return this.localize.getLocalizedString('Claim received by the medical plan, but benefits not available under this plan. Submit these services to the patient\'s dental plan for further consideration.');
        if (code == '271')
                return this.localize.getLocalizedString('Prior contractual reductions related to a current periodic payment as part of a contractual payment schedule when deferred amounts have been previously reported. (Use only with Group Code OA)');
        if (code == '272')
            return this.localize.getLocalizedString('Coverage/program guidelines were not met.');
        if (code == '273')
            return this.localize.getLocalizedString('Coverage/program guidelines were exceeded.');
        if (code == '274')
            return this.localize.getLocalizedString('Fee/Service not payable per patient Care Coordination arrangement.');
        if (code == '275')
            return this.localize.getLocalizedString('Prior payer\'s(or payers\') patient responsibility (deductible, coinsurance, co-payment) not covered. (Use only with Group Code PR)');
        if (code == '276')
            return this.localize.getLocalizedString('Services denied by the prior payer(s) are not covered by this payer.');
        if (code == '277')
            return this.localize.getLocalizedString('The disposition of the claim/service is undetermined during the premium payment grace period, per Health Insurance SHOP Exchange requirements. This claim/service will be reversed and corrected when the grace period ends (due to premium payment or lack of premium payment). (Use only with Group Code OA)');
        if (code == '278')
            return this.localize.getLocalizedString('Performance program proficiency requirements not met. (Use only with Group Codes CO or PI) Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '279')
            return this.localize.getLocalizedString('Services not provided by Preferred network providers. Usage: Use this code when there are member network limitations. For example, using contracted providers not in the member\'s \'narrow\' network.');
        if (code == '280')
            return this.localize.getLocalizedString('Claim received by the medical plan, but benefits not available under this plan. Submit these services to the patient\'s Pharmacy plan for further consideration.');
        if (code == '281')
                return this.localize.getLocalizedString('Deductible waived per contractual agreement. Use only with Group Code CO.');
        if (code == '282')
            return this.localize.getLocalizedString('The procedure/revenue code is inconsistent with the type of bill. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == '283')
            return this.localize.getLocalizedString('Attending provider is not eligible to provide direction of care.');
        if (code == '284')
            return this.localize.getLocalizedString('Precertification/authorization/notification/pre-treatment number may be valid but does not apply to the billed services.');
        if (code == '285')
            return this.localize.getLocalizedString('Appeal procedures not followed');
        if (code == '286')
            return this.localize.getLocalizedString('Appeal time limits not met');
        if (code == '287')
            return this.localize.getLocalizedString('Referral exceeded');
        if (code == '288')
            return this.localize.getLocalizedString('Referral absent');
        if (code == '289')
            return this.localize.getLocalizedString('Services considered under the dental and medical plans, benefits not available.');
        if (code == '290')
            return this.localize.getLocalizedString('Claim received by the dental plan, but benefits not available under this plan. Claim has been forwarded to the patient\'s medical plan for further consideration.');
        if (code == '291')
                return this.localize.getLocalizedString('Claim received by the medical plan, but benefits not available under this plan. Claim has been forwarded to the patient\'s dental plan for further consideration.');
        if (code == '292')
                return this.localize.getLocalizedString('Claim received by the medical plan, but benefits not available under this plan. Claim has been forwarded to the patient\'s pharmacy plan for further consideration.');
        if (code == '293')
                return this.localize.getLocalizedString('Payment made to employer.');
        if (code == '294')
            return this.localize.getLocalizedString('Payment made to attorney.');
        if (code == '295')
            return this.localize.getLocalizedString('Pharmacy Direct/Indirect Remuneration (DIR)');
        if (code == '296')
            return this.localize.getLocalizedString('Precertification/authorization/notification/pre-treatment number may be valid but does not apply to the provider.');
        if (code == '297')
            return this.localize.getLocalizedString('Claim received by the medical plan, but benefits not available under this plan. Submit these services to the patient\'s vision plan for further consideration.');
        if (code == '298')
                return this.localize.getLocalizedString('Claim received by the medical plan, but benefits not available under this plan. Claim has been forwarded to the patient\'s vision plan for further consideration.');
        if (code == '299')
                return this.localize.getLocalizedString('The billing provider is not eligible to receive payment for the service billed.');
        if (code == '300')
            return this.localize.getLocalizedString('Claim received by the Medical Plan, but benefits not available under this plan. Claim has been forwarded to the patient\'s Behavioral Health Plan for further consideration.');
        if (code == '301')
                return this.localize.getLocalizedString('Claim received by the Medical Plan, but benefits not available under this plan. Submit these services to the patient\'s Behavioral Health Plan for further consideration.');
        if (code == '302')
                return this.localize.getLocalizedString('Precertification/notification/authorization/pre-treatment time limit has expired.');
        if (code == '303')
            return this.localize.getLocalizedString('Prior payer\'s(or payers\') patient responsibility (deductible, coinsurance, co-payment) not covered for Qualified Medicare and Medicaid Beneficiaries. (Use only with Group Code CO)');
        if (code == 'A0')
            return this.localize.getLocalizedString('Patient refund amount.');
        if (code == 'A1')
            return this.localize.getLocalizedString('Claim/Service denied. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT.)');
        if (code == 'A5')
            return this.localize.getLocalizedString('Medicare Claim PPS Capital Cost Outlier Amount.');
        if (code == 'A6')
            return this.localize.getLocalizedString('Prior hospitalization or 30 day transfer requirement not met.');
        if (code == 'A8')
            return this.localize.getLocalizedString('Ungroupable DRG.');
        if (code == 'B1')
            return this.localize.getLocalizedString('Non-covered visits.');
        if (code == 'B4')
            return this.localize.getLocalizedString('Late filing penalty.');
        if (code == 'B7')
            return this.localize.getLocalizedString('This provider was not certified/eligible to be paid for this procedure/service on this date of service. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == 'B8')
            return this.localize.getLocalizedString('Alternative services were available, and should have been utilized. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == 'B9')
            return this.localize.getLocalizedString('Patient is enrolled in a Hospice.');
        if (code == 'B10')
            return this.localize.getLocalizedString('Allowed amount has been reduced because a component of the basic procedure/test was paid. The beneficiary is not liable for more than the charge limit for the basic procedure/test.');
        if (code == 'B11')
            return this.localize.getLocalizedString('The claim/service has been transferred to the proper payer/processor for processing. Claim/service not covered by this payer/processor.');
        if (code == 'B12')
            return this.localize.getLocalizedString('Services not documented in patient\'s medical records.');
        if (code == 'B13')
            return this.localize.getLocalizedString('Previously paid. Payment for this claim/service may have been provided in a previous payment.');
        if (code == 'B14')
            return this.localize.getLocalizedString('Only one visit or consultation per physician per day is covered.');
        if (code == 'B15')
            return this.localize.getLocalizedString('This service/procedure requires that a qualifying service/procedure be received and covered. The qualifying other service/procedure has not been received/adjudicated. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present.');
        if (code == 'B16')
            return this.localize.getLocalizedString('\'New Patient\' qualifications were not met.');
        if (code == 'B20')
            return this.localize.getLocalizedString('Procedure/service was partially or fully furnished by another provider.');
        if (code == 'B22')
            return this.localize.getLocalizedString('This payment is adjusted based on the diagnosis.');
        if (code == 'B23')
            return this.localize.getLocalizedString('Procedure billed is not authorized per your Clinical Laboratory Improvement Amendment (CLIA) proficiency test.');
        if (code == 'P1')
            return this.localize.getLocalizedString('State-mandated Requirement for Property and Casualty, see Claim Payment Remarks Code for specific explanation. To be used for Property and Casualty only.');
        if (code == 'P2')
            return this.localize.getLocalizedString('Not a work related injury/illness and thus not the liability of the workers\' compensation carrier Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment(Loop 2100 Other Claim Related Information REF qualifier \'IG\') for the jurisdictional regulation.If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment information REF).To be used for Workers\' Compensation only.');
        if (code == 'P3')
            return this.localize.getLocalizedString('Workers\' Compensation case settled.Patient is responsible for amount of this claim / service through WC \'Medicare set aside arrangement\' or other agreement.To be used for Workers\' Compensation only. (Use only with Group Code PR)');
        if (code == 'P4')
            return this.localize.getLocalizedString('Workers\' Compensation claim adjudicated as non - compensable.This Payer not liable for claim or service / treatment.Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment(Loop 2100 Other Claim Related Information REF qualifier \'IG\') for the jurisdictional regulation.If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment information REF).To be used for Workers\' Compensation only');
        if (code == 'P5')
            return this.localize.getLocalizedString('Based on payer reasonable and customary fees. No maximum allowable defined by legislated fee arrangement. To be used for Property and Casualty only.');
        if (code == 'P6')
            return this.localize.getLocalizedString('Based on entitlement to benefits. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment (Loop 2100 Other Claim Related Information REF qualifier \'IG\') for the jurisdictional regulation. If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF). To be used for Property and Casualty only.');
        if (code == 'P7')
            return this.localize.getLocalizedString('The applicable fee schedule/fee database does not contain the billed code. Please resubmit a bill with the appropriate fee schedule/fee database code(s) that best describe the service(s) provided and supporting documentation if required. To be used for Property and Casualty only.');
        if (code == 'P8')
            return this.localize.getLocalizedString('Claim is under investigation. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment (Loop 2100 Other Claim Related Information REF qualifier \'IG\') for the jurisdictional regulation. If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF). To be used for Property and Casualty only.');
        if (code == 'P9')
            return this.localize.getLocalizedString('No available or correlating CPT/HCPCS code to describe this service. To be used for Property and Casualty only.');
        if (code == 'P10')
            return this.localize.getLocalizedString('Payment reduced to zero due to litigation. Additional information will be sent following the conclusion of litigation. To be used for Property and Casualty only.');
        if (code == 'P11')
            return this.localize.getLocalizedString('The disposition of the related Property & Casualty claim (injury or illness) is pending due to litigation. To be used for Property and Casualty only. (Use only with Group Code OA)');
        if (code == 'P12')
            return this.localize.getLocalizedString('Workers\' compensation jurisdictional fee schedule adjustment.Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Class of Contract Code Identification Segment(Loop 2100 Other Claim Related Information REF).If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment information REF) if the regulations apply.To be used for Workers\' Compensation only.');
        if (code == 'P13')
            return this.localize.getLocalizedString('Payment reduced or denied based on workers\' compensation jurisdictional regulations or payment policies, use only if no other code is applicable.Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment(Loop 2100 Other Claim Related Information REF qualifier \'IG\') if the jurisdictional regulation applies.If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment(loop 2110 Service Payment information REF) if the regulations apply.To be used for Workers\' Compensation only.');
        if (code == 'P14')
            return this.localize.getLocalizedString('The Benefit for this Service is included in the payment/allowance for another service/procedure that has been performed on the same day. Usage: Refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment Information REF), if present. To be used for Property and Casualty only.');
        if (code == 'P15')
            return this.localize.getLocalizedString('Workers\' Compensation Medical Treatment Guideline Adjustment.To be used for Workers\' Compensation only.');
        if (code == 'P16')
            return this.localize.getLocalizedString('Medical provider not authorized/certified to provide treatment to injured workers in this jurisdiction. To be used for Workers\' Compensation only. (Use with Group Code CO or OA) ');
        if (code == 'P17')
            return this.localize.getLocalizedString('Referral not authorized by attending physician per regulatory requirement. To be used for Property and Casualty only.');
        if (code == 'P18')
            return this.localize.getLocalizedString('Procedure is not listed in the jurisdiction fee schedule. An allowance has been made for a comparable service. To be used for Property and Casualty only.');
        if (code == 'P19')
            return this.localize.getLocalizedString('Procedure has a relative value of zero in the jurisdiction fee schedule, therefore no payment is due. To be used for Property and Casualty only.');
        if (code == 'P20')
            return this.localize.getLocalizedString('Service not paid under jurisdiction allowed outpatient facility fee schedule. To be used for Property and Casualty only.');
        if (code == 'P21')
            return this.localize.getLocalizedString('Payment denied based on the Medical Payments Coverage (MPC) and/or Personal Injury Protection (PIP) Benefits jurisdictional regulations, or payment policies. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment (Loop 2100 Other Claim Related Information REF qualifier \'IG\') if the jurisdictional regulation applies. If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty Auto only.');
        if (code == 'P22')
            return this.localize.getLocalizedString('Payment adjusted based on the Medical Payments Coverage (MPC) and/or Personal Injury Protection (PIP) Benefits jurisdictional regulations, or payment policies. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment (Loop 2100 Other Claim Related Information REF qualifier \'IG\') if the jurisdictional regulation applies. If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty Auto only.');
        if (code == 'P23')
            return this.localize.getLocalizedString('Medical Payments Coverage (MPC) or Personal Injury Protection (PIP) Benefits jurisdictional fee schedule adjustment. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Class of Contract Code Identification Segment (Loop 2100 Other Claim Related Information REF). If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty Auto only.');
        if (code == 'P24')
            return this.localize.getLocalizedString('Payment adjusted based on Preferred Provider Organization (PPO). Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Class of Contract Code Identification Segment (Loop 2100 Other Claim Related Information REF). If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty only. Use only with Group Code CO.');
        if (code == 'P25')
            return this.localize.getLocalizedString('Payment adjusted based on Medical Provider Network (MPN). Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Class of Contract Code Identification Segment (Loop 2100 Other Claim Related Information REF). If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty only. (Use only with Group Code CO).');
        if (code == 'P26')
            return this.localize.getLocalizedString('Payment adjusted based on Voluntary Provider network (VPN). Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Class of Contract Code Identification Segment (Loop 2100 Other Claim Related Information REF). If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty only. (Use only with Group Code CO).');
        if (code == 'P27')
            return this.localize.getLocalizedString('Payment denied based on the Liability Coverage Benefits jurisdictional regulations and/or payment policies. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment (Loop 2100 Other Claim Related Information REF qualifier \'IG\') if the jurisdictional regulation applies. If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty Auto only.');
        if (code == 'P28')
            return this.localize.getLocalizedString('Payment adjusted based on the Liability Coverage Benefits jurisdictional regulations and/or payment policies. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Insurance Policy Number Segment (Loop 2100 Other Claim Related Information REF qualifier \'IG\') if the jurisdictional regulation applies. If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty Auto only.');
        if (code == 'P29')
            return this.localize.getLocalizedString('Liability Benefits jurisdictional fee schedule adjustment. Usage: If adjustment is at the Claim Level, the payer must send and the provider should refer to the 835 Class of Contract Code Identification Segment (Loop 2100 Other Claim Related Information REF). If adjustment is at the Line Level, the payer must send and the provider should refer to the 835 Healthcare Policy Identification Segment (loop 2110 Service Payment information REF) if the regulations apply. To be used for Property and Casualty Auto only.');
        if (code == 'P30')
            return this.localize.getLocalizedString('Payment denied for exacerbation when supporting documentation was not complete. To be used for Property and Casualty only.');
        if (code == 'P31')
            return this.localize.getLocalizedString('Payment denied for exacerbation when treatment exceeds time allowed. To be used for Property and Casualty only.');
        return code;
    }

}


