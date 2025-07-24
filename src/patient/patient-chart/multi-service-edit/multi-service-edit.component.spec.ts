import { compileNgModule } from '@angular/compiler';
import { async, ComponentFixture, TestBed, fakeAsync, flushMicrotasks, flush } from '@angular/core/testing';

import { MultiServiceEditComponent } from './multi-service-edit.component';
import { MULTI_SERVICE_EDIT_DATA } from './multi-service-edit.data';

describe('MultiServiceEditComponent', () => {
    let component: MultiServiceEditComponent;
    let fixture: ComponentFixture<MultiServiceEditComponent>;
    let mockDialogRef,
        MULTI_SERVICE_EDIT_DATA,
        mockChangeDetectorRef,
        mockStaticData,
        mockTreatmentPlansFactory,
        mockPatientServices,
        mockPatientServicesFactory,
        $q,
        $rootScope,
        mockToastrFactory,
        mockPracticesApiService,
        mockLocationsService,
        mockLocalize;


    let statusList = [
        { Name: 'Proposed', Id: 1 },
        { Name: 'Referred', Id: 2 },
        { Name: 'Rejected', Id: 3 },
        { Name: 'Completed', Id: 4 },
        { Name: 'Pending', Id: 5 },
        { Name: 'Existing', Id: 6 },
        { Name: 'Accepted', Id: 7 },
        { Name: 'Referred Completed', Id: 8 },

    ]

    beforeEach(async(() => {
        //TestBed.configureTestingModule({
        //  declarations: [ MultiServiceEditComponent ]
        //})
        //      .compileComponents();


        mockDialogRef = {
            events: { next: jasmine.createSpy() },
        };

        MULTI_SERVICE_EDIT_DATA = {
            serviceList: [{ RecordId: 1 }, { RecordId: 2 }]
        };

        mockChangeDetectorRef = {
            detectChanges: jasmine.createSpy()
        };

        mockStaticData = {
            ServiceTransactionStatuses: jasmine.createSpy().and.returnValue(
                { then: (success) => success({ Value: statusList }) }
            )
        };

        mockTreatmentPlansFactory = {
            GetTxPlanFlags: jasmine.createSpy().and.returnValue(
                { then: (success) => success({ Value: [] }) }
            )
        };


        mockPatientServices = {
            ServiceTransactions: {
                getServiceTransactionsByIds: jasmine.createSpy().and.returnValue({

                })
            }
        };

        mockPatientServicesFactory = {
            update: jasmine.createSpy().and.returnValue(
                { then: (success) => success({}) }
            )
        };

        $q = {
            defer: jasmine.createSpy().and.returnValue({
                promise: {
                    then: (success) =>
                        success({ Value: [{ ServiceTransactionId: 1 }, { ServiceTransactionId: 2 }] })},
                resolve: jasmine.createSpy().and.returnValue({
                    then: (success) =>
                        success({ Value: [{ ServiceTransactionId: 1 }, { ServiceTransactionId: 2 }]})
                })
            }),
            
        };

        $rootScope = {
            $broadcast: jasmine.createSpy()
        };

        mockToastrFactory = {
            error: jasmine.createSpy()
        };

        mockLocalize = {
            getLocalizedString: jasmine.createSpy()
        };

        mockToastrFactory = {
            error: jasmine.createSpy()
        };

        mockPracticesApiService = {
            getLocationsWithDetails: jasmine.createSpy().and.returnValue(
                { then: (success) => success({ data: [{ NameAbbreviation: 'loc1', LocationId: 1 }, { NameAbbreviation: 'loc2', LocationId: 2 }]}) }
            )
        };

        mockLocationsService = {
            findLocationsInBothPatientLocationsAndUsersLocations: jasmine.createSpy()
                .and.returnValue([{ NameAbbreviation: 'loc1', LocationId: 1 }, { NameAbbreviation: 'loc2', LocationId: 2 }])
        }

    }));

    beforeEach(() => {
        //fixture = TestBed.createComponent(MultiServiceEditComponent);
        //component = fixture.componentInstance;
        //  fixture.detectChanges();
        component = new MultiServiceEditComponent(
            mockDialogRef,
            MULTI_SERVICE_EDIT_DATA,
            mockChangeDetectorRef,
            mockStaticData,
            mockTreatmentPlansFactory,
            mockPatientServices,
            mockPatientServicesFactory,
            $q,
            $rootScope,
            mockToastrFactory,
            mockLocalize,
            mockPracticesApiService,
            mockLocationsService
        );

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            component.setLocationsList = jasmine.createSpy();
            component.setProviderList = jasmine.createSpy();
        });

        it('should set statusList to correct statuses', () => {
            component.statusList = [];

            component.ngOnInit();

            expect(component.statusList).toEqual(
                [{ text: 'No Status Change', value: 0 },
                { text: 'Proposed', value: 1 },
                { text: 'Referred', value: 2 },
                { text: 'Rejected', value: 3 },
                { text: 'Existing', value: 6 },
                { text: 'Accepted', value: 7 },
                { text: 'Referred Completed', value: 8 }]
            );
        });

        it('should set allServicesAtSameLocation to true when all services have same locationId', () => {
            component.statusList = [];
            component.allServicesAtSameLocation = false;
            component.serviceList = [{ LocationId: 1, StatusId: 6 }, { LocationId: 1, StatusId: 6 }]

            component.ngOnInit();

            expect(component.allServicesAtSameLocation).toBe(true);
        });

        it('should set existingServicesSelected to false when all services are not status 6', () => {
            component.statusList = [];
            component.existingServicesSelected = true;
            component.serviceList = [{ LocationId: 1, StatusId: 5 }, { LocationId: 1, StatusId: 5 }]

            component.ngOnInit();

            expect(component.existingServicesSelected).toBe(false);
        });

        it('should call setLocationsList and setProviderList', () => {
            component.statusList = [];
            component.existingServicesSelected = true;
            component.serviceList = [{ LocationId: 1, StatusId: 5 }, { LocationId: 1, StatusId: 5 }]

            component.ngOnInit();

            expect(component.setLocationsList).toHaveBeenCalled();
            expect(component.setProviderList).toHaveBeenCalled();
        });
    });


    describe('setLocationsList', () => {
        beforeEach(() => {
            component.patientInfo = {PatientLocations: []};
        });

        it('should call practicesApiService.getLocationsWithDetails', () => {
            component.locationDropdownList = [];

            component.setLocationsList();

            expect(mockPracticesApiService.getLocationsWithDetails).toHaveBeenCalled();
        });    

        it('should call locationsService.findLocationsInBothPatientLocationsAndUsersLocations', () => {
            component.locationDropdownList = [];

            component.setLocationsList();

            expect(mockLocationsService.findLocationsInBothPatientLocationsAndUsersLocations).toHaveBeenCalled();
        });

        it('should set locationDropdownList values', () => {
            component.locationDropdownList = [];

            component.setLocationsList();

            expect(component.locationDropdownList).toEqual(
                [{ text: 'No Location Change', value: 0 }, { text: 'loc1', value: 1 }, { text: 'loc2', value: 2 }]
            );
        });       
    });

    describe('setProviderList', () => {
        beforeEach(() => {
            component.patientInfo = { PatientLocations: [] };
        });

        it('should set filterLocationId to null and disableProviderList to true when all services not at same location', () => {
            component.locationDropdownList = [];
            component.allServicesAtSameLocation = false;
            component.serviceList = [{ LocationId: 1 }];
            component.disableProviderList = false;

            component.setProviderList();

            expect(component.filterLocationId).toBe(null);
            expect(component.disableProviderList).toBe(true);
        });

        it('should set filterLocationId to first service location and not set disableProviderList to true when all services are at same location', () => {
            component.locationDropdownList = [];
            component.allServicesAtSameLocation = true;
            component.serviceList = [{ LocationId: 1 }];
            component.disableProviderList = false;

            component.setProviderList();

            expect(component.filterLocationId).toBe(1);
            expect(component.disableProviderList).toBe(false);
        });     
    });

    describe('statusChanged', () => {
        beforeEach(() => {
            component.updateCanSave = jasmine.createSpy();
            component.setProviderIsRequired = jasmine.createSpy();
            component.setIsProviderDisabled = jasmine.createSpy();
        });

        //Status 6, date greater than maxServiceDate
        it('should set disableFee to false, change date to max date when greater, fee to null when status is Existing', () => {
            component.fee = 20;
            component.disableFee = false;
            component.maxDate = 'test';
            component.date = new Date(1994, 1, 23, 21, 36);
            component.maxServiceDate = new Date(1994, 1, 22, 21, 36);
            component.maxDateToSet = new Date(1994, 2, 22, 21, 36)
            component.serviceProvider = 'test';

            component.statusChanged({ target: { value: '6' } });

            expect(component.disableFee).toBe(true);
            expect(component.maxDate).toBe(component.maxServiceDate);
            expect(component.fee).toBe(null);
            expect(component.date).toEqual(component.maxDateToSet);
            expect(component.serviceProvider).toEqual(null);
        });

        //Status 2
        it('should set disableFee to false, maxDate to null, fee to null when status is Referred', () => {
            component.fee = 20;
            component.disableFee = false;
            component.maxDate = 'test';
            component.date = new Date(1994, 1, 22, 21, 36);
            component.maxServiceDate = new Date(1994, 1, 23, 21, 36);

            component.statusChanged({ target: { value: '2' } });

            expect(component.disableFee).toBe(true);
            expect(component.maxDate).toBe(null);
            expect(component.fee).toBe(null);
        });

        //Status 8
        it('should set disableFee to false, maxDate to null, fee to null when status is ReferredCompleted', () => {
            component.fee = 20;
            component.disableFee = false;
            component.maxDate = 'test';
            component.date = new Date(1994, 1, 22, 21, 36);
            component.maxServiceDate = new Date(1994, 1, 23, 21, 36);            

            component.statusChanged({ target: { value: '8' } });

            expect(component.disableFee).toBe(true);
            expect(component.maxDate).toBe(null);
            expect(component.fee).toBe(null);
        });


        it('should call set disableFee to false, maxDate to null', () => {
            component.disableFee = true;
            component.maxDate = 'test';

            component.status = '10';

            component.statusChanged({ target: { value: 20 } });

            expect(component.disableFee).toBe(false);
            expect(component.maxDate).toBe(null);
        });


        it('should call needed methods', () => {
            component.status = 10;

            component.statusChanged({ target: { value: 20 }});

            expect(component.setProviderIsRequired).toHaveBeenCalled();
            expect(component.setIsProviderDisabled).toHaveBeenCalled();
            expect(component.updateCanSave).toHaveBeenCalled();
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
        });

    });


    describe('feeChanged', () => {
        beforeEach(() => {
            component.updateCanSave = jasmine.createSpy();
        });

        it('should set date to newValue and call updateCanSave and detectChanges', () => {
            component.fee = 10;
            component.feeChanging = true;

            component.feeChanged({NewValue: 20});

            expect(component.feeChanging).toEqual(false);
            expect(component.fee).toEqual(20);
            expect(component.updateCanSave).toHaveBeenCalled();
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
        });

    });

    describe('dateChanged', () => {
        beforeEach(() => {
            component.updateCanSave = jasmine.createSpy();
        });

        it('should set isDateInvalid to false when new date is null', () => {
            component.date = new Date(1994, 1, 22);
            let newDate = null;
            component.isDateInvalid = true;

            component.dateChanged(newDate);

            expect(component.date).toEqual(newDate);
            expect(component.isDateInvalid).toEqual(false);
            expect(component.updateCanSave).toHaveBeenCalled();
        });

        it('should set isDateInvalid to true when year is under 1900', () => {
            component.date = new Date(1994, 1, 22);
            let newDate = new Date(1899, 1, 22);
            component.isDateInvalid = false;

            component.dateChanged(newDate);

            expect(component.date).toEqual(newDate);
            expect(component.isDateInvalid).toEqual(true);
            expect(component.updateCanSave).toHaveBeenCalled();
        });

        it('should set isDateInvalid to true when year is over 2099', () => {
            component.date = new Date(1994, 1, 22);
            let newDate = new Date(2100, 1, 22);
            component.isDateInvalid = false;

            component.dateChanged(newDate);

            expect(component.date).toEqual(newDate);
            expect(component.isDateInvalid).toEqual(true);
            expect(component.updateCanSave).toHaveBeenCalled();
        });

        it('should set date to newValue and call updateCanSave', () => {
            component.date = new Date(1994, 1, 22);
            let newDate = new Date();

            component.dateChanged(newDate);

            expect(component.date).toEqual(newDate);
            expect(component.updateCanSave).toHaveBeenCalled();
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
        });

    });

    describe('feeIsChanging', () => {
        beforeEach(() => {
            component.updateCanSave = jasmine.createSpy();
        });

        it('should set feeChanging to true and call updateCanSave', () => {            
            component.feeChanging = false;

            component.feeIsChanging();

            expect(component.feeChanging).toEqual(true);            
            expect(component.updateCanSave).toHaveBeenCalled();
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
        });

    });

    describe('locationChanged', () => {
        beforeEach(() => {
            component.setProviderIsRequired = jasmine.createSpy();
            component.setIsProviderDisabled = jasmine.createSpy();
            component.updateCanSave = jasmine.createSpy();            
            component.serviceProvider = 'provider';
            component.newLocation = 'newLocation';
            component.filterLocationId = 'filterLocationId';
            component.serviceList = [{ LocationId: 'serviceLocationId' }];
        });

        it('should set newLocation and filterLocationId when newValue is 0', () => {
            component.feeChanging = false;

            component.locationChanged({ target: { value: '0' } });
            
            expect(component.filterLocationId).toBe('serviceLocationId');
            expect(component.newLocation).toBe(0);
        });

        it('should set newLocation and filterLocationId when newValue is not 0', () => {
            component.feeChanging = false;

            component.locationChanged({ target: { value: 'test' } });

            expect(component.newLocation).toBe('test');
            expect(component.filterLocationId).toBe('test');
        });

        it('should call methods and set serviceProvider to null', () => {
            component.feeChanging = false;

            component.locationChanged({ target: { value: 'test' }});

            expect(component.serviceProvider).toBe(null);
            expect(component.setProviderIsRequired).toHaveBeenCalled();
            expect(component.setIsProviderDisabled).toHaveBeenCalled();
            expect(component.updateCanSave).toHaveBeenCalled();            
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
        });

    });



    describe('providerChanged', () => {
        beforeEach(() => {            
            component.updateCanSave = jasmine.createSpy();
            component.serviceProvider = 'provider';            
        });

        it('should set serviceProvider when newValue is not null', () => {
            component.serviceProvider = 'provider';

            component.providerChanged({ ProviderId: 1 });

            expect(component.serviceProvider).toBe(1);
        });

        it('should set serviceProvider to null when newValue is null', () => {
            component.serviceProvider = 'provider';

            component.providerChanged(null);

            expect(component.serviceProvider).toBe(null);            
        });

        it('should call updateCanSave and changeDetection', () => {
            component.feeChanging = false;

            component.providerChanged({ProviderId: 1});
                        
            expect(component.updateCanSave).toHaveBeenCalled();
            expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
        });

    });


    describe('setProviderIsRequired', () => {
        beforeEach(() => {
            component.updateCanSave = jasmine.createSpy();
            component.serviceProvider = 'provider';
        });

        it('should set isProviderRequired to true when existing service and status is not 0 or 6', () => {
            component.isProviderRequired = false;
            component.existingServicesSelected = true;
            component.status = '7';

            component.setProviderIsRequired();

            expect(component.isProviderRequired).toBe(true);
        });

        it('should set isProviderRequired to true when newLocation set and status not 6', () => {
            component.isProviderRequired = false;
            component.existingServicesSelected = false;
            component.newLocation = 1;
            component.status = '7';

            component.setProviderIsRequired();

            expect(component.isProviderRequired).toBe(true);
        });

        it('should set isProviderRequired to false neither scenario apply', () => {
            component.isProviderRequired = true;
            component.existingServicesSelected = false;
            component.newLocation = 1;
            component.status = '6';

            component.setProviderIsRequired();

            expect(component.isProviderRequired).toBe(false);
        });

    });

    describe('setIsProviderDisabled', () => {
        beforeEach(() => {
            component.updateCanSave = jasmine.createSpy();
            component.serviceProvider = 'provider';
        });

        it('should set disableProviderList to false newLocation not 0 and status not 6', () => {
            component.disableProviderList = true;
            component.newLocation = 1;
            component.status = '7';

            component.setIsProviderDisabled();

            expect(component.disableProviderList).toBe(false);
        });


        it('should set disableProviderList to true when status is 6', () => {
            component.disableProviderList = false;
            component.newLocation = 1;
            component.status = '6';

            component.setIsProviderDisabled();

            expect(component.disableProviderList).toBe(true);
        });


        it('should set disableProviderList to false when all services at same location', () => {
            component.disableProviderList = true;
            component.newLocation = 0;
            component.status = '7';
            component.allServicesAtSameLocation = true;

            component.setIsProviderDisabled();

            expect(component.disableProviderList).toBe(false);
        });


        it('should set disableProviderList to true when no other scenario applies', () => {
            component.disableProviderList = false;
            component.newLocation = 0;
            component.status = '7';
            component.allServicesAtSameLocation = false;

            component.setIsProviderDisabled();

            expect(component.disableProviderList).toBe(true);
        });
    });


    describe('updateCanSave', () => {
        beforeEach(() => {
            component.date = null;
            component.fee = null;
            component.status = 0;
            component.feeChanging = false;
        });

        it('should set canSave to false when all values are null', () => {
            component.canSave = true;
            component.date = null;
            component.fee = null;
            component.status = 0;

            component.updateCanSave();

            expect(component.canSave).toBe(false);
        });

        it('should set canSave to true when date is not null', () => {
            component.canSave = false;
            component.date = new Date();            

            component.updateCanSave();

            expect(component.canSave).toBe(true);
        });

        it('should set canSave false when date is invalid', () => {
            component.canSave = true;
            component.date = new Date(1890, 1, 22);

            component.updateCanSave();

            expect(component.canSave).toBe(false);
        });

        it('should set canSave false when date is set and feeChanging is true', () => {
            component.canSave = true;
            component.date = new Date();
            component.feeChanging = true;

            component.updateCanSave();

            expect(component.canSave).toBe(false);
        });

        it('should set canSave to true when fee is not null', () => {
            component.canSave = false;            
            component.fee = 'test';            

            component.updateCanSave();

            expect(component.canSave).toBe(true);
        });

        it('should set canSave to true when status is not null', () => {
            component.canSave = false;
            component.status = 'test';    

            component.updateCanSave();

            expect(component.canSave).toBe(true);
        });

        it('should set canSave to true when provider change is valid with no new location', () => {
            component.canSave = false;
            component.status = 'test';
            component.serviceProvider = 'provider';
            component.newLocation = 0;
            component.allServicesAtSameLocation = true;

            component.updateCanSave();

            expect(component.canSave).toBe(true);
        });

        it('should set canSave to true when provider change is valid with a new location', () => {
            component.canSave = false;
            component.status = 'test';
            component.serviceProvider = 'provider';
            component.newLocation = 1;
            component.allServicesAtSameLocation = false;

            component.updateCanSave();

            expect(component.canSave).toBe(true);
        });

        it('should set canSave to false when provider is required and not set', () => {
            component.canSave = true;
            component.status = 'test';
            component.isProviderRequired = true;
            component.serviceProvider = null;

            component.updateCanSave();

            expect(component.canSave).toBe(false);
        });

    });


    describe('save', async () => {
        beforeEach(() => {
            component.multiServiceEditReturned = jasmine.createSpy().and.returnValue(Promise.resolve('test'));            
        });

        it('should call multiServiceEditReturned', async () => {           
            await component.save();            

            expect(component.multiServiceEditReturned).toHaveBeenCalled();
        });

        it('should call dialogRef.events.next with type confirm', async () => {                        
            await component.save();           

            expect(component.dialogRef.events.next).toHaveBeenCalledWith({
                type: 'confirm',
            });
        });
    });


    describe('cancel', () => {
        beforeEach(() => {
        });
        
        it('should call dialogRef.events.next with type close', () => {            

            component.cancel();

            expect(component.dialogRef.events.next).toHaveBeenCalledWith({
                type: 'close',
            });
        });        
    });
    
    describe('getServicesFailure', () => {
        beforeEach(() => {
        });

        it('should call dialogRef.events.next with type close', () => {

            component.getServicesFailure();

            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });


    describe('handleLocationChange', () => {
        beforeEach(() => {            

        });
               
        it('should change service location when newLocation is set and service not on an appointment', () => {
            component.newLocation = 1;
            let service = {
                AppointmentId: null, Fee: 10, ProviderUserId: 'provider',
                LocationId: 'locationId'
            };

            component.handleLocationChange(service);

            expect(service.LocationId).toEqual(component.newLocation);
        });

        it('should change service location when newLocation is set and service not on an appointment and not on a treatment plan', () => {
            component.newLocation = 1;
            component.serviceIsLinkedToTreatmentPlanList = [{ Key: 1, Value: true }, { Key: 2, Value: false }]
            let service = {
                AppointmentId: null, Fee: 10, ProviderUserId: 'provider',
                LocationId: 'locationId', ServiceTransactionId: 2
            };

            component.handleLocationChange(service);

            expect(service.LocationId).toEqual(component.newLocation);
        });


        it('should not change service location when newLocation is set and service not on appoinment but is on treatment plan', () => {
            component.newLocation = 1;
            component.serviceIsLinkedToTreatmentPlanList = [{ Key: 1, Value: true }, { Key: 2, Value: false }]
            let service = {
                AppointmentId: 1, Fee: 10, ProviderUserId: 'provider',
                LocationId: 'locationId', ServiceTransactionId: 1
            };

            component.handleLocationChange(service);

            expect(service.LocationId).toEqual('locationId');
        });  

        it('should not change service location when newLocation is set and service is on an appointment', () => {
            component.newLocation = 1;
            let service = {
                AppointmentId: 1, Fee: 10, ProviderUserId: 'provider',
                LocationId: 'locationId'
            };

            component.handleLocationChange(service);

            expect(service.LocationId).toEqual('locationId');
        });        
    });



    describe('handleProviderChange', () => {
        beforeEach(() => {
        });

        it('should change service providerUserId when new provider is set and no new location', () => {
            component.newLocation = 0;
            component.serviceProvider = 'newProvider';
            let service = {
                AppointmentId: null, Fee: 10, ProviderUserId: 'provider',
                LocationId: 'locationId'
            };

            component.handleProviderChange(service);

            expect(service.ProviderUserId).toEqual(component.serviceProvider);
        });

        it('should change service providerUserId when new provider is set and newLocation matches the service location', () => {
            component.newLocation = 'locationId';
            component.serviceProvider = 'newProvider';
            let service = {
                AppointmentId: null, Fee: 10, ProviderUserId: 'provider',
                LocationId: 'locationId'
            };

            component.handleProviderChange(service);

            expect(service.ProviderUserId).toEqual(component.serviceProvider);
        });

        it('should not change service providerUserId when new provider is not set', () => {
            component.newLocation = 1;
            component.serviceProvider = null;
            let service = {
                AppointmentId: 1, Fee: 10, ProviderUserId: 'provider',
                LocationId: 'locationId'
            };

            component.handleProviderChange(service);

            expect(service.ProviderUserId).toEqual('provider');
        });

        it('should not change service providerUserId when newLocation does not match service location', () => {
            component.newLocation = 1;
            component.serviceProvider = null;
            let service = {
                AppointmentId: 1, Fee: 10, ProviderUserId: 'provider',
                LocationId: 'locationId'
            };

            component.handleProviderChange(service);

            expect(service.ProviderUserId).toEqual('provider');
        });
    });







    describe('handleStatusChange', () => {
        beforeEach(() => {
            component.serviceIsLinkedToTreatmentPlanList = [{ Key: 1, Value: true }, { Key: 2, Value: false }]
        });

        //Status 6, sets serviceIsOnTxPlan        

        //With AppointmentId, status 2
        it('should not set service status to 2 when status is 2 and service has appointmentId', () => {
            component.status = '2';
            let service = {
                AppointmentId: 1, Fee: 10, ProviderUserId: 'provider',
                ServiceTransactionStatusId: 4, DateEntered: 'test'
            };

            component.handleStatusChange(service);

            expect(service.ServiceTransactionStatusId).toEqual(4);
        });


        //With AppointmentId, status 3
        it('should not set service status to 3 when status is 3 and service has appointmentId', () => {
            component.status = '3';
            let service = {
                AppointmentId: 1, Fee: 10, ProviderUserId: 'provider',
                ServiceTransactionStatusId: 4, DateEntered: 'test'
            };

            component.handleStatusChange(service);

            expect(service.ServiceTransactionStatusId).toEqual(4);
        });


        //With AppointmentId, status 6
        it('should not set service status to 6 when status is 6 and service has appointmentId', () => {            
            component.status = '6';
            let service = {
                ServiceTransactionId: 1,
                AppointmentId: 1, Fee: 10, ProviderUserId: 'provider',
                ServiceTransactionStatusId: 4, DateEntered: 'test'
            };

            component.handleStatusChange(service);

            expect(service.ServiceTransactionStatusId).toEqual(4);
        });

        //With AppointmentId, status 8

        it('should not set service status to 8 when status is 8 and service has appointmentId', () => {
            component.status = '8';
            let service = {
                AppointmentId: 1, Fee: 10, ProviderUserId: 'provider',
                ServiceTransactionStatusId: 4, DateEntered: 'test'
            };

            component.handleStatusChange(service);

            expect(service.ServiceTransactionStatusId).toEqual(4);
        });        


        //Without AppointmentId, status 4 (serviceIsOnTxPlan == null)
        it('should set service status to 4 when service has no appointmentId and is not on a treatment plan', () => {
            component.status = '4';
            let service = {
                ServiceTransactionId: 3,
                AppointmentId: null, Fee: 10, ProviderUserId: 'provider',
                ServiceTransactionStatusId: 6, DateEntered: 'test'
            };

            component.handleStatusChange(service);

            expect(service.ServiceTransactionStatusId).toEqual(4);
        });


        //Without AppointmentId, status 6 (serviceIsOnTxPlan == true)
        it('should not set service status to 6 when status is 6 and service is on a treatment plan', () => {
            component.status = '6';
            let service = {
                ServiceTransactionId: 1,
                AppointmentId: null, Fee: 10, ProviderUserId: 'provider',
                ServiceTransactionStatusId: 5, DateEntered: 'test'
            };

            component.handleStatusChange(service);

            expect(service.ServiceTransactionStatusId).toEqual(5);
        });

        //Without AppointmentId, status 6 (serviceIsOnTxPlan == false)
        it('should set service status to 6 when status is 6 and service is not on a treatment plan', () => {
            component.status = '6';
            let service = {
                ServiceTransactionId: 2,
                AppointmentId: null, Fee: 10, ProviderUserId: 'provider',
                ServiceTransactionStatusId: 5, DateEntered: 'test'
            };

            component.handleStatusChange(service);

            expect(service.ServiceTransactionStatusId).toEqual(6);
        });

    });

    describe('handleFeeChange', () => {
        beforeEach(() => {
        });

        //Status other than Existing, Referred, ReferredCompleted
        //With fee set
        it('should change fee when fee is set and status is not 6, 2, or 8', () => {
            component.fee = 20;
            let service = { Fee: 10, ProviderUserId: 'provider', ServiceTransactionStatusId: 3, DateEntered: 'test' };

            component.handleFeeChange(service);

            expect(service.Fee).toEqual(20);
        });

        //Without fee set
        it('should not change fee when fee is not set and status is not 6, 2, or 8', () => {
            component.fee = null;
            let service = { Fee: 10, ProviderUserId: 'provider', ServiceTransactionStatusId: 3, DateEntered: 'test' };

            component.handleFeeChange(service);

            expect(service.Fee).toEqual(10);
        });

        //Status one of Existing, Referred, ReferredCompleted
        //Referred, leaves providerUserId
        it('should set fee to 0 when Referred and leave ProviderUserId', () => {
            component.fee = null;
            let service = { Fee: 10, ProviderUserId: 'provider', ServiceTransactionStatusId: 2, DateEntered: 'test' };

            component.handleFeeChange(service);

            expect(service.Fee).toEqual(0);
            expect(service.ProviderUserId).toEqual('provider');
        });

        //Existing, removes providerUserId
        it('should set fee to 0 when Referred and remove ProviderUserId', () => {
            component.fee = null;
            let service = { Fee: 10, ProviderUserId: 'provider', ServiceTransactionStatusId: 6, DateEntered: 'test' };

            component.handleFeeChange(service);

            expect(service.Fee).toEqual(0);
            expect(service.ProviderUserId).toEqual(null);
        });
    });

    describe('handleDateChange', () => {
        beforeEach(() => {
            
        });
        
        it('should not change DateEntered when neither if statement matches', () => {
            component.date = null;
            let service = { ServiceTransactionStatusId: 3, DateEntered: 'test' };

            component.handleDateChange(service);

            expect(service.DateEntered).toEqual('test');
        });


        //Date set, Existing status, and Date less than max, date is valid
        it('should change DateEntered when date set and existing status and date less than max', () => {
            component.date = new Date(1994, 1, 22, 21, 36);
            component.maxServiceDate = new Date(1994, 1, 23, 21, 36);
            let service = { ServiceTransactionStatusId: 6, DateEntered: 'test' };

            component.handleDateChange(service);

            expect(service.DateEntered.toString()).toEqual(component.date.toString());
        });

        //Date set, status other than Existing, date is valid
        it('should change DateEntered when date is valid and set and service status is not Existing', () => {
            component.date = new Date(1994, 1, 22, 21, 36);
            let service = { ServiceTransactionStatusId: 3, DateEntered: 'test' };

            component.handleDateChange(service);

            expect(service.DateEntered.toString()).toBe(component.date.toString());
        });


        //Date set, Existing status, and Date less than max, date is invalid
        it('should not change DateEntered when date is invalid and existing status and date less than max', () => {
            component.isDateInvalid = true;
            component.date = new Date(1890, 1, 22, 21, 36);
            component.maxServiceDate = new Date(1994, 1, 23, 21, 36);
            let service = { ServiceTransactionStatusId: 6, DateEntered: 'test' };

            component.handleDateChange(service);

            expect(service.DateEntered.toString()).toEqual('test');
        });

        //Date set, status other than Existing, date is invalid
        it('should not change DateEntered when date is invalid and status is not Existing', () => {
            component.isDateInvalid = true;
            component.date = new Date(1994, 1, 22, 21, 36);
            let service = { ServiceTransactionStatusId: 3, DateEntered: 'test' };

            component.handleDateChange(service);

            expect(service.DateEntered.toString()).toBe('test');
        });

        //Date not set, service status of Existing, and the service date is in the future
        it('should change service date to today if service is Existing, date is not set, and service date is in the future', () => {
            component.date = null;
            component.maxServiceDate = new Date(1994, 1, 22, 21, 36);
            component.maxDateToSet = new Date(2000, 1, 22, 21, 36);
            let service = { ServiceTransactionStatusId: 6, DateEntered: new Date(2001, 1, 22, 21, 36).toISOString() };

            component.handleDateChange(service);

            expect(service.DateEntered.toString()).toBe(component.maxDateToSet.toString());
        });

        it('should change service date to today if service is Existing, date is invalid', () => {
            component.date = new Date(1890, 1, 22, 21, 36);
            component.isDateInvalid = true;
            component.maxServiceDate = new Date(1994, 1, 22, 21, 36);
            component.maxDateToSet = new Date(2000, 1, 22, 21, 36);
            let service = { ServiceTransactionStatusId: 6, DateEntered: new Date(2001, 1, 22, 21, 36).toISOString() };

            component.handleDateChange(service);

            expect(service.DateEntered.toString()).toBe(component.maxDateToSet.toString());
        });


    });

});
