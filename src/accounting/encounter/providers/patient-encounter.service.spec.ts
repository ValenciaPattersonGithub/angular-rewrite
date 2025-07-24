import { TestBed } from '@angular/core/testing';

import { PatientEncounterService } from './patient-encounter.service';

describe('PatientEncounterService', () => {
    let service: PatientEncounterService;

    beforeEach(() => TestBed.configureTestingModule({}));

    beforeEach(() => {
        service = TestBed.get(PatientEncounterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createEncounter', () => {
        let serviceTransactionDto =  { ObjectState: 'Add', DisplayAs: 'ABC', Amount: 10, InsuranceOrder: 0, Discount: 10, Tax: 5, Fee: 25 };

        beforeEach(() => {
            service.buildServiceTransaction = jasmine.createSpy().and.returnValue(serviceTransactionDto);
            service.syncAppointmentIdOnService = jasmine.createSpy();
        });

        it('should create an encounter with no arguments', () => {
            let result = service.createEncounter();

            expect(result).not.toBe(null);
        });

        it('should set AccountMemberId if passed in', () => {
            let result = service.createEncounter('123');

            expect(result.AccountMemberId).toBe('123');
        });

        //This if statement that this test is written against is commented out because the code never gets hit.
        //it('should call buildServiceTransaction', () => {
        //    let serviceDtos = [];
        //    serviceDtos.push(serviceTransactionDto);

        //    let result = service.createEncounter('123', serviceDtos);

        //    expect(service.buildServiceTransaction).toHaveBeenCalled();
        //});

        //This if statement that this test is written against is commented out because the code never gets hit.
        //it('should call syncAppointmentIdOnService', () => {
        //    let serviceDtos = [];
        //    serviceDtos.push(serviceTransactionDto);

        //    let result = service.createEncounter('123', serviceDtos);

        //    expect(service.syncAppointmentIdOnService).toHaveBeenCalled();
        //});

        //This if statement that this test is written against is commented out because the code never gets hit.
        //it('should add service to encounter', () => {
        //    let serviceDtos = [];
        //    serviceDtos.push(serviceTransactionDto);

        //    let result = service.createEncounter('123', serviceDtos);

        //    expect(result.ServiceTransactionDtos.length).toBe(1);
        //});

        //This if statement that this test is written against is commented out because the code never gets hit.
        //it('should update service amount', () => {
        //    let serviceDtos = [];
        //    serviceDtos.push(serviceTransactionDto);

        //    let result = service.createEncounter('123', serviceDtos);

        //    expect(result.ServiceTransactionDtos[0].Amount).toBe(20);
        //});
    });

    describe('buildServiceTransaction', () => {
        let serviceTransactionDto = { ObjectState: 'Add', DisplayAs: 'ABC', Amount: 10, InsuranceOrder: 0, Discount: 10, Tax: 5, Fee: 25 };

        beforeEach(() => {
            service.CreateInsuranceEstimateObject = jasmine.createSpy();
        });

        it('should return a new serviceTransaction', () => {
            let result = service.buildServiceTransaction(serviceTransactionDto);

            expect(result).not.toBe(null);
        });

        it('should call CreateInsuranceEstimateObject', () => {
            let result = service.buildServiceTransaction(serviceTransactionDto);

            expect(service.CreateInsuranceEstimateObject).toHaveBeenCalled();
        });

        it('should set AccountMemberId for new transaction', () => {
            let result = service.buildServiceTransaction(serviceTransactionDto, 12);

            expect(result.AccountMemberId).toBe(12);
        });

        it('should set EncounterId for new transaction', () => {
            let result = service.buildServiceTransaction(serviceTransactionDto, null, 14);

            expect(result.EncounterId).toBe(14);
        });
    });

    describe('syncAppointmentIdOnService', () => {
        let syncServiceTransactionDtos = [];
        let appointmentId = 3;

        beforeEach(() => { 
            syncServiceTransactionDtos = [
                    { ObjectState: service.saveStates.Delete, AppointmentId: 3, DisplayAs: 'ABC', Amount: 10, InsuranceOrder: 0, Discount: 10, Tax: 5, Fee: 25 },
                    { ObjectState: service.saveStates.Add, AppointmentId: null, DisplayAs: 'ABC', Amount: 10, InsuranceOrder: 0, Discount: 10, Tax: 5, Fee: 25 }
                ];
        });

        it('should return result', () => {
            let result = service.syncAppointmentIdOnService(syncServiceTransactionDtos);
            expect(result).not.toBe(null);
        });

        it('should set appointment ids on all services', () => {
            let result = service.syncAppointmentIdOnService(syncServiceTransactionDtos,appointmentId);
            expect(result[1].AppointmentId).toBe(3);
        });

        it('should remove AppointmentId from deleted servicetransactions', () => {
            let result = service.syncAppointmentIdOnService(syncServiceTransactionDtos);
            expect(result[0].AppointmentId).toBe(null);
        });

        it('should set appointment ids on all services based on appointmentId on existing service '+
        'if no appointmentId passed in and ObjectState is Add or Update', () => {
            var serviceTransactionDtos = [
                { ServiceTransactionId:'1234', ObjectState: service.saveStates.Delete, AppointmentId: 4, },
                { ServiceTransactionId: null, ObjectState: service.saveStates.Add, AppointmentId: 4, },
                { ServiceTransactionId:'1236', ObjectState: service.saveStates.Update, AppointmentId: null, },
                { ServiceTransactionId:'1237', ObjectState: service.saveStates.None, AppointmentId: null, }
            ];            
            let result = service.syncAppointmentIdOnService(serviceTransactionDtos, null);
            result.forEach(serviceTransaction => {
                if (serviceTransaction.ServiceTransactionId === null||serviceTransaction.ServiceTransactionId === '1236'){
                    expect(serviceTransaction.AppointmentId).toBe(4);
                }                               
            })           
        });

        it('should set appointment ids and ObjectState on Service with ObjectState.Delete to null '+
        ' if no appointmentId passed in', () => {
            var serviceTransactionDtos = [
                { ServiceTransactionId:'1234', ObjectState: service.saveStates.Delete, AppointmentId: 4, },
                { ServiceTransactionId: null, ObjectState: service.saveStates.Add, AppointmentId: 4, },
                { ServiceTransactionId:'1236', ObjectState: service.saveStates.Update, AppointmentId: null, },
                { ServiceTransactionId:'1237', ObjectState: service.saveStates.None, AppointmentId: null, }
            ];              
            let result = service.syncAppointmentIdOnService(serviceTransactionDtos, null);
            result.forEach(serviceTransaction => {                
                if (serviceTransaction.ServiceTransactionId === '1234'){
                    expect(serviceTransaction.AppointmentId).toBe(null);
                    expect(serviceTransaction.ObjectState).toEqual(service.saveStates.Update);
                }                
            })           
        });

        it('should set appointment ids and ObjectState on all services based on appointmentId on existing service '+
        'if no appointmentId passed in and ObjectState is None', () => {
            var serviceTransactionDtos = [
                { ServiceTransactionId:'1234', ObjectState: service.saveStates.Delete, AppointmentId: 4, },
                { ServiceTransactionId: null, ObjectState: service.saveStates.Add, AppointmentId: 4, },
                { ServiceTransactionId:'1236', ObjectState: service.saveStates.Update, AppointmentId: null, },
                { ServiceTransactionId:'1237', ObjectState: service.saveStates.None, AppointmentId: null, }
            ];            
            let result = service.syncAppointmentIdOnService(serviceTransactionDtos, null);
            result.forEach(serviceTransaction => {
                if (serviceTransaction.ServiceTransactionId === '1237'){
                    expect(serviceTransaction.AppointmentId).toBe(4);
                    expect(serviceTransaction.ObjectState).toEqual(service.saveStates.Update);
                }                               
            })           
        });        
    });

    describe('CreateInsuranceEstimateObject', () => {
        it('should accept null input', () => {
            let result = service.CreateInsuranceEstimateObject(null);

            expect(result).not.toBe(null);
        });

        it('should set AccountMemberId', () => {
            let serviceTransaction = {
                AccountMemberId: 12,
                ServiceTransactionId: 13,
                ServiceCodeId: 14,
                Fee: 0
            };

            let result = service.CreateInsuranceEstimateObject(serviceTransaction);

            expect(result[0].AccountMemberId).toBe(12);
        });
    });
});
