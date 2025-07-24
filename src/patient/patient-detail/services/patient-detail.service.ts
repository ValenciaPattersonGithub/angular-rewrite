import { Injectable, Inject } from '@angular/core';
import { PatientHttpService } from '../../common/http-providers/patient-http.service';

import { Patient } from '../../common/models/patient.model';
import { PatientOverview } from 'src/patient/common/models/patient-overview.model';
import { AppointmentPreview } from 'src/scheduling/common/models/appointment-preview.model';

@Injectable()
export class PatientDetailService {
    currentPatientDetail: Patient;
    activePatientId: string;

    constructor(@Inject('localize') private localize,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('TimeZoneFactory') private timeZoneFactory,
        @Inject('StaticData') private staticData,
        @Inject(PatientHttpService) private patientHttpService
    ) { }

    setActivePatientId(id) {
        this.activePatientId = id;
    }
    getActivePatientId() {
        return this.activePatientId;
    }

    /* Public */
    getPatientDashboardOverviewByPatientId(patientId: string): Promise<PatientOverview> {
        // using promises in this way causes problems with how the typescript compiler works so to fix it we set the instance so we can control the behavior
        var instance = this;
        let promiseResult = new Promise<PatientOverview>(function (resolve, reject) {
            const promises = [];

            promises.push(Promise.resolve(instance.getPatientOverviewByPatientIdPromise(patientId)));
            promises.push(Promise.resolve(instance.getPatientDetailsPromise(patientId)));
            promises.push(Promise.resolve(instance.getPatientNextAppointmentPromise(patientId)));

            Promise.all(promises).then(([overview, patientDetails, nextAppointment]) => {
                let currentPatientOverview = overview;
                currentPatientOverview.Profile = patientDetails;

                let patientNextAppointmentResult = nextAppointment;
                if (patientNextAppointmentResult && patientNextAppointmentResult.StartTime && patientNextAppointmentResult.UserId) {
                    currentPatientOverview.Profile.NextAppointment = patientNextAppointmentResult;

                    // localize the startTime of the next appointment to the timezone of the location for which the appointment is scheduled
                    let nextApptLocalizedStartTime = instance.getNextAppointmentStartTimeLocalized(currentPatientOverview.Profile.NextAppointment);
                    currentPatientOverview.Profile.NextAppointment.$$StartTimeLocal = nextApptLocalizedStartTime;

                    var secondPromises = [];
                    secondPromises.push(Promise.resolve(instance.getNextAppointmentProviderDisplayName(currentPatientOverview.Profile.NextAppointment)));
                    secondPromises.push(Promise.resolve(instance.patientHttpService.getPatientAccountOverviewByAccountId(currentPatientOverview.Profile.PersonAccount.AccountId)));
                    Promise.all(secondPromises).then(([providerDisplay, patientAccount]) => {
                        currentPatientOverview.Profile.NextAppointment.nextAppointmentProviderDisplayName = providerDisplay;
                        currentPatientOverview.AccountMemberOverview = patientAccount;
                        resolve(currentPatientOverview);
                    }).catch(error => {
                        instance.toastrFactory.error('There was an error while attempting to retrieve data.', 'Server Error');
                        reject();
                    });
                } else {
                    if (currentPatientOverview.Profile && currentPatientOverview.Profile.PersonAccount
                        && currentPatientOverview.Profile.PersonAccount.AccountId) {                        
                        instance.patientHttpService.getPatientAccountOverviewByAccountId(currentPatientOverview.Profile.PersonAccount.AccountId)
                            .then((accountResponse) => {
                                currentPatientOverview.AccountMemberOverview = accountResponse;

                                resolve(currentPatientOverview);
                            }).catch(error => {
                                instance.toastrFactory.error('There was an error while attempting to retrieve data.', 'Server Error');
                                reject();
                            });
                    }
                    else {
                        //This patient had no responsible party set
                        currentPatientOverview.AccountMemberOverview = { AccountMembersProfileInfo: []}
                        resolve(currentPatientOverview);
                    }
                    
                }
            }).catch(error => {                
                instance.toastrFactory.error('There was an error while attempting to retrieve data.', 'Server Error');
                reject();
            });
        });
        return promiseResult;
    }
    /* End Public */

    async getNextAppointmentProviderDisplayName(nextAppointment: AppointmentPreview): Promise<string> {
        let providerDisplayName = '';

        let users = this.referenceDataService.get(this.referenceDataService.entityNames.users);
        if (users) {
            let nextAppointmentProvider = users.find(user => user.UserId === nextAppointment.UserId);

            // get the provider types from static data via our async wrapper
            let nextApptProviderType = {};
            let providerTypesResponse = await this.getProviderTypesPromise();

            if (providerTypesResponse && providerTypesResponse.Value) {
                let providerTypes = providerTypesResponse.Value;

                // get the location object from our provider object, so we know their ProviderTypeId for the next appointment's location
                let providerLocation = nextAppointmentProvider.Locations.find(location => location.LocationId === nextAppointment.LocationId);

                nextApptProviderType = providerTypes.find(providerType => providerType.Id === providerLocation.ProviderTypeId);
            }

            // display name format: F. Last ProviderType
            // Billy Schreiber, Dentist would be: B. Schreiber Dentist
            //    pbi 443652
            providerDisplayName = this.getProviderDisplayName(nextAppointmentProvider, nextApptProviderType);
        }

        return providerDisplayName;
    }

    getNextAppointmentStartTimeLocalized(nextAppointment: AppointmentPreview): string {
        let localizedStartTime = '';
        let locations = this.referenceDataService.get(this.referenceDataService.entityNames.locations);

        if (locations) {
            let nextApptLocation = locations.find(location => location.LocationId === nextAppointment.LocationId);

            localizedStartTime = this.timeZoneFactory.ConvertDateToMomentTZ(nextAppointment.StartTime, nextApptLocation.Timezone);
        }

        return localizedStartTime;
    }

    getProviderDisplayName(provider, providerType) {

        let providerFirstInitial = '';
        if (provider.FirstName) {
            providerFirstInitial = provider.FirstName.charAt(0);
        }

        let providerLastName = '';
        if (provider.LastName) {
            providerLastName = provider.LastName;
        }

        let providerFullNameDisplay = '';
        if (providerFirstInitial) {
            providerFullNameDisplay = providerFirstInitial + '.';
        }

        if (providerLastName) {
            if (providerFirstInitial) {
                providerFullNameDisplay = providerFullNameDisplay + ' '
            }

            providerFullNameDisplay = providerFullNameDisplay + providerLastName;
        }

        if (providerType && providerType.Name) {
            if (providerFullNameDisplay !== '') {
                providerFullNameDisplay = providerFullNameDisplay + ' ';
            }
            providerFullNameDisplay = providerFullNameDisplay + providerType.Name;
        }

        return providerFullNameDisplay;
    }

    async getProviderTypesPromise(): Promise<any> {
        return this.staticData.ProviderTypes();
    }

    async getPatientOverviewByPatientIdPromise(patientId: string): Promise<PatientOverview> {

        try {
            let patientOverview = await this.patientHttpService.getPatientDashboardOverviewByPatientId(patientId);
            return patientOverview;
        } catch (error) {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}.', ['Patient Overview']), 'Error');
        }

    }

    async getPatientDetailsPromise(patientId: string): Promise<Patient> {

        try {
            let patientDetail = await this.patientHttpService.getPatientByPatientId(patientId);

            patientDetail = this.setPatientPreferredDentist(patientDetail);
            patientDetail = this.setPatientPreferredHygienist(patientDetail);

            return patientDetail;
        } catch (error) {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}.', ['Patient Details']), 'Error');
        }
    }

    async getPatientNextAppointmentPromise(patientId: string): Promise<AppointmentPreview> {
        try {
            let patientNextAppointment = await this.patientHttpService.getPatientNextAppointment(patientId);

            return patientNextAppointment;
        } catch (error) {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}.', ['Next Scheduled Appointment']), 'Error');
        }
    }

    setPatientPreferredDentist(patient: Patient): Patient {

        if (patient.PreferredDentist) {
            let preferredDentistUser = null;
            let users: Array<any> = this.referenceDataService.get(this.referenceDataService.entityNames.users);

            if (users && users.length > 0) {
                preferredDentistUser = users.find(u => u.UserId === patient.PreferredDentist);
            }

            if (preferredDentistUser) {
                let pd = preferredDentistUser.ProfessionalDesignation ? ' ' + preferredDentistUser.ProfessionalDesignation : '';
                patient.preferredDentist = preferredDentistUser.FirstName.substring(0, 1) + '. ' + preferredDentistUser.LastName + ((preferredDentistUser.SuffixName != null && preferredDentistUser.SuffixName !== '') ? ' ' + preferredDentistUser.SuffixName : '') + pd;

                patient.inactivePreferredDentist = !preferredDentistUser.IsActive || preferredDentistUser.ProviderTypeId === 4;
            }
        } else {
            patient.preferredDentist = 'No Preference';
            patient.inactivePreferredDentist = false;
        }

        return patient;
    }

    setPatientPreferredHygienist(patient: Patient): Patient {
        if (patient.PreferredHygienist) {
            let preferredHygienistUser = null;
            let users: Array<any> = this.referenceDataService.get(this.referenceDataService.entityNames.users);

            if (users && users.length > 0) {
                preferredHygienistUser = users.find(u => u.UserId === patient.PreferredHygienist);
            }

            if (preferredHygienistUser) {
                let pd = preferredHygienistUser.ProfessionalDesignation ? ' ' + preferredHygienistUser.ProfessionalDesignation : '';
                patient.preferredHygienist = preferredHygienistUser.FirstName.substring(0, 1) + '. ' + preferredHygienistUser.LastName + ((preferredHygienistUser.SuffixName != null && preferredHygienistUser.SuffixName !== '') ? ' ' + preferredHygienistUser.SuffixName : '') + pd;

                patient.inactivePreferredHygienist = !preferredHygienistUser.IsActive || preferredHygienistUser.ProviderTypeId === 4;
            }
        } else {
            patient.preferredHygienist = 'No Preference';
            patient.inactivePreferredHygienist = false;
        }

        return patient;
    }
    /* End Private */
}
