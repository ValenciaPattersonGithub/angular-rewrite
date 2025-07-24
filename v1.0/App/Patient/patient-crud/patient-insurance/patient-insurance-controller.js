'use strict';

angular.module('Soar.Patient').controller('PatientInsuranceController', [
  '$scope',
  '$routeParams',
  '$filter',
  '$location',
  'localize',
  '$timeout',
  'toastrFactory',
  'PatientServices',
  'PatientBenefitPlansFactory',
  'BusinessCenterServices',
  'tabLauncher',
  'ModalFactory',
  'SaveStates',
  'ListHelper',
  'PatSharedServices',
  'PatientValidationFactory',
  function (
    $scope,
    $routeParams,
    $filter,
    $location,
    localize,
    $timeout,
    toastrFactory,
    patientServices,
    patientBenefitPlansFactory,
    businessCenterServices,
    tabLauncher,
    modalFactory,
    saveStates,
    listHelper,
    patSharedServices,
    patientValidationFactory
  ) {
    var ctrl = this;
    $scope.patSharedServices = patSharedServices;
    $scope.refreshOptions = false;
    $scope.selectedPlan = null;
    
    $scope.initialize = function () {
      $scope.loading = false;
      $scope.Changing = false;
      $scope.editing = $scope.insurance.PatientBenefitPlanId != null;
      $scope.addForOther = $scope.insurance.AddForOther;

      $scope.relationships = [
        {
          Description: localize.getLocalizedString('Dependent'),
          Value: 'Dependent',
        },
        { Description: localize.getLocalizedString('Spouse'), Value: 'Spouse' },
        { Description: localize.getLocalizedString('Other'), Value: 'Other' },
      ];

      ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';
      $scope.selfGuid =
        $scope.person && $scope.person.PatientId
          ? $scope.person.PatientId
          : ctrl.emptyGuid;

      $scope.policyHolder = null;
      $scope.disablePolicyHolder = false;

      $scope.selectedPlan = null;
      $scope.disableIndividualAnnualMax = false;

      $scope.searchTerm = '';
      $scope.individualMaxLeftTooltipContent =
        "<span class='patientInsurance-tooltip'>Individual Annual Maximum Left will be recalculated when Additional Benefits change.</span>";

      $scope.maxDate = moment().add(100, 'years').startOf('day').toDate();

      ctrl.benefitPlans = [];
      $scope.filteredBenefitPlans = [];
      $scope.unsavedSelectedBenefitPlans = [];
      $scope.dependentList = [];
      $scope.showDependentList = false;
      if ($scope.$parent.person) {
        $scope.person.PatientBenefitPlanDtos =
          $scope.$parent.person.PatientBenefitPlanDtos;
        $scope.priorityOptions = $scope.availablePriorities;
      }
      $scope.index = $scope.person.PatientBenefitPlanDtos.length - 1;

      /** used to enable fields when clearing a plan during editing */
      $scope.changedPlan = false;

      $scope.selectedPolicyHolder = null;

      $scope.unsavedSelectedBenefitPlans = $scope.person.PatientBenefitPlanDtos;

      ctrl.getBenefitPlans();

      //$scope.setPriorityOptions(ctrl.benefitPlans);

      $scope.$watch('responsiblePerson', ctrl.responsiblePersonWatch);
      $scope.$watch('selectedPolicyHolder', ctrl.selectedPolicyHolderWatch);
      if ($scope.editing) {
        $scope.insurance.$validPolicyHolder = true;

        //fix for bug 351146 - drop down is not accepting the existing RelationshipToPolicyHolder,
        //need to clear out and reset.
        //needs to wait two cycles to work properly
        if ($scope.insurance.RelationshipToPolicyHolder) {
          var a = $scope.insurance.RelationshipToPolicyHolder;
          $scope.insurance.RelationshipToPolicyHolder = '';
          $timeout(function () {
            $timeout(function () {
              $scope.insurance.RelationshipToPolicyHolder = a;
            });
          });
        }
      }
    };

    ctrl.getOldPriority = function () {
      return angular.copy($scope.person.PatientBenefitPlanDtos);
    };

    $scope.changePriority = function (newObj) {
      angular.forEach($scope.person.PatientBenefitPlanDtos, function (plan) {
        plan.Priority = parseInt(plan.Priority);
      });
      if (
        $scope.person.PatientBenefitPlanDtos[
          $scope.person.PatientBenefitPlanDtos.length - 1
        ].$dateValid == true
      ) {
        $scope.updated = {
          oldPriority: $scope.$parent.$index,
          newPriority: parseInt(newObj),
        };
        patientBenefitPlansFactory.setUpdatedPriority($scope.updated);
        $scope.priority();
      }
    };

    $scope.$watch('selectedPlan', function (nv, ov) {
      if (nv != ov) {
        $scope.insurance.planTaken = true;
        ctrl.benefitPlans = $scope.getAvailablePlans(ctrl.benefitPlans);
        if (
          $scope.patientId == -1 ||
          $scope.patientId == ctrl.emptyGuid ||
          $scope.patientId != '' ||
          $scope.policyHolder != ''
        ) {
          if (nv != null) {
            $scope.insurance.$validPolicyHolder = true;
          }
        }
        if (angular.isUndefined($scope.patientId)) {
          $scope.insurance.$validPolicyHolder = false;
          $scope.validatePolicyHolder = false;
        }
      }
    });

    ctrl.setPolicyHolders = function (policyHolders, selfOnly) {
      $scope.policyHolders = [];

      if (selfOnly == true) {
        $scope.policyHolders.push({
          $name: localize.getLocalizedString('Self'),
          $patientId: $scope.selfGuid,
        });
      } else {
        $scope.policyHolders.push({
          $name: localize.getLocalizedString('Self'),
          $patientId: $scope.selfGuid,
        });

        if (policyHolders) {
          angular.forEach(policyHolders, function (member) {
            if (
              member.PolicyHolder.length > 0 &&
              member.Person.PatientId != $scope.selfGuid
            ) {
              member.$name = patSharedServices.Format.PatientName(
                member.Person
              );
              member.$patientId = member.Person.PatientId;

              /** the DTO sends back a Person Object so we need to also give it $name property for the modals we use */
              member.Person.$name = member.$name;

              $scope.policyHolders.push(member);
            }
          });
        }

        $scope.policyHolders.push({
          $name: localize.getLocalizedString('Other...'),
          $patientId: -1,
        });
      }
    };

    ctrl.responsiblePersonWatch = function (nv, ov) {
      if (nv) {
        patientServices.Patients.get({ Id: nv }, function (patientRes) {
          var patient = patientRes.Value;
          patientServices.PolicyHolder.availablePolicyHolders(
            { accountId: patient.PersonAccount.AccountId },
            function (accountRes) {
              var policyHolders = accountRes.Value;
              var temp = $scope.insurance.PolicyHolderId;
              ctrl.setPolicyHolders(policyHolders, $scope.selfOnly);
              //wait for kendo grid to load in fully
              $timeout(function () {
                $scope.$apply(function () {
                  if (
                    $scope.responsiblePerson != temp &&
                    $scope.selfGuid != temp
                  ) {
                    ctrl.getPolicyHolder(temp, -1);
                  } else {
                    ctrl.getPolicyHolder(temp);
                  }
                });
              }, 100);
            }
          );
        });
      } else {
        ctrl.setPolicyHolders(null, $scope.selfOnly);
      }
    };

    ctrl.selectedPolicyHolderWatch = function (nv, ov) {
      if (nv !== ov && ov !== null) {
        $scope.clearSelectedPlan();
      }
      if (nv) {
        var newPolicyHolder = nv;
        $scope.insurance.PolicyHolderId = nv.PatientId;
        patientServices.Patients.get(
          { Id: nv.PatientId },
          function (res) {
            if (res && res.Value && res.Value.PersonAccount) {
              newPolicyHolder.PersonAccount = res.Value.PersonAccount;
              /** verify person from search is a valid policy holder */
              patientServices.PolicyHolder.availablePolicyHolders(
                { accountId: newPolicyHolder.PersonAccount.AccountId },
                function (accountRes) {
                  var policyHolders = accountRes.Value;
                  angular.forEach(policyHolders, function (member) {
                    /** should return policy holder greater than 0 if member has a policy or none */
                    if (
                      member.Person.PatientId == newPolicyHolder.PatientId &&
                      member.PolicyHolder.length > 0
                    ) {
                      /** if policy holder */
                      $scope.getBenefitPlansForPolicyHolder(newPolicyHolder);
                      $scope.insurance.$validPolicyHolder = true;
                    } else if (
                    /** member is a dependent */
                      member.Person.PatientId == newPolicyHolder.PatientId &&
                      member.PolicyHolder.length == 0
                    ) {
                      /** cannot be policy holder... display error */
                      $scope.insurance.$validPolicyHolder = false;
                    }
                  });
                }
              );
            }
          },
          function () {
            $scope.clearPatientSearch();
          }
        );
      }
    };

    ctrl.getPolicyHolderByPatientId = function (patientId) {
      return listHelper.findItemByFieldValue(
        $scope.policyHolders,
        '$patientId',
        patientId
      );
    };

    $scope.policyHolderChanged = function (patientId) {
      if (
        patientId &&
        patientId !== ctrl.emptyGuid &&
        patientId !== $scope.person.PatientId
      ) {
        var ph = _.find($scope.policyHolders, function (ph) {
          return ph.Person && ph.Person.PatientId === patientId;
        });
        if (!ph || !ph.Person) {
          $scope.continuePolicyHolderChanged(patientId);
          return;
        }
        patientValidationFactory
          .PatientSearchValidation(ph.Person)
          .then(function (res) {
            if (
              !res.authorization.UserIsAuthorizedToAtLeastOnePatientLocation
            ) {
              patientValidationFactory.LaunchPatientLocationErrorModal(res);
              $scope.policyHolder =
                $scope.person.PatientId !== null
                  ? $scope.person.PatientId
                  : ctrl.emptyGuid;
              return;
            } else {
              $scope.continuePolicyHolderChanged(patientId);
            }
          });
      } else {
        $scope.continuePolicyHolderChanged(patientId);
      }
    };
    $scope.continuePolicyHolderChanged = function (patientId) {
      $scope.insurance.$validPolicyHolder = false;
      $scope.patientId = patientId;
      if (patientId && patientId != ctrl.emptyGuid) {
        if (!$scope.editing) $scope.clearSelectedPlan();
        var patient = ctrl.getPolicyHolderByPatientId(patientId);
        if (!patient) return;

        if (!$scope.editing) {
          $scope.insurance.PolicyHolderId =
            patientId && patientId == -1 ? null : patientId;
        }

        if (
          patientId &&
          patientId != -1 &&
          patientId == $scope.person.ResponsiblePersonId &&
          !$scope.editing
        ) {
          $scope.insurance.PolicyHolderId = patientId;
        }

        /** needs to take into consideration if 'Self' is selected */

        if (
          $scope.insurance.PatientId == $scope.insurance.PolicyHolderId &&
          !$scope.editing
        ) {
          $scope.insurance.RelationshipToPolicyHolder = null;
        }

        if (patient.Person && !$scope.editing) {
          $scope.getBenefitPlansForPolicyHolder(patient.Person);
        }
      }

      if (patientId == '') {
        if (!$scope.insurance.AddForOther) {
          $scope.insurance.$validPolicyHolder = false;
          $scope.validatePolicyHolder = false;
        } else {
          $scope.insurance.$validPolicyHolder = true;
          $scope.validatePolicyHolder = true;
          $scope.policyHolder = $scope.insurance.PolicyHolderId;
        }
      }
      // selfonly
      if (
        patientId == ctrl.emptyGuid ||
        (patientId != '' &&
          patientId != -1 &&
          patientId != $scope.person.ResponsiblePersonId)
      ) {
        if (!$routeParams.currentPatientId && !patientId) {
          $scope.insurance.PolicyHolderId = $scope.editing
            ? patientId
            : $scope.insurance.PatientId
            ? patientId
            : null;
        }
      }
      if (patientId == -1 || patientId == ctrl.emptyGuid || patientId != '') {
        if ($scope.selectedPlan != null) {
          $scope.insurance.$validPolicyHolder = true;
        }
        $scope.validatePolicyHolder = true;
      }
    };

    $scope.getBenefitPlansForPolicyHolder = function (patient) {
      patientServices.PatientBenefitPlan.get(
        {
          patientId: patient.PatientId,
        },
        function (res) {
          var patientBenefitPlans = _.filter(res.Value, function (plan) {
            return (
              plan.PolicyHolderBenefitPlanDto.PolicyHolderId ===
              patient.PatientId
            );
          });
          var allowedPlans = 6 - res.Value.length;
          if (patientBenefitPlans.length > 0) {
            patient.PatientBenefitPlanDtos = patientBenefitPlans;
            /** retrieve insurance plan */
            modalFactory
              .Modal({
                templateUrl:
                  'App/Patient/components/insurance-selector-modal/insurance-selector-modal.html',
                backdrop: 'static',
                keyboard: false,
                size: 'md',
                windowClass: 'center-modal insuranceSelectorModal__modal',
                controller: 'InsuranceSelectorModalController',
                amfa: 'soar-acct-insinf-view',
                resolve: {
                  patient: function () {
                    return patient;
                  },
                  insurance: function () {
                    return $scope.insurance;
                  },
                  unsavedBenefitPlans: function () {
                    return $scope.unsavedSelectedBenefitPlans;
                  },
                },
              })
              .result.then(ctrl.planAdded);
          } else {
            /** if no plan, popup add insurance plan modal */
            modalFactory
              .Modal({
                templateUrl:
                  'App/Patient/components/insurance-modal/insurance-modal.html',
                backdrop: 'static',
                keyboard: false,
                size: 'lg',
                windowClass: 'center-modal',
                controller: 'InsuranceModalController',
                amfa: 'soar-acct-insinf-view',
                resolve: {
                  insurance: function () {
                    return {
                      PolicyHolderId: patient.PatientId,
                      PatientId: patient.PatientId,
                      BenefitPlanId: null,
                      PolicyHolderStringId: null,
                      DependentChildOnly: false,
                      RequiredIdentification: null,
                      $policyHolderNeedsInsurance: true,
                      Priority: 0,
                      MemberId: null
                    };
                  },
                  allowedPlans: function () {
                    return allowedPlans;
                  },
                  patient: function () {
                    return patient;
                  },
                },
              })
              .result.then(ctrl.policyHolderInsuranceAdded);
          }
        },
        function (err) {}
      );
    };

    $scope.getAvailablePlans = function (benefitPlans) {
      var availablePlans = [];
      angular.forEach(benefitPlans, function (plan) {
        if (!plan.planTaken) {
          availablePlans.push(plan);
        }
      });
      return availablePlans;
    };

    ctrl.planAdded = function (plan) {
      /** add plan to insurance */
      $scope.selectedPlan = plan;
      $scope.insurance.BenefitPlanId = plan.BenefitId;
      $scope.insurance.PolicyHolderStringId = plan.PolicyHolderStringId;
      $scope.insurance.MemberId = plan.MemberId
      // $scope.insurance.PolicyHolderId = plan.PolicyHolderId;
    };

    ctrl.policyHolderInsuranceAdded = function (insurance) {
      if (insurance.length == 1) {
        var policyHolderInsurance = insurance[0];
        $scope.selectedPlan = listHelper.findItemByFieldValue(
          ctrl.benefitPlans,
          'BenefitId',
          policyHolderInsurance.BenefitPlanId
        );

        /** if insurance added wasn't for policy holder as self then we need to warn the user it's an invalid policy holder*/
        if (
          policyHolderInsurance.PolicyHolderId !=
          policyHolderInsurance.PatientId
        ) {
          $scope.insurance.$validPolicyHolder = false;
        } else {
          $scope.insurance.BenefitPlanId = policyHolderInsurance.BenefitPlanId;
          $scope.insurance.PolicyHolderStringId =
            policyHolderInsurance.PolicyHolderStringId;
          $scope.insurance.PolicyHolderId =
                policyHolderInsurance.PolicyHolderId;
          $scope.insurance.MemberId =
            policyHolderInsurance.MemberId;
        }
      } else {
        patientServices.Patients.get(
          {
            Id: insurance[0].PatientId,
          },
          function (res) {
            var patient = res.Value;
            modalFactory
              .Modal({
                templateUrl:
                  'App/Patient/components/insurance-selector-modal/insurance-selector-modal.html',
                backdrop: 'static',
                keyboard: false,
                size: 'md',
                windowClass: 'center-modal insuranceSelectorModal__modal',
                controller: 'InsuranceSelectorModalController',
                amfa: 'soar-acct-insinf-view',
                resolve: {
                  patient: function () {
                    return patient;
                  },
                },
              })
              .result.then(ctrl.planAdded);
          }
        );
      }
    };

    $scope.filterBenefitPlans = function (searchTerm) {
      const MaxDropdownLength = 50;

      if (searchTerm) {
        $scope.filteredBenefitPlans = ctrl.benefitPlansFilter(
          searchTerm,
          MaxDropdownLength
        );
      } else {
        $scope.filteredBenefitPlans = angular.copy(
          ctrl.benefitPlans.slice(0, MaxDropdownLength)
        );
      }
    };

    ctrl.benefitPlansFilter = function (searchTerm, MaxDropdownLength) {
      var toFind = searchTerm ? searchTerm.toLowerCase() : null;
      var resultCount = 0;
      var results = [];

      angular.forEach(ctrl.benefitPlans, function (plan) {
        if (
          plan != null &&
          ((plan.Name && plan.Name.toLowerCase().indexOf(toFind) > -1) ||
            (plan.PlanGroupNumber &&
              plan.PlanGroupNumber.toLowerCase().indexOf(toFind) > -1)) &&
          resultCount < MaxDropdownLength
        ) {
          results.push(plan);
          resultCount++;
        }
      });

      return results;
    };

    $scope.selectPlan = function (plan) {
      if (plan != null) {
        $scope.selectedPlan = angular.copy(plan);
        $scope.insurance.BenefitPlanId = plan.BenefitId;

        $scope.searchTerm = '';

        // If we are editing we need to check to see if the patient is a policy holder for other patients
        if ($scope.editing) {
          $scope.insurance.PolicyHolderBenefitPlanDto.BenefitPlanId =
            plan.BenefitId;
          ctrl.checkForOtherDependentsWithThisPlan(
            $scope.selfGuid,
            $scope.selectedPlan.BenefitId
          );
          ctrl.getBenefitPlans();
        }
      } else {
        $scope.clearSelectedPlan();
      }
    };

    $scope.clearContent = function () {
      $scope.searchTerm = '';
      $scope.filterBenefitPlans($scope.searchTerm);
    };

    $scope.removeInsurance = function () {
      $scope.remove();
    };

    $scope.clearSelectedPlan = function () {
      $scope.selectedPlan = null;
      $scope.insurance.BenefitPlanId = null;
      $scope.insurance.PolicyHolderStringId = null;
      $scope.insurance.MemberId = null;
      $scope.searchTerm = '';

      $scope.changedPlan = true;

      $scope.showDependentList = false;
    };

    $scope.openBenefitPlanTab = function (benefitId) {
      tabLauncher.launchNewTab(
        '#/BusinessCenter/Insurance/Plans/Edit/?guid=' + benefitId
      );
    };

    $scope.toggleDependentsSection = function () {
      $scope.showDependentList = !$scope.showDependentList;
    };

    $scope.closeDependentList = function () {
      $scope.showDependentList = false;
    };

    ctrl.disablePolicyHolderIfNeeded = function () {
      $scope.disablePolicyHolder = false;
      $scope.showDependentList = false;

      if ($scope.selfGuid && $scope.selectedPlan) {
        var dependents = $scope.dependentList;

        if (dependents && dependents.length > 0) {
          if (
            dependents.length == 1 &&
            dependents[0].PersonLiteDto &&
            dependents[0].PersonLiteDto.PatientId == $scope.selfGuid
          ) {
            $scope.disablePolicyHolder = false;
          } else {
            // disable dropdown
            $scope.disablePolicyHolder = true;
          }
        }
      }
    };

    ctrl.getPolicyHolder = function (policyHolder, override) {
      if (!policyHolder) return;

      patientServices.Patients.get(
        {
          Id: policyHolder,
        },
        function (res) {
          var patient = res.Value;
          patient.$name = patSharedServices.Format.PatientName(patient);
          patient.$patientId = patient.PatientId;

          if ($scope.insurance.PatientId != policyHolder) {
            $scope.policyHolderDisplay = patient;
          } else {
            $scope.policyHolderDisplay = {
              $name: localize.getLocalizedString('Self'),
            };
            $scope.insurance.RelationshipToPolicyHolder = null;
          }

          if (override) {
            /** need to set policy holder options to include Other */
            ctrl.setPolicyHolders([]);
            /** kendo issue - have to wait so policy holder can be assigned to new options */
            $timeout(function () {
              $scope.$apply(function () {
                $scope.policyHolder = override;
              });
            }, 100);

            if (override == -1) {
              $scope.displayPolicyHolder = patient;
            }
            $scope.policyHolderChanged(override);
          } else {
            $scope.policyHolder = policyHolder;
            $scope.policyHolderChanged(policyHolder);
          }
        },
        function (err) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve {0}. Please try again.',
              ['policy holder']
            )
          );
        }
      );
    };

    $scope.clearDisplayPolicyHolder = function () {
      $scope.displayPolicyHolder = null;
    };

    ctrl.checkForOtherDependentsWithThisPlan = function (
      patientId,
      benefitPlanId
    ) {
      $scope.loading = true;
      $scope.dependentList = [];

      patientServices.PatientBenefitPlan.getDependentsForPolicyHolder(
        {
          patientId: patientId,
          benefitPlanId: benefitPlanId,
        },
        function (res) {
          var dependents = res.Value;

          $scope.loading = false;

          if (dependents && dependents.length > 0) {
            angular.forEach(dependents, function (dependent) {
              if (dependent.PersonLiteDto.PatientId != patientId) {
                $scope.dependentList.push(dependent);
              }
            });
          }

          // if we haven't already disabled the policy holder dropdown, check to see if we need to
          if ($scope.disablePolicyHolder == false) {
            ctrl.disablePolicyHolderIfNeeded();
          }
        },
        function (err) {
          $scope.loading = false;
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the list of {0}. Please try again.',
              ['dependents']
            ),
            'Error'
          );
        }
      );
    };

    ctrl.getBenefitPlans = function () {
      businessCenterServices.BenefitPlan.getActive(
        {},
        ctrl.getBenefitPlansOnSuccess,
        function (err) {
          /** Failed */
          toastrFactory.error({
            Text: 'Failed retrieve list of {0}. Please try again.',
            Params: ['benefit plans'],
          });
        }
      );
    };

    ctrl.getBenefitPlansOnSuccess = function (benRes) {
      /** Success */
      ctrl.fullBenefitPlanList = benRes.Value;

      if ($scope.insurance.PatientId === null) {
        var emptyPlans = {
          Value: [],
        };
        ctrl.getPatientBenefitPlansOnSuccess(emptyPlans);
      } else {
        patientServices.PatientBenefitPlan.get(
          { patientId: $scope.insurance.PatientId },
          ctrl.getPatientBenefitPlansOnSuccess,
          function (err) {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve list of {0}. Please try again.',
                ['insurance patient benefit plans']
              ),
              'Error'
            );
          }
        );
      }
    };

    ctrl.getPatientBenefitPlansOnSuccess = function (pbpRes) {
      $scope.currentPlans = pbpRes.Value;
      ctrl.tempPlans = [];
      ctrl.tempPlans = _.filter(ctrl.fullBenefitPlanList, function (fbp) {
        return !_.some($scope.unsavedSelectedBenefitPlans, function (usbp) {
          return usbp.BenefitPlanId === fbp.BenefitId;
        });
      });
      ctrl.benefitPlans = _.filter(ctrl.tempPlans, function (bp) {
        return !_.some($scope.currentPlans, function (p) {
          return (
            p.BenefitPlanId === bp.BenefitId &&
            p.PolicyHolderId === $scope.insurance.PatientId
          );
        });
      });
      if ($scope.editing) {
        var currentBenefitPlan = _.find(
          ctrl.fullBenefitPlanList,
          function (bp) {
            return bp.BenefitId === $scope.insurance.BenefitPlanId;
          }
        );
        if (currentBenefitPlan) {
          ctrl.benefitPlans.push(currentBenefitPlan);
        }
      }
      $scope.filterBenefitPlans(null);

      // ensure values populated on benefit plan if exists
      if ($scope.insurance.BenefitPlanId) {
        $timeout(function () {
          var benefitPlan = listHelper.findItemByFieldValue(
            ctrl.fullBenefitPlanList,
            'BenefitId',
            $scope.insurance.BenefitPlanId
          );
          if (benefitPlan) {
            let additionalBenefits =
              $scope.insurance.AdditionalBenefits == null
                ? 0
                : $scope.insurance.AdditionalBenefits;
            $scope.insurance.$planGroupNumber = benefitPlan.PlanGroupNumber;
            $scope.insurance.$benefitPlan = benefitPlan;
            /** these values are used to calculate Deductible and Maximum Used values */
            $scope.insurance.$individualDeductibleLeft = Math.max(
              0,
              benefitPlan.IndividualDeductible -
                $scope.insurance.IndividualDeductibleUsed
            );
            $scope.insurance.$familyDeductibleLeft = Math.max(
              0,
              benefitPlan.FamilyDeductible -
                $scope.insurance.PolicyHolderBenefitPlanDto.FamilyDeductibleUsed
            );

            $scope.insurance.$individualMaxLeft = 0;
            $scope.insurance.$additionalBenefits = 0;

            $scope.disableIndividualAnnualMax =
              benefitPlan.AnnualBenefitMaxPerIndividual <= 0;
            if (!$scope.disableIndividualAnnualMax) {
              $scope.insurance.$individualMaxLeft = Math.max(
                0,
                benefitPlan.AnnualBenefitMaxPerIndividual +
                  additionalBenefits -
                  $scope.insurance.IndividualMaxUsed
              );
              $scope.insurance.$additionalBenefits = Math.max(
                0,
                additionalBenefits
              );
            } else {
              $scope.individualMaxLeftTooltipContent =
                "<span class='patientInsurance-tooltip'>Individual Annual Maximum Left is disabled because the benefit plan has no individual annual maximum.</span>";
              $scope.individualMaxLeftTooltip.options.content =
                $scope.individualMaxLeftTooltipContent;
            }

            $scope.selectedPlan = benefitPlan;
          }
        }, 0);
      }

      var count = 0;
      angular.forEach(ctrl.benefitPlans, function (benefitPlan) {
        var priority = count + 1;
        ctrl.benefitPlans[count].Priority = priority;
        count++;
      });

      // If we are editing we need to check to see if the patient is a policy holder for other patients

      if ($scope.editing && $scope.selectedPlan != null) {
        ctrl.checkForOtherDependentsWithThisPlan(
          $scope.selfGuid,
          $scope.selectedPlan.BenefitId
        );
      }
    };

    $scope.individualDeductibleLeftOnChange = function () {
      if (
        $scope.insurance.$individualDeductibleLeft >
        $scope.selectedPlan.IndividualDeductible
      )
        $scope.insurance.$individualDeductibleLeft =
          $scope.selectedPlan.IndividualDeductible;
    };

    $scope.familyDeductibleLeftOnChange = function () {
      if (
        $scope.insurance.$familyDeductibleLeft >
        $scope.selectedPlan.FamilyDeductible
      )
        $scope.insurance.$familyDeductibleLeft =
          $scope.selectedPlan.FamilyDeductible;
    };

    $scope.additionalBenefitsOnChange = function () {
      let additionalBenefitsDelta =
        $scope.insurance.$additionalBenefits -
        $scope.insurance.AdditionalBenefits;
      if (additionalBenefitsDelta != 0) {
        $scope.insurance.AdditionalBenefits =
          $scope.insurance.$additionalBenefits;
        $scope.insurance.$individualMaxLeft = Math.max(
          0,
          additionalBenefitsDelta + $scope.insurance.$individualMaxLeft
        );
      }
    };

    $scope.individualMaxLeftOnChange = function () {
      let maxIndividualRemaining =
        $scope.insurance.AdditionalBenefits +
        $scope.selectedPlan.AnnualBenefitMaxPerIndividual;
      if ($scope.insurance.$individualMaxLeft > maxIndividualRemaining)
        $scope.insurance.$individualMaxLeft = maxIndividualRemaining;
    };

    $scope.$on('PlanPriorityChange', function (event, priorities) {
      $scope.refreshOptions = true;
      $timeout(function () {
        $scope.priorityOptions = priorities;
        $scope.refreshOptions = false;
      });
    });
  },
]);
