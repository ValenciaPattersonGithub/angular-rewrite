import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';

import { ScheduleDisplayPatientService } from 'src/scheduling/common/providers/schedule-display-patient.service';
import { LocationHttpService } from '../../../practices/http-providers/location-http.service';
import { LocationsService } from '../../../practices/providers/locations.service';
import { LocationTimeService } from '../../../practices/common/providers/location-time.service';
import { ScheduleAppointmentHttpService } from '../../common/http-providers';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { Subscription, forkJoin } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { FamilyAppointment } from './family-appointment';
import { TranslateService } from '@ngx-translate/core';
import { FamilySchedulingModalServiceService } from './family-scheduling-modal-service.service';

@Component({
    selector: 'family-scheduling-modal',
    templateUrl: './family-scheduling-modal.component.html',
    styleUrls: ['./family-scheduling-modal.component.scss']
})
export class FamilySchedulingModalComponent implements OnInit, OnDestroy {
    [x: string]: any;

    public isOpen: boolean = false;
    public showPatientData: boolean = false;
    public isMasterChecked: boolean = false;

    startingLocations: any[] = [];
    appointmentTypes: any[] = [];
    appointmentDurations: any[] = [];

    timeIncrementStep: number;

    public subscription: Subscription;

    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;

    patientFamilyMembers: FamilyAppointment[] = [];

    constructor(public scheduleDisplayPatientService: ScheduleDisplayPatientService,
        private locationHttpService: LocationHttpService,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('locationService') private locationsService,
        private locationService: LocationsService,
        private locationTimeService: LocationTimeService,
        private scheduleAppointmentHttpService: ScheduleAppointmentHttpService,
        private confirmationModalService: ConfirmationModalService,
        private familySchedulingModalServiceService: FamilySchedulingModalServiceService,
        private translate: TranslateService,
        @Inject('ClipboardAppointmentUpdateService') private clipboardAppointmentUpdateService,
        @Inject('CommonServices') private commonServices: any,
    ) {
    }

    ngOnInit() {

    }

    async setupLocationsAndProviders() {

        this.locationHttpService.getLocationsWithDetailsByPermissionsObservable(2135).subscribe(data => {

            let allLoc = this.locationsService.getActiveLocations();

            let newData = this.locationService.addInactiveFlagtoLocations(data, allLoc);

            let tempLocations = newData;

            const tempProviders = this.referenceDataService.get(this.referenceDataService.entityNames.users);

            // put providers inside of location to they are easier to filter and easier to then change out later.
            for (let i = 0; i < tempLocations.length; i++) {
                // create array to avoid filtering later on.
                tempLocations[i].providers = [];
                for (let x = 0; x < tempProviders.length; x++) {
                    for (let y = 0; y < tempProviders[x].Locations.length; y++) {
                        if (tempProviders[x].Locations[y].LocationId === tempLocations[i].LocationId && tempProviders[x].Locations[y].IsActive) {
                            if (tempProviders[x].Locations[y].ProviderTypeId === 1 || tempProviders[x].Locations[y].ProviderTypeId === 2) {
                                tempLocations[i].providers.push(tempProviders[x]);
                            }
                        }
                    }
                }
                // only get locations that have providers
                if (tempLocations[i].providers.length > 0) {
                    this.startingLocations.push(tempLocations[i]);
                }
            }

        });

        await this.loadDuration();

        this.appointmentTypes = this.referenceDataService.get(this.referenceDataService.entityNames.appointmentTypes);
    }

    getProvidersForLocation(number: number) {
        // if you do not provider a number you get no providers
        let tempProviders = [];

        if (number !== 0) {
            for (let x = 0; x < this.startingLocations.length; x++) {
                if (this.startingLocations[x].LocationId === number) {
                    tempProviders = this.startingLocations[x].providers;
                }
            }
        }

        return tempProviders;
    }

    locationChange(value, index) {
        // when the location changes reset the provider list.
        const locationNumber = parseInt(value);
        const tempProviders = this.getProvidersForLocation(locationNumber);

        // ensuring that the value is cleared out, prevents bugs when preferred provider is not in the list of providers
        this.patientFamilyMembers[index].SelectedProvider = null;

        if (this.patientFamilyMembers[index].PreferredLocation !== null
            && parseInt(this.patientFamilyMembers[index].PreferredLocation) === locationNumber) {
            // get provider id from list of providers in case preferred provider is not in the list of providers
            for (let x = 0; x < tempProviders.length; x++) {
                if (tempProviders[x].UserId === this.patientFamilyMembers[index].PreferredProvider && tempProviders[x].IsActive === true) {
                    this.patientFamilyMembers[index].SelectedProvider = tempProviders[x].UserId;
                }
            }
        }

        this.patientFamilyMembers[index].Providers = tempProviders;
    }

    async loadDuration() {
        const practiceSettings = (await this.commonServices.PracticeSettings.Operations.Retrieve()).Value;

        // timeIncrement based on practice settings
        let timeIncrement = null;
        let timeIncrementObject = null;
        if (practiceSettings && practiceSettings.DefaultTimeIncrement) {
            timeIncrement = practiceSettings.DefaultTimeIncrement;
            timeIncrementObject = { TimeIncrement: cloneDeep(timeIncrement) };
        }

        this.timeIncrementStep = timeIncrement ? timeIncrement : 5;

        this.appointmentDurations = [];

        for (let i = this.timeIncrementStep; i < 996; i += this.timeIncrementStep) {
            this.appointmentDurations.push({ Duration: i.toString(), DurationText: i.toString() + ' min' });
        }
    }

    clearDisplay($event) {
        this.patientFamilyMembers = [];
        this.showPatientData = false;
    }

    getPeople($event) {
        this.subscription = this.familySchedulingModalServiceService
            .getFamilyAccountOverviewByAccountId($event)
            .subscribe((data: any) => this.getPatientAccountOverviewByAccountIdSuccess(data),
                error => this.getPatientAccountOverviewByAccountIdFailure()
            );
    }

    getPatientAccountOverviewByAccountIdSuccess = (accountOverview: any) => {
        let patientIds = accountOverview.map(x => x.PatientId);
        let nextPreventDue = [];
        forkJoin(this.familySchedulingModalServiceService
            .getNextPreventiveDue(patientIds),
            this.familySchedulingModalServiceService
                .getNextPreventiveAppt(patientIds)
        )
            .subscribe((data: any) => {
                let curloc = this.locationsService.getCurrentLocation();

                for (let i = 0; i < accountOverview.length; ++i) {
                    let nextDue = data[0].filter(x => x.PatientId === accountOverview[i].PatientId);
                    let nextAppt = data[1].filter(y => y.PatientId === accountOverview[i].PatientId);
                    if (nextDue) {
                        if (nextDue[0].NextPreventiveDue === '0001-01-01T00:00:00') {
                            accountOverview[i].NextPreventiveDue = null;
                        } else {
                            const due: Date = new Date(nextDue[0].NextPreventiveDue);
                            accountOverview[i].NextPreventiveDue = this.locationTimeService.translateUtcToLocationTime(curloc, due).format('MMMM DD, YYYY');
                        }
                    }
                    if (nextAppt && nextAppt[0] && nextAppt[0].NextPreventiveApptId !== '00000000-0000-0000-0000-000000000000') {
                        const next: Date = new Date(nextAppt[0].NextPreventiveApptStart);
                        accountOverview[i].NextPreventiveApptStart = this.locationTimeService.translateUtcToLocationTime(curloc, next).format('MMMM DD, YYYY');
                    }
                }
                this.displayPeople(accountOverview);
                this.showPatientData = true;
            });
    }

    getPatientAccountOverviewByAccountIdFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the Account Family Members.'),
            this.translate.instant('Server Error'));
    }

    displayPeople(people) {
        // later need to ensure that we are getting the patients locations. and filtering them more ...
        let list: FamilyAppointment[] = [];
        for (let i = 0; i < people.length; i++) {

            const person: FamilyAppointment = {
                IsChecked: false,
                IsResponsiblePerson: people[i].IsResponsiblePerson,
                PatientId: people[i].PatientId,
                FirstName: people[i].FirstName,
                LastName: people[i].LastName,
                DateOfBirth: people[i].DateOfBirth,
                PreferredLocation: people[i].PreferredLocation,
                PreferredProvider: people[i].PreferredProvider,
                PreferredHygienist: people[i].PreferredHygenist,
                NextPreventiveDue: people[i].NextPreventiveDue,
                NextPreventiveScheduled: people[i].NextPreventiveApptStart,
                Locations: null,
                SelectedLocation: null,
                Providers: null,
                SelectedProvider: null,
                SelectedAppointmentTypeId: null,
                SelectedAppointmentType: null,
                SelectedDuration: { Duration: this.timeIncrementStep, DurationText: this.timeIncrementStep + ' min' },
                ShowLocationError: false,
                LocationError: null,
                ShowDurationError: false,
                DurationError: null,
            };

            // filter locations that will display based on what locations the patient is a part of.
            person.Locations = [];
            for (let x = 0; x < people[i].PatientLocations.length; x++) {
                for (let y = 0; y < this.startingLocations.length; y++) {
                    if (this.startingLocations[y].LocationId === people[i].PatientLocations[x]) {
                        person.Locations.push(this.startingLocations[y]);
                    }
                }
            }

            if (person.PreferredLocation !== null) {
                person.SelectedLocation = person.PreferredLocation;
            } else {
                // grab the first one the person has access to.
                person.SelectedLocation = this.startingLocations[0].LocationId;
            }
            // ensure that providers used in this section is based on the providers for the default selected location.
            person.Providers = this.getProvidersForLocation(parseInt(person.SelectedLocation));
            if (person.PreferredProvider !== null) {
                person.SelectedProvider = person.PreferredProvider;
            }
            else {
                person.SelectedProvider = null;
            }

            list.push(person);
        }
        this.patientFamilyMembers = list;
        this.sortPatientFamilyMembersAsc();

        this.showPatientData = true;
    }

    //Sort List By first and last name in ascending order
    sortPatientFamilyMembersAsc() {
        this.patientFamilyMembers.sort((a, b) => {
            //sort by last name
            let result = a.LastName.localeCompare(b.LastName);
            //if last name's are the same, sort by first name
            if (result === 0) {
                return a.FirstName.localeCompare(b.FirstName);
            }
            else {
                return result;
            }
        })
    }

    appointmentTypeChanged($event, i) {
        this.patientFamilyMembers[i].SelectedAppointmentType = $event;
        if ($event !== null && $event.DefaultDuration !== null && $event.DefaultDuration > 0) {
            const duration = $event.DefaultDuration;
            this.patientFamilyMembers[i].SelectedDuration = { Duration: duration, DurationText: duration.toString() + ' min' };
        }
        else {
            this.patientFamilyMembers[i].SelectedDuration = { Duration: 15, DurationText: 15 + ' min' };
        }
    }

    appointmentDurationChanged($event, i) {
        this.patientFamilyMembers[i].SelectedDuration = $event;
    }

    checkChanged(event: any) {
        this.isMasterChecked = event.currentTarget.checked;

        for (let i = 0; i < this.patientFamilyMembers.length; i++) {
            this.patientFamilyMembers[i].IsChecked = this.isMasterChecked;
        }
    }

    singleCheckChanged(event: any, i: any) {
        this.patientFamilyMembers[i].IsChecked = event.currentTarget.checked;

        this.isMasterChecked = this.patientFamilyMembers.every(function (item: any) {
            return item.IsChecked === true;
        });
    }

    isAtLeastOneCheckboxChecked() {
        for (let i = 0; i < this.patientFamilyMembers.length; i++) {
            if (this.patientFamilyMembers[i].IsChecked) {
                return false;
            }
        }
        return true;
    }

    async openOrCloseFamilyScheduling(value: boolean) {
        if (value === false) {
            this.isOpen = true;
            // load locations and provider data
            this.patientFamilyMembers = [];
            this.showPatientData = false;
            this.isMasterChecked = false;
            this.startingLocations = [];
            await this.setupLocationsAndProviders();
        } else {
            this.isOpen = false;
        }
    }

    saveAppointments(value: boolean) {
        // if true save with pinned / else just save as a normal unscheduled appointment.
        let appointments = [];
        this.patientFamilyMembers.forEach(function (item) {
            if (item.IsChecked === true) {
                // set SelectedAppointmentTypeId or each item before making appointments
                if (item.SelectedAppointmentTypeId === null && item.SelectedAppointmentType !== null) {
                    item.SelectedAppointmentTypeId = item.SelectedAppointmentType.AppointmentTypeId;
                }

                const appointment = {
                    IsPinned: value, // true is pinned - false is not pinned
                    Classification: 2,
                    AppointmentId: null,
                    AppointmentTypeId: item.SelectedAppointmentTypeId,
                    UserId: item.SelectedProvider,
                    ProposedDuration: item.SelectedDuration.Duration,
                    StartDate: null,
                    EndDate: null,
                    PersonId: item.PatientId,
                    LocationId: item.SelectedLocation,
                    IsExamNeeded: false,
                    ExaminingDentist: null
                };
                appointments.push(appointment);
            }
        });

        if (appointments.length > 0) {

            this.scheduleAppointmentHttpService.createFamilyAppointments(appointments).subscribe(data => {
                if (value === true) {
                    if (appointments.length === 1) {
                        this.toastrFactory.success(
                            this.translate.instant(appointments.length + ' Unscheduled Appointment was saved successfully and added to the Clipboard.'),
                            this.translate.instant('Success'));
                    }
                    else {
                        this.toastrFactory.success(
                            this.translate.instant(appointments.length + ' Unscheduled Appointments were saved successfully and added to the Clipboard.'),
                            this.translate.instant('Success'));
                    }
                }
                else {
                    if (appointments.length === 1) {
                        this.toastrFactory.success(
                            this.translate.instant(appointments.length + ' Unscheduled Appointment was saved successfully.'),
                            this.translate.instant('Success'));
                    }
                    else {
                        this.toastrFactory.success(
                            this.translate.instant(appointments.length + ' Unscheduled Appointments were saved successfully.'),
                            this.translate.instant('Success'));
                    }
                }

                this.isOpen = false;
                this.ngOnDestroy();

                // kick off update to clipboard appointment area if needed based on if the user selected that button
                if (value === true) {
                    this.clipboardAppointmentUpdateService.updateClipboardAppointments();
                }
            }, error => {
                //TODO: We are going to show the errors taht come back ... more work is needed to do that.

                console.log(error); // temp need to show exceptions in the console so we can see them since we are not able to do so right now.
                this.handleErrors(error.error);
                this.toastrFactory.error('Failed to create family appointments please contact support regarding the problem.');
                // console.log("Appointments created");
            });
        }
        else {
            this.toastrFactory.error('Please select appointments to create.');
        }
    }

    handleErrors(err) {
        if (err.InvalidProperties) {
            for (let i = 0; i < err.InvalidProperties.length; i++) {
                for (let x = 0; x < this.patientFamilyMembers.length; x++) {
                    if (this.patientFamilyMembers[x].IsChecked === true) {
                        if (this.patientFamilyMembers[x].SelectedLocation === null && err.InvalidProperties[i].PropertyName === 'LocationId') {
                            this.patientFamilyMembers[x].ShowLocationError = true;
                            this.patientFamilyMembers[x].LocationError = err.InvalidProperties[i].ValidationMessage;
                        }
                        if (this.patientFamilyMembers[x].SelectedDuration.Duration === null && err.InvalidProperties[i].PropertyName === 'Duration') {
                            this.patientFamilyMembers[x].ShowDurationError = true;
                            this.patientFamilyMembers[x].DurationError = err.InvalidProperties[i].ValidationMessage;
                        }
                    }
                }
            }
        }
    }

    cancel(event: any) {
        this.isOpen = false;
        const data = {
            header: 'Cancel Scheduling Family?',
            message: 'Are you sure you want to cancel scheduling this family appointment?',
            confirm: 'Yes',
            cancel: 'No',
            height: 180,
            width: 350
        };
        this.confirmationRef = this.confirmationModalService.open({
            data
        });

        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    this.confirmationRef.close();
                    this.ngOnDestroy();
                    break;
                case 'close':
                    this.confirmationRef.close();
                    this.isOpen = true;
                    break;
            }
        });
    }

    ngOnDestroy() {
        if (this.confirmationRef !== undefined) {
            this.confirmationRef.close();
        }

        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
