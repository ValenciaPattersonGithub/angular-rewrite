import {
  Component,
  OnInit,
  Input,
  Output,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
declare var angular: angular.IAngularStatic;
import { MULTI_SERVICE_EDIT_DATA } from './multi-service-edit.data';
import { MultiServiceEditOverlayRef } from './multi-service-edit.overlayref';
import * as moment from 'moment-timezone';
import { isNullOrUndefined } from 'util';
import { LocationsService } from '../../../practices/providers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'multi-service-edit',
  templateUrl: './multi-service-edit.component.html',
  styleUrls: ['./multi-service-edit.component.scss'],
})
export class MultiServiceEditComponent implements OnInit {
  serviceList: any[];
  patientInfo: any;
  @Output() updatedValues: any;

  //Variables that are used to set new values on services
  fee: any = null;
  status: any = null;
  date: Date;
  serviceProvider: any = null;
  newLocation: any = 0;

  statusList: any;
  statusPlaceHolder: any = 'No Status Change';
  canSave: boolean = false;
  serviceTransactionIds: any[];
  disableFee: boolean = false;
  disableProviderList: boolean = false;
  isProviderRequired: boolean = false;
  isLocationRequired: boolean = false;
  //showProviderRequired: boolean = false;

  feeChanging: boolean = false;
  currentDate: Date;
  minDate: Date = new Date(1899, 12, 1);
  maxServiceDate: Date;
  maxDate: any;
  maxDateToSet: Date;
  isDateInvalid: boolean = false;
  serviceIsLinkedToTreatmentPlanList: any[];
  locationList: any[];
  locationDropdownList: any[];

  allServicesAtSameLocation: boolean = false;
  existingServicesSelected: boolean = true;
  filterLocationId: any;

  constructor(
    public dialogRef: MultiServiceEditOverlayRef,
    @Inject(MULTI_SERVICE_EDIT_DATA) public data: any,
    @Inject(ChangeDetectorRef) private changeDetectorRef: ChangeDetectorRef,
    @Inject('StaticData') private staticData,
    @Inject('TreatmentPlansFactory') private treatmentPlansFactory,
    @Inject('PatientServices') private patientServices,
    @Inject('PatientServicesFactory') private patientServicesFactory,
    @Inject('$q') private $q,
    @Inject('$rootScope') private $rootScope,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    @Inject('PracticesApiService') private practicesApiService,
    @Inject(LocationsService) private locationsService
  ) {}

  ngOnInit() {
    this.serviceList = this.data.serviceList;
    this.patientInfo = this.data.patientInfo;
    this.currentDate = new Date();
    this.maxServiceDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      this.currentDate.getDate(),
      23,
      59,
      0
    );
    this.maxDateToSet = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      this.currentDate.getDate(),
      moment().hour(),
      moment().minute(),
      moment().second(),
      moment().millisecond()
    );
    this.statusList = [];
    this.staticData.ServiceTransactionStatuses().then(res => {
      var validStatuses = res.Value.filter(
        x =>
          x.Id === 1 ||
          x.Id === 2 ||
          x.Id === 3 ||
          x.Id === 6 ||
          x.Id === 7 ||
          x.Id === 8
      );
      this.statusList.push({ text: this.statusPlaceHolder, value: 0 });
      validStatuses.forEach(x => {
        this.statusList.push({ text: x.Name, value: x.Id });
      });
    });
    this.status = 0;

    var firstLocation = this.serviceList[0].LocationId;
    var everyServiceAtSameLocation = this.serviceList.every(service => {
      return service.LocationId == firstLocation;
    });
    if (everyServiceAtSameLocation) {
      //Are all of the services initially on the same location?
      this.allServicesAtSameLocation = true;
    }

    if (
      this.serviceList.every(service => {
        return service.StatusId != 6;
      })
    ) {
      //Are all of the services not set in the Existing status to start with?
      this.existingServicesSelected = false;
    }
    this.setLocationsList();
    this.setProviderList();
  }

  setLocationsList() {
    // this api returns locations based on the current user and a permission that is being passed into the end point
    // permission 1120 is the permission used to determine if people have access to a location
    // given how many places this modal for services is used this seems like the best permission to check
    // given the alternative would be to check different permission on each usage based on where it is used
    this.practicesApiService.getLocationsWithDetails(1120).then(
      res => {
        var locationResponse = res.data;
        if (locationResponse !== null && locationResponse.length > 0) {
          // locations that are in both lists.
          this.locationList =
            this.locationsService.findLocationsInBothPatientLocationsAndUsersLocations(
              this.patientInfo.PatientLocations,
              locationResponse
            );

          this.locationDropdownList = [];
          this.locationDropdownList.push({
            text: 'No Location Change',
            value: 0,
          });
          this.locationList.forEach(location => {
            this.locationDropdownList.push({
              text: location.NameAbbreviation,
              value: location.LocationId,
            });
          });
        } else {
          this.locationList = null;
          this.locationDropdownList = [];
        }
      },
      error => {}
    );
  }

  setProviderList() {
    this.filterLocationId = null;

    // this api returns locations based on the current user and a permission that is being passed into the end point
    // permission 1120 is the permission used to determine if people have access to a location
    // given how many places this modal for services is used this seems like the best permission to check
    // given the alternative would be to check different permission on each usage based on where it is used
    if (this.allServicesAtSameLocation) {
      this.filterLocationId = this.serviceList[0].LocationId;
    } else {
      this.disableProviderList = true;
    }
  }

  statusChanged(newValue) {
    this.status = newValue.target.value == '0' ? 0 : newValue.target.value;
    if (this.status == '6' || this.status == '2' || this.status == '8') {
      //Existing, Referred, ReferredCompleted
      if (this.status == '6') {
        //Status
        this.maxDate = this.maxServiceDate;
        if (this.date > this.maxServiceDate) {
          this.date = this.maxDateToSet;
        }

        this.serviceProvider = null;
      } else {
        this.maxDate = null;
      }
      this.fee = null;
      this.disableFee = true;
    } else {
      //We selected something other than 6, 2, or 8
      this.disableFee = false;
      this.maxDate = null;
    }
    this.setProviderIsRequired();
    this.setIsProviderDisabled();

    this.updateCanSave();
    this.changeDetectorRef.detectChanges();
  }

  feeChanged(newValue) {
    this.fee = newValue.NewValue;
    this.feeChanging = false;
    this.updateCanSave();
    this.changeDetectorRef.detectChanges();
  }

  dateChanged(newValue) {
    if (
      newValue != null &&
      (newValue.getFullYear() < 1900 || newValue.getFullYear() > 2099)
    ) {
      this.isDateInvalid = true;
    } else {
      this.isDateInvalid = false;
    }
    this.date = newValue;

    this.updateCanSave();
    this.changeDetectorRef.detectChanges();
  }

  feeIsChanging() {
    this.feeChanging = true;
    this.updateCanSave();
    this.changeDetectorRef.detectChanges();
  }

  locationChanged(newValue) {
    if (newValue.target.value != '0') {
      this.newLocation = newValue.target.value;
      this.filterLocationId = newValue.target.value;
    } else {
      //We don't have a location selected, don't require a provider selection
      //Don't set providerRequired to false, unless we have no existing services selected OR
      //We have existing services selected, but the status is either not set or is set to Existing
      //if (!this.existingServicesSelected || (this.existingServicesSelected && (this.status == 0 || this.status == '6'))) {
      //    this.isProviderRequired = false;
      //}
      this.filterLocationId = this.serviceList[0].LocationId;
      this.newLocation = 0;
    }

    this.setProviderIsRequired();
    this.setIsProviderDisabled();
    this.serviceProvider = null;

    this.updateCanSave();
    this.changeDetectorRef.detectChanges();
  }

  providerChanged(newValue) {
    if (!isNullOrUndefined(newValue)) {
      this.serviceProvider = newValue.ProviderId;
    } else {
      this.serviceProvider = null;
    }

    this.updateCanSave();
    this.changeDetectorRef.detectChanges();
  }

  setProviderIsRequired() {
    if (
      this.existingServicesSelected &&
      this.status != 0 &&
      this.status != '6'
    ) {
      this.isProviderRequired = true;
    } else if (this.newLocation != 0 && this.status != '6') {
      this.isProviderRequired = true;
    } else {
      this.isProviderRequired = false;
    }
  }

  setIsProviderDisabled() {
    if (this.newLocation != 0 && this.status != '6') {
      this.disableProviderList = false;
    } else if (this.status == '6') {
      this.disableProviderList = true;
    } else if (this.allServicesAtSameLocation) {
      this.disableProviderList = false;
    } else {
      this.disableProviderList = true;
    }
  }

  updateCanSave() {
    var dateIsNotNullAndInLimits =
      this.date != null &&
      this.date.getFullYear() >= 1900 &&
      this.date.getFullYear() <= 2099;

    var feeIsNotNull = this.fee != null;

    var validProviderChange = false;
    if (
      !isNullOrUndefined(this.serviceProvider) &&
      this.newLocation == 0 &&
      this.allServicesAtSameLocation
    ) {
      //We selected a provider AND did not select a new location AND all services are at the same location
      validProviderChange = true;
    } else if (
      !isNullOrUndefined(this.serviceProvider) &&
      this.newLocation != 0
    ) {
      //We selected a provider AND also selected a new location
      validProviderChange = true;
    }

    var validStatusChange = false;
    if (this.status != 0) {
      //We selected a status AND have no existing services selected
      validStatusChange = true;
    }

    var providerGivenWhenRequired = true;
    if (this.isProviderRequired && isNullOrUndefined(this.serviceProvider)) {
      //Provider is being required and we didn't provide one
      providerGivenWhenRequired = false;
    }

    this.canSave =
      (dateIsNotNullAndInLimits ||
        feeIsNotNull ||
        validStatusChange ||
        validProviderChange) &&
      !this.feeChanging &&
      providerGivenWhenRequired;
  }

  async save() {
    await this.multiServiceEditReturned();

    this.dialogRef.events.next({
      type: 'confirm',
    });
  }

  cancel() {
    this.dialogRef.events.next({
      type: 'close',
    });
  }

  multiServiceEditReturned() {
    var serviceTransactionIds = [];
    var txPlanStatusPromise;

    this.data.serviceList.forEach(x => {
      serviceTransactionIds.push(x.RecordId);
    });

    if (this.status && this.status == '6') {
      var txPlanDefer = this.$q.defer();
      txPlanStatusPromise = txPlanDefer.promise;
      this.treatmentPlansFactory
        .GetTxPlanFlags(serviceTransactionIds)
        .then(res => {
          this.serviceIsLinkedToTreatmentPlanList = res.Value;
          txPlanDefer.resolve();
        });
    } else {
      txPlanStatusPromise = Promise.resolve();
    }

    var defer = this.$q.defer();
    var modalPromise = defer.promise;
    txPlanStatusPromise.then(() => {
      this.patientServices.ServiceTransactions.getServiceTransactionsByIds(
        serviceTransactionIds,
        res => {
          var serviceTransactions = res.Value;

          serviceTransactions.forEach(service => {
            this.handleLocationChange(service);
            this.handleProviderChange(service);
            this.handleStatusChange(service);
            this.handleFeeChange(service);
            this.handleDateChange(service);

            service.ObjectState = 'Update';
          });

          this.patientServicesFactory
            .update(serviceTransactions, null, null, null)
            .then(
              res => {
                var savedServiceTransactions = res.Value;
                if (savedServiceTransactions.length > 0) {
                  this.$rootScope.$broadcast(
                    'reloadProposedServices',
                    savedServiceTransactions
                  );
                  this.$rootScope.$broadcast(
                    'soar:chart-services-reload-ledger'
                  );
                  //$scope.close();
                  defer.resolve();
                }
              },
              () => {
                defer.resolve();
              }
            );

          //If we have existing service and the date changed to the future, skip it

          //If we have a service on an appointment and the new status is:
          //Existing
          //Rejected
          //Referred
          //ReferredCompleted
          //Ignore the status change for that service
        },
        () => {
          this.getServicesFailure();
          defer.resolve();
        }
      );
    });

    return modalPromise;
  }

  getServicesFailure() {
    this.toastrFactory.error(
      this.localize.getLocalizedString('Failed to get {0}.', ['Services']),
      this.localize.getLocalizedString('Server Error')
    );
  }

  handleLocationChange(service) {
    var serviceIsOnTxPlan = null;

    if (!isNullOrUndefined(this.serviceIsLinkedToTreatmentPlanList)) {
      serviceIsOnTxPlan = this.serviceIsLinkedToTreatmentPlanList.find(x => {
        return x.Key == service.ServiceTransactionId;
      });
    }

    //If the service is on a treatment plan and we are changing Status to Existing and trying to change location,
    //We cannot safely take the location change because Existing status blocks selecting a new provider

    if (
      this.newLocation != 0 &&
      service.AppointmentId == null &&
      (serviceIsOnTxPlan == null ||
        (serviceIsOnTxPlan && !serviceIsOnTxPlan.Value))
    ) {
      //To take a location change, the service cannot be on an appointment
      //Due to current validations, services on an appointment must match the appointment location
      //Changing an appointment service location would not be safe

      //The service must also either: A) Not be on a treatment plan or B) On a treamtent plan and the new Status not be Existing
      //B is important because if the service is on a treatment plan, we will not be able to take the Status change of Existing
      //Nor will we be able to give a new provider because the Existing status will block us from selecting one
      //Without a new provider given, we cannot accept the new location
      service.LocationId = this.newLocation;
    }
  }

  handleProviderChange(service) {
    if (
      this.serviceProvider != null &&
      (this.newLocation == 0 || service.LocationId == this.newLocation)
    ) {
      //Apply the new provider if our location change was taken or if the service location already matched the new location
      //If the location change wasn't taken, then we can't safely apply the new provider
      //A case for this is selecting an appointment service and trying to change the location
      //to something different than the appointment's location. That would fail.

      //If on the other hand, we are changing the location to the appointment service's location,
      //then we can take the provider change

      //It's possible that the provider will be overwritten in later steps
      //In the case of an Existing service
      service.ProviderUserId = this.serviceProvider;
    }
  }

  handleStatusChange(service) {
    var serviceIsOnTxPlan = null;
    if (this.status) {
      if (this.status == '6') {
        serviceIsOnTxPlan = this.serviceIsLinkedToTreatmentPlanList.find(x => {
          return x.Key == service.ServiceTransactionId;
        });
      }

      if (service.AppointmentId) {
        //Appointment is most restrictive, if the service can be on an appointment, it can be on a treatment plan
        //This logic will cover the event that the service is on both an appointment and treatment plan

        if (
          this.status &&
          this.status != '2' &&
          this.status != '3' &&
          this.status != '6' &&
          this.status != '8'
        ) {
          service.ServiceTransactionStatusId = parseInt(this.status);
        }
      } else if (isNullOrUndefined(serviceIsOnTxPlan)) {
        //The service wasn't on an appointment and we aren't trying to change to Existing
        service.ServiceTransactionStatusId = parseInt(this.status);
      } else if (serviceIsOnTxPlan && !serviceIsOnTxPlan.Value) {
        //We are are trying to change status to Existing and the service is not on a treatment plan
        service.ServiceTransactionStatusId = parseInt(this.status);
      }
    }
  }

  handleFeeChange(service) {
    if (
      service.ServiceTransactionStatusId != 6 &&
      service.ServiceTransactionStatusId != 2 &&
      service.ServiceTransactionStatusId != 8
    ) {
      if (this.fee != null) {
        service.Fee = this.fee;
      }
    } else {
      //We had an Existing, Referred, or ReferredCompleted service, make sure the fee 0
      service.Fee = 0;

      if (service.ServiceTransactionStatusId == 6) {
        //This is an Existing service, clear out any ProviderUserId that might be set
        service.ProviderUserId = null;
      }
    }
  }

  handleDateChange(service) {
    if (
      this.date &&
      service.ServiceTransactionStatusId == 6 &&
      this.date <= this.maxServiceDate &&
      !this.isDateInvalid
    ) {
      //Existing
      //We have a new date set, it's an Existing service and the new date is today or before,
      //Take the new date
      service.DateEntered = this.date;
    } else if (
      this.date &&
      service.ServiceTransactionStatusId != 6 &&
      !this.isDateInvalid
    ) {
      //We have a new date set, and the service isn't an Existing service
      //Take the new date
      service.DateEntered = this.date;
    } else if (
      (this.isDateInvalid || isNullOrUndefined(this.date)) &&
      service.ServiceTransactionStatusId == 6 &&
      new Date(service.DateEntered) > this.maxServiceDate
    ) {
      //We aren't trying to change date, but we are trying to change the status to Existing
      //The service date is in the future and we can't have future dates on Existing services
      //Change the future date to today's date
      service.DateEntered = this.maxDateToSet;
    }
  }
}
