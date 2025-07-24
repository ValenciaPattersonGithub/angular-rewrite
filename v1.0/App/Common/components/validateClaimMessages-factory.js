'use strict';
angular.module('common.factories').factory('ValidateClaimMessagesFactory', [
  'localize',
  function (localize) {
    var messages = [
      {
        PropertyName: 'IsActualClaim',
        ValidationCode: 7,
        Message:
          'Please ensure the transaction type for this claim has been selected.',
      },
      {
        PropertyName: 'CarrierName',
        ValidationCode: 7,
        Message:
          'The Carrier Name is not valid. Please ensure the Carrier name is correct and that the Carrier is attached to the correct Plan',
      },
      {
        PropertyName: 'CarrierAddress1',
        ValidationCode: 7,
        Message:
          'The Carrier does not have a valid Address. Please update within the Carrier Page',
      },
      {
        PropertyName: 'CarrierCity',
        ValidationCode: 7,
        Message:
          'The Carrier does not have a valid City within their address. Please update within the Carrier Page',
      },
      {
        PropertyName: 'CarrierStateProvince',
        ValidationCode: 7,
        Message:
          'The Carrier does not have a valid State within their address. Please update within the Carrier Page',
      },
      {
        PropertyName: 'CarrierPostalCode',
        ValidationCode: 7,
        Message:
          'The Carrier does not have a valid Postal Code within their address. Please update within the Carrier Page',
      },
      {
        PropertyName: 'PolicyHolderFirstName',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid First Name. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderLastName',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid Last Name. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderMiddleName',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid Middle Initial. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderPrefix',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid Prefix. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderAddress1',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid Home Address. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderCity',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid City within their address. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderStateProvince',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid State within their address. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderPostalCode',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid Postal Code within their address. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderDateOfBirth',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid Date of Birth. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderGender',
        ValidationCode: 7,
        Message:
          "The policy holder /subscriber does not have a valid Gender. Please update the policy holder's Patient Profile",
      },
      {
        PropertyName: 'PolicyHolderId',
        ValidationCode: 7,
        Message:
          "The policy holder / subscriber does not have a valid Policy Holder ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
      },
      {
        PropertyName: 'PolicyHolderId',
        ValidationCode: 41,
        Message:
          "The policy holder / subscriber does not have a valid Policy Holder ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
        },
      {
        PropertyName: 'MemberId',
        ValidationCode: 7,
        Message:
          "The policy holder / subscriber does not have a valid Member ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
      },
      {
        PropertyName: 'MemberId',
        ValidationCode: 41,
        Message:
          "The policy holder / subscriber does not have a valid Member ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
      },
      {
        PropertyName: 'PolicyHolderPlanGroupNumber',
        ValidationCode: 7,
        Message:
          "The policy holder/subscriber does not have a valid Plan/Group number. Please update the policy holder's Insurance Information",
      },
      {
        PropertyName: 'PolicyHolderPlanName',
        ValidationCode: 7,
        Message:
          'Please enter a valid Insurance Plan name within the Insurance Plan Settings',
      },
      {
        PropertyName: 'PolicyHolderRelationship',
        ValidationCode: 7,
        Message:
          "Please enter the Relationship to the Policy Holder for this Patient within the patient's Insurance Information",
      },
      {
        PropertyName: 'PatientFirstName',
        ValidationCode: 7,
        Message:
          "The patient does not have a valid First Name. Please update from the patient's profile page",
      },
      {
        PropertyName: 'PatientLastName',
        ValidationCode: 7,
        Message:
          "The patient does not have a valid Last Name. Please update from the patient's profile page",
      },
      {
        PropertyName: 'PatientAddress1',
        ValidationCode: 7,
        Message:
          "The patient does not have a valid Home Address. Please update from the patient's profile page",
      },
      {
        PropertyName: 'PatientCity',
        ValidationCode: 7,
        Message:
          "The patient does not have a valid City within their address. Please update from the patient's profile page",
      },
      {
        PropertyName: 'PatientStateProvince',
        ValidationCode: 7,
        Message:
          "The patient does not have a valid State within their address. Please update from the patient's profile page",
      },
      {
        PropertyName: 'PatientPostalCode',
        ValidationCode: 7,
        Message:
          "The patient does not have a valid Postal Code within their address. Please update from the patient's profile page",
      },
      {
        PropertyName: 'PatientDateOfBirth',
        ValidationCode: 7,
        Message:
          "The patient does not have a valid Date of Birth. Please update from the patient's profile page",
      },
      {
        PropertyName: 'PatientGender',
        ValidationCode: 7,
        Message:
          "The patient does not have a valid Gender. Please update from the patient's profile page",
      },
      {
        PropertyName: 'Date',
        ValidationCode: 7,
        Message:
          "Please ensure the Procedure Date of the completed services is correct . Dates can be verified within the Patient's Account Summary",
      },
      {
        PropertyName: 'Area',
        ValidationCode: 7,
        Message:
          "Please ensure the Area of the completed service is correct. Area can be verified within the Patient's Account Summary",
      },
      {
        PropertyName: 'ProcedureCode',
        ValidationCode: 7,
        Message:
          "Please ensure the correct Procedure Code is being used for this service. Codes can be verified within the Patient's Account Summary",
      },
      {
        PropertyName: 'DiagnosisPointer',
        ValidationCode: 7,
        Message:
          "Please ensure the service code has the correct diagnosis pointer. Diagnosis pointers can be updated from the claim's Change Answers page",
      },
      {
        PropertyName: 'Quantity',
        ValidationCode: 7,
        Message:
          'Please ensure the correct Quantity for the Service Code is correct. The quantity can be verified within the encounter  on the Account Summary page',
      },
      {
        PropertyName: 'Description',
        ValidationCode: 7,
        Message:
          'Please ensure the Description of the service codes listed is correct. Service Code Descriptions can be verified within the Service Code Page',
      },
      {
        PropertyName: 'Fee',
        ValidationCode: 7,
        Message:
          "Please ensure the service listed on this claim has Charges greater than $0.00. Charges can be verified within the Patient's Account Summary",
      },
      {
        PropertyName: 'TotalFees',
        ValidationCode: 7,
        Message:
          "There are no services on this claim with higher than $0.00 in Charges. Charges can be verified within the Patient's Account Summary",
      },
      {
        PropertyName: 'MissingTeethInfo',
        ValidationCode: 7,
        Message:
          "Please indicate the patient's Missing Teeth. Please update Missing Teeth Information within the Patient Clinical Chart",
      },
      {
        PropertyName: 'DiagnosisCodeA',
        ValidationCode: 7,
        Message:
          'Please indicate the Diagnosis Codes for the listed services on this claim. The codes can be setup within the Change Answers page',
      },
      {
        PropertyName: 'DiagnosisCodeB',
        ValidationCode: 7,
        Message:
          'Please indicate the Diagnosis Codes for the listed services on this claim. The codes can be setup within the Change Answers page',
      },
      {
        PropertyName: 'DiagnosisCodeC',
        ValidationCode: 7,
        Message:
          'Please indicate the Diagnosis Codes for the listed services on this claim. The codes can be setup within the Change Answers page',
      },
      {
        PropertyName: 'DiagnosisCodeD',
        ValidationCode: 7,
        Message:
          'Please indicate the Diagnosis Codes for the listed services on this claim. The codes can be setup within the Change Answers page',
      },
      {
        PropertyName: 'IsPolicyHolderSignatureOnFile',
        ValidationCode: 7,
        Message:
          'The patient does not have a valid Signature on File. The authorization can be validated within the Patient Profile',
      },
      {
        PropertyName: 'PolicyHolderSignatureDate',
        ValidationCode: 7,
        Message:
          'There is an Invalid Date with your patient signature. Please check your computer Date and Time settings',
      },
      {
        PropertyName: 'PlaceOfTreatment',
        ValidationCode: 7,
        Message:
          'Please ensure a valid Place of Treatment has been selected within the Change Answers page',
      },
      {
        PropertyName: 'DateAppliancePlaced',
        ValidationCode: 7,
        Message:
          'Please ensure the Date Appliance Placed is correct. Please verify the transcation date of the service within the Account Summary. ',
      },
      {
        PropertyName: 'TotalMonthsOfTreatment',
        ValidationCode: 7,
        Message:
          'Please ensure the Months Of Treatement is set up correctly within the Patient Profile',
      },
      {
        PropertyName: 'DateOfPriorPlacement',
        ValidationCode: 7,
        Message:
          'Please verify the Date of Prior Placement is correct by checking within the Account Summary',
      },
      {
        PropertyName: 'IsOccupationalInjury',
        ValidationCode: 7,
        Message:
          'Please indicate where the Treatment Resulting from is correctly selected within the Change Answers page',
      },
      {
        PropertyName: 'IsAutoAccident',
        ValidationCode: 7,
        Message:
          'Please indicate where the Treatment Resulting from is correctly selected within the Change Answers page',
      },
      {
        PropertyName: 'IsOtherAccident',
        ValidationCode: 7,
        Message:
          'Please indicate where the Treatment Resulting from is correctly selected within the Change Answers page',
      },
      {
        PropertyName: 'DateOfAccident',
        ValidationCode: 7,
        Message:
          'Please ensure the Date of Accident is correctly entered within the Change Answers page',
      },
      {
        PropertyName: 'AutoAccidentState',
        ValidationCode: 7,
        Message:
          'Please select the correct Auto Accident State from the Change Answers page',
      },
      {
        PropertyName: 'BillingDentistAddress1',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's address is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingDentistCity',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's address is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingDentistStateProvince',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's address is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingDentistPostalCode',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's address is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingDentistNpi',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's NPI Number is not valid and must be updated from the Team Member page or the Location Page",
      },
      {
        PropertyName: 'BillingDentistLicense',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's License Number is not valid and must be updated from the Team Member page.",
      },
      {
        PropertyName: 'BillingDentistTaxId',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's Tax ID or SSN#  is not valid and must be updated from the Team Member page",
      },
      {
        PropertyName: 'BillingDentistPrimaryPhone',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's phone number is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingDentistAdditionalProviderId',
        ValidationCode: 7,
        Message:
          'Please ensure the Additional Provider ID is entered. This can be verified within the Team Member Page',
      },
      {
        PropertyName: 'TreatingDentistSignature',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's signature is not valid and must be updated from their Team Member page",
      },
      {
        PropertyName: 'TreatingDentistNpi',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's NPI  is not valid and must be updated from their Team Member page",
      },
      {
        PropertyName: 'TreatingDentistLicense',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's License Number is not valid and must be updated from their Team Member page",
      },
      {
        PropertyName: 'TreatingDentistAddress1',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's Address is not valid and must be updated within the Location Settings",
      },
      {
        PropertyName: 'TreatingDentistCity',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's City is not valid and must be updated within the Location Settings",
      },
      {
        PropertyName: 'TreatingDentistStateProvince',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's State is not valid and must be updated within the Location Settings",
      },
      {
        PropertyName: 'TreatingDentistPostalCode',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's Postal Code is not valid and must be updated within the Location Settings",
      },
      {
        PropertyName: 'TreatingDentistTaxonomyCode',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's Specialty Code is not valid and must be updated from their Team Member page",
      },
      {
        PropertyName: 'TreatingDentistLocationPrimaryPhone',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's Phone Number is not valid and must be updated within the Location Settings",
      },
      {
        PropertyName: 'OtherPolicyHolderFirstName',
        ValidationCode: 7,
        Message:
          "The secondary policy holder does not have a valid Last, First, Middle Initial or Suffix. Please update the secondary policy holder's Patient Profile",
      },
      {
        PropertyName: 'OtherPolicyHolderLastName',
        ValidationCode: 7,
        Message:
          "The secondary policy holder does not have a valid Last, First, Middle Initial or Suffix. Please update the secondary policy holder's Patient Profile",
      },
      {
        PropertyName: 'OtherPolicyHolderMiddleName',
        ValidationCode: 7,
        Message:
          "The secondary policy holder does not have a valid Last, First, Middle Initial or Suffix. Please update the secondary policy holder's Patient Profile",
      },
      {
        PropertyName: 'OtherPolicyHolderNameSuffix',
        ValidationCode: 7,
        Message:
          "The secondary policy holder does not have a valid Last, First, Middle Initial or Suffix. Please update the secondary policy holder's Patient Profile",
      },
      {
        PropertyName: 'OtherPolicyHolderDateOfBirth',
        ValidationCode: 7,
        Message:
          "The secondary policy holder /subscriber does not have a valid date of birth. Please update the secondary policy holder's Patient Profile.",
      },
      {
        PropertyName: 'OtherPolicyHolderGender',
        ValidationCode: 7,
        Message:
          "The secondary policy holder /subscriber does not have a valid gender. Please update the secondary policy holder's Patient Profile.",
      },
      {
        PropertyName: 'OtherPolicyHolderId',
        ValidationCode: 7,
        Message:
          "The other insurance policy holder / subscriber does not have a valid Policy Holder ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
      },
      {
        PropertyName: 'OtherPolicyHolderId',
        ValidationCode: 41,
        Message:
          "The other insurance policy holder / subscriber does not have a valid Policy Holder ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
        },
      {
        PropertyName: 'OtherMemberId',
        ValidationCode: 7,
        Message:
          "The other insurance policy holder / subscriber does not have a valid Member ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
      },
      {
        PropertyName: 'OtherMemberId',
        ValidationCode: 41,
        Message:
          "The other insurance policy holder / subscriber does not have a valid Member ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
      },
      {
        PropertyName: 'OtherPolicyHolderPlanGroupNumber',
        ValidationCode: 7,
        Message:
          "The secondary policy holder/subscriber does not have a valid Plan/Group number. Please update the secondary policy holder's Patient Profile.",
      },
      {
        PropertyName: 'OtherPolicyHolderPlanGroupName',
        ValidationCode: 7,
        Message:
          "The secondary policy holder/subscriber does not have a valid Plan/Group name. Please update the secondary policy holder's Patient Profile.",
      },
      {
        PropertyName: 'OtherPolicyHolderRelationshipType',
        ValidationCode: 7,
        Message:
          'Please enter the relationship to the secondary policy holder for this Patient within the Insurance Information',
      },
      {
        PropertyName: 'OtherCarrierName',
        ValidationCode: 7,
        Message:
          'The Secondary Carrier does not have a valid name. Please ensure the Carrier name is correct and that the carrier is attached to the correct Plan',
      },
      {
        PropertyName: 'OtherCarrierAddress1',
        ValidationCode: 7,
        Message:
          'The Secondary Carrier does not have a valid address. Please ensure the Carrier address is correct and that the carrier is attached to the correct Plan',
      },
      {
        PropertyName: 'OtherCarrierCity',
        ValidationCode: 7,
        Message:
          'The Secondary Carrier does not have a valid city. Please ensure the Carrier address is correct and that the carrier is attached to the correct Plan',
      },
      {
        PropertyName: 'OtherCarrierStateProvince',
        ValidationCode: 7,
        Message:
          'The Secondary Carrier does not have a valid state. Please ensure the Carrier address is correct and that the carrier is attached to the correct Plan',
      },
      {
        PropertyName: 'OtherCarrierPostalCode',
        ValidationCode: 7,
        Message:
          'The Secondary Carrier does not have a valid postal code. Please ensure the Carrier address is correct and that the carrier is attached to the correct Plan',
      },
      {
        PropertyName: 'PayerIdentifier',
        ValidationCode: 7,
        Message:
          'The Payer ID is missing or invalid. Please update the ID within the Carrier Page.',
      },
      {
        PropertyName: 'RenderingProviderTaxId',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's Federal Tax ID  is not valid and must be updated from their Team Member page",
      },
      {
        PropertyName: 'DiagnosisCodes',
        ValidationCode: 7,
        Message:
          "This claim does not have a diagnosis code.  Please update the claim's Change Answers page with a valid diagnosis code.",
      },
      {
        PropertyName: 'BillingLocationPrimaryPhone',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or Dental Entity's phone number is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingLocationAddress1',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's Address is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingLocationCity',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's City is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingLocationStateProvince',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's State is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingLocationPostalCode',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's Zip is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'BillingLocationNpi',
        ValidationCode: 7,
        Message:
          "The Billing Dentist or dental entity's NPI is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'ServiceLocationNpi',
        ValidationCode: 7,
        Message:
          "The Treating Location's NPI is not valid and must be updated from the Location Page",
      },
      {
        PropertyName: 'RenderingProviderNpi',
        ValidationCode: 7,
        Message:
          "The Treating Dentist's NPI  is not valid and must be updated from their Team Member page",
      },
      {
        PropertyName: 'ProcedureCode',
        ValidationCode: 7,
        Message:
          'Service Code is missing the CPT code, please update from the service code edit page',
      },
      {
        PropertyName: 'ToothNumbers',
        ValidationCode: null,
        Message:
          'The claim contains service code(s) exceeding the two character limit for tooth.  For a range of teeth, please use quadrant/arch/mouth designations (UL; UR; LL: LR: UA; LA; FM).  Please use the additional remarks section of the claim to specify the range of teeth.',
      },
      {
        PropertyName: 'BillingLocationAdditionalIdType',
        ValidationCode: 7,
        Message:
          "The Billing Location's Additional Identifier, {0}, is missing the qualifier and must be updated from the Location Additional Identifiers page.",
      },
      {
        PropertyName: 'ServiceLocationAdditionalIdType',
        ValidationCode: 7,
        Message:
          "The Service Location's Additional Identifier, {0}, is missing the qualifier and must be updated from the Location Additional Identifiers page.",
      },
      {
        PropertyName: 'BillingLocationAdditionalIdType',
        ValidationCode: 20,
        Message:
          "The Billing Location's Additional Identifier, {0}, has an invalid qualifier.  This must be updated from the Location Additional Identifiers page.",
      },
      {
        PropertyName: 'ServiceLocationAdditionalIdType',
        ValidationCode: 20,
        Message:
          "The Service Location's Additional Identifier, {0}, has an invalid qualifier.  This must be updated from the Location Additional Identifiers page.",
      },
      {
        PropertyName: 'RenderingProviderAdditonalIdType',
        ValidationCode: 7,
        Message:
          "The Treating Provider's Additional Identifier, {0}, is missing the qualifier and must be updated from the Team Member Additional Identifiers page.",
      },
    ];
    return {
      SetupMessages: function (claimSubmissionResultsDto) {
        angular.forEach(
          claimSubmissionResultsDto.InvalidClaims,
          function (claim) {
            angular.forEach(claim.InvalidProperties, function (property) {
                if (claim.TransformPolicyHolderIdProperty === true && property.PropertyName === 'PolicyHolderId') {
                    property.PropertyName = 'MemberId';
                }
                if (claim.TransformOtherPolicyHolderIdProperty === true && property.PropertyName === 'OtherPolicyHolderId') {
                    property.PropertyName = 'OtherMemberId';
                }
                var message = _.find(messages, function (message) {
                return (
                  message.PropertyName === property.PropertyName &&
                  message.ValidationCode === property.ValidationCode
                );
              });
              if (message) {
                property.ValidationMessage = message.Message;
                if (property.AdditionalProperty) {
                  property.ValidationMessage = localize.getLocalizedString(
                    message.Message,
                    [property.AdditionalProperty]
                  );
                } else {
                  property.ValidationMessage =
                    property.ValidationMessage.replace(', {0},', '');
                }
              } else {
                property.ValidationMessage =
                  property.PropertyName + ': ' + property.ValidationMessage;
              }
            });
            var carriernameInvalid = _.find(
              claim.InvalidProperties,
              function (property) {
                return property.PropertyName === 'CarrierName';
              }
            );
            if (carriernameInvalid) {
              claim.InvalidProperties = _.reject(
                claim.InvalidProperties,
                function (property) {
                  return (
                    property.PropertyName === 'CarrierAddress1' ||
                    property.PropertyName === 'CarrierCity' ||
                    property.PropertyName === 'CarrierStateProvince' ||
                    property.PropertyName === 'CarrierPostalCode'
                  );
                }
              );
            }
          }
        );
      },
      Messages: function () {
        return messages;
      },
      Message: function (propertyName, validationCode) {
        return messages.find(
          message =>
            message.PropertyName.toLowerCase() === propertyName.toLowerCase() &&
            message.ValidationCode === validationCode
        );
      },
    };
  },
]);
