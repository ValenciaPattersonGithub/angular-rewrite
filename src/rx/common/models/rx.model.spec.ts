import { RxPatient } from 'src/patient/patient-chart/patient-rx/models/patient-rx.model';
import {
    LegacyRxLocation, LegacyRxUser, RxEnterpriseRequest, RxPatientRequest, RxPhoneNumber,
    RxPhoneNumberType, RxSettings, RxUserRequest
} from './rx.model';

describe('RxModels ->', () => {

    describe('RxEnterpriseRequest ->', () => {

        it('should create an instance', () => {
            expect(new RxEnterpriseRequest(new LegacyRxLocation())).toBeTruthy();
        });

        describe('constructor ->', () => {

            let legacyLocation;
            beforeEach(() => {
                legacyLocation = new LegacyRxLocation();
                legacyLocation.Name = 'LocName';
                legacyLocation.Address1 = 'LocAddress1';
                legacyLocation.Address2 = 'LocAddress2';
                legacyLocation.City = 'LocCity';
                legacyLocation.State = 'LocState';
                legacyLocation.PostalCode = 'LocPostalCode';
            });

            it('should copy properties correctly if phone and fax are not supplied', () => {
                const result = new RxEnterpriseRequest(legacyLocation);

                expect(result.name).toBe(legacyLocation.Name);
                expect(result.address).toBeDefined();
                expect(result.address.street1).toBe(legacyLocation.Address1);
                expect(result.address.street2).toBe(legacyLocation.Address2);
                expect(result.address.city).toBe(legacyLocation.City);
                expect(result.address.state).toBe(legacyLocation.State);
                expect(result.address.postalCode).toBe(legacyLocation.PostalCode);
                expect(result.phoneNumbers).toBeDefined();
                expect(result.phoneNumbers.length).toBe(0);
            });

            it('should copy properties correctly if phone and fax are supplied', () => {
                legacyLocation.Phone = '1234';
                legacyLocation.Fax = '4321';

                const result = new RxEnterpriseRequest(legacyLocation);

                expect(result.phoneNumbers.length).toBe(2);

                const phone = result.phoneNumbers.filter(p => p.type == RxPhoneNumberType.Home);
                expect(phone.length).toBe(1);
                expect(phone[0].isPrimary).toBe(true);
                expect(phone[0].isPrimaryForType).toBe(true);
                expect(phone[0].number).toBe(parseInt(legacyLocation.Phone));

                const fax = result.phoneNumbers.filter(p => p.type == RxPhoneNumberType.Fax);
                expect(fax.length).toBe(1);
                expect(fax[0].isPrimary).toBe(false);
                expect(fax[0].isPrimaryForType).toBe(true);
                expect(fax[0].number).toBe(parseInt(legacyLocation.Fax));
            });

        });

    });

    describe('RxUserRequest ->', () => {

        it('should create an instance', () => {
            const settings = new RxSettings();
            settings.roles = [];
            settings.locations = [];
            expect(new RxUserRequest(new LegacyRxUser(), settings)).toBeTruthy();
        });

        describe('constructor ->', () => {

            let legacyUser: LegacyRxUser,
                settings: RxSettings;
            beforeEach(() => {
                legacyUser = new LegacyRxUser();
                legacyUser.UserId = 'UserId';
                legacyUser.FirstName = 'UserFirst';
                legacyUser.MiddleName = 'UserMiddle';
                legacyUser.LastName = 'UserLast';
                legacyUser.Suffix = 'UserSuffix';
                legacyUser.Gender = 'UserGender';
                legacyUser.Address1 = 'UserAdd1';
                legacyUser.Address2 = 'UserAdd2';
                legacyUser.City = 'UserCity';
                legacyUser.State = 'UserState';
                legacyUser.PostalCode = 'UserZip';
                legacyUser.ApplicationId = 100;
                legacyUser.DEANumber = 'UserDEA';
                legacyUser.DateOfBirth = new Date();
                legacyUser.Email = 'UserEmail';
                legacyUser.NPINumber = 'UserNPI';
                legacyUser.LocationIds = [101, 202, 303];

                settings = new RxSettings();
                settings.roles = [
                    { text: 'role1', value: 1 },
                    { text: 'role2', value: 2 }
                ];
                settings.locations = [
                    { text: 'loc1', value: { legacyId: 1, enterpriseId: 11 }},
                    { text: 'loc2', value: { legacyId: 2, enterpriseId: 22 }}
                ];
                settings.isEPCSRequested = true;
            });

            it('should copy properties correctly if phone and fax are not supplied', () => {
                const result = new RxUserRequest(legacyUser, settings);

                expect(result.firstName).toBe(legacyUser.FirstName);
                expect(result.middleName).toBe(legacyUser.MiddleName);
                expect(result.lastName).toBe(legacyUser.LastName);
                expect(result.suffix).toBe(legacyUser.Suffix);
                expect(result.dateOfBirth).toBe(legacyUser.DateOfBirth);
                expect(result.emailAddress).toBe(legacyUser.Email);
                expect(result.address.street1).toBe(legacyUser.Address1);
                expect(result.address.street2).toBe(legacyUser.Address2);
                expect(result.address.city).toBe(legacyUser.City);
                expect(result.address.state).toBe(legacyUser.State);
                expect(result.address.postalCode).toBe(legacyUser.PostalCode);
                expect(result.deaNumbers).toEqual([legacyUser.DEANumber]);
                expect(result.npiNumber).toBe(legacyUser.NPINumber);
                expect(result.phoneNumbers).toEqual([]);
                expect(result.clinicianRoleTypes).toEqual(settings.roles.map(r => r.value));
                expect(result.isEPCSRequested).toBe(settings.isEPCSRequested);
            });

            it('should copy properties correctly if phone and fax are supplied', () => {
                legacyUser.Phone = '1234';
                legacyUser.Fax = '4321';

                const result = new RxUserRequest(legacyUser, settings);

                expect(result.phoneNumbers.length).toBe(2);

                const phone = result.phoneNumbers.filter(p => p.type == RxPhoneNumberType.Home);
                expect(phone.length).toBe(1);
                expect(phone[0].isPrimary).toBe(true);
                expect(phone[0].isPrimaryForType).toBe(true);
                expect(phone[0].number).toBe(parseInt(legacyUser.Phone));

                const fax = result.phoneNumbers.filter(p => p.type == RxPhoneNumberType.Fax);
                expect(fax.length).toBe(1);
                expect(fax[0].isPrimary).toBe(false);
                expect(fax[0].isPrimaryForType).toBe(true);
                expect(fax[0].number).toBe(parseInt(legacyUser.Fax));
            });

        });

    });

    describe('RxPatientRequest ->', () => {

        it('should create an instance', () => {
            expect(new RxPatientRequest(new RxPatient())).toBeTruthy();
        });

        describe('constructor ->', () => {

            let legacyPatient: RxPatient;
            beforeEach(() => {
                legacyPatient = new RxPatient();
                legacyPatient.FirstName = 'PatFirst';
                legacyPatient.MiddleName = 'PatMid';
                legacyPatient.LastName = 'PatLast';
                legacyPatient.Suffix = 'PatSuff';
                legacyPatient.Gender = 'Female';
                legacyPatient.DateOfBirth = new Date();
                legacyPatient.Weight = 200;
                legacyPatient.WeightMetric = 90;
                legacyPatient.Email = 'PatEmail';
                legacyPatient.Address1 = 'PatAdd1';
                legacyPatient.Address2 = 'PatAdd2';
                legacyPatient.City = 'PatCity';
                legacyPatient.State = 'PatState';
                legacyPatient.PostalCode = 'PatZip';
            });

            it('should copy properties correctly if phone is not supplied', () => {
                const result = new RxPatientRequest(legacyPatient);

                expect(result.firstName).toBe(legacyPatient.FirstName);
                expect(result.middleName).toBe(legacyPatient.MiddleName);
                expect(result.lastName).toBe(legacyPatient.LastName);
                expect(result.suffix).toBe(legacyPatient.Suffix);
                expect(result.dateOfBirth).toBe(legacyPatient.DateOfBirth);
                expect(result.sex).toBe(2);
                expect(result.emailAddress).toBe(legacyPatient.Email);
                expect(result.address.street1).toBe(legacyPatient.Address1);
                expect(result.address.street2).toBe(legacyPatient.Address2);
                expect(result.address.city).toBe(legacyPatient.City);
                expect(result.address.state).toBe(legacyPatient.State);
                expect(result.address.postalCode).toBe(legacyPatient.PostalCode);
                expect(result.phoneNumbers).toEqual([]);
                expect(result.weightDecimal).toBe(legacyPatient.Weight);
                expect(result.weightMetric).toBe(1);
            });

            it('should copy properties correctly if phone and fax are supplied', () => {
                legacyPatient.Phone = '1234';
                legacyPatient.PhoneType = 'Work';

                const result = new RxPatientRequest(legacyPatient);

                expect(result.phoneNumbers.length).toBe(1);
                expect(result.phoneNumbers[0].type).toBe(RxPhoneNumberType.Work);
                expect(result.phoneNumbers[0].isPrimary).toBe(true);
                expect(result.phoneNumbers[0].isPrimaryForType).toBe(true);
                expect(result.phoneNumbers[0].number).toBe(parseInt(legacyPatient.Phone));
            });

        });

    });

});
