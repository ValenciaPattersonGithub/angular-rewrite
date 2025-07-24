import { RxUserSetupComponent } from './rx-user-setup.component';

describe('RxUserSetupComponent ->', () => {
    let component: RxUserSetupComponent;
    let rxService, referenceDataService, translateService;
    let mockLocations;

    beforeEach(() => {
        mockLocations = [
            { IsRxRegistered: true, NameAbbreviation: 'loc1' },
            { IsRxRegistered: false, NameAbbreviation: 'loc2' }
        ];
        rxService = {};
        referenceDataService = {
            entityNames: { locations: 'locationskey' },
            get: jasmine.createSpy().and.returnValue(mockLocations)
        };
        translateService = {
            instant: (str) => str
        };
        component = new RxUserSetupComponent(referenceDataService, rxService, translateService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call referenceDataService and set locationList', () => {
        expect(referenceDataService.get).toHaveBeenCalledWith(referenceDataService.entityNames.locations);
        expect(component.locationList).toBeDefined();
        expect(component.locationList.length).toBe(1);
        expect(component.locationList[0].text).toBe(mockLocations[0].NameAbbreviation);
    });

    describe('ngOnInit function ->', () => {

        beforeEach(() => {
            rxService.getRxClinicianData = jasmine.createSpy().and.returnValue({ then: () => {} });
        });

        it('should not call rxService if userId is null', () => {
            component.userId = null;
            component.initialized = false;

            component.ngOnInit();

            expect(rxService.getRxClinicianData).not.toHaveBeenCalled();
            expect(component.initialized).toBe(true);
        });

        it('should not call rxService if userId is empty', () => {
            component.userId = '';
            component.initialized = false;

            component.ngOnInit();

            expect(rxService.getRxClinicianData).not.toHaveBeenCalled();
            expect(component.initialized).toBe(true);
        });

        it('should call rxService if userId is not empty', () => {
            component.userId = 'user';
            component.initialized = false;

            component.ngOnInit();

            expect(rxService.getRxClinicianData).toHaveBeenCalledWith(component.userId);
        });

        describe('rxService failure callback ->', () => {

            beforeEach(() => {
                component.userId = 'user';
                rxService.getRxClinicianData = () => ({ then: (s, f) => f() });
                component.showError = false;
            });

            it('should set showError to true', () => {
                component.ngOnInit();

                expect(component.showError).toBe(true);
            });

        });

        describe('rxService success callback ->', () => {

            let res;
            beforeEach(() => {
                res = {
                    roles: [1, 2],
                    locations: []
                };
                component.userId = 'user';
                rxService.getRxClinicianData = () => ({ then: s => s(res) });

                component.initialized = false;
                component.model = {};
                component.showError = false;
            });

            it('should set values correctly', () => {
                component.ngOnInit();

                expect(component.initialized).toBe(true);
                expect(component.model.roles).toEqual([component.roleList[0], component.roleList[2]]);
                expect(component.showError).toBe(false);
            });

        });

    });

    describe('onChange function ->', () => {

        let model;
        beforeEach(() => {
            component.modelChange.emit = jasmine.createSpy();

            model = { key: 'test' };
            component.model = model;
        });
       

        it('should set validation when model.roles has entries', () => {
            model.invalid = true;
            model.validationMessage = 'test';
            model.isNew = false;
            model.locations = [{}];
            model.roles = [{}];

            component.onChange();

            expect(model.invalid).toBe(false);
            expect(model.validationMessage).toBe('');
        });

        it('should set validation when model.roles is null', () => {
            model.invalid = false;
            model.validationMessage = '';
            model.isNew = false;
            model.locations = [{}];
            model.roles = null;

            component.onChange();

            expect(model.invalid).toBe(true);
            expect(model.validationMessage).not.toBe('');
        });

        it('should set validation when model.roles is empty', () => {
            model.invalid = false;
            model.validationMessage = '';
            model.isNew = false;
            model.locations = [{}];
            model.roles = [];

            component.onChange();

            expect(model.invalid).toBe(true);
            expect(model.validationMessage).not.toBe('');
        });




        it('should set validation when model.isNew is true', () => {
            model.invalid = true;
            model.validationMessage = 'test';
            model.isNew = true;

            component.onChange();

            expect(model.invalid).toBe(false);
            expect(model.validationMessage).toBe('');
        });

        it('should set validation when model.locations has entries', () => {
            model.invalid = true;
            model.validationMessage = 'test';
            model.isNew = false;
            model.locations = [{}];
            model.roles = [{}];

            component.onChange();

            expect(model.invalid).toBe(false);
            expect(model.validationMessage).toBe('');
        });

        it('should set validation when model.locations is null', () => {
            model.invalid = false;
            model.validationMessage = '';
            model.isNew = false;
            model.locations = null;
            model.roles = [{}];

            component.onChange();

            expect(model.invalid).toBe(true);
            expect(model.validationMessage).not.toBe('');
        });

        it('should set validation when model.locations is empty', () => {
            model.invalid = false;
            model.validationMessage = '';
            model.isNew = false;
            model.locations = [];
            model.roles = [{}];

            component.onChange();

            expect(model.invalid).toBe(true);
            expect(model.validationMessage).not.toBe('');
        });

        it('should call modelChange', () => {
            component.onChange();

            expect(component.modelChange.emit).toHaveBeenCalledWith(model);
        });

        it('should set showEpcsCheckbox to false if model is null', () => {
            component.model = null;
            component.showEpcsCheckbox = false;

            component.onChange();

            expect(component.showEpcsCheckbox).toBe(false);
        });

        it('should set showEpcsCheckbox to false if model.roles is null', () => {
            component.model.roles = null;
            component.model.isEPCSRequested = true;
            component.showEpcsCheckbox = true;

            component.onChange();

            expect(component.showEpcsCheckbox).toBe(false);
            expect(component.model.isEPCSRequested).toBe(false);
        });

        it('should set showEpcsCheckbox to false if model.roles is empty', () => {
            component.model.roles = [];
            component.model.isEPCSRequested = true;
            component.showEpcsCheckbox = true;

            component.onChange();

            expect(component.showEpcsCheckbox).toBe(false);
            expect(component.model.isEPCSRequested).toBe(false);
        });

        it('should set showEpcsCheckbox to false if model.roles does not contain role 1', () => {
            component.model.roles = [{ value: 2 }, { value: 3 }];
            component.model.isEPCSRequested = true;
            component.showEpcsCheckbox = true;

            component.onChange();

            expect(component.showEpcsCheckbox).toBe(false);
            expect(component.model.isEPCSRequested).toBe(false);
        });

        it('should set showEpcsCheckbox to true if model.roles contains role 1', () => {
            component.model.roles = [{ value: 2 }, { value: 3 }, { value: 1 }];
            component.model.isEPCSRequested = true;
            component.showEpcsCheckbox = false;

            component.onChange();

            expect(component.showEpcsCheckbox).toBe(true);
            expect(component.model.isEPCSRequested).toBe(false);
        });

    });

});
