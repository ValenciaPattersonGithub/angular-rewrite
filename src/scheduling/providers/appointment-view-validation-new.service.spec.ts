import { TestBed, async } from '@angular/core/testing';
import { MicroServiceApiService } from 'src/security/providers';
import { LocationsService } from '../../practices/providers/locations.service';
import { AppointmentViewValidationNewService } from './appointment-view-validation-new.service';
import { DatePipe } from '@angular/common';


describe('AppointmentViewValidationNewService', () => {

    const mockLocalizeService: any = {
        getLocalizedString: () => 'translated text'
    };

    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    let mockLocationsService: LocationsService;
    let mockAppointmentViewValidationNewService: AppointmentViewValidationNewService;
    const mockReferenceDataService: any = {
        get: function (x) { return []; },
        entityNames: {
            users: [{
                UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Locations: [{ LocationId: 10127 }]
            }]
        }
    };
    const mockSoarConfigService = {};
    const mockMicroServiceApiUrlConfig = {};
    const mockMicroServiceApiService = {
    enterpriseApiUrl: 'mockEntApiUrl'
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
               
            ],
            declarations: [],
            providers: [LocationsService,
                AppointmentViewValidationNewService,
                DatePipe,
                { provide: 'SoarConfig', useValue: mockSoarConfigService },
                { provide: 'MicroServiceApiUrlConfig', useValue: mockMicroServiceApiUrlConfig },
                { provide: MicroServiceApiService, useValue: mockMicroServiceApiService },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'referenceDataService', useValue: mockReferenceDataService }
            ]
        });

        mockLocationsService = TestBed.inject(LocationsService);
        mockAppointmentViewValidationNewService = new AppointmentViewValidationNewService(mockLocationsService, mockReferenceDataService);

                    
    }));
      

    describe('sharedValidationRulesForScheduledAndUnscheduled', () => {
        
        it('patientPropertyDoesNotExistForScheduledAppointment', function () {
            //Arrange
                let scheduledAppointment: any = {
                    AppointmentId: 1,
                    Status: 6,
                    Classification: 0,//scheduled
                    StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                    EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                    ProviderAppointments: [{UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b'}],
                    Location: { LocationId: 10127 },
                    LocationId: 10127
                };
         
            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
              let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;
           
            //Assert
            expect(validationErrorMessage).toEqual('Patient Property does not exist.Patient is a required field.');
            
        });

        it('patientPropertyDoesNotExistForunscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('Patient Property does not exist.Patient is a required field.');

        });

        it('patientIdExistsForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('Patient is a required field.');

        });

        it('patientIdExistsForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('Patient is a required field.');

        });

        it('patientIsActiveForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: false,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The patient must be active.');

        });

        it('patientIsActiveForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: false,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The patient must be active.');

        });
                              
        it('locationIdPropertyDoesNotExistForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 }
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('LocationId Property does not exist.LocationId must have a value.');

        });

        it('locationIdPropertyDoesNotExistForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 }
              
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('LocationId Property does not exist.LocationId must have a value.');

        });
                
        it('roomDoesNotExistInLocationForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };

            //Act
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected room does not exist for the selected location.');

        });

        it('roomDoesNotExistInLocationForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'

            };

            //Act
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected room does not exist for the selected location.');

        });

        it('roomDoesExistInLocationForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };

            //Act
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('');

        });

        it('roomDoesExistInLocationForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'

            };

            //Act
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('');

        });


        it('plannedServicesExistForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{LocationId:10127}]
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
        
            //Assert
            expect(mockAppointmentViewValidationNewService.serviceCodeValidation).toHaveBeenCalled;

        });

        it('plannedServicesExistForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ LocationId: 10127 }]

            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
           
            //Assert
            expect(mockAppointmentViewValidationNewService.serviceCodeValidation).toHaveBeenCalled;

        });


        it('examiningDentistDoesNotExistForSelectedLocationForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                ExaminingDentist: 'ccc7bdd7-f43b-eb11-8199-0a15d365459b'
            };

            //Act
            mockAppointmentViewValidationNewService.isExaminingDentistInSelectedLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected examining dentist does not exist for the selected location.');

        });

        it('examiningDentistDoesNotExistForSelectedLocationForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                ExaminingDentist: 'ccc7bdd7-f43b-eb11-8199-0a15d365459b'
            };

            //Act
            mockAppointmentViewValidationNewService.isExaminingDentistInSelectedLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected examining dentist does not exist for the selected location.');

        });

        it('selectedLocationIsNotOneOfThePatientsLocationsForScheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10129 }, { LocationId: 10130 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected location is not one of the patients locations.');

        });

        it('selectedLocationIsNotOneOfThePatientsLocationsForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10129 }, { LocationId: 10130 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected location is not one of the patients locations.');

        });

        it('patientLocationsPropertyDoesNotExistForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('PatientLocations Property does not exist.');

        });

        it('patientLocationsPropertyDoesNotExistForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('PatientLocations Property does not exist.');

        });

        it('patientLocationsDoesNotHaveAValueForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{}]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('LocationId Property for PatientLocations does not exist.LocationId Property for PatientLocations must have a value.The selected location is not one of the patients locations.');

        });

        it('patientLocationsDoesNotHaveAValueForScheduledAppointmentForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{}]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('LocationId Property for PatientLocations does not exist.LocationId Property for PatientLocations must have a value.The selected location is not one of the patients locations.');

        });

        it('patientLocationsPropertyDoesNotExistForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('PatientLocations Property does not exist.');

        });

        it('patientLocationsLocationIdDoesNotHaveAValueForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{LocationId: null}]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('LocationId Property for PatientLocations must have a value.The selected location is not one of the patients locations.');

        });

        it('patientLocationsLocationIdDoesNotHaveAValueForScheduledAppointmentForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: null }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('LocationId Property for PatientLocations must have a value.The selected location is not one of the patients locations.');

        });

        it('isExaminingDentistInSelectedLocationIsCalledForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                ExaminingDentist: 'ccc7bdd7-f43b-eb11-8199-0a15d365459b'
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);
           
            //Assert
            expect(mockAppointmentViewValidationNewService.isExaminingDentistInSelectedLocation).toHaveBeenCalled;

        });

        it('isExaminingDentistInSelectedLocationIsCalledForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                ExaminingDentist: 'ccc7bdd7-f43b-eb11-8199-0a15d365459b'

            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);
           
            //Assert
            expect(mockAppointmentViewValidationNewService.isExaminingDentistInSelectedLocation).toHaveBeenCalled;

        });

        it('isSelectedLocationOneOfThePatientsAvailableLocationIsCalledForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(scheduledAppointment);

            //Assert
            expect(mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations).toHaveBeenCalled;

        });

        it('isSelectedLocationOneOfThePatientsAvailableLocationIsCalledForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127

            };

            //Act
            mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled(unscheduledAppointment);

            //Assert
            expect(mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations).toHaveBeenCalled;

        });
        
    });

    describe('serviceCodeValidation', () => {
        it('codePropertyDoesNotExistOnServiceForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ LocationId: 10128, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('Code Property does not exist on service.Code must have a value on service.');

        });

        it('codePropertyDoesNotExistOnServiceForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ LocationId: 10128, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('Code Property does not exist on service.Code must have a value on service.');

        });

        it('codeDoesNotHaveAValueOnServiceForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: null, LocationId: 10128, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('Code must have a value on service.');

        });

        it('codeDoesNotHaveAValueOnServiceForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: null, LocationId: 10128, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('Code must have a value on service.');

        });

        it('plannedServicesLocationDoesNotMatchAppointmentLocationForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120',LocationId: 10128, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add'}]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The location is incorrect for service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('plannedServicesLocationDoesNotMatchAppointmentLocationForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{Code: 'D0120', LocationId: 10128, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState:'Add'}]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The location is incorrect for service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('providerIsNotOnServiceForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{Code: 'D0120', LocationId: 10127, ProviderId: '', ObjectState: 'Add' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('A provider must be selected for service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('providerIsNotOnServiceForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: '', ObjectState: 'Add' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('A provider must be selected for service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('addingNewServiceWithObjectStateUpdateWithNoServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Update'}]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Add" for the new service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('addingNewServiceWithObjectStateUpdateWithNoServiceTransactionIdForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Update' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Add" for the new service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('addingNewServiceWithObjectStateNoneWithNoServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'None' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Add" for the new service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('addingNewServiceWithObjectStateNoneWithNoServiceTransactionIdForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'None' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Add" for the new service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('addingNewServiceWithObjectStateAsEmptyStringWithNoServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: '' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Add" for the new service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('addingNewServiceWithObjectStateAsEmptyStringWithNoServiceTransactionIdForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: '' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Add" for the new service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('addingNewServiceWithObjectStateAddWithNoServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('');
            
        });

        it('addingNewServiceWithObjectStateAddWithNoServiceTransactionIdForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('');

        });

        it('updateServiceWithObjectStateAddWithServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Update" for the proposed service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('updateServiceWithObjectStateAddWithServiceTransactionIdForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Update" for the proposed service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('updateServiceWithObjectStateDeleteWithServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Delete', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Update" for the proposed service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('updateServiceWithObjectStateDeleteWithServiceTransactionIdForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Delete', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Update" for the proposed service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('updateServiceWithObjectStateNoneWithServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'None', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Update" for the proposed service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('updateServiceWithObjectStateNoneWithServiceTransactionIdForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'None', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Update" for the proposed service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('updateServiceWithObjectStateEmptyStringWithServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: '', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Update" for the proposed service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('updateServiceWithObjectStateEmptyStringWithServiceTransactionIdForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: '', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The object state must be "Update" for the proposed service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('updateServiceWithObjectStateUpdateWithServiceTransactionIdForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Update', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('');

        });

        it('completedAppointmentThatHasBeenCheckedOutForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 3,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae', EncounterId: 'da4c69ee-b24b-451d-a478-2d3cbc06b4ae' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The service status is a completed service that has been checked out.');

        });

        it('appointmentThatIsReadyForCheckoutForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae', EncounterId: 'da4c69ee-b24b-451d-a478-2d3cbc06b4ae' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForService = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The service status is in ready for checkout.');

        });

        it('providerOnServiceIsNotInSelectedLocationForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The provider is not valid for the location for service: ' + scheduledAppointment.PlannedServices[0].Code + '.');

        });

        it('providerOnServiceIsNotInSelectedLocationForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ Code: 'D0120', LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Update', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The provider is not valid for the location for service: ' + unscheduledAppointment.PlannedServices[0].Code + '.');
        });

        it('isProviderInSelectedLocationIsCalledForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]
            };

            //Act
            mockAppointmentViewValidationNewService.serviceCodeValidation(scheduledAppointment);
            
            //Assert
            expect(mockAppointmentViewValidationNewService.isProviderInSelectedLocation).toHaveBeenCalled;

        });

        it('isProviderInSelectedLocationIsCalledForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Update', ServiceTransactionId: 'da5d69ee-b24b-451d-a478-2d3cbc06b4ae' }]

            };

            //Act
            mockAppointmentViewValidationNewService.serviceCodeValidation(unscheduledAppointment);
           
            //Assert
            expect(mockAppointmentViewValidationNewService.isProviderInSelectedLocation).toHaveBeenCalled;
        });
    });

    describe('providerAppointmentsValidation', () => {

        it('noSelectedProviderForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ AppointmentId: "1"}],
                LocationId: 10127,
             };

            //Act
            mockAppointmentViewValidationNewService.providerAppointmentsValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('At least one provider timeslot is required to be checked.');

        });

        it('atLeastOneSelectedProviderForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ AppointmentId: "1", UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: {LocationId: 10127 },
                LocationId: 10127,
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.providerAppointmentsValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('');

        });

        it('atLeastOneSelectedProviderForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ AppointmentId: "1", UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.providerAppointmentsValidation(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected provider does not exist for the selected location.');

        });

        it('isProviderInSelectedLocationIsCalledForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                PlannedServices: [{ LocationId: 10127, ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b', ObjectState: 'Add' }]
            };

            //Act
            mockAppointmentViewValidationNewService.providerAppointmentsValidation(scheduledAppointment);

            //Assert
            expect(mockAppointmentViewValidationNewService.isProviderInSelectedLocation).toHaveBeenCalled;

        });

    });

    describe('validateAppointment', () => {
        it('expectSharedValidationRulesForScheduledAndUnscheduledToBeCalledForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.validateAppointment(unscheduledAppointment);
            
            //Assert
            expect(mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled).toHaveBeenCalled;

        });

        it('expectSharedValidationRulesForScheduledAndUnscheduledToBeCalledForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127
            };


            //Act
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);

            //Assert
            expect(mockAppointmentViewValidationNewService.sharedValidationRulesForScheduledAndUnscheduled).toHaveBeenCalled;

        });

        it('providerDoesExistInLocationForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.validateAppointment(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected provider does not exist for the selected location.');

        });


        it('isProviderInSelectedLocationIsCalledForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.validateAppointment(unscheduledAppointment);
            
            //Assert
            expect(mockAppointmentViewValidationNewService.isProviderInSelectedLocation).toHaveBeenCalled;

        });

        it('providerAppointmentsPropertyDoesNotExistForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('ProviderAppointments Property does not exist.');

        });

        it('treamentRoomPropertyDoesNotExistForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b'}],
                Location: { LocationId: 10127 },
                LocationId: 10127
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('TreatmentRoomId Property does not exist.Room is a required field.');

        });
        
        it('treamentRoomIdRequiredForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: ''
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('Room is a required field.');

        });

        it('startTimePropertyDoesNotExistForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('StartTime Property does not exist.StartTime is a required field.');

        });

        it('startTimeIsRequiredForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: '',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('StartTime is a required field.');

        });

        it('endTimePropertyDoesNotExistForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled StartTime: 
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('EndTime Property does not exist.EndTime is a required field.');

        });

        it('endTimeIsRequiredForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: '',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('EndTime is a required field.');

        });

        it('endTimeMustBeGreaterThanStartTimeForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The EndTime must be greater than and not equal to the StartTime.');

        });

        it('endTimeCannotBeEqualToStartTimeForScheduledAppointment', function () {
            //Arrange
            let scheduledAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 0,//scheduled
                StartTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderAppointments: [{ UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b' }],
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isSelectedLocationOneOfThePatientsAvailableLocations = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.isProviderInSelectedLocationForProviderAppointments = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(scheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The EndTime must be greater than and not equal to the StartTime.');

        });
              
                
        it('locationIdPropertyDoesNotExistForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('LocationId Property does not exist.LocationId must have a value.');

        });

        it('treamentRoomPropertyDoesNotExistForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };


            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('TreatmentRoomId Property does not exist.');

        });

        it('roomDoesNotExistInLocationForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected room does not exist for the selected location.');

        });

        it('providerIdPropertyDoesNotExistForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('ProviderId Property does not exist.');

        });

        it('treatmentRoomOrProviderDoesNotExistForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: '',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: ''

            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(false);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('A room or a provider is required.');
        });

        it('startTimePropertyDoesNotExistForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('StartTime Property does not exist.StartTime is a required field.');

        });

        it('startTimeIsRequiredForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                StartTime: '',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('StartTime is a required field.');

        });

        it('endTimePropertyDoesNotExistForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('EndTime Property does not exist.EndTime is a required field.');

        });

        it('endTimeIsRequiredForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: '',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('EndTime is a required field.');

        });


        it('endTimeMustBeGreaterThanStartTimeForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };


            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The EndTime must be greater than and not equal to the StartTime.');

        });

        it('endTimeCannotBeEqualToStartTimeForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The EndTime must be greater than and not equal to the StartTime.');

        });

        it('providerDoesNotExistInLocationForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127,
                TreatmentRoomId: '181bba05-d128-4c24-9d9b-92590e058ba7'
            };

            //Act
            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(false);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('The selected provider does not exist for the selected location.');

        });

        it('providerInSelectedLocationIsCalledForBlockAppointment', function () {
            //Arrange
            let blockAppointment: any = {
                AppointmentId: 1,
                Status: 5,
                Classification: 1,//block
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            //Act
            mockAppointmentViewValidationNewService.validateAppointment(blockAppointment);
            
            //Assert
            expect(mockAppointmentViewValidationNewService.isProviderInSelectedLocation).toHaveBeenCalled;

        });

        it('StartTimeShouldNotBePresentForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                StartTime: 'Fri Nov 05 2021 12:00:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('StartTime should not be on an unscheduled appointment.');

        });

        it('EndTimeShouldNotBePresentForUnscheduledAppointment', function () {
            //Arrange
            let unscheduledAppointment: any = {
                AppointmentId: 1,
                Status: 6,
                Classification: 2,//unscheduled
                EndTime: 'Fri Nov 05 2021 12:15:00 GMT-0500 (Central Daylight Time) {}',
                Patient: {
                    PatientId: '54f01f08-0929-419a-9d7b-a09e18abb379',
                    IsActive: true,
                    PatientLocations: [{ LocationId: 10127 }]
                },
                ProviderId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Location: { LocationId: 10127 },
                LocationId: 10127
            };

            mockAppointmentViewValidationNewService.isProviderInSelectedLocation = jasmine.createSpy().and.returnValue(true);
            mockLocationsService.doesRoomExistInLocation = jasmine.createSpy().and.returnValue(true);
            mockAppointmentViewValidationNewService.validateAppointment(unscheduledAppointment);
            let validationErrorMessage = mockAppointmentViewValidationNewService.validationErrorMessages;

            //Assert
            expect(validationErrorMessage).toEqual('EndTime should not be on an unscheduled appointment.');

        });
       
    });

});
