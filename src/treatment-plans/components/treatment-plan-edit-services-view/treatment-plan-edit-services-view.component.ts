import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  Renderer2,
  ViewChildren,
  QueryList,
  ViewChild,
  Input,
  HostListener,
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDragStart,
  CdkDragEnd,
} from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { DrawerNotificationService } from 'src/@shared/providers/drawer-notification.service';
import cloneDeep from 'lodash/cloneDeep';
import { TreatmentPlanEditServicesService } from '../../component-providers';
import { TreatmentPlanServicesDrawerDragService } from '../../providers';
import { TreatmentPlansService } from '../../providers';
import { TreatmentPlanHeader } from '../../models/treatment-plan-header';
import { LocationHttpService } from '../../../practices/http-providers/location-http.service';
import { LocationsService } from '../../../practices/providers/locations.service';
//for modal functionality
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { take, filter } from 'rxjs/operators';
import { TreatmentPlanHttpService } from '../../http-providers';
import { TreatmentPlanConfirmationModalDataService } from '../../../treatment-plans/providers/treatment-plan-confirmation-modal-data.service';
import { ScheduleAppointmentHttpService } from '../../../scheduling/common/http-providers';
import {
  TreatmentPlanCoverage,
  FeesIns,
  TaxCalculation,
  TaxAssignment,
  SecondaryCalculationMethod,
} from '../../models/treatment-plan-coverage';
//for currency-input
import { CurrencyInputComponent } from '../../../@shared/components/currency-input/currency-input.component';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { TreatmentPlanService } from '../../models/treatment-plan-service';
import { ServiceTransaction } from '../../models/service-transaction';
import { TreatmentPlanServiceBenefit } from '../../models/treatment-plan-service-benefit';
import { ToothAreaDataService } from '../../../@shared/providers/tooth-area-data.service';
import { TreatmentPlanCoverageServiceRequest } from '../../models/treatment-plan-coverage-service-request';

@Component({
  selector: 'treatment-plan-edit-services-view',
  templateUrl: './treatment-plan-edit-services-view.component.html',
  styleUrls: ['./treatment-plan-edit-services-view.component.scss'],
})
export class TreatmentPlanEditServicesViewComponent
  implements OnInit, OnDestroy
{
  public drawerState: boolean = false;
  public isCardBeingDragged: boolean = false;
  subscription: Subscription;
  treatmentPlan: TreatmentPlanHeader;
  planStages: any[];
  tempPlanStages: any[];
  tempPlanStagesCloned: any[];
  treatmentPlanName: string = '';
  creationDate: string;
  daysSinceCreation: string;
  proposedLocation: string;

  treatmentPlanServices: any[];

  dragAreaSubscription: Subscription;
  dragStateSubscription: Subscription;
  dragAreas: string[] = [];
  dragAreasAdded: string[] = [];

  providers: any[] = [];
  teeth: any[] = [];
  roots: any[] = [];
  surfaces: any[] = [];
  serviceCodes: any[] = [];
  serviceStatuses: any[] = [];
  locations: any[] = [];

  deletedServices: any[] = [];

  activeTreatmentPlan: any = {};
  treatmentPlanCoverage: TreatmentPlanCoverage = null;
  primaryRenewYear: number = 0;

  txPlanChange: boolean = false;
  initComplete: boolean = false;
  isSaveDisabled: boolean = false;
  isComingFromOnDropEvent: boolean = false;
  appointmentExistsOnNonCompletedAndNonPendingService: boolean = false;
  deleteStageRemoveServiceOrDeleteTxPlanClicked: string = '';

  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;

  isValid: boolean = true;
  @ViewChildren(CurrencyInputComponent)
  currencyInputs!: QueryList<CurrencyInputComponent>;

  formGroup: FormGroup = this.formBuilder.group({});

  removeServiceFromAppointment: boolean = false;

  url: string = '';

  constructor(
    private renderer: Renderer2,
    @Inject('$routeParams') private route,
    private treatmentPlanEditServicesService: TreatmentPlanEditServicesService,
    private treatmentPlansService: TreatmentPlansService,
    private drawerNotificationService: DrawerNotificationService,
    private locationHttpService: LocationHttpService,
    private scheduleAppointmentHttpService: ScheduleAppointmentHttpService,
    private drawerDragService: TreatmentPlanServicesDrawerDragService,
    @Inject('TreatmentPlansFactory') private treatmentPlanFactory,
    @Inject('TreatmentPlanChangeService') private treatmentPlanChangeService,
    @Inject('PatientValidationFactory') private patientValidationFactory,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('locationService') private locationsService,
    private locationService: LocationsService,
    private confirmationModalService: ConfirmationModalService,
    private treatmentPlanHttpService: TreatmentPlanHttpService,
    private treatmentPlanConfirmationModalDataService: TreatmentPlanConfirmationModalDataService,
    private formBuilder: FormBuilder,
    private toothAreaDataService: ToothAreaDataService,
    @Inject('PatientServices') private patientServices
  ) {
    treatmentPlanEditServicesService.loadStaticData();

    // you have to register the observer this way toc ensure the update works
    // notice how I am not calling a function but putting the function definition in the registration
    this.subscription = this.drawerNotificationService
      .getDrawerState()
      .subscribe(message => {
        this.drawerState = message;
      });

    this.dragAreaSubscription = this.drawerDragService
      .getDragAreas()
      .subscribe(message => {
        this.dragAreas = message;
      });
    //dragState True means the user is dragging a service from either drawer or reorder page. This toggles a class for the empty stage container to hide on hover.
    this.dragStateSubscription = this.drawerNotificationService
      .getDragState()
      .subscribe(message => {
        this.isCardBeingDragged = message;
      });

    //Added this validator for the treatmentPlanName input field
    this.formGroup.addControl(
      'treatmentPlanName',
      this.formBuilder.control('', Validators.required)
    );
  }

  ngOnInit() {
    //subscribe to value change of treatment plan name and update it on the OnChange of the value
    this.formGroup.controls.treatmentPlanName.valueChanges.subscribe(value => {
      this.treatmentPlanName = value;
      //console.log('treatment plan name has changed:', value)
    });

    this.treatmentPlanEditServicesService.loadData();

    //load tooth/area data for the tooth and area dropdown controls
    this.toothAreaDataService.loadPrerequisiteData();

    // setup the local collection
    let dataCollections = this.treatmentPlanEditServicesService.getData();
    this.providers = dataCollections.providers;
    this.teeth = dataCollections.teeth;
    this.roots = dataCollections.roots;
    this.surfaces = dataCollections.surfaces;
    this.serviceCodes = dataCollections.serviceCodes;
    this.serviceStatuses = dataCollections.serviceStatuses.filter(x => {
      if (x.ShowInDDList) {
        return x;
      }
    });

    this.locationHttpService
      .getLocationsWithDetailsByPermissionsObservable(1120)
      .subscribe(data => {
        let patientData = this.patientValidationFactory.GetPatientData();
        let allLoc = this.locationsService.getActiveLocations();

        let newData = this.locationService.addInactiveFlagtoLocations(
          data,
          allLoc
        );

        // get locations that are in both lists.
        let tempLocations =
          this.locationService.findLocationsInBothPatientLocationsAndUsersLocations(
            patientData.PatientLocations,
            newData
          );

        for (let i = 0; i < tempLocations.length; i++) {
          // for each location we have decided to load i want to
          // make a providers array to remove double filtering later on
          tempLocations[i].providers = [];
          for (let x = 0; x < this.providers.length; x++) {
            for (let y = 0; y < this.providers[x].Locations.length; y++) {
              if (
                this.providers[x].Locations[y].LocationId ===
                tempLocations[i].LocationId
              ) {
                tempLocations[i].providers.push(this.providers[x]);
              }
            }
          }
        }

        this.locations = tempLocations;

        this.tempPlanStages = this.treatmentPlanFactory.GetPlanStages();
        // need to disconnect the two objects ... right now I know this will work ...
        this.activeTreatmentPlan = JSON.parse(
          JSON.stringify(this.treatmentPlanFactory.ActiveTreatmentPlan)
        );
        if (
          this.activeTreatmentPlan !== null &&
          this.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanId !== null
        ) {
          this.creationDate =
            this.activeTreatmentPlan.TreatmentPlanHeader.$$DisplayCreatedDate;
          this.daysSinceCreation =
            this.activeTreatmentPlan.TreatmentPlanHeader.DaysAgo;
          this.treatmentPlanName =
            this.activeTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName;
          this.proposedLocation =
            this.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction.LocationName;
          this.treatmentPlanServices =
            this.activeTreatmentPlan.TreatmentPlanServices;
        } else {
          let ofcLocation = this.locationsService.getCurrentLocation();
          let today = new Date().toLocaleDateString();
          let currentTreatmentPlan = {
            TreatmentPlanHeader: {
              TreatmentPlanName: 'New Treatment Plan',
              PersonId: patientData.PatientId,
              PracticeId: ofcLocation.practiceid,
              NumberOfStages: 0,
              TreatmentPlanId: null,
              ObjectState: 'Add',
              Status: 'Proposed',
            },
            TreatmentPlanServices: [],
          };
          this.tempPlanStages = [{}];
          this.treatmentPlanEditServicesService.setTreatmentPlan(
            currentTreatmentPlan
          );
          this.creationDate = today;
          this.daysSinceCreation = '0';
          this.treatmentPlanName =
            currentTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName;
          this.proposedLocation = ofcLocation.name;
          this.treatmentPlanServices =
            currentTreatmentPlan.TreatmentPlanServices;

          //on init of new tx plan we need to make sure that the save is disable so that things dont blowup
          this.isSaveDisabled = true;
        }

        // we need to check if the services loaded have appointments associated with them.
        // If they do we need to get lists of the providers from each appointment.
        // consider preloading this information or getting it from loaded appointments in the future.
        let appointmentIds =
          this.treatmentPlanEditServicesService.getListOfAppointmentIdsFromServices(
            this.treatmentPlanServices
          );

        if (appointmentIds.length > 0) {
          // call an api getting the allowed providers for the appointments
          this.scheduleAppointmentHttpService
            .getAppointmentProvidersForMultipleAppointments(appointmentIds)
            .subscribe(basicData => {
              let serviceProviders =
                this.treatmentPlanEditServicesService.populateProviderListBasedOnBasicAppointmentProviderRecords(
                  basicData,
                  this.providers
                );

              this.buildStagesWithServices(serviceProviders);

              this.getMissingCoverage();
            });
        } else {
          this.buildStagesWithServices(null);

          this.getMissingCoverage();
        }
      });

    this.treatmentPlanEditServicesService.changeCancel('Edit Services');

    this.treatmentPlanEditServicesService.navClickedEvent.subscribe(
      (data: string) => {
        this.url = data;
        this.cancel('service');
      }
    );
  }

  recalculateCoverage() {
    let deductible = this.treatmentPlanCoverage.PrimaryDeductibleLeft;
    let annualBenefit = this.treatmentPlanCoverage.PrimaryLeftBeforeMax;
    let currentPlanYear: number = this.primaryRenewYear - 1;

    for (let i = 0; i < this.planStages.length; ++i) {
      let curStage = this.planStages[i];
      for (let j = 0; j < curStage.services.length; ++j) {
        let curService = curStage.services[j];
        curService.ServiceTransaction.$$AdjEst = 0;
        curService.ServiceTransaction.$$PatientPortion = 0;
        let fee = curService.ServiceTransaction.Fee;
        let charges = fee;
        let allowedAmount = 0;

        // first check for discount
        if (
          curService.Coverage &&
          curService.Coverage.PrimaryCoverage &&
          curService.Coverage.PrimaryCoverage.AllowedAmount
        ) {
          allowedAmount = curService.Coverage.PrimaryCoverage.AllowedAmount;
        }
        if (
          this.treatmentPlanCoverage.PatientDiscountRate > 0 &&
          curService.Coverage &&
          curService.Coverage.DiscountEligible
        ) {
          let discount = fee * this.treatmentPlanCoverage.PatientDiscountRate;
          discount = Math.round(discount * 100) / 100;
          charges = fee - discount;
        }

        // second calculate tax
        curService.ServiceTransaction.Tax = 0;
        if (curService.Coverage && curService.Coverage.TaxRate > 0) {
          let taxable = charges;
          if (
            this.treatmentPlanCoverage.PrimaryTaxCalculation ===
              TaxCalculation.FeeSchedule &&
            allowedAmount > 0
          ) {
            // tax based on allowed amount rather than location fee
            taxable = allowedAmount;
          }
          let tax = taxable * curService.Coverage.TaxRate;
          tax = Math.round(tax * 100) / 100;
          if (
            this.treatmentPlanCoverage.PrimaryTaxAssignment ===
            TaxAssignment.Charge
          ) {
            curService.ServiceTransaction.Tax = tax;
            charges += tax;
          }
          if (
            this.treatmentPlanCoverage.PrimaryTaxAssignment ===
              TaxAssignment.FeeSchedule &&
            allowedAmount > 0
          ) {
            // FeeSchedule setting means tax is added to allowed amount to get ACTUAL amount allowed
            let allowedTax =
              Math.round(allowedAmount * curService.Coverage.TaxRate * 100) /
              100;
            curService.ServiceTransaction.Tax = allowedTax;
            allowedAmount += allowedTax;
          }
        }

        // third check for insurance coverage
        if (curService.Coverage && curService.Coverage.PrimaryCoverage) {
          let serviceDate: Date = new Date(
            curService.ServiceTransaction.DateEntered
          );
          let primary: TreatmentPlanServiceBenefit =
            curService.Coverage.PrimaryCoverage;
          if (
            serviceDate.getFullYear() > currentPlanYear &&
            serviceDate.getMonth() + 1 >=
              this.treatmentPlanCoverage.PrimaryRenewalMonth
          ) {
            deductible = this.treatmentPlanCoverage.PrimaryIndividualDeductible;
            annualBenefit = this.treatmentPlanCoverage.PrimaryAnnualMax;
            currentPlanYear = serviceDate.getFullYear();
            if (
              serviceDate.getMonth() + 1 <
              this.treatmentPlanCoverage.PrimaryRenewalMonth
            ) {
              currentPlanYear = currentPlanYear - 1;
            }
          }
          let insuranceCharges = charges;
          if (allowedAmount > 0) {
            curService.ServiceTransaction.AllowedAmount = allowedAmount;
            if (allowedAmount < charges) {
              if (
                this.treatmentPlanCoverage.PrimaryFeesIns === FeesIns.AdjustOff
              ) {
                // We're going to apply the difference between the charges (before taxes) and the allowed amount as an adjustment
                curService.ServiceTransaction.$$AdjEst =
                  charges - allowedAmount - curService.ServiceTransaction.Tax;
              }
              // for either FeesIns, insurance will cover based on allowed amount so adjust it
              insuranceCharges =
                allowedAmount + curService.ServiceTransaction.Tax;
            }
          }

          insuranceCharges -= primary.Copay;
          let estIns = insuranceCharges * primary.CoveragePercent;
          estIns = Math.round(estIns * 100) / 100;
          if (estIns < 0) {
            estIns = 0;
          }
          if (deductible > 0 && primary.IncludedInDeductible) {
            if (deductible >= insuranceCharges) {
              // all charges go toward the deductible
              deductible -= insuranceCharges;
              estIns = 0;
            } else {
              if (deductible > 0) {
                // now recalculate the insurance by subtracting the copay AND the remaining deductible from the fee, then cover the remainder at the agreed percent
                estIns =
                  (insuranceCharges - deductible) * primary.CoveragePercent;
                estIns = Math.round(estIns * 100) / 100;
                if (estIns < 0) {
                  estIns = 0;
                }
              }
              // note that if the copay takes care the rest of the deductible, there is no change to the insurance calculation
              deductible = 0;
            }
          }
          if (annualBenefit < estIns) {
            estIns = annualBenefit;
            annualBenefit = 0;
          } else {
            annualBenefit -= estIns;
          }
          curService.ServiceTransaction.Amount = charges;

          if (
            this.treatmentPlanCoverage.PrimaryTaxAssignment ===
            TaxAssignment.AfterCoverage
          ) {
            estIns += curService.ServiceTransaction.Tax;
            curService.ServiceTransaction.Amount +=
              curService.ServiceTransaction.Tax;
          }
          curService.ServiceTransaction.$$EstInsurance = estIns;
        }

        // we want to calculate this value regardless of if something is covered or not.
        curService.ServiceTransaction.$$PatientPortion =
          curService.ServiceTransaction.Amount -
          curService.ServiceTransaction.$$EstInsurance -
          curService.ServiceTransaction.$$AdjEst;
        if (
          this.treatmentPlanCoverage.PrimaryTaxAssignment ===
          TaxAssignment.PatientPortion
        ) {
          curService.ServiceTransaction.$$PatientPortion +=
            curService.ServiceTransaction.Tax;
          curService.ServiceTransaction.Amount +=
            curService.ServiceTransaction.Tax;
        }

        /// We thought we saw the allowed amount not set all the time ... if that happens enable this.
        //if (curService.ServiceTransaction.AllowedAmount === null || curService.ServiceTransaction.AllowedAmount === undefined) {
        //    curService.ServiceTransaction.AllowedAmount = 0;
        //}
      }
    }
    //this check is to ensure we do the clone only after getting ins estimates and only on init!
    if (!this.initComplete) {
      this.tempPlanStagesCloned = cloneDeep(this.tempPlanStages);
      this.initComplete = true;
    }
  }

  getMissingCoverage() {
    // first walk the services in each stage and build a list of those missing coverage
    let serviceTransactions: ServiceTransaction[] =
      new Array<ServiceTransaction>();
    for (let i = 0; i < this.planStages.length; ++i) {
      let curStage = this.planStages[i];
      for (let j = 0; j < curStage.services.length; ++j) {
        if (!curStage.services[j].Coverage) {
          serviceTransactions.push(curStage.services[j].ServiceTransaction);
        }
      }
    }

    if (serviceTransactions.length > 0) {
      this.getInsuranceData(serviceTransactions);
    }
  }

  getInsuranceData(serviceTransactions: ServiceTransaction[]) {
    let coverageRequest: TreatmentPlanCoverageServiceRequest[] =
      new Array<TreatmentPlanCoverageServiceRequest>();

    //convert the ServiceTransaction to TreatmentPlanCoverageServiceRequest
    for (let i = 0; i < serviceTransactions.length; ++i) {
      coverageRequest.push({
        AccountMemberId: serviceTransactions[i].AccountMemberId,
        ServiceCodeId: serviceTransactions[i].ServiceCodeId,
        LocationId: serviceTransactions[i].LocationId,
        ServiceTransactionId: serviceTransactions[i].ServiceTransactionId,
        ServiceTransactionStatusId:
          serviceTransactions[i].ServiceTransactionStatusId,
        Fee: serviceTransactions[i].Fee,
      });
    }

    // now call the api to get the missing coverage
    this.treatmentPlanHttpService.getInsuranceInfo(coverageRequest).subscribe({
      next: result => {
        // this will stomp any old value with the latest and greatest
        this.treatmentPlanCoverage = result.Value;
        let today: Date = new Date();
        this.primaryRenewYear =
          today.getMonth() < result.Value.PrimaryRenewalMonth
            ? today.getFullYear()
            : today.getFullYear() + 1;
        // now we can add the missing service coverages, emptying the Services array as we do, we should end up with an empty array
        if (
          !this.treatmentPlanCoverage.Services ||
          !Array.isArray(this.treatmentPlanCoverage.Services)
        ) {
          console.log(
            'treatment plans insurance coverage returned a Services object that is not an array!'
          );
        } else {
          // walk the services in each stage
          for (let i = 0; i < this.planStages.length; ++i) {
            let curStage = this.planStages[i];
            for (let j = 0; j < curStage.services.length; ++j) {
              let curService = curStage.services[j];
              if (!curService.Coverage) {
                // current service is missing coverage, fill in from return element with matching service code and location
                for (
                  let k = 0;
                  k < this.treatmentPlanCoverage.Services.length;
                  ++k
                ) {
                  if (
                    this.treatmentPlanCoverage.Services[k].ServiceCodeId ===
                      curService.ServiceTransaction.ServiceCodeId &&
                    this.treatmentPlanCoverage.Services[k].LocationId ===
                      curService.ServiceTransaction.LocationId
                  ) {
                    curService.Coverage =
                      this.treatmentPlanCoverage.Services[k];
                    this.treatmentPlanCoverage.Services.splice(k, 1);
                    break;
                  }
                }
              }
            }
          }
          //here for assign plan stages?
          this.recalculateCoverage();
        }
      },
      error: error => {
        console.log(error);
      },
    });
  }

  showTooltip(elem, stageIndex, serviceIndex) {
    let container = elem.offsetWidth;
    let description = elem.scrollWidth;

    if (container == description) {
      this.planStages[stageIndex].services[
        serviceIndex
      ].displayState.displayTooltip = false;
    } else {
      this.planStages[stageIndex].services[
        serviceIndex
      ].displayState.displayTooltip = true;
    }
  }

  //disables save if empty txplan
  checkForAnyServices() {
    let totalServices = [];
    for (let i = 0; i < this.planStages.length; i++) {
      for (let j = 0; j < this.planStages[i].services.length; j++)
        totalServices.push(this.planStages[i].services[j]);
    }
    if (totalServices.length <= 0) {
      this.isSaveDisabled = true;
    } else {
      this.isSaveDisabled = false;
    }
  }

  buildStagesWithServices(serviceProviders: any[]) {
    let collection = [];
    for (let i = 0; i < this.tempPlanStages.length; i++) {
      collection.push('stage_' + i);

      // reset the array of items so that it does not double up or start out with a value
      this.tempPlanStages[i].services = [];

      let services = this.treatmentPlanServices;

      for (let x = 0; x < services.length; x++) {
        if (
          this.tempPlanStages[i].stageno ===
          services[x].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber
        ) {
          //This adds the $$toothAreaData variable to the ServiceTransaction
          services[x].ServiceTransaction =
            this.toothAreaDataService.loadToothAreaDataValuesForService(
              services[x].ServiceTransaction
            );

          let overrideProviders =
            this.treatmentPlanEditServicesService.getProvidersForService(
              serviceProviders,
              services[x]
            );

          let record = this.treatmentPlanEditServicesService.processRecord(
            JSON.parse(JSON.stringify(services[x])),
            this.locations,
            overrideProviders,
            this.isComingFromOnDropEvent
          );
          if (
            record.displyState !== null &&
            record.displayState !== undefined
          ) {
            this.tempPlanStages[i].services.push(record);
          }
        }
      }
    }

    this.planStages = this.tempPlanStages;

    // add the collectionValues to the list to setup the drag area
    for (let i = 0; i < collection.length; i++) {
      let item = this.dragAreas.find(function (item) {
        return item === collection[i];
      });
      if (item === undefined) {
        this.dragAreas.push(collection[i]);
      }
      this.dragAreasAdded.push(collection[i]);
    }

    this.drawerDragService.changeDragAreas(this.dragAreas);
  }

  statusChange($event, tps) {
    let statusId = parseInt(tps.ServiceTransaction.ServiceTransactionStatusId);
    this.treatmentPlanEditServicesService.handleStatusChangeDisplayState(tps);
    //reset to zero out insurance if referred or referred completed
    if (statusId === 8 || statusId === 2) {
      this.recalculateCoverage();
      if (
        tps.ServiceTransaction.InsuranceEstimates !== null &&
        tps.ServiceTransaction.InsuranceEstimates !== undefined
      ) {
        for (
          let i = 0;
          i < tps.ServiceTransaction.InsuranceEstimates.length;
          i++
        ) {
          tps.ServiceTransaction.InsuranceEstimates[i].EstInsurance = 0;
          tps.ServiceTransaction.InsuranceEstimates[i].Fee = 0;
        }
        tps.ServiceTransaction.ObjectState = 'Update';
      }
    }
  }

  onFeeChanged(newFee: any, stageIndex, serviceIndex) {
    this.planStages[stageIndex].services[serviceIndex].ServiceTransaction.Fee =
      newFee.NewValue;
    this.recalculateCoverage();
  }

  toothChange(event, stageIndex, serviceIndex) {
    this.planStages[stageIndex].services[
      serviceIndex
    ].ServiceTransaction.Tooth = event;
  }

  rootSurfaceChanged() {
    let services: ServiceTransaction[] = new Array<ServiceTransaction>();
    for (let i = 0; i < this.planStages.length; ++i) {
      let curStage = this.planStages[i];
      for (let j = 0; j < curStage.services.length; ++j) {
        let curService = curStage.services[j];
        if (
          curService.Coverage &&
          curService.ServiceTransaction &&
          curService.Coverage.ServiceCodeId !=
            curService.ServiceTransaction.ServiceCodeId
        ) {
          curService.Coverage = null;
          services.push(curService.ServiceTransaction);
        }
      }
    }
    if (services.length > 0) {
      this.getInsuranceData(services);
    }
  }

  dateChange($event, stageIndex, serviceIndex) {
    let newEnteredDate = new Date($event);
    let oldDate: Date = new Date(
      this.planStages[stageIndex].services[
        serviceIndex
      ].ServiceTransaction.DateEntered
    );
    let needRecalc: boolean = false;
    let newDateYear: number = newEnteredDate.getFullYear();
    let oldDateYear: number = oldDate.getFullYear();
    let adjustedRenewalMonth: number =
      Number(this.treatmentPlanCoverage.PrimaryRenewalMonth) - 1;
    if (newDateYear === oldDateYear + 1) {
      // year advanced by 1 recalculate if old date was before renewal or if new date is after
      needRecalc =
        oldDate.getMonth() < adjustedRenewalMonth ||
        newEnteredDate.getMonth() >= adjustedRenewalMonth;
    } else if (newDateYear === oldDateYear) {
      // year unchanged, need to recalculate if old is before year switch and new is after OR old is after and new is before
      needRecalc =
        (oldDate.getMonth() < adjustedRenewalMonth &&
          newEnteredDate.getMonth() >= adjustedRenewalMonth) ||
        (oldDate.getMonth() >= adjustedRenewalMonth &&
          newEnteredDate.getMonth() < adjustedRenewalMonth);
    } else if (newDateYear === oldDateYear - 1) {
      // year decremented by 1, recalculate if old date was after the renewal or new date is before
      needRecalc =
        oldDate.getMonth() >= adjustedRenewalMonth ||
        newEnteredDate.getMonth() < adjustedRenewalMonth;
    } else {
      // incremented or decremented 2+ years
      needRecalc = true;
    }
    this.planStages[stageIndex].services[
      serviceIndex
    ].ServiceTransaction.$$DateEntered = newEnteredDate;
    this.planStages[stageIndex].services[
      serviceIndex
    ].ServiceTransaction.DateEntered = newEnteredDate;
    if (needRecalc) {
      this.recalculateCoverage();
    }
  }

  //reloadClonedStages() {
  //    var len = this.planStages.length;

  //    if (len === 0) {
  //        for (let j = 0; j < this.tempPlanStagesCloned.length; j++) {
  //            this.planStages.push(this.tempPlanStagesCloned[j]);
  //        }
  //    } else {

  //        for (let j = 0; j < this.tempPlanStagesCloned.length; j++) {
  //            this.planStages.push(this.tempPlanStagesCloned[j]);
  //        }

  //        for (let i = len -1; i >= 0; i--) {
  //            this.removeStage(i);
  //        }

  //    }

  //}

  //clear out extraneous observers, as this prompts the sub to fire cancel repeatedly
  cleanObservers() {
    if (
      this.treatmentPlanEditServicesService.navClickedEvent.observers.length > 1
    ) {
      for (
        let j = 1;
        j <
        this.treatmentPlanEditServicesService.navClickedEvent.observers.length;
        j++
      ) {
        this.treatmentPlanEditServicesService.navClickedEvent.observers[
          j
        ].complete();
      }
    }
  }

  cancel(source: string) {
    this.cleanObservers();
    if (
      JSON.stringify(this.tempPlanStagesCloned) ===
        JSON.stringify(this.planStages) &&
      !this.txPlanChange
    ) {
      if (source === 'service') {
        if (
          this.url.length > 0 &&
          this.url.indexOf('Clinical?tab=1&activeSubTab=2') === -1
        ) {
          window.location.href = this.url;
        } else {
          this.treatmentPlanChangeService.changeCloseState(true);
        }
      } else {
        this.treatmentPlanChangeService.changeCloseState(true);
      }
      return;
    }

    let data = null;

    if (source === 'service') {
      data =
        this.treatmentPlanConfirmationModalDataService
          .cancelConfirmationModalData2;
    } else {
      data =
        this.treatmentPlanConfirmationModalDataService
          .cancelConfirmationModalData;
      this.url = '';
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
            console.log('User elected to close the page anyway.');
            this.confirmationRef.close();
            if (
              this.url.length > 0 &&
              this.url.indexOf('Clinical?tab=1&activeSubTab=2') === -1
            ) {
              window.location.href = this.url;
            } else {
              //this.reloadClonedStages();
              this.treatmentPlanChangeService.changeCloseState(true);
            }
            this.treatmentPlanEditServicesService.changeCancel('');
            break;
          case 'close':
            console.log('User elected to not close the page');
            this.confirmationRef.close();
            break;
        }
      });
  }

  openServicesDrawer() {
    // code that initiates the drawer open.
    this.treatmentPlanChangeService.changeOpenDrawerState(true);
  }

  //save Treatment Plan
  save() {
    if (this.isSaveDisabled === false) {
      this.isSaveDisabled = true;
      let services = this.reOrderServices();

      if (services != null) {
        services.forEach(txPlanService => {
          let serviceTransaction = txPlanService.ServiceTransaction;

          if (
            serviceTransaction != null &&
            serviceTransaction.IsBalanceAlreadyUpdated === null &&
            (serviceTransaction.IsDeleted === true ||
              serviceTransaction.ServiceTransactionStatusId === 4 ||
              serviceTransaction.ServiceTransactionStatusId === 8 ||
              serviceTransaction.ServiceTransactionStatusId === 3 ||
              serviceTransaction.ServiceTransactionStatusId === 2)
          )
            serviceTransaction.IsBalanceAlreadyUpdated = true;
        });
      }

      let currentTreatmentPlan = {
        TreatmentPlanHeader: null,
        TreatmentPlanServices: null,
      };
      let patientId = null;
      let accountMemberId = null;
      if (this.activeTreatmentPlan !== null) {
        patientId = this.activeTreatmentPlan.TreatmentPlanHeader.PersonId;
        accountMemberId =
          this.activeTreatmentPlan.TreatmentPlanServices[0].ServiceTransaction
            .AccountMemberId;
        let treatmentPlan = this.activeTreatmentPlan.TreatmentPlanHeader;
        treatmentPlan.TreatmentPlanName = this.treatmentPlanName;
        treatmentPlan.ObjectState = 'Update';
        currentTreatmentPlan = {
          TreatmentPlanHeader: treatmentPlan,
          TreatmentPlanServices: services,
        };
      } else {
        currentTreatmentPlan =
          this.treatmentPlanEditServicesService.getTreatmentPlan();
        currentTreatmentPlan.TreatmentPlanHeader.TreatmentPlanName =
          this.treatmentPlanName;
        let patientData = this.patientValidationFactory.GetPatientData();
        patientId = patientData.PatientId;
        accountMemberId = services[0].ServiceTransaction.AccountMemberId;
        currentTreatmentPlan.TreatmentPlanServices = services;
      }

      var apiTreatmentPlan =
        this.removeExtraPropertiesBeforeApiCall(currentTreatmentPlan);

      this.treatmentPlanHttpService
        .save(
          patientId,
          accountMemberId,
          apiTreatmentPlan,
          this.removeServiceFromAppointment
        )
        .subscribe(
          data => {
            this.treatmentPlanFactory.ClearCache();
            var treatmentPlanId =
              data?.Value?.TreatmentPlanHeader?.TreatmentPlanId;
            if (treatmentPlanId != null) {
              this.patientServices.TreatmentPlans.getTreatmentPlansWithServicesByPersonId(
                {
                  Id: patientId,
                }
              ).$promise.then(res => {
                let treatmentPlan = res.Value.find(plan => {
                  return (
                    plan.TreatmentPlanHeader.TreatmentPlanId === treatmentPlanId
                  );
                });
                if (treatmentPlan) {
                  this.treatmentPlanEditServicesService.setTreatmentPlan(
                    treatmentPlan
                  );
                  // after save processes call this as well
                  this.treatmentPlanChangeService.changeCloseState(true);
                  this.isSaveDisabled = false;
                }
              });
            }
          },
          error => {
            // We should consider what else might be appropriate
            this.toastrFactory.error('Failed to create/update treatment plan');
            this.isSaveDisabled = false;
          }
        );
    }
  }

  saveOrPromptUser() {
    // Are all services removed from the txPlan
    if (this.areAllServicesRemovedFromTxPlan()) {
      this.saveRequestNoServices();
    } else {
      this.save();
    }
  }

  removeExtraPropertiesBeforeApiCall(treatmentPlan) {
    var plan = cloneDeep(treatmentPlan);

    plan.TreatmentPlanHeader.TreatmentPlanServices = [];
    plan.TreatmentPlanServices.forEach(x => {
      if (x.displayState) {
        x.displayState = null;
      }
      if (x.Coverage) {
        x.Coverage = null;
      }
      if (x.ServiceTransaction && x.ServiceTransaction.$toothAreaData) {
        x.ServiceTransaction.$toothAreaData = null;
      }
      if (x.ServiceTransaction && x.ServiceTransaction.Coverage) {
        x.ServiceTransaction.Coverage = null;
      }
      x.TreatmentPlanServiceHeader.TreatmentPlanInsuranceEstimates = [];
    });

    return plan;
  }

  locationChange(value, stageIndex, serviceIndex) {
    // when the location changes reset the provider list.
    let number = parseInt(value);
    let tempProviders = [];

    if (number !== 0) {
      for (let x = 0; x < this.providers.length; x++) {
        for (let y = 0; y < this.providers[x].Locations.length; y++) {
          if (this.providers[x].Locations[y].LocationId === number) {
            tempProviders.push(this.providers[x]);
          }
        }
      }
    } else {
      tempProviders = JSON.parse(JSON.stringify(this.providers));
    }
    this.planStages[stageIndex].services[serviceIndex].displayState.providers =
      tempProviders;

    // location change may change coverage as fee schedule is location dependent
    this.planStages[stageIndex].services[serviceIndex].Coverage = null;
    this.getMissingCoverage();

    //TODO:
    // hey we are not done yet ... now we need to figure out how we are getting the fee lists to potentially change the fee
    //$scope.currentServiceCode = _.cloneDeep(referenceDataService.setFeesByLocation(serviceCode));
    // do we still need a modal confirmation??
  }

  reOrderServices() {
    // need to extract to some service or factory.
    let reOrderedStages = this.planStages;
    let reOrderedServices: any[] = [];
    // take plan stages ... and update the priority numbers and the stage numbers for each item.
    let stageNumber = 1;

    for (let i = 0; i < reOrderedStages.length; i++) {
      let priorityNumber = 1;
      for (let x = 0; x < reOrderedStages[i].services.length; x++) {
        reOrderedStages[i].services[
          x
        ].TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = stageNumber;
        reOrderedStages[i].services[x].TreatmentPlanServiceHeader.Priority =
          priorityNumber;

        // until we have change tracking we need to ensure we are setting the objects as having been changed
        reOrderedStages[i].services[x].ServiceTransaction.ObjectState =
          'Update';

        // until we handle this in the page - we have to ensure the teeth surfaces are set correctly.
        if (
          reOrderedStages[i].services[x].ServiceTransaction.SurfaceSelection &&
          reOrderedStages[i].services[x].ServiceTransaction.SurfaceSelection
            .length > 0
        ) {
          let surfaceValue = '';
          for (
            let a = 0;
            a <
            reOrderedStages[i].services[x].ServiceTransaction.$toothAreaData
              .areaSelection.length;
            a++
          ) {
            if (surfaceValue === '') {
              surfaceValue +=
                reOrderedStages[i].services[x].ServiceTransaction.$toothAreaData
                  .areaSelection[a];
            } else {
              surfaceValue +=
                ',' +
                reOrderedStages[i].services[x].ServiceTransaction.$toothAreaData
                  .areaSelection[a];
            }
          }

          reOrderedStages[i].services[x].ServiceTransaction.Surface =
            surfaceValue;
        }

        if (
          reOrderedStages[i].services[x].ServiceTransaction.RootsSelection &&
          reOrderedStages[i].services[x].ServiceTransaction.RootsSelection
            .length > 0
        ) {
          let rootsValue = '';
          for (
            let a = 0;
            a <
            reOrderedStages[i].services[x].ServiceTransaction.$toothAreaData
              .areaSelection.length;
            a++
          ) {
            if (rootsValue === '') {
              rootsValue +=
                reOrderedStages[i].services[x].ServiceTransaction.$toothAreaData
                  .areaSelection[a];
            } else {
              rootsValue +=
                ',' +
                reOrderedStages[i].services[x].ServiceTransaction.$toothAreaData
                  .areaSelection[a];
            }
          }

          reOrderedStages[i].services[x].ServiceTransaction.Roots = rootsValue;
        }
        reOrderedServices.push(reOrderedStages[i].services[x]);
        priorityNumber++;
      }

      stageNumber++;
    }

    // ensure the deleted services are added back in.
    for (let i = 0; i < this.deletedServices.length; i++) {
      reOrderedServices.push(this.deletedServices[i]);
    }
    return reOrderedServices;
  }

  dragStarted(event: CdkDragStart<string[]>) {
    this.drawerNotificationService.changeDragState(true);
  }

  dragEnded(event: CdkDragEnd<string[]>) {
    this.drawerNotificationService.changeDragState(false);
  }

  onDrop(event: CdkDragDrop<any[]>) {
    this.isComingFromOnDropEvent = true;
    if (event.previousContainer == event.container) {
      event.container.data[event.previousIndex].ServiceTransaction.ObjectState =
        'Update';
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.recalculateCoverage();
    } else {
      // when adding a new service from another drag location (drawer) that requires we do some tweaking to that object.
      // so first we need to figure out if this data was loaded from the drawer or from the page in another stage area.
      if (
        event.previousContainer.data[event.previousIndex].displayState !==
          null &&
        event.previousContainer.data[event.previousIndex].displayState !==
          undefined
      ) {
        event.previousContainer.data[
          event.previousIndex
        ].ServiceTransaction.ObjectState = 'Update';

        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.getMissingCoverage();
      } else {
        // Need to fully process the displayState and other properties
        // this item was added from a location that does not have the same data loaded.
        // depending on how many items we are adding we either need to calculate the new indexes of items or we add one item

        let checkedItems = this.drawerDragService.getCheckedItems();
        let items: any[] = [];

        // we need to check if the drag has multiple item before processing.
        // we also need to check if the dragged item is in the checked items list
        // if it is not in the checked items list we need to process per normal
        if (
          checkedItems &&
          checkedItems.length > 1 &&
          checkedItems.some(
            x =>
              x.ServiceTransaction.ServiceTransactionId ===
              event.previousContainer.data[event.previousIndex]
                .ServiceTransaction.ServiceTransactionId
          )
        ) {
          items = JSON.parse(JSON.stringify(checkedItems));

          this.startProcessDataAfterDrawerDrag(event, items);
        } else {
          items.push(
            JSON.parse(
              JSON.stringify(event.previousContainer.data[event.previousIndex])
            )
          );

          this.startProcessDataAfterDrawerDrag(event, items);
        }
      }
    }
  }

  //list to contain ServicdTransactionId,displayProposed, and $toothAreaData value
  //$toothAreaData contains the values to populate in the Tooth and Surface Multiselect Controls
  createModifiedServiceTransactionList(list, display) {
    let returnList = [];
    list.forEach(value => {
      value.ServiceTransaction =
        this.toothAreaDataService.loadToothAreaDataValuesForService(
          value.ServiceTransaction
        );

      let item = {
        id: value.ServiceTransaction.ServiceTransactionId,
        display: display,
        $toothAreaData: value.ServiceTransaction.$toothAreaData,
      };

      returnList.push(item);
    });
    return returnList;
  }

  startProcessDataAfterDrawerDrag(event, items) {
    let list = this.createModifiedServiceTransactionList(items, false);
    this.drawerDragService.setProposed(list);
    // we need to check if the services loaded have appointments associated with them.
    // If they do we need to get lists of the providers from each appointment.
    // consider preloading this information or getting it from loaded appointments in the future.
    let appointmentIds =
      this.treatmentPlanEditServicesService.getListOfAppointmentIdsFromServices(
        items
      );

    if (appointmentIds.length > 0) {
      // call an api getting the allowed providers for the appointments
      this.scheduleAppointmentHttpService
        .getAppointmentProvidersForMultipleAppointments(appointmentIds)
        .subscribe(basicData => {
          let serviceProviders =
            this.treatmentPlanEditServicesService.populateProviderListBasedOnBasicAppointmentProviderRecords(
              basicData,
              this.providers
            );

          this.processDataAfterDrawerDrag(event, items, serviceProviders);
          // this seems practical. If the checked items were not dragged over then we should clear the selection
          this.drawerDragService.resetCheckedItems(true);

          this.getMissingCoverage();
        });
    } else {
      this.processDataAfterDrawerDrag(event, items, null);
      // this seems practical. If the checked items were not dragged over then we should clear the selection
      this.drawerDragService.resetCheckedItems(true);

      this.getMissingCoverage();
    }
  }

  processDataAfterDrawerDrag(event, items, serviceProviders) {
    // local variable that helps assign the new index in the existing list for items being added
    let timesRun: number = 0;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      item.isSelected = false;

      let overrideProviders =
        this.treatmentPlanEditServicesService.getProvidersForService(
          serviceProviders,
          item
        );

      let record = this.treatmentPlanEditServicesService.processRecord(
        item,
        this.locations,
        overrideProviders,
        this.isComingFromOnDropEvent
      );
      record.ServiceTransaction.ObjectState = 'Update';
      record.drawerState = null;
      event.container.data.splice(event.currentIndex + timesRun, 0, record);
      timesRun++;
    }
    this.checkForAnyServices();
  }

  addStage() {
    // get what the next stage number needs to be.
    let length = this.planStages.length;
    length++;
    let dragAreaName = 'stage_' + (length - 1);

    // stubbed out new stage
    let stage = {
      stageno: length, // not sure we need this any more.
      services: [],
    };

    // setup the drag area.
    this.dragAreas.push(dragAreaName);
    this.dragAreasAdded.push(dragAreaName);
    this.drawerDragService.changeDragAreas(this.dragAreas);

    // add the new stage to the page
    this.planStages.push(stage);
  }

  removeStage(stageIndex) {
    for (let i = 0; i < this.planStages[stageIndex].services.length; i++) {
      if (
        this.planStages[stageIndex].services[i].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId !== null &&
        this.planStages[stageIndex].services[i].TreatmentPlanServiceHeader
          .TreatmentPlanServiceId !== undefined
      ) {
        // the item exists so we need to save to the deletedServices list to really delete it
        let deletedService = this.planStages[stageIndex].services[i];
        deletedService.ServiceTransaction.ObjectState = 'Delete';
        this.deletedServices.push(deletedService);
      }
    }

    //Need to tell the proposed drawer to display the proposed cards
    let list = this.createModifiedServiceTransactionList(
      this.planStages[stageIndex].services,
      true
    );
    this.drawerDragService.setProposed(list);

    let dragAreaName = 'stage_' + stageIndex + 1;

    // remove the stage from the observable collections
    // this can be optimized at a later time.
    for (let i = 0; i < this.dragAreasAdded.length; i++) {
      for (let x = 0; x < this.dragAreas.length; x++) {
        if (
          this.dragAreasAdded[i] === dragAreaName &&
          this.dragAreas[x] === dragAreaName
        ) {
          this.dragAreas.splice(x, 1);
          this.dragAreasAdded.splice(i, 1);
        }
      }
    }

    // remove the stage since we have setup the deletedServices list we do not need this any more.
    this.planStages.splice(stageIndex, 1);

    this.checkForAnyServices();

    this.recalculateCoverage();

    if (!this.txPlanChange) {
      this.txPlanChange = true;
    }
  }

  //Call this when clicking x to Delete Stage
  openDeleteStageConfirmationModal(stageIndex) {
    let data =
      this.treatmentPlanConfirmationModalDataService
        .deleteStageConfirmationModalData;
    let data2 =
      this.treatmentPlanConfirmationModalDataService
        .removeServiceFromAppointmentConfirmationModalData;
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
          case 'close':
            //console.log('User elected to not delete the stage.');
            this.confirmationRef.close();
            break;
          case 'confirm':
            //console.log('User elected to delete the stage.');
            this.confirmationRef.close();
            this.deleteStageRemoveServiceOrDeleteTxPlanClicked = 'delete stage';
            this.doesAnAppointmentExistOnServiceInStageThatIsNotCompletedOrPending(
              stageIndex
            );
            if (
              this.appointmentExistsOnNonCompletedAndNonPendingService === true
            ) {
              this.openRemoveServiceFromAppointmentConfirmationModal(
                data2,
                stageIndex,
                null
              );
            } else {
              this.removeStage(stageIndex);
            }
            break;
        }
      });
  }

  //check to see if an appointment exists on a service that is not in a completed or pending state on Delete Stage
  doesAnAppointmentExistOnServiceInStageThatIsNotCompletedOrPending(
    stageIndex
  ) {
    this.appointmentExistsOnNonCompletedAndNonPendingService = false;
    for (let i = 0; i < this.planStages[stageIndex].services.length; i++) {
      if (
        this.planStages[stageIndex].services[i].ServiceTransaction
          .AppointmentId !== null &&
        this.planStages[stageIndex].services[i].ServiceTransaction
          .ServiceTransactionStatusId !== 4 &&
        this.planStages[stageIndex].services[i].ServiceTransaction
          .ServiceTransactionStatusId !== 5
      ) {
        this.appointmentExistsOnNonCompletedAndNonPendingService = true;
      }
    }
  }

  //Call this after calling the openRemoveServiceCofirmationModal and possibly the openRemoveServiceFromAppointmentConfirmationModal
  removeService(stageIndex, serviceIndex) {
    if (
      this.planStages[stageIndex].services[serviceIndex]
        .TreatmentPlanServiceHeader.TreatmentPlanServiceId !== null &&
      this.planStages[stageIndex].services[serviceIndex]
        .TreatmentPlanServiceHeader.TreatmentPlanServiceId !== undefined
    ) {
      // the item exists so we need to save to the deletedServices list to really delete it
      let deletedService = this.planStages[stageIndex].services[serviceIndex];
      deletedService.ServiceTransaction.ObjectState = 'Delete';
      this.deletedServices.push(deletedService);
      // remove the service from the list of items
    }

    let tempList = [];
    tempList.push(this.planStages[stageIndex].services[serviceIndex]);
    //Need to tell the proposed drawer to display the proposed cards
    let list = this.createModifiedServiceTransactionList(tempList, true);
    this.drawerDragService.setProposed(list);

    this.planStages[stageIndex].services.splice(serviceIndex, 1);

    //disables save if no services on tx plan
    this.checkForAnyServices();

    if (!this.isSaveDisabled) {
      this.recalculateCoverage();
    }

    if (!this.txPlanChange) {
      this.txPlanChange = true;
    }
  }

  //Check to see if there are any services left on the TX Plan
  areAllServicesRemovedFromTxPlan() {
    if (
      this.planStages.length === 0 ||
      (this.planStages.length === 1 && this.planStages[0].services.length === 0)
    ) {
      return true;
    } else {
      return false;
    }
  }

  //Call this if the x is clicked to delete a service
  openRemoveServiceConfirmationModal(stageIndex, serviceIndex) {
    let data =
      this.treatmentPlanConfirmationModalDataService
        .removeServiceConfirmationModalData;
    let data2 =
      this.treatmentPlanConfirmationModalDataService
        .removeServiceFromAppointmentConfirmationModalData;
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
          case 'close':
            //console.log('User elected to not remove the service.');
            this.confirmationRef.close();
            break;
          case 'confirm':
            //console.log('User elected to remove the service');
            this.confirmationRef.close();
            this.doesAnAppointmentExistOnServiceThatIsNotCompletedOrPending(
              stageIndex,
              serviceIndex
            );
            if (
              this.appointmentExistsOnNonCompletedAndNonPendingService === true
            ) {
              this.deleteStageRemoveServiceOrDeleteTxPlanClicked =
                'remove service';
              this.openRemoveServiceFromAppointmentConfirmationModal(
                data2,
                stageIndex,
                serviceIndex
              );
            } else {
              this.removeService(stageIndex, serviceIndex);
            }

            break;
        }
      });
  }

  //check to see if an appointment exists on a service that is not in a completed or pending state on Remove Service
  doesAnAppointmentExistOnServiceThatIsNotCompletedOrPending(
    stageIndex,
    serviceIndex
  ) {
    this.appointmentExistsOnNonCompletedAndNonPendingService = false;
    if (
      this.planStages[stageIndex].services[serviceIndex].ServiceTransaction
        .AppointmentId !== null &&
      this.planStages[stageIndex].services[serviceIndex].ServiceTransaction
        .ServiceTransactionStatusId !== 4 &&
      this.planStages[stageIndex].services[serviceIndex].ServiceTransaction
        .ServiceTransactionStatusId !== 5
    ) {
      this.appointmentExistsOnNonCompletedAndNonPendingService = true;
    }
  }

  //Call this if Remove Service Modal Prompt Selection is Yes and an appointment is on non completed and non pending service
  openRemoveServiceFromAppointmentConfirmationModal(
    data,
    stageIndex,
    serviceIndex
  ) {
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
          case 'close':
            //console.log('User elected to not remove the service from the appointment when clicking ' + this.deleteStageRemoveServiceOrDeleteTxPlanClicked);
            this.confirmationRef.close();
            if (
              this.deleteStageRemoveServiceOrDeleteTxPlanClicked ===
              'remove service'
            ) {
              this.removeService(stageIndex, serviceIndex);
            } else if (
              this.deleteStageRemoveServiceOrDeleteTxPlanClicked ===
              'delete stage'
            ) {
              this.removeStage(stageIndex);
            }
            break;
          case 'confirm':
            //console.log('User elected to remove the service from the appointment when clicking ' + this.deleteStageRemoveServiceOrDeleteTxPlanClicked);
            if (
              this.deleteStageRemoveServiceOrDeleteTxPlanClicked ===
              'remove service'
            ) {
              this.removeAppointmentFromNonPendingAndNonCompletedService(
                stageIndex,
                serviceIndex
              );
              this.removeService(stageIndex, serviceIndex);
              this.confirmationRef.close();
            } else if (
              this.deleteStageRemoveServiceOrDeleteTxPlanClicked ===
              'delete stage'
            ) {
              this.removeAppointmentsFromNonPendingAndNonCompletedServiceInStage(
                stageIndex
              );
              this.removeStage(stageIndex);
              this.confirmationRef.close();
            }
            break;
        }
      });
  }

  //delete appointment from Service if RemoveServiceFromAppointmentConfirmationModal is answered yes when removing service
  //Null out the AppointmenId to delete the appointment from the service
  removeAppointmentFromNonPendingAndNonCompletedService(
    stageIndex,
    serviceIndex
  ) {
    this.planStages[stageIndex].services[
      serviceIndex
    ].ServiceTransaction.AppointmentId = null;
    this.removeServiceFromAppointment = true;
  }

  //delete appointment from Service/s if RemoveServiceFromAppointmentConfirmationModal is answered yes when deleting stage
  //Null out the AppointmenId to delete the appointment from the service
  removeAppointmentsFromNonPendingAndNonCompletedServiceInStage(stageIndex) {
    for (let i = 0; i < this.planStages[stageIndex].services.length; i++) {
      if (
        this.planStages[stageIndex].services[i].ServiceTransaction
          .AppointmentId !== null &&
        this.planStages[stageIndex].services[i].ServiceTransaction
          .ServiceTransactionStatusId !== 4 &&
        this.planStages[stageIndex].services[i].ServiceTransaction
          .ServiceTransactionStatusId !== 5
      ) {
        this.planStages[stageIndex].services[
          i
        ].ServiceTransaction.AppointmentId = null;
      }
    }
  }

  //Call this when user Clicks Save and there are 0 services left on the TX Plan
  saveRequestNoServices() {
    let data =
      this.treatmentPlanConfirmationModalDataService
        .saveRequestNoServicesConfirmationModalData;
    this.confirmationRef = this.confirmationModalService.open({
      data,
    });

    this.confirmationModalSubscription = this.confirmationRef.events
      .pipe(
        filter(event => !!event),
        filter(event => {
          return event.type === 'confirm';
        }),
        take(1)
      )
      .subscribe(events => {
        switch (events.type) {
          case 'confirm':
            //console.log('User elected to not remove the the Tx Plan.');
            this.confirmationRef.close();
            break;
        }
      });
  }

  isItemSelected(value: any[], itemText: string): boolean {
    return value.some(item => item === itemText);
  }

  // unregister the item from observing the drawer notification service
  ngOnDestroy() {
    // clean up items
    this.dragAreaSubscription.unsubscribe();

    for (let i = 0; i < this.dragAreasAdded.length; i++) {
      for (let x = 0; x < this.dragAreas.length; x++) {
        if (this.dragAreasAdded[i] === this.dragAreas[x]) {
          this.dragAreas.splice(x, 1);
        }
      }
    }

    this.drawerDragService.changeDragAreas(this.dragAreas);
    this.subscription.unsubscribe();
    this.dragAreaSubscription.unsubscribe();
    this.treatmentPlanEditServicesService.changeCancel('');
    if (this.txPlanChange) {
      this.txPlanChange = false;
    }
  }
}
