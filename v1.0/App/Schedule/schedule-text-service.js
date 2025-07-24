(function () {
    'use strict';

    angular
        .module('Soar.Schedule')
        .service('ScheduleTextService', scheduleTextService);
    scheduleTextService.$inject = ['localize'];

    function scheduleTextService(localize) {
        var getSchedulePageText = function () {
            return {
                scheduleSetup: localize.getLocalizedString('Schedule Setup'),
                location: localize.getLocalizedString('Location'),
                treatmentRoom: localize.getLocalizedString('Treatment Room'),
                providerFull: localize.getLocalizedString('Provider'),
                today: localize.getLocalizedString('Today'),
                provider: localize.getLocalizedString('Prov'),
                providers: localize.getLocalizedString('providers'),
                room: localize.getLocalizedString('Room'),
                rooms: localize.getLocalizedString('rooms'),
                day: localize.getLocalizedString('Day'),
                week: localize.getLocalizedString('Week'),
                on: localize.getLocalizedString('On'),
                off: localize.getLocalizedString('Off'),
                privacyMode: localize.getLocalizedString('Privacy Mode'),
                apptColor: localize.getLocalizedString('Appt Color'),
                provColor: localize.getLocalizedString('Prov Color'),
                maxProviderDisplay: localize.getLocalizedString('Max Provider Display'),
                maxRoomDisplay: localize.getLocalizedString('Max Room Display'),
                less: localize.getLocalizedString('Less'),
                more: localize.getLocalizedString('More'),
                providerHours: localize.getLocalizedString('Provider Hours'),
                idealDayTemplates: localize.getLocalizedString('Ideal Day Templates'),
                setHolidays: localize.getLocalizedString('Set Holidays'),
                timeIncrements: localize.getLocalizedString('Set Time Increments'),
                regular: localize.getLocalizedString('Regular'),
                hygiene: localize.getLocalizedString('Hygiene'),
                orderColumns: localize.getLocalizedString('Order Columns'),
                minutes: localize.getLocalizedString('minutes'),
                slideInText: '<<Hide', // consider making localized
                slideOutText: 'Show>>', // consider making localized
                addALocation: localize.getLocalizedString('Add a Location'),
                addATreatmentRoom: localize.getLocalizedString('Add a Treatment Room'),
                addAProvider: localize.getLocalizedString('Add a Provider'),
                anyProvider: localize.getLocalizedString('Any Provider'),
                // Toast Messages
                appointmentModalDataFailed: localize.getLocalizedString(
                    'Failed to retrieve the data necessary for editing an appointment. Please try again'
                ),
                appointmentsOnError: localize.getLocalizedString(
                    'Failed to retrieve list of appointments. Please try again.'
                ),
                pinnedAppointmentsOnError: localize.getLocalizedString(
                    'Failed to retrieve the list of Pinned Appointments. Refresh the page to try again'
                ),
                userSettingsFailed: localize.getLocalizedString(
                    'Failed to retrieve User Settings.'
                ),
                userSettingsFailedToSave: localize.getLocalizedString(
                    'Failed to save User Settings.'
                ),
                userSettingsSaved: localize.getLocalizedString(
                    'User Settings saved successfully.'
                ),
                appointmentSaved: localize.getLocalizedString(
                    'Successfully saved appointment'
                ),
                appointmentFailedToRetrieveToSave: localize.getLocalizedString(
                    'Failed to retrieve appointment to save.'
                ),
                appointmentFailedToSave: localize.getLocalizedString(
                    'Failed to save appointment, please try again.'
                ),
                cannotCompleteAppointmentScheduledForTomorrow:
                    localize.getLocalizedString(
                        'Cannot complete an appointment scheduled for tomorrow.'
                    ),
                getProviderScheduleFailed: localize.getLocalizedString(
                    'Failed to retrieve provider-room assignments.'
                ),
                getScheduleForProviderFailed: localize.getLocalizedString(
                    'Failed to retrieve the list of Provider Hour Occurrences. Refresh the page to try again'
                ),
                getAppointmentWithDetailsFailed: localize.getLocalizedString(
                    'Failed to retrieve appointment, please try again.'
                ),
                getMedicalHistoryAlertsFailed: localize.getLocalizedString(
                    'Failed to retrieve medical history alerts. Please try again.'
                ),
                plannedServicesCreationFailed: localize.getLocalizedString(
                    'Failed to create Planned Services.'
                ),
                setScheduleDataSourceFailed: localize.getLocalizedString(
                    'Failed to show the schedule. Please refresh the page.'
                ),
            };
        };

        var getBlockModalText = function () {
            return {
                block: localize.getLocalizedString('Block'),
                date: localize.getLocalizedString('Date'),
                blockTime: localize.getLocalizedString('Block Time'),
                to: localize.getLocalizedString('to'),
                minutes: localize.getLocalizedString('minutes'),
                location: localize.getLocalizedString('Location'),
                room: localize.getLocalizedString('Room'),
                selectRoom: localize.getLocalizedString('Select Room'),
                provider: localize.getLocalizedString('Provider'),
                selectProvider: localize.getLocalizedString('Select Provider'),
                description: localize.getLocalizedString('Description'),
                notes: localize.getLocalizedString('Notes'),
                lastModified: localize.getLocalizedString('Last Modified'),
                remove: localize.getLocalizedString('Remove'),
                cancel: localize.getLocalizedString('Cancel'),
                save: localize.getLocalizedString('Save Block'),
                // not sure when this will be used yet as I still need to fix up the validation for the modal
                requiredField: localize.getLocalizedString('This field is required'),
            };
        };

        var getAppointmentModalText = function () {
            return {
                appointment: localize.getLocalizedString('Appointment'),
                unscheduledAppointment: localize.getLocalizedString(
                    'Unscheduled Appointment'
                ),
                save: localize.getLocalizedString('Save'),
                addToClipBoard: localize.getLocalizedString('Add to Clipboard'),
                addStatusNote: localize.getLocalizedString('Add Status Note'),
                addNewService: localize.getLocalizedString('Add New Service'),
                preventativeCare: localize.getLocalizedString('Preventative Care'),
                treatmentPlan: localize.getLocalizedString('Treatment Plan'),
                addAService: localize.getLocalizedString('Add a Service'),
                inCollections: localize.getLocalizedString('In Collections'),
                age: localize.getLocalizedString('age'),
                male: localize.getLocalizedString('Male'),
                female: localize.getLocalizedString('Female'),
                patient: localize.getLocalizedString('Patient'),
                overview: localize.getLocalizedString('Patient Overview'),
                appointments: localize.getLocalizedString('Appointments'),
                clinical: localize.getLocalizedString('Clinical'),
                account: localize.getLocalizedString('Account'),
                to: localize.getLocalizedString('to'),
                type: localize.getLocalizedString('Type'),
                selectAppointmentType: localize.getLocalizedString(
                    '- Select Appointment Type -'
                ),
                appointmentNotes: localize.getLocalizedString('Appointment Notes'),
                location: localize.getLocalizedString('Location'),
                notPreferredLocation: localize.getLocalizedString(
                    "This is not the patient's preferred location"
                ),
                provider: localize.getLocalizedString('Provider'),
                providerNotAvailable: localize.getLocalizedString(
                    'Preferred Provider is Not Available at the current Location'
                ),
                examiningDentist: localize.getLocalizedString('Examining Dentist'),
                notPatientsPreferredProvider: localize.getLocalizedString(
                    "This is not the patient's preferred provider!"
                ),
                room: localize.getLocalizedString('Room'),
                selectRoom: localize.getLocalizedString('- Select Room -'),
                services: localize.getLocalizedString('Services'),
                addServicesFrom: localize.getLocalizedString('Add Services From'),
                proposed: localize.getLocalizedString('Proposed'),
                treatmentPlans: localize.getLocalizedString('Treatment Plans'),
                preventiveCare: localize.getLocalizedString('Preventive Care'),
                new: localize.getLocalizedString('New'),
                description: localize.getLocalizedString('Description'),
                tooth: localize.getLocalizedString('Tooth'),
                area: localize.getLocalizedString('Area'),
                charges: localize.getLocalizedString('Charges'),
                estIn: localize.getLocalizedString('Est. Ins.'),
                ptPortion: localize.getLocalizedString('Pt Portion'),
                estAmount: localize.getLocalizedString('Estimated Amount'),
                estIns: localize.getLocalizedString('Estimated Ins.'),
                estPatientPortion: localize.getLocalizedString('Est. Patient Portion'),
                lastModified: localize.getLocalizedString('Last Modified'),
                cannotScheduleForInactive: localize.getLocalizedString(
                    'Cannot schedule appointment for inactive patient'
                ),
                cannotProposeServiceForInactive: localize.getLocalizedString(
                    'Cannot add a proposed service for inactive patient'
                ),
                cannotPreventativeCareForInactive: localize.getLocalizedString(
                    'Cannot add preventive care for inactive patient'
                ),
                pleaseSelectProvider: localize.getLocalizedString(
                    'Please select provider'
                ),
                examiningDentistPlaceHolder: localize.getLocalizedString(
                    '- Select Examining Dentist -'
                ),
                defaultPlaceHolder: localize.getLocalizedString('- Select Provider -'),
                anyProvider: localize.getLocalizedString('Any Provider'),
            };
        };

        let translatedStatuses = null;
        var getAppointmentStatusesTranslated = function (statuses) {
            if (translatedStatuses === null) {
                for (let i = 0; i < statuses.length; i++) {
                    statuses[i].descriptionTranslation = localize.getLocalizedString(
                        statuses[i].description
                    );
                }
                translatedStatuses = statuses;
            }

            return translatedStatuses;
        };

        return {
            getSchedulePageText: getSchedulePageText,
            getBlockModalText: getBlockModalText,
            getAppointmentModalText: getAppointmentModalText,
            getAppointmentStatusesTranslated: getAppointmentStatusesTranslated,
        };
    }
})();
