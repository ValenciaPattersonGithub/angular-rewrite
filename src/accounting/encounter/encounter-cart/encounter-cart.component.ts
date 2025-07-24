import {
  Component,
  OnInit,
  Input,
  Inject,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EncounterCartBalanceBarComponent } from '../encounter-cart-balance-bar/encounter-cart-balance-bar.component';
import { EncounterCartCardComponent } from '../encounter-cart-card/encounter-cart-card.component';
import { isNullOrUndefined, isUndefined } from 'util';
import { PatientEncounterService } from '../providers/patient-encounter.service';
import * as moment from 'moment-timezone';
import cloneDeep from 'lodash/cloneDeep';
import { ToothAreaDataService } from '../../../@shared/providers/tooth-area-data.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { filter, take } from 'rxjs/operators';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { EncounterTotalPatientPortionPipe } from 'src/@shared/pipes/encounter/encounter-totals.pipe';
import { BestPracticePatientNamePipe } from 'src/@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { SoarInsuranceEstimateHttpService } from 'src/@core/http-services/soar-insurance-estimate-http.service';
import { SoarEncounterHttpService } from 'src/@core/http-services/soar-encounter-http.service';
declare let angular: any;
declare let _: any;

@Component({
  selector: 'encounter-cart',
  templateUrl: './encounter-cart.component.html',
  styleUrls: ['./encounter-cart.component.scss'],
})
export class EncounterCartComponent implements OnInit, OnDestroy {
  @ViewChild('encounterBar', { static: false })
  encounterBar: EncounterCartBalanceBarComponent;
  @ViewChildren(EncounterCartCardComponent)
  encounterCartCards!: QueryList<EncounterCartCardComponent>;

  @Input() accountId: any;
  @Input() encounterId: any;
  @Input() appointmentId?: any;
  @Input() isEditEncounter = true;
  @Output() canSaveChange = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<any>();

  public serviceDate: Date;
  public maxServiceDate: Date;
  public minServiceDate: Date;
  encounter: any = {};
  tempEncounter: any = {};
  services: any[] = [];
  feeSchedules: any;
  patientBenefitPlans: any[] = [];
  title: string = '';
  canSave: boolean = false;
  promisesComplete: boolean = false;
  hasChanges: boolean = false;
  isLoadingData: boolean = true;
  navigateToAccountSummary: boolean = false;
  promises: any[] = [];
  patientData: any;
  serviceCodes: any[] = [];
  providers: any[] = this.referenceDataService.get(
    this.referenceDataService.entityNames.users
  );
  location: any;
  serviceTypes: any[] = [
    { Text: 'Services', Id: 1 },
    { Text: 'Account Payments', Id: 2 },
    { Text: 'Insurance Payments', Id: 3 },
    { Text: '- Adjustments', Id: 4 },
    { Text: '+ Adjustments', Id: 5 },
    { Text: 'Finance Charges', Id: 6 },
  ];
  providerOnClaims: any;
  providerOnServices: any;
  isValidDateRange: Boolean = true;
  invaliDate = this.localize.getLocalizedString('Invalid Date');
  prevLocation: any;
  hasCheckoutPermissions: boolean;
  checkoutButtonTooltip: any;
  providerServicesError: boolean;
  providerClaimsError: boolean;
  providerToothError: boolean;
  providerAreaError: boolean;
  isFamilyCheckout: boolean;
  isRecalculating: boolean;

  isResetAllowedAmountsDisabled: boolean = true;

  constructor(
    private translate: TranslateService,
    @Inject('localize') private localize,
    private encounterService: PatientEncounterService,
    @Inject('windowObject') private window,
    @Inject('PatientServices') private patientServices,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('FinancialService') private financialService,
    @Inject('ModalFactory') private modalFactory,
    @Inject('$routeParams') private route,
    @Inject('locationService') private locationService,
    @Inject('BusinessCenterServices') private businessCenterServices,
    @Inject('DiscardChangesService') private discardChangesService,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('ScheduleServices') private scheduleServices,
    private confirmationModalService: ConfirmationModalService,
    private toothAreaDataService: ToothAreaDataService,
    private currencyPipe: CurrencyPipe,
    private encounterTotalPatientPortionPipe: EncounterTotalPatientPortionPipe,
    private bestPracticePatientNamePipe: BestPracticePatientNamePipe,
    private insuranceEstimateService: SoarInsuranceEstimateHttpService,
    private soarEncounterHttpService: SoarEncounterHttpService
  ) {}
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;

  ngOnInit() {
    this.title = this.translate.instant('Cart for Encounter');
    this.location = this.locationService.getCurrentLocation();
    const currentDate = new Date();
    this.maxServiceDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      23,
      59,
      0
    );
    this.minServiceDate = new Date(1900, 0, 1);
    this.prevLocation = this.route.PrevLocation;
    this.isFamilyCheckout = this.route.familyCheckout === 'true' ? true : false;
    this.getCheckoutPermissions();
    this.providerToothError = false;
    this.providerAreaError = false;
    this.providerServicesError = false;
    this.providerClaimsError = false;

    const promises = [];
    promises.push(
      Promise.resolve(
        this.patientServices.PatientBenefitPlan.getBenefitPlansRecordsByPatientId(
          { patientId: this.route.patientId }
        ).$promise
      )
    );
    promises.push(
      Promise.resolve(
        this.patientServices.Patients.get({ Id: this.route.patientId }).$promise
      )
    );
    promises.push(
      Promise.resolve(this.businessCenterServices.FeeSchedule.get({}).$promise)
    );
    promises.push(
      Promise.resolve(
        this.referenceDataService.getData(
          this.referenceDataService.entityNames.serviceCodes
        )
      )
    );

    if (this.encounterId) {
      promises.push(
        Promise.resolve(
          this.patientServices.Encounter.getEncountersByAccountId({
            accountId: this.accountId,
            includeTransactions: true,
          }).$promise
        )
      );
    } else {
      this.isEditEncounter = false;
      this.encounter = this.encounterService.createEncounter();
      this.services = cloneDeep(this.encounter.ServiceTransactionDtos);
      // if appointmentId is passed as parameter this has been called from the appointment modal or schedule
      // this call won't be made if we have an encounterId
      if (this.appointmentId) {
        promises.push(
          Promise.resolve(
            this.patientServices.PatientAppointment.GetWithDetails({
              appointmentId: this.appointmentId,
              FillAppointmentType: true,
              FillProviders: true,
              FillServices: true,
            }).$promise
          )
        );
      }
    }
    // we don't want to process until all the toothAreaData prereqs have resolved too
    this.toothAreaDataService
      .loadPrerequisiteData()
      .forEach(promise => promises.push(promise));

    Promise.all(promises).then(
      ([
        patientBenefitData,
        patientData,
        feeScheduleData,
        allServiceCodes,
        serviceTransactionData,
      ]) => {
        this.serviceCodes = allServiceCodes;
        // Finished loading all data
        this.isLoadingData = false;

        if (patientBenefitData !== undefined) {
          if (patientBenefitData.Value && patientBenefitData.Value.length > 0) {
            this.patientBenefitPlans = patientBenefitData.Value;
          }
        }

        if (patientData !== undefined) {
          this.patientData = patientData.Value;

          if (!this.isEditEncounter) {
            let accountMemberId = this.getAccountMemberId();
            this.encounter.AccountMemberId = accountMemberId;
            this.services.forEach(service => {
              service.AccountMemberId = accountMemberId;
            });
          }
        }

        if (feeScheduleData !== undefined) {
          this.feeSchedules = feeScheduleData.Value;
        }

        if (serviceTransactionData !== undefined) {
          // is the serviceTransactionData from an encounter
          if (this.encounterId) {
            if (
              serviceTransactionData.Value &&
              serviceTransactionData.Value.length > 0
            ) {
              let filteredEncounter = _.find(serviceTransactionData.Value, {
                EncounterId: this.encounterId,
              });
              if (filteredEncounter) {
                var services = cloneDeep(
                  filteredEncounter.ServiceTransactionDtos
                );

                this.validateInsuranceOrder(services);

                services.forEach(service => {
                  let split = service.Description.split(':');
                  service.CompleteDescription = split[1];
                  service.Code = split[0];
                });
                // capture appointmentId from existing services if not already set by url
                var serviceWithAppointmentId = services.find(
                  serviceTransaction => {
                    return !isNullOrUndefined(serviceTransaction.AppointmentId);
                  }
                );
                if (serviceWithAppointmentId) {
                  this.appointmentId = this.appointmentId
                    ? this.appointmentId
                    : serviceWithAppointmentId.AppointmentId;
                }

                services.forEach(service => {
                  if (!service.$toothAreaData) {
                    service = this.toothAreaDataService.loadToothAreaDataValuesForService(
                      service
                    );
                  }
                  this.updateAllowedAmount(service);
                });

                // encountered a race condition where services without toothAreaData attempting to load teeth selectors
                // this error repeated infinitely and stopped painting in its tracks.  To solve this we finish all operations
                // on a local services variable and only assigned complete services to this.services.
                this.encounter = filteredEncounter;
                this.services = services;
              }
            }
          } else {
            // if appointmentId is passed as parameter and no encounterId
            // this has been called from the appointment modal or schedule
            // we need to create the encounter based on appointment.plannedServices
            if (this.appointmentId) {
              let appointmentData = serviceTransactionData.Value;
              let appointment = appointmentData.Appointment;
              this.addServicesToEncounter(
                appointment.PlannedServices,
                null,
                null
              );
            }
          }
        }
        this.encounterBar.forceUpdate();
        this.registerController();
        this.updateCanSave();
        this.promisesComplete = true;
      }
    );
  }

  // ascertain that all services have InsuranceOrder before calculating insurance estimate
  // InsuranceOrder should begin with 1 and increment accordingly
  validateInsuranceOrder(services) {
    let order = 1;
    // Separate services with and without InsuranceOrder
    const servicesWithOrder = services.filter(s => s.InsuranceOrder !== null && s.InsuranceOrder !== undefined && s.InsuranceOrder > 0);
    const servicesWithoutOrder = services.filter(s => s.InsuranceOrder === null || s.InsuranceOrder === undefined || s.InsuranceOrder <= 0);

    // Sort services with InsuranceOrder in ascending order
    servicesWithOrder.sort((a, b) => a.InsuranceOrder - b.InsuranceOrder);

    // Assign unique InsuranceOrder values in sequence to services with order
    // this will remove duplicates
    servicesWithOrder.forEach(serviceTransaction => {
      serviceTransaction.InsuranceOrder = order++;
    });

    // Assign unique InsuranceOrder values to services without order 
    // starting from the next available order number
    // InsuranceOrder = 0 || InsuranceOrder = null || InsuranceOrder = undefined
    let nextOrder = servicesWithOrder.length > 0
      ? Math.max(...servicesWithOrder.map(s => s.InsuranceOrder)) + 1
      : 1;

    servicesWithoutOrder.forEach(service => {
      service.InsuranceOrder = nextOrder++;
    });

    // Combine the lists back together (optional, if needed)
    services.sort((a, b) => a.InsuranceOrder - b.InsuranceOrder);
  }

  ngOnDestroy(): void {
    this.registerControllerHasChanges(false);
  }

  registerController() {
    this.discardChangesService.onRegisterController({
      controller: 'PatientEncounterCartController',
      hasChanges: false,
    });
  }

  onChangesInProgress(changesInProgress: boolean) {
    this.canSave = !changesInProgress;
  }

  registerControllerHasChanges(canSave) {
    if (
      this.discardChangesService.currentChangeRegistration !== null &&
      this.discardChangesService.currentChangeRegistration.hasChanges != canSave
    ) {
      if (
        this.discardChangesService.currentChangeRegistration.controller ===
        'PatientEncounterCartController'
      ) {
        this.discardChangesService.currentChangeRegistration.hasChanges = canSave;
      }
    }
  }

  loadFeeSchedule(feeSchedule) {
    if (!isNullOrUndefined(feeSchedule)) {
      return this.businessCenterServices.FeeSchedule.getById(
        { feeScheduleId: feeSchedule.FeeScheduleId, IsCopy: false },
        res => {
          feeSchedule.FeeScheduleDetailDtos = res.Value.FeeScheduleDetailDtos;
          feeSchedule.FeeScheduleGroupDtos = res.Value.FeeScheduleGroupDtos;
        }
      ).$promise;
    }
  }

  // populate AllowedAmountDisplay on insuranceEstimate based on whether override exists
  // ie if no override, use AllowedAmount from estimate
  // populate ServiceTransaction.AllowedAmount based on lesser of AllowedAmounts on estimates
  updateAllowedAmount(serviceTransaction) {
    if (
      serviceTransaction !== null &&
      serviceTransaction !== undefined &&
      serviceTransaction.InsuranceEstimates !== null &&
      serviceTransaction.InsuranceEstimates !== undefined
    ) {
      serviceTransaction.InsuranceEstimates.forEach(insuranceEstimate => {
        insuranceEstimate.AllowedAmountDisplay =
          insuranceEstimate.AllowedAmount;
        // if AllowedAmount has been overridden update AllowedAmountDisplay based on that.
        if (
          insuranceEstimate.AllowedAmountOverride !== null &&
          insuranceEstimate.AllowedAmountOverride !== undefined
        ) {
          insuranceEstimate.AllowedAmountDisplay =
            insuranceEstimate.AllowedAmountOverride;
          this.isResetAllowedAmountsDisabled = false;
        }
        // set the service.AllowedAmount to the lesser of the AllowedAmount values (including AllowedAmountOverride) and there are multiple rows of InsuranceEstimates
        // NOTE this is dynamic value and is not persisted
        if (
          insuranceEstimate.AllowedAmountDisplay !== null &&
          insuranceEstimate.AllowedAmountDisplay !== undefined
        ) {
          if (
            serviceTransaction.AllowedAmount === null ||
            serviceTransaction.AllowedAmount === undefined
          ) {
            serviceTransaction.AllowedAmount =
              insuranceEstimate.AllowedAmountDisplay;
          } else {
            if (
              insuranceEstimate.AllowedAmountDisplay <
              serviceTransaction.AllowedAmount
            ) {
              serviceTransaction.AllowedAmount =
                insuranceEstimate.AllowedAmountDisplay;
            }
          }
        }
      });
    }
  }

  cancelClicked() {
    if (this.hasChanges === true) {
      this.confirmCancellation();
    } else {
      this.cancel.emit();
    }
  }

  addServiceClicked() {
    var modalInstance = this.modalFactory.Modal({
      windowTemplateUrl: 'uib/template/modal/window.html',
      templateUrl:
        'App/Patient/patient-chart/treatment-plans/add-services/add-services.html',
      controller: 'AddTxPlanServicesController',
      amfa: 'soar-clin-cpsvc-add',
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      windowClass: 'center-modal',
      resolve: {
        addServicesCallback: () => {
          return this.addServicesToEncounter.bind(this);
        },
        patient: () => {
          return this.patientData;
        },
        stageNumber: function () {
          return 1; // stage;
        },
        treatmentPlanId: function () {
          return null;
        },
        treatmentPlanServices: () => {
          return this.services;
        },
        servicesOnEncounter: () => {
          return this.services;
        },
        saveService: () => {
          return false;
        },
        includeEstIns: () => {
          return true;
        },
      },
    });
    modalInstance.isEncounterServices = true;
  }

  addServicesToEncounter(services, stage, areNew) {
    if (!isNullOrUndefined(services) && services.length > 0) {
      if (services[0].TreatmentPlanServiceHeader) {
        //This is coming from treatment plan services add
        this.applyTxEstInsOverrides(services);
      } else {
        // order by InsuranceOrder before adding to this.services so that the list maintains the
        // InsuranceOrder no other services or increments from the greatest existing service's Insurance Order
        services.sort((x, y) => (x.InsuranceOrder > y.InsuranceOrder ? 1 : -1));
        services.forEach(service => {
          let sequenceNumber = this.services.length;
          let serviceTransaction = this.createServiceTransactionForEncounter(
            service,
            ++sequenceNumber
          );
          serviceTransaction.InsuranceOrder = this.calculateInsuranceOrder();

          if (serviceTransaction.InsuranceEstimates != null) {
            serviceTransaction.InsuranceEstimates.forEach(est => {
              est.Fee = serviceTransaction.Fee;
            });
            if (serviceTransaction.applyDiscount !== undefined)
              serviceTransaction.isDiscounted =
                serviceTransaction.applyDiscount;
          }
          serviceTransaction = this.toothAreaDataService.loadToothAreaDataValuesForService(
            serviceTransaction
          );

          this.services.push(serviceTransaction);
          this.updateHasChanges();
        });
        this.services.sort((x, y) =>
          x.InsuranceOrder > y.InsuranceOrder ? 1 : -1
        );
      }

      //use insuranceEstimateService to map to IServiceTransactionDto before post to remove dynamic content before processing
      this.insuranceEstimateService
        .calculateDiscountAndTaxAndInsuranceEstimate(this.services)
        .subscribe(
          serviceTransactions => {
            this.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(
              serviceTransactions.Value
            );
          },
          err => {
            this.toastrFactory.error(
              this.translate.instant(
                'Failed to calculate discount,tax,and insurance estimate'
              ),
              this.translate.instant('Server Error')
            );
          }
        );
    }
  }

  applyTxEstInsOverrides(services) {
    services.forEach(service => {
      let sequenceNumber = this.services.length;
      let serviceTransaction = this.createServiceTransactionForEncounter(
        angular.copy(service.ServiceTransaction),
        ++sequenceNumber
      );
      serviceTransaction.InsuranceEstimates = [];

      var pbpPlanNumber = 0;
      for (
        var pbpPlanNumber = 0;
        pbpPlanNumber < this.patientBenefitPlans.length;
        ++pbpPlanNumber
      ) {
        var matchingPriorityPlan = this.patientBenefitPlans.find(x => {
          return x.Priority == pbpPlanNumber;
        });
        if (matchingPriorityPlan) {
          var tempEstIns = this.financialService.CreateInsuranceEstimateObject(
            serviceTransaction
          );
          tempEstIns[0].PatientBenefitPlanId =
            matchingPriorityPlan.PatientBenefitPlanId;
          serviceTransaction.InsuranceEstimates.push(
            angular.copy(tempEstIns[0])
          );
        }

        if (pbpPlanNumber == 1) {
          //Short circuit to exit out once we have the primary/secondary insurances
          pbpPlanNumber = this.patientBenefitPlans.length;
        }
      }

      var servicePatientBenefitPlans = serviceTransaction.InsuranceEstimates.map(
        x => x.PatientBenefitPlanId
      );
      var txServicePbps = service.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.map(
        x => x.PatientBenefitPlanId
      );
      var servicesHaveSamePbps = true;

      servicePatientBenefitPlans.forEach(x => {
        if (
          !txServicePbps.find(y => {
            return y == x;
          })
        ) {
          servicesHaveSamePbps = false;
        }
      });

      //Only apply tx plan est ins overrides if all of the patient benefit plans used on the tx plan match current patient benefit plans
      //If they do not match, then the tx overrides are out of date and should not be used
      if (servicesHaveSamePbps) {
        if (
          service.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.find(
            x => {
              return (
                x.IsUserOverRidden == true &&
                serviceTransaction.InsuranceEstimates.find(estimate => {
                  return (
                    x.PatientBenefitPlanId == estimate.PatientBenefitPlanId
                  );
                })
              );
            }
          )
        ) {
          serviceTransaction.InsuranceEstimates.forEach(x => {
            var matchingTxEstimate = service.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates.find(
              estimate => {
                return estimate.PatientBenefitPlanId == x.PatientBenefitPlanId;
              }
            );

            x.EstInsurance = matchingTxEstimate.EstInsurance;
            x.AdjEst = matchingTxEstimate.AdjEst;
            x.IsUserOverRidden = true;
          });
          if (serviceTransaction.InsuranceEstimates.length > 0) {
            serviceTransaction.InsuranceEstimates[0].IsMostRecentOverride = true;
          }
        }
      }

      serviceTransaction.InsuranceOrder = this.calculateInsuranceOrder();

      if (serviceTransaction.InsuranceEstimates != null) {
        serviceTransaction.InsuranceEstimates.forEach(est => {
          est.Fee = serviceTransaction.Fee;
        });
        if (serviceTransaction.applyDiscount !== undefined)
          serviceTransaction.isDiscounted = serviceTransaction.applyDiscount;
      }
      serviceTransaction = this.toothAreaDataService.loadToothAreaDataValuesForService(
        serviceTransaction
      );

      this.services.push(serviceTransaction);
      this.updateHasChanges();
    });
  }

  calculateInsuranceOrder() {
    if (this.services.length === 0) return 1;
    // if services already exist on the encounter this code insures that the added services
    // Insurance Order is incremented from the greatest of those in its current order.
    let last = this.services.reduce((a, b) =>
      a.InsuranceOrder > b.InsuranceOrder ? a : b
    );
    return last && !isUndefined(last.InsuranceOrder) && last.InsuranceOrder > 0
      ? last.InsuranceOrder + 1
      : 1;
  }

  onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(services) {
    this.services.forEach(serviceTransaction => {
      // find the matching serviceTraction by InsuranceOrder
      let reCalculatedService = services.find(x => {
        return x.InsuranceOrder === serviceTransaction.InsuranceOrder;
      });
      if (reCalculatedService) {
        serviceTransaction.Discount = reCalculatedService.Discount;
        serviceTransaction.Amount = reCalculatedService.Amount;
        serviceTransaction.Tax = reCalculatedService.Tax;
        serviceTransaction.InsuranceEstimates =
          reCalculatedService.InsuranceEstimates;
        serviceTransaction.TotalEstInsurance =
          reCalculatedService.TotalEstInsurance;
        serviceTransaction.TotalAdjEstimate =
          reCalculatedService.TotalAdjEstimate;
        serviceTransaction.Balance = parseFloat(
          (
            serviceTransaction.Amount -
            serviceTransaction.TotalEstInsurance -
            serviceTransaction.TotalAdjEstimate
          ).toFixed(2)
        );
        this.updateAllowedAmount(serviceTransaction);
      }
    });
    this.encounterService.notifyServiceHasChanged();

    this.encounterBar.forceUpdate();
  }

  calculateDiscount(serviceTransaction) {
    return this.patientServices.Discount.get(
      { isDiscounted: serviceTransaction.applyDiscount },
      serviceTransaction
    ).$promise.then(
      res => this.calculateDiscountOnSuccess(serviceTransaction, res),
      this.calculateDiscountOnError
    );
  }

  calculateDiscountOnSuccess(serviceTransaction, successResponse) {
    if (serviceTransaction.applyDiscount) {
      serviceTransaction.Discount = successResponse.Value;
    } else {
      serviceTransaction.Discount = 0;
    }
  }

  calculateDiscountOnError() {
    this.toastrFactory.error(
      this.translate.instant('Failed to calculate discount'),
      'Server Error'
    );
  }

  calculateTaxAfterDiscount(serviceTransaction) {
    return this.patientServices.TaxAfterDiscount.get(
      {
        isDiscounted: serviceTransaction.applyDiscount,
      },
      serviceTransaction
    ).$promise.then(
      res => this.calculateTaxOnSuccess(serviceTransaction, res),
      this.calculateTaxOnError
    );
  }

  calculateTaxOnSuccess = function (serviceTransaction, successResponse) {
    serviceTransaction.Tax = successResponse.Value;
  };

  calculateTaxOnError = function () {
    this.toastrFactory.error(
      this.translate.instant('Failed to calculate tax'),
      'Server Error'
    );
  };

  // returns true if passed date is today, false otherwise
  isTodaysDate = function (dateEntered) {
    const todaysDate = new Date();
    let dateToCheck = new Date(dateEntered);
    return (
      dateToCheck.getUTCDate() === todaysDate.getUTCDate() &&
      dateToCheck.getUTCMonth() === todaysDate.getUTCMonth() &&
      dateToCheck.getUTCFullYear() === todaysDate.getUTCFullYear()
    );
  };

  // if this is a treatment plan service or a proposed service set the serviceTransaction DateEntered to today
  // for all new services, allow past dates but do not allow future dates
  getServiceTransactionDate(serviceTransaction, dateEntered) {
    // for existing services (tx plan or proposed)
    if (serviceTransaction.ServiceTransactionId > '') {
      return new Date().toISOString();
    } else {
      let parsedDateEntered = new Date(dateEntered);
      // dateEntered can't be outside the minServiceDate & maxServiceDate range, if this is new service use dateEntered
      return parsedDateEntered > this.maxServiceDate || parsedDateEntered < this.minServiceDate
        ? new Date().toISOString()
        : parsedDateEntered.toISOString();
    }
  }

  createServiceTransactionForEncounter(service, sequenceNumber) {
    var serviceTransactionObject = angular.copy(service);
    var dateEnteredOnService = this.getServiceTransactionDate(
      serviceTransactionObject,
      service.DateEntered
    );
    // patient-encounter-refactor-controller buildServiceTransaction
    serviceTransactionObject.EncounterId = this.encounter.EncounterId;
    serviceTransactionObject.ServiceTransactionStatusId = 5;

    serviceTransactionObject.AccountMemberId = this.getAccountMemberId();
    serviceTransactionObject.InsuranceEstimates = this.financialService.CreateOrCloneInsuranceEstimateObject(
      service
    );
    serviceTransactionObject.InsuranceEstimates[0].AccountMemberId =
      serviceTransactionObject.AccountMemberId;
    serviceTransactionObject.ObjectState =
      serviceTransactionObject.ServiceTransactionId > ''
        ? this.encounterService.saveStates.Update
        : this.encounterService.saveStates.Add;
    serviceTransactionObject.DateEntered = dateEnteredOnService;
    serviceTransactionObject.SequenceNumber = sequenceNumber;
    serviceTransactionObject.Amount =
      angular.copy(serviceTransactionObject.Fee) -
      (serviceTransactionObject.Discount
        ? angular.copy(serviceTransactionObject.Discount)
        : 0) +
      (serviceTransactionObject.Tax
        ? angular.copy(serviceTransactionObject.Tax)
        : 0);
    serviceTransactionObject.Balance = !isNullOrUndefined(service.Balance)
      ? service.Balance
      : 0;
    serviceTransactionObject.SurfaceSummaryInfo = !isNullOrUndefined(
      service.Surface
    )
      ? service.Surface.replace(/[ ,]/g, '')
      : '';
    serviceTransactionObject.RootSummaryInfo = !isNullOrUndefined(service.Roots)
      ? service.Roots.replace(/[ ,]/g, '')
      : '';
    if (serviceTransactionObject.TransactionTypeId) {
      serviceTransactionObject.TransactionType = this.getTransactionType(
        serviceTransactionObject.TransactionTypeId
      );
    }

    this.setProviderOnClaimsForService(
      serviceTransactionObject,
      this.providers
    );

    var serviceCode = this.serviceCodes.find(
      scid => scid.ServiceCodeId === serviceTransactionObject.ServiceCodeId
    );

    if (serviceCode != null) {
      serviceTransactionObject.TaxableServiceTypeId =
        serviceCode.$$locationTaxableServiceTypeId;
      serviceTransactionObject.DiscountableServiceTypeId =
        serviceCode.DiscountableServiceTypeId;
      serviceTransactionObject.ServiceTypeId = serviceCode.ServiceTypeId;
      serviceTransactionObject.IsEligibleForDiscount =
        serviceCode.IsEligibleForDiscount;

      serviceTransactionObject.CdtCodeName = serviceCode.CdtCodeName;
      serviceTransactionObject.Code = serviceCode.Code;
      serviceTransactionObject.AffectedAreaId = serviceCode.AffectedAreaId;
      serviceTransactionObject.Description = serviceCode.Description;
      serviceTransactionObject.CompleteDescription = serviceCode.Description;
      if (
        serviceCode.CdtCodeName !== null &&
        serviceCode.CdtCodeName !== '' &&
        serviceCode.CdtCodeName !== undefined
      )
        serviceTransactionObject.CompleteDescription =
          serviceCode.Description + ' (' + serviceCode.CdtCodeName + ')';
      serviceTransactionObject.DisplayAs = serviceCode.DisplayAs;
    }

    // set description = ServiceCode : description (CDTCode)
    if (
      !isNullOrUndefined(serviceTransactionObject.Description) &&
      serviceTransactionObject.Description.split(':').length == 0
    ) {
      serviceTransactionObject.Description = [
        serviceTransactionObject.Code,
        serviceTransactionObject.Description,
      ]
        .filter(function (text) {
          return text;
        })
        .join(': ');
      if (
        typeof serviceTransactionObject.CdtCodeName !== 'undefined' &&
        serviceTransactionObject.CdtCodeName != null &&
        serviceTransactionObject.CdtCodeName.length > 0
      )
        serviceTransactionObject.Description =
          serviceTransactionObject.Description +
          ' (' +
          serviceTransactionObject.CdtCodeName +
          ')';
    }

    serviceTransactionObject.LocationId = this.location.id;

    if (serviceTransactionObject.IsEligibleForDiscount) {
      serviceTransactionObject.applyDiscount = true;
    } else {
      serviceTransactionObject.applyDiscount = false;
    }

    if (
      serviceTransactionObject.Fee == null ||
      serviceTransactionObject.Fee == undefined ||
      serviceTransactionObject.Fee == 0
    ) {
      serviceTransactionObject.Fee = 0;
      serviceTransactionObject.Tax = 0;
      serviceTransactionObject.Discount = 0;
      serviceTransactionObject.Balance = 0;
      serviceTransactionObject.Amount = 0;
      angular.forEach(
        serviceTransactionObject.InsuranceEstimates,
        function (est) {
          est.EstInsurance = 0;
        }
      );
      // $scope.taxLoading = false;
      serviceTransactionObject.IsEligibleForDiscount = false;
    }
    // InsuranceOrder is set by the treatment plan selector
    // NOTE other methods of adding a serviceTransaction will not have InsuranceOrder set so
    // it will be either NULL or 0
    serviceTransactionObject.InsuranceOrder = service.InsuranceOrder;
    return serviceTransactionObject;
  }

  getAccountMemberId = function () {
    if (this.encounter && this.encounter.AccountMemberId) {
      return this.encounter.AccountMemberId;
    } else if (
      this.patientData != null &&
      this.patientData.PersonAccount != null &&
      this.patientData.PersonAccount.PersonAccountMember != null
    ) {
      return this.patientData.PersonAccount.PersonAccountMember.AccountMemberId;
    } else {
      return null;
    }
  };

  setProviderOnClaimsForService(serviceTransaction, providers) {
    if (serviceTransaction.ProviderUserId && providers.length > 0) {
      var serviceProvider = providers.find(provider => {
        return provider.UserId === serviceTransaction.ProviderUserId;
      });
      // if the provider on this service transaction has ProviderOnClaimsRelationship of Other and has a ProviderOnClaimsId, set to ProviderOnClaimsId
      // otherwise set to provider
      if (serviceProvider) {
        let ofcLocation =
          serviceProvider.Locations.length > 0
            ? serviceProvider.Locations.find(location => {
                return location.LocationId === this.location.id;
              })
            : null;

        serviceTransaction.ProviderOnClaimsId =
          ofcLocation &&
          ofcLocation.ProviderOnClaimsRelationship === 2 &&
          ofcLocation.ProviderOnClaimsId
            ? ofcLocation.ProviderOnClaimsId
            : serviceProvider.UserId;
      }
    }
  }

  getTransactionType(serviceTypeId) {
    var serviceTypeItem = this.serviceTypes.find(
      stt => stt.Id === serviceTypeId
    );
    if (serviceTypeItem == null) {
      return '';
    } else {
      return serviceTypeItem.Text;
    }
  }

  saveEncounterSuccess(successResponse) {
    var updatedEncounter = successResponse.Value;

    if (!this.isEditEncounter) {
      if (updatedEncounter) {
        this.encounterId = updatedEncounter.EncounterId;
        this.encounter = this.processRequiredPropertiesForServiceTransaction(
          updatedEncounter
        );
        this.toastrFactory.success(
          this.translate.instant('Encounter created successfully'),
          this.translate.instant('Success')
        );
        this.navigateToNextScreen();
      } else {
        this.toastrFactory.error(
          this.translate.instant(
            'An error has occurred while creating an encounter'
          ),
          this.translate.instant('Error')
        );
      }
    } else {
      if (updatedEncounter) {
        this.isEditEncounter = false;
        this.encounter = this.processRequiredPropertiesForServiceTransaction(
          updatedEncounter[0]
        );
        this.toastrFactory.success(
          this.translate.instant('Encounter updated successfully'),
          this.translate.instant('Success')
        );
        this.navigateToNextScreen();
      } else {
        this.toastrFactory.error(
          this.translate.instant(
            'An error has occurred while updating an encounter'
          ),
          this.translate.instant('Error')
        );
      }
    }
  }

  updateAppointmentSuccess(successResponse) {
    if (successResponse.Value) {
      // recalculate estimates
      this.recalculateEstimatedInsuranceForAllServices();
      this.updateHasChanges();
      this.toastrFactory.success(
        this.translate.instant('Appointment updated successfully'),
        this.translate.instant('Success')
      );
    } else {
      this.toastrFactory.error(
        this.translate.instant(
          'An error has occurred while updating the appointment'
        ),
        this.translate.instant('Error')
      );
    }
  }

  processRequiredPropertiesForServiceTransaction(encounter) {
    if (isNullOrUndefined(encounter)) {
      return null;
    }

    encounter.Description = '';
    if (
      !isNullOrUndefined(encounter.ServiceTransactionDtos) &&
      encounter.ServiceTransactionDtos.length > 0
    ) {
      encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
        if (serviceTransaction.EncounterId) {
          var serviceCodeItem =
            !isNullOrUndefined(this.serviceCodes) &&
            this.serviceCodes.length > 0
              ? this.serviceCodes.find(
                  scid =>
                    scid.ServiceCodeId === serviceTransaction.ServiceCodeId
                )
              : null;
          if (serviceCodeItem == null) {
            // set values to blank
            serviceTransaction.DisplayAs = '';
            serviceTransaction.AffectedAreaId = '';
            serviceTransaction.Code = '';
            serviceTransaction.CdtCodeName = '';
          } else {
            // set values with result
            serviceTransaction.DisplayAs = serviceCodeItem.DisplayAs;
            serviceTransaction.AffectedAreaId = serviceCodeItem.AffectedAreaId;
            serviceTransaction.Code = serviceCodeItem.Code;
            serviceTransaction.CdtCodeName = serviceCodeItem.CdtCodeName;
          }
          if (serviceTransaction.TransactionTypeId) {
            serviceTransaction.TransactionType = this.getTransactionType(
              serviceTransaction.TransactionTypeId
            );
          }
          encounter.Description += serviceTransaction.DisplayAs + ',';
        }
      });
    }
    encounter.Description = encounter.Description.substring(
      0,
      encounter.Description.length - 1
    );
    return encounter;
  }

  saveEncounterFailure(errorResponse) {
    //Enable the action button
    if (!this.isEditEncounter) {
      this.toastrFactory.error(
        this.translate.instant(
          'An error has occurred while creating an encounter'
        ),
        this.translate.instant('Error')
      );
    } else {
      if (!(errorResponse && errorResponse.status === 409))
        this.toastrFactory.error(
          this.translate.instant(
            'An error has occurred while updating an encounter'
          ),
          this.translate.instant('Error')
        );
    }
  }

  getAppointmentFailure() {
    this.toastrFactory.error(
      this.translate.instant(
        'An error has occurred while retrieving the appointment'
      ),
      this.translate.instant('Error')
    );
  }

  updateAppointmentFailure() {
    this.toastrFactory.error(
      this.translate.instant(
        'An error has occurred while updating the appointment'
      ),
      this.translate.instant('Error')
    );
  }

  getCheckoutPermissions() {
    if (
      this.patSecurityService.IsAuthorizedByAbbreviation(
        'soar-acct-enctr-chkout'
      )
    ) {
      this.hasCheckoutPermissions = true;
      this.checkoutButtonTooltip = '';
    } else {
      // Notify user, he is not authorized to access checkout
      this.hasCheckoutPermissions = false;
      this.checkoutButtonTooltip = this.patSecurityService.generateMessage(
        'soar-acct-enctr-chkout'
      );
    }
  }

  startCheckoutClicked() {
    if (this.hasCheckoutPermissions === true) {
      if (
        !isNullOrUndefined(this.encounter) &&
        !isNullOrUndefined(this.services) &&
        this.services.length > 0
      ) {
        if (this.canSave) {
          this.saveEncounter();
        } else {
          this.navigateToNextScreen();
        }
      }
    }
  }

  saveAsPendingClicked() {
    if (
      !isNullOrUndefined(this.encounter) &&
      !isNullOrUndefined(this.services) &&
      this.services.length > 0
    ) {
      this.navigateToAccountSummary = true;

      if (this.canSave) {
        this.saveEncounter();
      } else {
        this.navigateToNextScreen();
      }
    }
  }

  navigateToNextScreen() {
    if (this.navigateToAccountSummary) {
      if (this.prevLocation == 'AccountSummaryBeta') {
        this.window.location.href =
          '#/Patient/' +
          this.route.patientId +
          '/Summary/?tab=Account%20Summary%20Beta';
      } else {
        this.window.location.href =
          '#/Patient/' +
          this.route.patientId +
          '/Summary/?tab=Account%20Summary';
      }
    } else {
      if (this.isFamilyCheckout === true) {
        this.window.location.href =
          '#/Patient/' +
          this.route.patientId +
          '/Account/' +
          this.accountId +
          '/Checkout/' +
          this.prevLocation;
      } else {
        const prevLocation =
          this.prevLocation === 'PatientOverview'
            ? 'EncountersCartPatientOverview'
            : this.prevLocation === 'Schedule'
            ? 'Schedule'
            : this.prevLocation === 'AccountSummaryBeta'
            ? 'EncounterCartAccountSummaryBeta'
            : 'EncountersCartAccountSummary';
        this.window.location.href =
          '#/Patient/' +
          this.route.patientId +
          '/Account/' +
          this.accountId +
          '/Encounter/' +
          this.encounter.EncounterId +
          '/Checkout/' +
          prevLocation;
      }
    }
  }

  saveEncounter() {
    // prevent user attempting duplicate saves
    this.canSave = false;
    this.tempEncounter = cloneDeep(this.encounter);
    this.tempEncounter.Description = '';
    // validate that services have InsuranceOrder
    this.validateInsuranceOrder(this.services);

    // sychronize AppointmentIds on services before peristing.
    this.encounterService.syncAppointmentIdOnService(
      this.services,
      this.appointmentId
    );

    this.services.forEach(serviceTransaction => {
      if (
        serviceTransaction.ObjectState === this.encounterService.saveStates.None
      ) {
        serviceTransaction.ObjectState = this.encounterService.saveStates.Update;
      }
      this.tempEncounter.Description += serviceTransaction.DisplayAs + ',';
    });

    //Reconcile the encounter.ServiceTransactionDtos list vs this.services
    //If not present on this.services, assume we want don't want it on the encounter
    //  If the service was already on the encounter, then remove the encounterId, appointmentId
    //  set status to Proposed, ObjectState.Update, remove InsuranceOrder

    var tempEncounterServiceList = cloneDeep(
      this.encounter.ServiceTransactionDtos
    );
    var tempDisplayedServiceList = cloneDeep(this.services);

    this.tempEncounter.ServiceTransactionDtos = [];

    var serviceFound = false;
    //Loop through the services that were on the encounter when the cart was started
    tempEncounterServiceList.forEach(serviceTransaction => {
      serviceFound = false;

      //Loop through the services that are displayed on the encounter
      tempDisplayedServiceList.forEach(service => {
        if (!serviceFound && service.ServiceTransactionId > '') {
          if (
            service.ServiceTransactionId ==
            serviceTransaction.ServiceTransactionId
          ) {
            //The service was already saved to the encounter when we started up the cart
            //It's still here, so update it.
            service.ObjectState = this.encounterService.saveStates.Update;
            this.tempEncounter.ServiceTransactionDtos.push(service);

            //Remove the service from the temp displayed list
            //  so we don't have to loop through that service again
            const index = tempDisplayedServiceList.indexOf(service);

            if (index !== -1) {
              tempDisplayedServiceList.splice(index, 1);
            }
            serviceFound = true;
          }
        }
      });
      if (!serviceFound && serviceTransaction.ServiceTransactionId > '') {
        //The service was already existing and saved to the encounter, but was removed
        //Reset it back to Proposed and remove any IDs linking it to an encounter/appointment
        serviceTransaction.EncounterId = null;
        serviceTransaction.ObjectState = this.encounterService.saveStates.Update;
        serviceTransaction.AppointmentId = null;
        serviceTransaction.ServiceTransactionStatusId = 1; //Proposed
        serviceTransaction.InsuranceOrder = null;
        this.tempEncounter.ServiceTransactionDtos.push(serviceTransaction);
      }
    });

    //Loop through the remaining services that were not found
    tempDisplayedServiceList.forEach(serviceTransaction => {
      //This service is either brand new and has never been saved yet
      //Or the service was already existing, but not on the encounter yet
      //Add it to the encounter
      this.tempEncounter.ServiceTransactionDtos.push(serviceTransaction);
    });

    this.tempEncounter.ServiceTransactionDtos.forEach(serviceTransaction => {
      if (
        serviceTransaction.ObjectState === this.encounterService.saveStates.None
      ) {
        serviceTransaction.ObjectState = this.encounterService.saveStates.Update;
      }
    });

    this.tempEncounter.Description = this.tempEncounter.Description.substring(
      0,
      this.tempEncounter.Description.length - 1
    );

    this.tempEncounter.ServiceTransactionDtos = this.tempEncounter.ServiceTransactionDtos.sort(
      (a, b) =>
        a['InsuranceOrder'] > b['InsuranceOrder']
          ? 1
          : a['InsuranceOrder'] == b['InsuranceOrder']
          ? 0
          : -1
    );
    if (this.isEditEncounter) {
      var encounterDtos = [];
      encounterDtos.push(this.tempEncounter);

      this.soarEncounterHttpService.update(encounterDtos).subscribe(
        res => {
          this.saveEncounterSuccess(res);
        },
        err => {
          this.saveEncounterFailure(err);
        }
      );
      this.registerControllerHasChanges(false);
    } else {
      this.soarEncounterHttpService.create(this.tempEncounter).subscribe(
        res => {
          this.saveEncounterSuccess(res);
        },
        err => {
          this.saveEncounterFailure(err);
        }
      );
      this.registerControllerHasChanges(false);
    }
  }

  sortServicesBy(prop: string) {
    return this.services.sort((a, b) =>
      a[prop] > b[prop] ? 1 : a[prop] == b[prop] ? 0 : -1
    );
  }

  onServiceChanged(service: any) {
    this.updateHasChanges();
  }

  onServiceDateChanged(dateValue: Date) {
    if (dateValue) {
      const dateToCompare = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate()
      );
      this.isValidDateRange =
        dateToCompare != null &&
        dateToCompare <= this.maxServiceDate &&
        dateToCompare >= this.minServiceDate;

      var dateTimeForDatabase = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate(),
        moment().hour(),
        moment().minute(),
        moment().second(),
        moment().millisecond()
      );

      this.encounterCartCards.forEach(card => {
        card.onServiceDateChanged(dateTimeForDatabase);
      });
    }
  }

  updateHasChanges() {
    this.registerControllerHasChanges(true);
    this.hasChanges = true;
    this.updateCanSave();
  }

  updateCanSave() {
    let cardValidity = !this.encounterCartCards.some(cartCard => {
      return !cartCard.isValidDateRange;
    });
    let serviceValidity = this.checkIfServicesAreValid(this.services);
    this.canSave = cardValidity && serviceValidity;
  }

  onTransactionRecalculated(service: any) {
    this.recalculateEstimatedInsuranceForAllServices();
  }

  recalculateEstimatedInsuranceForAllServices() {
    this.isRecalculating = true;
    var servicesToCalculate = [];
    this.services.forEach(service => {
      if (!service.PredeterminationHasResponse) {
        servicesToCalculate.push(service);
      }
    });

    this.financialService
      .RecalculateInsurance(servicesToCalculate)
      .then(() => {
        this.addServicesCalculateValues();
        this.encounterCartCards.forEach(x => x.forceTotalInsuranceUpdate());
        this.services.forEach(x => this.updateAllowedAmount(x));
        this.encounterBar.forceUpdate();
      })
      .finally(() => {
        this.isRecalculating = false;
      });
  }

  addServicesCalculateValues() {}

  onRemoveService(service: any) {
    this.canSave = false;
    const index = this.services.indexOf(service);

    if (index !== -1) {
      this.services.splice(index, 1);
    }

    //in the case of a new encounter, we need to remove the service from the appointment itself
    if (
      service.AppointmentId > '' &&
      this.encounter.ServiceTransactionDtos.length === 0
    ) {
      this.scheduleServices.Lists.Appointments.GetWithDetails(
        { AppointmentId: service.AppointmentId },
        res => {
          this.removeServiceFromAppointment(service, res.Value);
        },
        () => {
          this.getAppointmentFailure();
        }
      );
      return;
    }

    //Recalculate insurance estimates for the remaining services
    this.recalculateEstimatedInsuranceForAllServices();
    this.updateHasChanges();
  }

  removeServiceFromAppointment(service, appointmentDetail) {
    appointmentDetail.Appointment.PlannedServices.forEach(plannedService => {
      if (
        plannedService.ServiceTransactionId === service.ServiceTransactionId
      ) {
        plannedService.ObjectState = this.encounterService.saveStates.Update;
        plannedService.AppointmentId = null;
        plannedService.ServiceTransactionStatusId = 1; //Proposed
        plannedService.InsuranceOrder = null;
      }
    });
    appointmentDetail.Appointment.ProviderAppointments.forEach(
      providerAppointment => {
        providerAppointment.ObjectState = this.encounterService.saveStates.Update;
      }
    );

    this.scheduleServices.Update.Appointment(
      { returnList: false },
      appointmentDetail.Appointment,
      res => {
        this.updateAppointmentSuccess(res);
      },
      () => {
        this.updateAppointmentFailure();
      }
    );
  }

  onProviderOnClaimsChanged(selectedProviderId: any) {
    this.providerOnClaims = selectedProviderId;
    this.services.forEach(service => {
      service.ProviderOnClaimsId = selectedProviderId;
    });

    this.updateHasChanges();
  }

  onProviderOnServicesChanged(selectedProvider: any) {
    if (isNullOrUndefined(selectedProvider)) {
      this.providerOnServices = null;
      this.services.forEach(service => {
        service.ProviderUserId = null;
        service.ProviderOnClaimsId = null;
      });
    } else {
      this.providerOnServices = selectedProvider.ProviderId;
      this.services.forEach(service => {
        service.ProviderUserId = selectedProvider.ProviderId;
        service.ProviderOnClaimsId =
          selectedProvider.UserLocationSetup.ProviderOnClaimsRelationship ===
            2 && selectedProvider.UserLocationSetup.ProviderOnClaimsId
            ? selectedProvider.UserLocationSetup.ProviderOnClaimsId
            : selectedProvider.ProviderId;
      });
    }

    this.updateHasChanges();
  }

  scrollToService(id: any) {
    $('html, body').animate(
      {
        scrollTop: $(id).offset().top - 205,
      },
      300
    );
  }

  checkIfServicesAreValid(serviceList) {
    var invalidSelectionsFlag = false;

    for (let x = 0; x < serviceList.length; ++x) {
      serviceList[x].providerToothError = false;
      serviceList[x].providerAreaError = false;
      serviceList[x].providerServicesError = false;
      serviceList[x].providerClaimsError = false;

      let toothAreaIsValid = this.checkToothAndAreaSelections(serviceList[x]);
      if (!toothAreaIsValid) {
        invalidSelectionsFlag = true;
      }
      if (isNullOrUndefined(serviceList[x].ProviderUserId)) {
        serviceList[x].providerServicesError = true;
        invalidSelectionsFlag = true;
      }
      if (isNullOrUndefined(serviceList[x].ProviderOnClaimsId)) {
        serviceList[x].providerClaimsError = true;
        invalidSelectionsFlag = true;
      }
    }

    // don't overwrite checkoutButtonTooltip if its user is not authorized to access checkout
    if (this.hasCheckoutPermissions === true) {
      if (invalidSelectionsFlag) {
        this.checkoutButtonTooltip = this.translate.instant(
          'Invalid selection(s)'
        );
      } else {
        this.checkoutButtonTooltip = '';
      }
    }

    if (invalidSelectionsFlag) {
      return false;
    }
    invalidSelectionsFlag = false;
    return true;
  }

  confirmResetAllowedAmounts() {
    let data = {
      header: this.translate.instant('Confirm'),
      message: 'Are you sure you want to reset all of the Allowed Amounts?',
      confirm: this.translate.instant('OK'),
      cancel: this.translate.instant('Cancel'),
      height: 200,
      width: 450,
    };
    this.confirmationRef = this.confirmationModalService.open({
      data,
    });
    this.confirmationModalSubscription = this.confirmationRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type === 'confirm' || event.type === 'close';
        }),
        take(1)
      )
      .subscribe(events => {
        switch (events.type) {
          case 'confirm':
            this.confirmationRef.close();
            this.resetAllowedAmounts();
            break;
          case 'close':
            this.confirmationRef.close();
            break;
        }
      });
  }

  resetAllowedAmounts() {
    this.services.forEach(service => {
      service.AllowedAmount = null;
      service.InsuranceEstimates.forEach(est => {
        est.AllowedAmountOverride = null;
        est.AllowedAmountDisplay = est.AllowedAmount;
      });
    });
    this.isResetAllowedAmountsDisabled = true;

    //use insuranceEstimateService to map to IServiceTransactionDto before post to remove dynamic content before processing
    this.insuranceEstimateService
      .calculateDiscountAndTaxAndInsuranceEstimate(this.services)
      .subscribe(
        serviceTransactions => {
          this.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(
            serviceTransactions.Value
          );
        },
        err => {
          this.toastrFactory.error(
            this.translate.instant(
              'Failed to calculate discount,tax,and insurance estimate'
            ),
            this.translate.instant('Server Error')
          );
        }
      );
  }

  // encounter display date should be oldest service date
  getEncounterDisplayDate(services) {
    const datesToCompare = services.map(a => a.DateEntered);
    datesToCompare.sort();
    let displayDate = datesToCompare[0];
    if (!displayDate.toLowerCase().endsWith('z')) {
      displayDate += 'Z';
    }
    return new DatePipe('en-US').transform(displayDate, 'MM/dd/yyyy');
  }

  confirmCancellation() {
    // default messaging for individual checkout
    let data = {
      header: this.translate.instant('Discard Changes'),
      message: this.translate.instant(
        'Are you sure you want to discard these changes?'
      ),
      message2: null,
      confirm: this.translate.instant('Yes'),
      cancel: this.translate.instant('No'),
      height: 200,
      width: 400,
    };

    // tailor messaging to family checkout with explicit encounter information
    if (this.isFamilyCheckout === true) {
      const bestPracticePatientName = this.bestPracticePatientNamePipe.transform(
        this.patientData
      );
      const balanceDue = this.encounterTotalPatientPortionPipe.transform(
        this.services
      );
      const displayAmount = this.currencyPipe.transform(
        balanceDue,
        'USD',
        'symbol',
        '1.2-2'
      );
      const displayDate = this.getEncounterDisplayDate(this.services);
      let encounterDescription = `${bestPracticePatientName} ${displayDate} ${displayAmount}`;
      // override message for family checkout
      data.message = this.translate.instant(
        'Are you sure you want to discard these changes for '
      );
      data.message2 = encounterDescription;
    }

    this.confirmationRef = this.confirmationModalService.open({
      data,
    });
    this.confirmationModalSubscription = this.confirmationRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type === 'confirm' || event.type === 'close';
        }),
        take(1)
      )
      .subscribe(events => {
        switch (events.type) {
          case 'confirm':
            this.confirmationRef.close();
            this.hasChanges = false;
            this.registerControllerHasChanges(false);
            this.cancel.emit();
            break;
          case 'close':
            this.confirmationRef.close();
            break;
        }
      });
  }

  checkToothAndAreaSelections(service) {
    let isValidToothSelection = true;
    let isValidAreaSelection = true;
    let serviceCode = this.serviceCodes.find(code => {
      return code.ServiceCodeId === service.ServiceCodeId;
    });
    if (serviceCode) {
      if (serviceCode.AffectedAreaId != 1) {
        //The service code wasn't a Mouth code, so it should have a tooth
        if (
          !service.Tooth ||
          service.Tooth === '' ||
          service.Tooth == 0 ||
          service.Tooth === '0'
        ) {
          isValidToothSelection = false;
          service.providerToothError = true;
        } else {
          isValidToothSelection = true;
        }
      } else {
        isValidToothSelection = true;
      }

      if (
        serviceCode.AffectedAreaId === 3 ||
        serviceCode.AffectedAreaId === 4
      ) {
        if (
          !(service.Roots && service.Surface) &&
          service.Roots === '' &&
          service.Surface === ''
        ) {
          isValidAreaSelection = false;
          service.providerAreaError = true;
        } else {
          isValidAreaSelection = true;
        }
      } else {
        isValidAreaSelection = true;
      }
      if (!isValidAreaSelection || !isValidToothSelection) {
        return false;
      } else {
        return true;
      }
    }
  }
}
