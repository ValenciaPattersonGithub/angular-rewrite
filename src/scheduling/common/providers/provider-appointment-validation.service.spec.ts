import { TestBed,async} from '@angular/core/testing';
import { ProviderAppointmentValidationService } from './provider-appointment-validation.service';


describe('ProviderAppointmentValidationService ProviderTypeId Equals One (Dentist)', () => {
    let mockProviderAppointmentValidationService: ProviderAppointmentValidationService;
    const mockReferenceDataService: any = {
        get: jasmine.createSpy().and.returnValue([{
            UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
            Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 1 }]
        }]),
        entityNames: {
            users: [{
                UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 1 }]
            }]
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [

            ],
            declarations: [],
            providers: [ProviderAppointmentValidationService,
                { provide: 'referenceDataService', useValue: mockReferenceDataService }
            ]
        });

        mockProviderAppointmentValidationService = new ProviderAppointmentValidationService(mockReferenceDataService);
    }));

    it('should be created', () => {
        expect(mockProviderAppointmentValidationService).toBeTruthy();
    });

    it('isExaminingDentistValid when performedByProviderTypeId does not equal 2 and examining dentist is null returns true', () => {

        //Arrange

        let examiningDentistId = null;
        let locationId = '10127';
        let performedByProviderTypeId = 1;

        //Act
        let isExaminingDentistValid = mockProviderAppointmentValidationService.isExaminingDentistValid(examiningDentistId, locationId, performedByProviderTypeId);

        //Assert
        expect(isExaminingDentistValid).toEqual(true);
    });

    it('isExaminingDentistValid when performedByProviderTypeId equals 2, examiningdentist is not null and equals UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 1, returns true', () => {

        //Arrange

        let examiningDentistId = 'bcd7bdd7-f43b-eb11-8199-0a15d365459b';
        let locationId = '10127';
        let performedByProviderTypeId = 2;

        //Act
        let isExaminingDentistValid = mockProviderAppointmentValidationService.isExaminingDentistValid(examiningDentistId, locationId, performedByProviderTypeId);

        //Assert
        expect(isExaminingDentistValid).toEqual(true);
    });

    it('areProvidersOnPlannedServicesValid ProviderIds is empty, returns true', () => {

        //Arrange
        let locationId = '10127';
        let providerIds = [];

        //Act
        let areProvidersOnPlannedServicesValid = mockProviderAppointmentValidationService.areProvidersOnPlannedServicesValid(providerIds, locationId);

        //Assert
        expect(areProvidersOnPlannedServicesValid).toEqual(true);
    });

    it('areProvidersOnPlannedServicesValid ProviderIds has value, ProviderIds equal UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 1 (For Dentist), returns true', () => {

        //Arrange
        let locationId = '10127';
        let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];

        //Act
        let areProvidersOnPlannedServicesValid = mockProviderAppointmentValidationService.areProvidersOnPlannedServicesValid(providerIds, locationId);

        //Assert
        expect(areProvidersOnPlannedServicesValid).toEqual(true);
    });

    it('areProvidersValid ProviderIds has value, ProviderIds equal UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 1 (For Dentist), returns true', () => {

        //Arrange
        let locationId = '10127';
        let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];

        //Act
        let areProvidersValid = mockProviderAppointmentValidationService.areProvidersValid(providerIds, locationId);

        //Assert
        expect(areProvidersValid).toEqual(true);
    });

    it('isProviderValidOnAllAppointmentViewFields Providers, Examining Dentist, and Providers on Services are valid, returns true', () => {

        //Arrange
        let locationId = '10127';
        let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];
        let plannedServiceProviderIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];
        let examiningDentistId = 'bcd7bdd7-f43b-eb11-8199-0a15d365459b';
        let performedByProviderTypeId = 1;

        //Act
        let areAllProvidersValid = mockProviderAppointmentValidationService.isProviderValidOnAllAppointmentViewFields(examiningDentistId, locationId, providerIds, plannedServiceProviderIds, performedByProviderTypeId);

        //Assert
        expect(areAllProvidersValid).toEqual(true);
    });
});

describe('ProviderAppointmentValidationService ProviderTypeId Equals Two (Hygienist)', () => {
        let mockProviderAppointmentValidationService: ProviderAppointmentValidationService;
        const mockReferenceDataService: any = {
            get: jasmine.createSpy().and.returnValue([{
                UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 2 }]
            }]),
            entityNames: {
                users: [{
                    UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                    Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 2 }]
                }]
            }
        };

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [

                ],
                declarations: [],
                providers: [ProviderAppointmentValidationService,
                    { provide: 'referenceDataService', useValue: mockReferenceDataService }
                ]
            });

             mockProviderAppointmentValidationService = new ProviderAppointmentValidationService(mockReferenceDataService);
        }));

        it('isExaminingDentistValid when performedByProviderTypeId equals 2, examiningdentist is not null and equals UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 2 (Hygienist), returns false', () => {

            //Arrange
            let examiningDentistId = 'bcd7bdd7-f43b-eb11-8199-0a15d365459b';
            let locationId = '10127';
            let performedByProviderTypeId = 2;

            //Act
            let isExaminingDentistValid = mockProviderAppointmentValidationService.isExaminingDentistValid(examiningDentistId, locationId, performedByProviderTypeId);

            //Assert
            expect(isExaminingDentistValid).toEqual(false);
        });

        it('areProvidersOnPlannedServicesValid ProviderIds has value, ProviderIds equal UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 2 (For Hygienist), returns true', () => {

            //Arrange
            let locationId = '10127';
            let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];

            //Act
            let areProvidersOnPlannedServicesValid = mockProviderAppointmentValidationService.areProvidersOnPlannedServicesValid(providerIds, locationId);

            //Assert
            expect(areProvidersOnPlannedServicesValid).toEqual(true);
        });

        it('areProvidersValid ProviderIds has value, ProviderIds equal UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 2 (For Hygienist), returns true', () => {

            //Arrange
            let locationId = '10127';
            let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];

            //Act
            let areProvidersValid = mockProviderAppointmentValidationService.areProvidersValid(providerIds, locationId);

            //Assert
            expect(areProvidersValid).toEqual(true);
        });
});

describe('ProviderAppointmentValidationService ProviderTypeId Equals Four (Not a Provider)', () => {
    let mockProviderAppointmentValidationService: ProviderAppointmentValidationService;
    const mockReferenceDataService: any = {
        get: jasmine.createSpy().and.returnValue([{
            UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
            Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 1 }]
        },
        {
            UserId: 'ccc7bdd7-f43b-eb11-8199-2a30d123456b',
            Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 4 }]
        }

        ]),
        entityNames: {
            users: [{
                UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 1 }]
            },
            {
                UserId: 'ccc7bdd7-f43b-eb11-8199-2a30d123456b',
                Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 4 }]
            }]
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [

            ],
            declarations: [],
            providers: [ProviderAppointmentValidationService,
                { provide: 'referenceDataService', useValue: mockReferenceDataService }
            ]
        });

        mockProviderAppointmentValidationService = new ProviderAppointmentValidationService(mockReferenceDataService);
    }));
        
    it('areProvidersOnPlannedServicesValid ProviderIds has value, ProviderIds is not empty, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 4 (Not a Provider), returns false', () => {

        //Arrange
        let locationId = "10127";
        let providerIds = ["ccc7bdd7-f43b-eb11-8199-2a30d123456b"];

        //Act
        let areProvidersOnPlannedServicesValid = mockProviderAppointmentValidationService.areProvidersOnPlannedServicesValid(providerIds, locationId);

        //Assert
        expect(areProvidersOnPlannedServicesValid).toEqual(false);
    });
        
    it('isExaminingDentistValid examiningdentist is not null, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 4 (Not a Provider), returns false', () => {

        //Arrange
        let locationId = "10127";
        let examiningDentistId = "ccc7bdd7-f43b-eb11-8199-2a30d123456b";
        let performedByProviderTypeId = 2;

        //Act
        let isExaminingDentistValid = mockProviderAppointmentValidationService.isExaminingDentistValid(examiningDentistId, locationId, performedByProviderTypeId);

        //Assert
        expect(isExaminingDentistValid).toEqual(false);
    });

    it('areProvidersValid ProviderIds has value, ProviderIds is not empty, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 4 (Not a Provider), returns false', () => {

        //Arrange
        let locationId = "10127";
        let providerIds = ["ccc7bdd7-f43b-eb11-8199-2a30d123456b"];

        //Act
        let areProvidersValid = mockProviderAppointmentValidationService.areProvidersValid(providerIds, locationId);

        //Assert
        expect(areProvidersValid).toEqual(false);
    });

    it('isProviderValidOnAllAppointmentViewFields Providers valid, Examining Dentist valid, and Providers on Services not valid, returns false', () => {

        //Arrange
        let locationId = '10127';
        let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];
        let plannedServiceProviderIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b', 'ccc7bdd7-f43b-eb11-8199-2a30d123456b'];
        let examiningDentistId = 'bcd7bdd7-f43b-eb11-8199-0a15d365459b';
        let performedByProviderTypeId = 1;

        //Act
        let areAllProvidersValid = mockProviderAppointmentValidationService.isProviderValidOnAllAppointmentViewFields(examiningDentistId, locationId, providerIds, plannedServiceProviderIds, performedByProviderTypeId);

        //Assert
        expect(areAllProvidersValid).toEqual(false);
    });

    it('isProviderValidOnAllAppointmentViewFields Providers valid, Examining Dentist not valid, and Providers on Services not valid, returns false', () => {

        //Arrange
        let locationId = '10127';
        let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];
        let plannedServiceProviderIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b', 'ccc7bdd7-f43b-eb11-8199-2a30d123456b'];
        let examiningDentistId = 'ccc7bdd7-f43b-eb11-8199-2a30d123456b';
        let performedByProviderTypeId = 1;

        //Act
        let areAllProvidersValid = mockProviderAppointmentValidationService.isProviderValidOnAllAppointmentViewFields(examiningDentistId, locationId, providerIds, plannedServiceProviderIds, performedByProviderTypeId);

        //Assert
        expect(areAllProvidersValid).toEqual(false);
    });

    it('isProviderValidOnAllAppointmentViewFields Providers not valid, Examining Dentist not valid, and Providers on Services not valid, returns false', () => {

        //Arrange
        let locationId = '10127';
        let providerIds = ['ccc7bdd7-f43b-eb11-8199-2a30d123456b'];
        let plannedServiceProviderIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b', 'ccc7bdd7-f43b-eb11-8199-2a30d123456b'];
        let examiningDentistId = 'ccc7bdd7-f43b-eb11-8199-2a30d123456b';
        let performedByProviderTypeId = 1;

        //Act
        let areAllProvidersValid = mockProviderAppointmentValidationService.isProviderValidOnAllAppointmentViewFields(examiningDentistId, locationId, providerIds, plannedServiceProviderIds, performedByProviderTypeId);

        //Assert
        expect(areAllProvidersValid).toEqual(false);
    });

    describe('ProviderAppointmentValidationService ProviderTypeId Equals Three (Assistant)', () => {
        let mockProviderAppointmentValidationService: ProviderAppointmentValidationService;
        const mockReferenceDataService: any = {
            get: jasmine.createSpy().and.returnValue([{
                UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 3 }]
            }]),
            entityNames: {
                users: [{
                    UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                    Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 3 }]
                }]
            }
        };

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [

                ],
                declarations: [],
                providers: [ProviderAppointmentValidationService,
                    { provide: 'referenceDataService', useValue: mockReferenceDataService }
                ]
            });

            mockProviderAppointmentValidationService = new ProviderAppointmentValidationService(mockReferenceDataService);
        }));
                
        it('areProvidersOnPlannedServicesValid ProviderIds has value, ProviderIds equal UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 3 (For Assistant), returns true', () => {

            //Arrange
            let locationId = '10127';
            let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];

            //Act
            let areProvidersOnPlannedServicesValid = mockProviderAppointmentValidationService.areProvidersOnPlannedServicesValid(providerIds, locationId);

            //Assert
            expect(areProvidersOnPlannedServicesValid).toEqual(true);
        });

        it('areProvidersValid ProviderIds has value, ProviderIds equal UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 3 (For Assistant), returns true', () => {

            //Arrange
            let locationId = '10127';
            let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];

            //Act
            let areProvidersOnPlannedServicesValid = mockProviderAppointmentValidationService.areProvidersValid(providerIds, locationId);

            //Assert
            expect(areProvidersOnPlannedServicesValid).toEqual(true);
        });
    });

    describe('ProviderAppointmentValidationService ProviderTypeId Equals Five (Other)', () => {
        let mockProviderAppointmentValidationService: ProviderAppointmentValidationService;
        const mockReferenceDataService: any = {
            get: jasmine.createSpy().and.returnValue([{
                UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 5 }]
            }]),
            entityNames: {
                users: [{
                    UserId: 'bcd7bdd7-f43b-eb11-8199-0a15d365459b',
                    Locations: [{ LocationId: '10127', IsActive: true, ProviderTypeId: 5 }]
                }]
            }
        };

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [

                ],
                declarations: [],
                providers: [ProviderAppointmentValidationService,
                    { provide: 'referenceDataService', useValue: mockReferenceDataService }
                ]
            });

            mockProviderAppointmentValidationService = new ProviderAppointmentValidationService(mockReferenceDataService);
        }));

        it('areProvidersOnPlannedServicesValid ProviderIds has value, ProviderIds equal UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 5 (For Other), returns true', () => {

            //Arrange
            let locationId = '10127';
            let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];

            //Act
            let areProvidersOnPlannedServicesValid = mockProviderAppointmentValidationService.areProvidersOnPlannedServicesValid(providerIds, locationId);

            //Assert
            expect(areProvidersOnPlannedServicesValid).toEqual(true);
        });

        it('areProvidersValid ProviderIds has value, ProviderIds equal UserId, locationId matches, locationIsActive = true, and location.ProviderTypeId equals 5 (For Other), returns true', () => {

            //Arrange
            let locationId = '10127';
            let providerIds = ['bcd7bdd7-f43b-eb11-8199-0a15d365459b'];

            //Act
            let areProvidersOnPlannedServicesValid = mockProviderAppointmentValidationService.areProvidersValid(providerIds, locationId);

            //Assert
            expect(areProvidersOnPlannedServicesValid).toEqual(true);
        });
    });
});
