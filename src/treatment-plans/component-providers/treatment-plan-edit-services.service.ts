import { Injectable, Inject, EventEmitter, Output } from '@angular/core';
import { TreatmentPlanOrderingService } from '../providers';
import { ScheduleDisplayPlannedServicesService } from '../../scheduling/common/providers/schedule-display-planned-services.service';

@Injectable()
export class TreatmentPlanEditServicesService {
    providers: any[] = [];
    teeth: any[] = [];
    roots: any[] = [];
    surfaces: any[] = [];
    cdtCodeGroups: any[] = [];
    serviceCodes: any[] = [];
    serviceStatuses: any[] = [];

    treatmentPlan: any = null;

    @Output() navClickedEvent = new EventEmitter<string>();
    @Output() esCancelEvent = new EventEmitter<string>();

    constructor(@Inject('StaticData') private staticData,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('PatientOdontogramFactory') private patientOdontogramFactory,
        private treatmentPlanOrderingService: TreatmentPlanOrderingService,
        private scheduleDisplayPlannedServicesService: ScheduleDisplayPlannedServicesService) { }

    navClicked(msg: string) {
        this.navClickedEvent.emit(msg);
    }

    changeCancel(msg: string) {
        this.esCancelEvent.emit(msg);
    }

    loadStaticData() {

        // Need to consider caching this data for some time. ... need to think about it more.
        this.providers = this.referenceDataService.get(this.referenceDataService.entityNames.users);
        this.teeth = this.patientOdontogramFactory.TeethDefinitions.Teeth;
        this.roots = this.patientOdontogramFactory.TeethDefinitions.roots;
        this.surfaces = this.patientOdontogramFactory.TeethDefinitions.SummarySurfaces;

        // cdtCodeGroups used to change the available teeth selection
        this.cdtCodeGroups = this.patientOdontogramFactory.CdtCodeGroups;

        // Services that are on a treatment plan only have a couple of possible statues.
        // Currently we are reloading the same list ... I would like to consider not doing that moving forward.

        this.serviceStatuses = [
            { Id: 7, Name: 'Accepted', Order: 7, ShowInDDList: true },
            { Id: 1, Name: 'Proposed', Order: 1, ShowInDDList: true },
            { Id: 2, Name: 'Referred', Order: 2, ShowInDDList: true },
            { Id: 8, Name: 'Referred Completed', Order: 8, ShowInDDList: true },
            { Id: 3, Name: 'Rejected', Order: 3, ShowInDDList: true },
            { Id: 4, Name: 'Completed', Order: 4, ShowInDDList: false },
            { Id: 5, Name: 'Pending', Order: 5, ShowInDDList: false }

        ];
    }

    loadData() {
        this.providers = this.referenceDataService.get(this.referenceDataService.entityNames.users);
        Promise.resolve(this.referenceDataService.getData(this.referenceDataService.entityNames.serviceCodes)).then(allServiceCodes => {
            this.serviceCodes = allServiceCodes;
        });
    }

    getData() {
        let dataCollection = {
            providers: this.providers,
            teeth: this.teeth,
            roots: this.roots,
            surfaces: this.surfaces,
            cdtCodeGroups: this.cdtCodeGroups,
            serviceCodes: this.serviceCodes,
            serviceStatuses: this.serviceStatuses
        }

        return dataCollection;
    }

    //if an appointment is not on the service, then change ServicTransactionStatusId to Proposed (id = 1)
    //when dragging from Proposed Services list in Tx drawer
    setStatusOnServiceToProposedWhenNoAppointmentExists(serviceTransaction) {
        if (!serviceTransaction.AppointmentId) {
            serviceTransaction.ServiceTransactionStatusId = 1;
        }
    }

    //Check if the Service is Completed Or Pending
    isServiceCompletedOrPending(serviceTransactionStatusId) {

        if (serviceTransactionStatusId === 4) {
            return true;
        }
        else if (serviceTransactionStatusId === 5) {
            return true;
        }
        else {
            return false;
        }

    }

    getListOfAppointmentIdsFromServices(services) {
        let appointmentIds = [];
        for (let i = 0; i < services.length; i++) {
            // take and move this if statement to a service
            if (services[i].ServiceTransaction.AppointmentId !== null &&
                services[i].ServiceTransaction.AppointmentId !== undefined &&
                services[i].ServiceTransaction.ServiceTransactionStatusId !== 4) {
                appointmentIds.push(services[i].ServiceTransaction.AppointmentId);
            }
        }

        return appointmentIds;
    }

    populateProviderListBasedOnBasicAppointmentProviderRecords(providerAppointments, providers) {
        let serviceProviders = [];
        for (let a = 0; a < providerAppointments.length; a++) {
            for (let b = 0; b < providers.length; b++) {
                if (providerAppointments[a].ProviderId === providers[b].UserId) {
                    // need to add the appointment id so we can check it later.
                    let currentProvider = JSON.parse(JSON.stringify(providers[b]));
                    currentProvider.AppointmentId = providerAppointments[a].AppointmentId;
                    serviceProviders.push(currentProvider);
                }
            }
        }
        return serviceProviders;
    }

    getProvidersForService(providers, service) {
        let overrideProviders = [];
        if (providers !== null && service.ServiceTransaction.AppointmentId != null && service.ServiceTransaction.AppointmentId != null) {
            let currentServiceProviderIncluded = false;
            //services[x].ServiceTransaction.ProviderUserId
            // now we need to get the providers from the data list and utilize those to populate the override provider array.
            for (let a = 0; a < providers.length; a++) {
                if (providers[a].AppointmentId === service.ServiceTransaction.AppointmentId) {
                    overrideProviders.push(providers[a]);
                }
            }

            if (overrideProviders !== []) {
                for (let a = 0; a < overrideProviders.length; a++) {
                    if (overrideProviders[a].UserId === service.ServiceTransaction.ProviderUserId) {
                        currentServiceProviderIncluded = true;
                    }
                }

                // if current selected provider is not in the list yet we need to add it.
                if (currentServiceProviderIncluded === false) {
                    for (let a = 0; a < this.providers.length; a++) {
                        if (this.providers[a].UserId === service.ServiceTransaction.ProviderUserId) {
                            overrideProviders.push(this.providers[a]);
                        }
                    }
                }
            }
        }
        return overrideProviders;

    }



    processRecord(record, locations, overrideProviders, isComingFromOnDropEvent) {

        // Populate Lists that will live with each service 
        // ...vary by location ... vary by tooth etc
        let displayState = {
            providers: [],
            area: 1,
            useCodeForRangeOfTeeth: false,
            teeth: [],
            roots: [],
            displaySurfaces: false,
            surfaces: [],
            displayToothDropdown: true,
            displaySurfaceDropdown: true,
            displayStatusDropdown: true,
            displayLocationDropdown: true,
            displayProviderDropdown: true,
            displayFeeDropdown: true,
            displayCheckmarkIcon: false,
            displayScheduleIcon: false,
            displayCartIcon: false,
            displayDatePicker: false,
            displayText: null,
            displayTooltip: false,
        };

        if (isComingFromOnDropEvent) {
            this.setStatusOnServiceToProposedWhenNoAppointmentExists(record.ServiceTransaction);
        }

        let serviceCode = this.serviceCodes.find(function (item) {
            return item.ServiceCodeId == record.ServiceTransaction.ServiceCodeId;
        });

        let tempLocation = locations.find(function (item) {
            return item.LocationId == record.ServiceTransaction.LocationId;
        });

        record.ServiceTransaction.$$DateEntered = new Date(record.ServiceTransaction.DateEntered);

        //because object of services coming from drawer look a little different we need to build insurance estimates for display
        if (!record.ServiceTransaction.$$AdjEst || !record.ServiceTransaction.$$EstInsurance || !record.ServiceTransaction.$$PatientPortion) {
            record.ServiceTransaction.$$AdjEst = 0;
            record.ServiceTransaction.$$EstInsurance = 0;
            record.ServiceTransaction.$$PatientPortion = 0;
        }


        if (serviceCode && tempLocation) {
            // need to set the service code value so we can change the display
            record.ServiceTransaction.ServiceCode = serviceCode.Code;
            record.ServiceTransaction.Description = serviceCode.Description;

            // transform the value of either the surface or roots value so that they match the format needed
            if (record.ServiceTransaction.Surface) {
                record.ServiceTransaction.SurfaceSelection = record.ServiceTransaction.Surface.split(',');
                record.ServiceTransaction.Surface = this.scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(record.ServiceTransaction.Surface);
            }
            if (record.ServiceTransaction.Roots) {
                record.ServiceTransaction.RootsSelection = record.ServiceTransaction.Roots.split(',');
                record.ServiceTransaction.Roots = record.ServiceTransaction.Roots.split(',').join('');

            }

            // The affectedAreaId tells if something is a root or surface or other service type
            displayState.area = serviceCode.AffectedAreaId;
            displayState.useCodeForRangeOfTeeth = serviceCode.UseCodeForRangeOfTeeth;

            // we need to get the tooth if one is selected
            if (displayState.area !== 1) {

                let tempTooth = this.teeth.find(function (item) {
                    return item.USNumber == record.ServiceTransaction.Tooth;
                });


                // check and see if we should limit what teeth show in the selection
                // set the displayState teeth property
                displayState = this.getTeethAvailableForServiceBasedOnServiceCode(displayState, record);

            }

            // get the providers and populate the list of providers for the record based on the location
            if (overrideProviders !== null && overrideProviders.length > 0) {
                displayState.providers = overrideProviders;
            }
            else {
                displayState.providers = tempLocation.providers;
            }

            let statusId = parseInt(record.ServiceTransaction.ServiceTransactionStatusId);
            //this checks to see if the service is in a Completed or Pending State. If it is, then we set a variable
            //in order to determine if we show or hide the status dropdown
            if (this.isServiceCompleted(statusId)) {
                displayState.displayToothDropdown = false;
                displayState.displaySurfaceDropdown = false;
                displayState.displayStatusDropdown = false;
                displayState.displayLocationDropdown = false;
                displayState.displayProviderDropdown = false;
                displayState.displayFeeDropdown = false;

                displayState.displayCheckmarkIcon = true;
                displayState.displayScheduleIcon = false;
                displayState.displayCartIcon = false;
                displayState.displayDatePicker = false;
                displayState.displayText = 'Completed On:';
            }

            if (this.isServiceAccepted(statusId)) {
                displayState.displayToothDropdown = true;
                displayState.displaySurfaceDropdown = true;
                displayState.displayStatusDropdown = true;
                displayState.displayLocationDropdown = true;
                displayState.displayProviderDropdown = true;
                displayState.displayFeeDropdown = true;

                displayState.displayCheckmarkIcon = false;
                displayState.displayScheduleIcon = false;
                displayState.displayCartIcon = false;
                displayState.displayDatePicker = true;

                //TODO figure out how to handle this problem of not having a schedule status when coming from drawer.
                if (record.ServiceTransaction.ScheduledStatus) {
                    record.ServiceTransaction.$$statusName = 'Accepted'
                    displayState.displayToothDropdown = false;
                    displayState.displaySurfaceDropdown = false;
                    displayState.displayStatusDropdown = false;
                    displayState.displayLocationDropdown = false;
                    displayState.displayProviderDropdown = true;
                    displayState.displayFeeDropdown = false;

                    displayState.displayCheckmarkIcon = false;
                    displayState.displayScheduleIcon = true;
                    displayState.displayCartIcon = false;
                    displayState.displayDatePicker = false;
                    displayState.displayText = 'Scheduled For:';
                }
            }

            if (this.isServiceReferredCompleted(statusId)) {
                displayState.displayToothDropdown = true;
                displayState.displaySurfaceDropdown = true;
                displayState.displayStatusDropdown = true;
                displayState.displayLocationDropdown = true;
                displayState.displayProviderDropdown = true;
                displayState.displayFeeDropdown = false;

                displayState.displayCheckmarkIcon = true;
                displayState.displayScheduleIcon = false;
                displayState.displayCartIcon = false;
                displayState.displayDatePicker = true;
                displayState.displayText = null;
            }

            if (this.isServiceProposed(statusId)) {
                displayState.displayToothDropdown = true;
                displayState.displaySurfaceDropdown = true;
                displayState.displayStatusDropdown = true;
                displayState.displayLocationDropdown = true;
                displayState.displayProviderDropdown = true;
                displayState.displayFeeDropdown = true;

                displayState.displayCheckmarkIcon = false;
                displayState.displayScheduleIcon = false;
                displayState.displayCartIcon = false;
                displayState.displayDatePicker = true;
                displayState.displayText = null;
            }

            if (this.isServicePending(statusId)) {
                displayState.displayToothDropdown = false;
                displayState.displaySurfaceDropdown = false;
                displayState.displayStatusDropdown = false;
                displayState.displayLocationDropdown = false;
                displayState.displayProviderDropdown = true;
                displayState.displayFeeDropdown = false;

                displayState.displayCheckmarkIcon = false;
                displayState.displayScheduleIcon = false;
                displayState.displayCartIcon = true;
                displayState.displayDatePicker = false;
                displayState.displayText = 'Ready for Checkout:';
            }

            if (this.isServiceRejected(statusId)) {
                displayState.displayToothDropdown = true;
                displayState.displaySurfaceDropdown = true;
                displayState.displayStatusDropdown = true;
                displayState.displayLocationDropdown = true;
                displayState.displayProviderDropdown = true;
                displayState.displayFeeDropdown = true;

                displayState.displayCheckmarkIcon = false;
                displayState.displayScheduleIcon = false;
                displayState.displayCartIcon = false;
                displayState.displayDatePicker = true;
                displayState.displayText = null;
            }

            if (this.isServiceReferred(statusId)) {
                displayState.displayToothDropdown = true;
                displayState.displaySurfaceDropdown = true;
                displayState.displayStatusDropdown = true;
                displayState.displayLocationDropdown = true;
                displayState.displayProviderDropdown = true;
                displayState.displayFeeDropdown = false;

                displayState.displayCheckmarkIcon = false;
                displayState.displayScheduleIcon = false;
                displayState.displayCartIcon = false;
                displayState.displayDatePicker = true;
                displayState.displayText = null;             
            }

            // make sure we can utilize the lists and displayState for each item on the view
            record.displayState = displayState;

        }
        return record;

    }

    // format surfaces in dental standard form
    normalizeSurfaces(surfaces: string): string {
        return this.scheduleDisplayPlannedServicesService.getSurfacesInSummaryFormat(surfaces);
    }


    getTeethAvailableForServiceBasedOnServiceCode(displayState, record) {
        // this service ... get cdtCodeGroup record if it exists.
        let group = [];
        for (let x = 0; x < this.cdtCodeGroups.length; x++) {
            if (this.cdtCodeGroups[x].CdtCode === record.ServiceTransaction.ServiceCode) {
                group.push(this.cdtCodeGroups[x]);
            }
        }

        // before proceeding we need to determine if we should limit the selection or display all the teeth
        if (group.length > 0 && group[0].AllowedTeeth.indexOf('All') == -1) {
            let tempTeeth = [];
            for (let x = 0; x < group.length; x++) {
                for (let i = 0; i < group[x].AllowedTeeth.length; i++) {
                    // ensure we do not add something twice
                    let ifExists = tempTeeth.find(function (item) {
                        return item.USNumber == group[x].AllowedTeeth[i];
                    });

                    if (ifExists === null || ifExists === undefined) {
                        for (let a = 0; a < this.teeth.length; a++) {
                            if (this.teeth[a].USNumber === group[x].AllowedTeeth[i]) {
                                tempTeeth.push(this.teeth[a]);
                            }
                        }
                    }
                }
            }

            // have to order the list by the inner value
            let list = this.treatmentPlanOrderingService.orderNumberAndStringListByNestedParameter(tempTeeth, 'USNumber', null, true);

            displayState.teeth = list;

        } else {
            displayState.teeth = this.teeth;
        }

        return displayState;
    }

    handleStatusChangeDisplayState(tps) {

        let statusId = parseInt(tps.ServiceTransaction.ServiceTransactionStatusId);
        //this checks to see if the service is in a Completed or Pending State. If it is, then we set a variable
        //in order to determine if we show or hide the status dropdown
        if (this.isServiceCompleted(statusId)) {
            tps.displayState.displayToothDropdown = false;
            tps.displayState.displaySurfaceDropdown = false;
            tps.displayState.displayStatusDropdown = false;
            tps.displayState.displayLocationDropdown = false;
            tps.displayState.displayProviderDropdown = false;
            tps.displayState.displayFeeDropdown = false;

            tps.displayState.displayCheckmarkIcon = true;
            tps.displayState.displayScheduleIcon = false;
            tps.displayState.displayCartIcon = false;
            tps.displayState.displayDatePicker = false;
            tps.displayState.displayText = 'Completed On:';

        }

        if (this.isServiceAccepted(statusId)) {
            tps.displayState.displayToothDropdown = true;
            tps.displayState.displaySurfaceDropdown = true;
            tps.displayState.displayStatusDropdown = true;
            tps.displayState.displayLocationDropdown = true;
            tps.displayState.displayProviderDropdown = true;
            tps.displayState.displayFeeDropdown = true;

            tps.displayState.displayCheckmarkIcon = false;
            tps.displayState.displayScheduleIcon = false;
            tps.displayState.displayCartIcon = false;
            tps.displayState.displayDatePicker = true;
            tps.displayState.displayText = null;

            if (tps.ServiceTransaction.ScheduledStatus) {
                tps.ServiceTransaction.$$statusName = 'Accepted'
                tps.displayState.displayToothDropdown = false;
                tps.displayState.displaySurfaceDropdown = false;
                tps.displayState.displayStatusDropdown = false;
                tps.displayState.displayLocationDropdown = false;
                tps.displayState.displayProviderDropdown = true;
                tps.displayState.displayFeeDropdown = false;

                tps.displayState.displayCheckmarkIcon = false;
                tps.displayState.displayScheduleIcon = false;
                tps.displayState.displayCartIcon = true;
                tps.displayState.displayDatePicker = false;
                tps.displayState.displayText = 'Scheduled For:';
            }
        }

        if (this.isServiceReferredCompleted(statusId)) {
            tps.ServiceTransaction.$$statusName = 'Referred Completed',
                tps.displayState.displayToothDropdown = true;
            tps.displayState.displaySurfaceDropdown = true;
            tps.displayState.displayStatusDropdown = true;
            tps.displayState.displayLocationDropdown = true;
            tps.displayState.displayProviderDropdown = true;
            tps.displayState.displayFeeDropdown = false;

            tps.displayState.displayCheckmarkIcon = true;
            tps.displayState.displayScheduleIcon = false;
            tps.displayState.displayCartIcon = false;
            tps.displayState.displayDatePicker = true;
            tps.displayState.displayText = null;

            tps.ServiceTransaction.Amount = 0;
            tps.ServiceTransaction.Fee = 0;
        }

        if (this.isServiceProposed(statusId)) {
            tps.displayState.displayToothDropdown = true;
            tps.displayState.displaySurfaceDropdown = true;
            tps.displayState.displayStatusDropdown = true;
            tps.displayState.displayLocationDropdown = true;
            tps.displayState.displayProviderDropdown = true;
            tps.displayState.displayFeeDropdown = true;

            tps.displayState.displayCheckmarkIcon = false;
            tps.displayState.displayScheduleIcon = false;
            tps.displayState.displayCartIcon = false;
            tps.displayState.displayDatePicker = true;
            tps.displayState.displayText = null;
        }

        if (this.isServicePending(statusId)) {
            tps.displayState.displayToothDropdown = false;
            tps.displayState.displaySurfaceDropdown = false;
            tps.displayState.displayStatusDropdown = false;
            tps.displayState.displayLocationDropdown = false;
            tps.displayState.displayProviderDropdown = true;
            tps.displayState.displayFeeDropdown = false;

            tps.displayState.displayCheckmarkIcon = false;
            tps.displayState.displayScheduleIcon = false;
            tps.displayState.displayCartIcon = true;
            tps.displayState.displayDatePicker = false;
            tps.displayState.displayText = 'Ready for Checkout';
        }

        if (this.isServiceRejected(statusId)) {
            tps.displayState.displayToothDropdown = true;
            tps.displayState.displaySurfaceDropdown = true;
            tps.displayState.displayStatusDropdown = true;
            tps.displayState.displayLocationDropdown = true;
            tps.displayState.displayProviderDropdown = true;
            tps.displayState.displayFeeDropdown = true;

            tps.displayState.displayCheckmarkIcon = false;
            tps.displayState.displayScheduleIcon = false;
            tps.displayState.displayCartIcon = false;
            tps.displayState.displayDatePicker = true;
            tps.displayState.displayText = null;
        }

        if (this.isServiceReferred(statusId)) {
            tps.displayState.displayToothDropdown = true;
            tps.displayState.displaySurfaceDropdown = true;
            tps.displayState.displayStatusDropdown = true;
            tps.displayState.displayLocationDropdown = true;
            tps.displayState.displayProviderDropdown = true;
            tps.displayState.displayFeeDropdown = false;

            tps.displayState.displayCheckmarkIcon = false;
            tps.displayState.displayScheduleIcon = false;
            tps.displayState.displayCartIcon = false;
            tps.displayState.displayDatePicker = true;
            tps.displayState.displayText = null;
  
            tps.ServiceTransaction.Amount = 0;
            tps.ServiceTransaction.Fee = 0;
        }
    }

    //Check if the Service is Completed
    isServiceCompleted(serviceTransactionStatusId) {

        if (serviceTransactionStatusId === 4) {
            return true;
        }
        else {
            return false;
        }
    }

    //Check if the Service is Completed
    isServiceProposed(serviceTransactionStatusId) {

        if (serviceTransactionStatusId === 1) {
            return true;
        }
        else {
            return false;
        }
    }

    //Check if the Service is referred completed
    isServiceReferredCompleted(serviceTransactionStatusId) {

        if (serviceTransactionStatusId === 8) {
            return true;
        }
        else {
            return false;
        }
    }

    //Check if the Service is accepted
    isServiceAccepted(serviceTransactionStatusId) {

        if (serviceTransactionStatusId === 7) {
            return true;
        }
        else {
            return false;
        }
    }

    //Check if the Service is pending
    isServicePending(serviceTransactionStatusId) {

        if (serviceTransactionStatusId === 5) {
            return true;
        }
        else {
            return false;
        }
    }

    //Check if the Service is rejected
    isServiceRejected(serviceTransactionStatusId) {

        if (serviceTransactionStatusId === 3) {
            return true;
        }
        else {
            return false;
        }
    }

    //Check if the Service is referred
    isServiceReferred(serviceTransactionStatusId) {

        if (serviceTransactionStatusId === 2) {
            return true;
        }
        else {
            return false;
        }
    }

    // as we convert this code from angular Js to angular we have to build things like this to ensure the services communicate between one another.
    // this work is to ensure we can do that and is not needed at some point.
    setTreatmentPlan(plan) {
        this.treatmentPlan = plan;
    }

    getTreatmentPlan() {
        return this.treatmentPlan;
    }
}
