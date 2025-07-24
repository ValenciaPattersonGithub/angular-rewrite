(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .service(
      'ClinicalTimelineBusinessService',
      ClinicalTimelineBusinessService
    );

  ClinicalTimelineBusinessService.$inject = ['localize', 'OdontogramUtilities'];

  function ClinicalTimelineBusinessService(localize, odontogramUtilities) {
    function getFilterButtons() {
      // at present some elements in this list are hard-coded in the view. At some point this whole list will go away.
      var filterButtons = [
        {
          ID: 'tmLnCondFltrCtrl',
          Description: localize.getLocalizedString('Conditions'),
          DescriptionFull: localize.getLocalizedString('Conditions'),
          RecordType: 'Condition',
          Active: false,
          IconName: 'conditions',
        },
        {
          ID: 'tmLnSrvcFltrCtrl',
          Description: localize.getLocalizedString('Services'),
          DescriptionFull: localize.getLocalizedString('Services'),
          RecordType: 'ServiceTransaction',
          Active: false,
          IconName: 'services',
        },
        {
          ID: 'tmLnTxPlanFltrCtrl',
          Description: localize.getLocalizedString('Tx Plans'),
          DescriptionFull: localize.getLocalizedString('Treatment Plans'),
          RecordType: 'TreatmentPlan',
          Active: false,
          IconName: 'txplans',
        },
        {
          ID: 'tmLnNoteFltrCtrl',
          Description: localize.getLocalizedString('Notes'),
          DescriptionFull: localize.getLocalizedString('Notes'),
          RecordType: 'ClinicalNote',
          Active: false,
          IconName: 'notes',
        },
        {
          ID: 'tmLnApptFltrCtrl',
          Description: localize.getLocalizedString('Appts'),
          DescriptionFull: localize.getLocalizedString('Appointments'),
          RecordType: 'Appointment',
          Active: false,
          IconName: 'appointments',
        },
        {
          ID: 'tmLnPerioFltrCtrl',
          Description: localize.getLocalizedString('Perio'),
          DescriptionFull: localize.getLocalizedString('Perio'),
          RecordType: 'PerioStatsMouth',
          Active: false,
          IconName: 'perio',
        }, // This filter button will be used to filter perio stats records - both mouth and tooth tiles
        {
          ID: 'tmLnImgFltrCtrl',
          Description: localize.getLocalizedString('Images'),
          DescriptionFull: localize.getLocalizedString('Images'),
          RecordType: 'ImageExam',
          Active: false,
          IconName: 'images',
        },
        {
          ID: 'tmLnMedHxFltrCtrl',
          Description: localize.getLocalizedString('Med Hx'),
          DescriptionFull: localize.getLocalizedString('Medical History'),
          RecordType: 'MedicalHx',
          Active: false,
          IconName: 'medical',
        },
        {
          ID: 'tmLnConsentFltrCtrl',
          Description: localize.getLocalizedString('Consent'),
          DescriptionFull: localize.getLocalizedString('Consent'),
          RecordType: 'Consent',
          Active: false,
          IconName: 'document',
        },
        {
          ID: 'tmLnHIPAAFltrCtrl',
          Description: localize.getLocalizedString('HIPAA'),
          DescriptionFull: localize.getLocalizedString('HIPAA'),
          RecordType: 'HIPAA',
          Active: false,
          IconName: 'document',
        },
        {
          ID: 'tmLnLabFltrCtrl',
          Description: localize.getLocalizedString('Lab'),
          DescriptionFull: localize.getLocalizedString('Lab'),
          RecordType: 'Lab',
          Active: false,
          IconName: 'lab',
        },
        {
          ID: 'tmLnSpecialistFltrCtrl',
          Description: localize.getLocalizedString('Specialist'),
          DescriptionFull: localize.getLocalizedString('Specialist'),
          RecordType: 'Specialist',
          Active: false,
          IconName: 'specialist',
        }, // The RecordType should be "Specialist", but this is a quick fix until domain is updated
        {
          ID: 'tmLnOthClinFltrCtrl',
          Description: localize.getLocalizedString('Clinical'),
          DescriptionFull: localize.getLocalizedString('Other Clinical'),
          RecordType: 'Other Clinical',
          Active: false,
          IconName: 'document',
        },
        {
          ID: 'tmLnAccountFltrCtrl',
          Description: localize.getLocalizedString('Account'),
          DescriptionFull: localize.getLocalizedString('Account'),
          RecordType: 'Account',
          Active: false,
          IconName: 'account',
        },
        {
          ID: 'tmLnInsuranceFltrCtrl',
          Description: localize.getLocalizedString('Insurance'),
          DescriptionFull: localize.getLocalizedString('Insurance'),
          RecordType: 'Insurance',
          Active: false,
          IconName: 'insurance',
        },
        {
          ID: 'tmLnRxFltrCtrl',
          Description: localize.getLocalizedString('Rx'),
          DescriptionFull: localize.getLocalizedString('Rx'),
          RecordType: 'PatientRx',
          Active: false,
          IconName: 'rx',
        },
      ];
      return filterButtons;
    }

    function createTimelineIcon(recordType) {
      switch (recordType) {
        case 'ServiceTransaction':
          return 'Images/TimelineFilterIcons/services.svg';
        case 'TreatmentPlan':
        case 'Treatment Plans':
          return 'Images/TimelineFilterIcons/txplans.svg';
        case 'ClinicalNote':
          return 'Images/TimelineFilterIcons/notes.svg';
        case 'Appointment':
          return 'Images/TimelineFilterIcons/appointments.svg';
        case 'Condition':
          return 'Images/TimelineFilterIcons/conditions.svg';
        case 'MedicalHx':
        case 'Medical History':
          return 'Images/TimelineFilterIcons/medical.svg';
        case 'PerioStatsMouth':
        case 'Perio':
          return 'Images/TimelineFilterIcons/perio.svg';
        case 'Specialist':
          return 'Images/TimelineFilterIcons/specialist.svg';
        case 'Insurance':
          return 'Images/TimelineFilterIcons/insurance.svg';
        case 'Account':
          return 'Images/TimelineFilterIcons/account.svg';
        case 'Lab':
          return 'Images/TimelineFilterIcons/lab.svg';
        case 'Consent':
        case 'HIPAA':
        case 'Clinical':
        case 'Other Clinical':
          return 'Images/TimelineFilterIcons/document.svg';
        case 'ImageExam':
          return 'Images/TimelineFilterIcons/images.svg';
        default:
          return '';
      }
    }

    // Filter timeline records based on teeth selection from odontogram
    function checkToothAssociated(selectedTeeth, timelineRecord) {
      var returnValue = false;

      if (!selectedTeeth || selectedTeeth.length === 0) {
        return true;
      }

      // filter out all the null toothIds from the selected Teeth list.
      var filteredTeeth = _.filter(selectedTeeth, function (item) {
        return !_.isNil(item.toothId);
      });

      switch (timelineRecord.recordType) {
        case 'Condition':
        case 'ServiceTransaction':
          _.forEach(filteredTeeth, function (tooth) {
            if (returnValue === false) {
              // short circuit processing - why continue if the value is true ...
              if (!_.isNil(timelineRecord.record.Tooth)) {
                if (
                  tooth.toothId.toString() ===
                  timelineRecord.record.Tooth.toString()
                ) {
                  returnValue = true;
                } else if (
                  isRange(timelineRecord.record.Tooth) &&
                  isToothInRange(timelineRecord.record.Tooth, tooth) === true
                ) {
                  returnValue = true;
                }
              }
            }
          });

          break;
        case 'TreatmentPlan':
          _.forEach(filteredTeeth, function (tooth) {
            if (returnValue === false) {
              // short circuit processing.
              _.forEach(
                timelineRecord.record.TreatmentPlanServices,
                function (txPlanService) {
                  if (returnValue === false) {
                    // short circuit processing.
                    if (!_.isNil(txPlanService.ServiceTransaction.Tooth)) {
                      if (
                        tooth.toothId.toString() ===
                        txPlanService.ServiceTransaction.Tooth.toString()
                      ) {
                        returnValue = true;
                      } else if (
                        isRange(txPlanService.ServiceTransaction.Tooth) &&
                        isToothInRange(
                          txPlanService.ServiceTransaction.Tooth,
                          tooth
                        ) === true
                      ) {
                        returnValue = true;
                      }
                    }
                  }
                }
              );
            }
          });

          break;
        case 'ClinicalNote':
          _.forEach(filteredTeeth, function (tooth) {
            if (returnValue === false) {
              // short circuit processing.
              _.forEach(
                timelineRecord.record.ToothNumbers,
                function (noteTooth) {
                  if (!_.isNil(tooth)) {
                    if (tooth.toothId.toString() === noteTooth.toString()) {
                      returnValue = true;
                    }
                  }
                }
              );
            }
          });

          break;
        case 'Appointment':
          _.forEach(filteredTeeth, function (tooth) {
            if (returnValue === false) {
              // short circuit processing.
              _.forEach(
                timelineRecord.record.PlannedServices,
                function (apptPlanService) {
                  if (!_.isNil(apptPlanService.Tooth)) {
                    if (
                      tooth.toothId.toString() ===
                      apptPlanService.Tooth.toString()
                    ) {
                      returnValue = true;
                    }
                  }
                }
              );
            }
          });

          break;
        case 'MedicalHx':
          _.forEach(filteredTeeth, function (tooth) {
            if (returnValue === false) {
              // short circuit processing.
              _.forEach(timelineRecord.record.MedHx, function (medHx) {
                if (!_.isNil(medHx.Tooth)) {
                  if (tooth.toothId.toString() === medHx.Tooth.toString()) {
                    returnValue = true;
                  }
                }
              });
            }
          });

          break;
        case 'Insurance':
        case 'HIPAA':
        case 'Lab':
        case 'Specialist':
        case 'Other Clinical':
        case 'Account':
        case 'Consent':
        case 'Medical History':
          _.forEach(filteredTeeth, function (tooth) {
            if (returnValue === false) {
              // short circuit processing.
              _.forEach(
                timelineRecord.record.ToothNumbers,
                function (toothNumber) {
                  if (!_.isNil(toothNumber)) {
                    if (tooth.toothId.toString() === toothNumber.toString()) {
                      returnValue = true;
                    }
                  }
                }
              );
            }
          });
          break;
        case 'ExternalImageExam':
        case 'ImageExam':
          _.forEach(filteredTeeth, function (tooth) {
            if (returnValue === false) {
              // short circuit processing.
              _.forEach(
                timelineRecord.record.ToothNumbers,
                function (toothNumber) {
                  if (!_.isNil(toothNumber)) {
                    if (tooth.toothId.toString() === toothNumber.toString()) {
                      returnValue = true;
                    }
                  }
                }
              );
            }
          });
          break;
        default:
          returnValue = false;
      }
      return returnValue;
    }

    // set IsDeleted for timelineRecords that don't have that
    function setIsDeleted(record, recordType) {
      switch (recordType) {
        case undefined:
        case 'PerioStatsMouth':
        case 'Perio':
        case 'ServiceTransaction':
          break;
        case 'ClinicalNote':
          record.IsDeleted = record.StatusTypeId === 3;
          break;
        default:
          record.IsDeleted = false;
          break;
      }
    }

    // helper for determining if tooth is a range of teeth
    function isRange(tooth) {
      return odontogramUtilities.isRange(tooth);
    }

    // returns true if selectedTooth is in range
    function isToothInRange(range, selectedTooth) {
      return odontogramUtilities.isToothInRange(
        range,
        selectedTooth.toothId.toString()
      );
    }

    return {
      getFilterButtons: getFilterButtons,
      createTimelineIcon: createTimelineIcon,
      checkToothAssociated: checkToothAssociated,
      setIsDeleted: setIsDeleted,
      isRange: isRange,
      isToothInRange: isToothInRange,
    };
  }
})();
