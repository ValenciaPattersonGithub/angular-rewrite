import { TestBed } from '@angular/core/testing';

import { PatientRxService } from './patient-rx.service';
import { ZipCodePipe } from '../../../../@shared/pipes/zipCode/zip-code.pipe';
import { RxPatient } from '../models/patient-rx.model';
import { AuthAccess } from '../../../../@shared/models/auth-access.model';


describe('PatientRxService', () => {

    const mockPatient = {
        PatientId: '1234',
        FirstName: 'James',
        LastName: 'Bond',
        MiddleName: null,
        DateOfBirth: '1965-12-03',
        AddressLine1: 'xxx',
        City: 'Eff',
        State: 'IL',
        ZipCode: '123456789',
        Sex: 'M',
        EmailAddress: 'xxx',
        Phones: [
            { Type: 'Home', PhoneNumber: '2175403725', IsPrimary: true },
            { Type: 'Work', PhoneNumber: '2175405555', IsPrimary: false },
        ]
    };

    const mockTruncatePatient = {
        PatientId: '1234',
        Prefix: 'PrefixMaxLength10',
        FirstName: 'FirstNameMaxLengthIsThirtyFiveCharacters',
        LastName: 'LastNameMaxLengthIsThirtyFiveCharacters',
        MiddleName: 'MiddleNameMaxLengthIsThirtyFiveCharacters',
        Suffix: 'SuffixMaxLength10',
        DateOfBirth: '1965-12-03',
        AddressLine1: 'AddressLine1LongerThanThirtyFiveCharacters',
        AddressLine2: 'AddressLine2LongerThanThirtyFiveCharacters',
        City: 'CityNameThatIsLongerThanThirtyFiveCharacters',
        State: 'StateLongerThanTwentyCharacters',
        ZipCode: '123456789LongerThanMax',
        Sex: 'M',
        EmailAddress: 'xxx',
        Phones: [
            { Type: 'PhoneTypeMaxLengthIsFiftyFiveCharactersFiftyCharactersIsVeryLong', PhoneNumber: '2175403725LongerThanTwentyFiveCharacters', IsPrimary: true },
            { Type: 'Work', PhoneNumber: '2175405555', IsPrimary: false },
        ]
    }

    let service: PatientRxService;
    let userContext;


    const mockSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };

    const mockPracticeService = {

    };

    const mockLocationService = {
    };



    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PatientRxService, ZipCodePipe,
                { provide: 'patSecurityService', useValue: mockSecurityService },
                { provide: 'practiceService', useValue: mockPracticeService },
                { provide: 'locationService', useValue: mockLocationService }],
        });
        service = TestBed.get(PatientRxService);

        userContext = '{ "Result": { "Application": { "ApplicationId": "4" }, "User":{"UserId":"1234"} } }';
        sessionStorage.setItem('userContext', userContext);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAuthAccess', () => {

        beforeEach(() => {

        });
        it('should return false if RxPatient model has missing information', () => {
            let result: AuthAccess;
            result = service.getAuthAccess();
            expect(result.view).toBe(true);
            expect(result.create).toBe(true);
        });
    });

    describe('validationMessage', () => {

        beforeEach(() => {

        });
        it('should return false if RxPatient model has missing information', () => {
            const rxPatient = service.createRxPatient(mockPatient);

            rxPatient.FirstName = 'Bob';
            let result = service.validationMessage(rxPatient);
            expect(result).toEqual([]);

            rxPatient.FirstName = '';
            result = service.validationMessage(rxPatient);
            expect(result).toEqual([{ info: 'FirstName' }]);

            rxPatient.LastName = '';
            result = service.validationMessage(rxPatient);
            expect(result).toEqual([{ info: 'FirstName' }, { info: 'LastName' }]);
        });

    });

    describe('validatePatient', () => {

        beforeEach(() => {

        });
        it('should return false if RxPatient model has missing information', () => {
            const rxPatient = service.createRxPatient(mockPatient);
            rxPatient.FirstName = '';
            let result = service.validatePatient(rxPatient);
            expect(result).toBe(false);

            rxPatient.FirstName = 'Bob';
            result = service.validatePatient(rxPatient);
            expect(result).toBe(true);

            rxPatient.LastName = '';
            result = service.validatePatient(rxPatient);
            expect(result).toBe(false);

            rxPatient.LastName = 'Jones';
            result = service.validatePatient(rxPatient);
            expect(result).toBe(true);
        });

    });

    describe('createRxPatient', () => {

        beforeEach(() => {

        });
        it('should return patient info as RxPatient model', () => {
            const result = service.createRxPatient(mockPatient);
            expect(result.PatientId).toEqual(mockPatient.PatientId);
            expect(result.FirstName).toEqual(mockPatient.FirstName);
            expect(result.LastName).toEqual(mockPatient.LastName);
            expect(result.Address1).toEqual(mockPatient.AddressLine1);
            expect(result.City).toEqual(mockPatient.City);
            expect(result.State).toEqual(mockPatient.State);
        });

        it('should return patient with formatted PostalCode', () => {
            const result = service.createRxPatient(mockPatient);
            expect(result.PostalCode).toEqual('12345-6789');
        });

        it('should return patient with PrimaryPhone', () => {
            const result = service.createRxPatient(mockPatient);
            expect(result.Phone).toEqual('2175403725');
        });

        it('should determine Gender based on Sex', () => {
            mockPatient.Sex = 'M';
            let result = service.createRxPatient(mockPatient);
            expect(result.Gender).toEqual('Male');

            mockPatient.Sex = 'F';
            result = service.createRxPatient(mockPatient);
            expect(result.Gender).toEqual('Female');
        });

        it('should return truncated values when fields are too long', () => {            
            let result = service.createRxPatient(mockTruncatePatient);

            expect(result.Prefix).toEqual('PrefixMaxL');
            expect(result.FirstName).toEqual('FirstNameMaxLengthIsThirtyFiveChara');
            expect(result.MiddleName).toEqual('MiddleNameMaxLengthIsThirtyFiveChar');
            expect(result.LastName).toEqual('LastNameMaxLengthIsThirtyFiveCharac');
            expect(result.Suffix).toEqual('SuffixMaxL');
            expect(result.Address1).toEqual('AddressLine1LongerThanThirtyFiveCha');
            expect(result.Address2).toEqual('AddressLine2LongerThanThirtyFiveCha');
            expect(result.City).toEqual('CityNameThatIsLongerThanThirtyFiveC');
            expect(result.State).toEqual('StateLongerThanTwent');
            expect(result.PostalCode).toEqual('12345-6789');
            expect(result.Phone).toEqual('2175403725LongerThanTwent');
            expect(result.PhoneType).toEqual('Home');                                                
        });

    });
});
