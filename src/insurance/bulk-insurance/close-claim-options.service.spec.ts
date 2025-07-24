import { Overlay } from '@angular/cdk/overlay';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';

import { CloseClaimOptionsService } from './close-claim-options.service';
import { CloseClaimOptionsComponent } from './close-claim-options/close-claim-options.component';

describe('CloseClaimOptionsService', () => {
    let closeClaimOptionsService: CloseClaimOptionsService;

    const mockService = {
        // define called methods
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CloseClaimOptionsService,
                Overlay,
                { provide: ConfirmationModalOverlayRef, useValue: mockService },
            ], 
            declarations: [CloseClaimOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        
        closeClaimOptionsService = TestBed.inject(CloseClaimOptionsService);
    });
    it('should be created', () => {
        expect(closeClaimOptionsService).toBeTruthy();
    });

    describe('allowEstimateOption', () => {        
        let todaysDate = new Date();
        let currentMonth = todaysDate.getMonth();
        let currentYear = todaysDate.getFullYear();
        let services = [];        
        beforeEach(() => {            
            services = [
                {DateEntered: new Date('2021-05-03')},
                {DateEntered: new Date('2021-09-03')}
            ];
            todaysDate = new Date();
            currentMonth = new Date().getMonth();
            currentYear = todaysDate.getFullYear();
        })
        it('should return false if renewalMonth is 0 which indicates no renewal', () => {
            let renewalMonth = 0;
            expect(closeClaimOptionsService.allowEstimateOption(renewalMonth, services)).toBe(false);
        });

        it('should return false if renewalMonth is equal to service.Date month and service.Date year is current year', () => {
            let renewalMonth = currentMonth + 1;
            services[0].DateEntered = new Date(currentYear, currentMonth, 1);
            services[1].DateEntered = new Date(currentYear, currentMonth, 15);
            expect(closeClaimOptionsService.allowEstimateOption(renewalMonth, services)).toBe(false);
        });

        it('should return true if renewalMonth is more than the service.Date month and service.Date year is past year', () => {
            let renewalMonth = 5;
            services[0].DateEntered = new Date(currentYear - 1, 3, 1);   
            services[1].DateEntered = new Date(currentYear - 1, 3, 15);          
            expect(closeClaimOptionsService.allowEstimateOption(renewalMonth, services)).toBe(true);
        });
        
        it('should return true if renewalMonth is less than or equal to current month, and claims are from the previous year', () => {
            let renewalMonth = 1;
            services[0].DateEntered = new Date(currentYear - 1, 4, 1);
            services[1].DateEntered = new Date(currentYear - 1, 4, 1);
            expect(closeClaimOptionsService.allowEstimateOption(renewalMonth, services)).toBe(true);
        });

        it('should return true if service.Date year is prior to previous year regardless of renewalMonth', () => {
            let renewalMonth = currentMonth + 1;
            services[0].DateEntered = new Date(currentYear - 2, currentMonth, 1);
            services[1].DateEntered = new Date(currentYear - 2, currentMonth, 1);
            expect(closeClaimOptionsService.allowEstimateOption(renewalMonth, services)).toBe(true);
        });

        it('should return false if renewalMonth is less than the service.Date month and service.Date year is current year', () => {
            // Because of the dependency on the current date, this test is only valid in months before December
            if(currentMonth < 11) {
                let renewalMonth = currentMonth + 1;
                services[0].DateEntered = new Date(currentYear, renewalMonth + 1, 1);
                services[1].DateEntered = new Date(currentYear, renewalMonth + 1, 3);
                expect(closeClaimOptionsService.allowEstimateOption(renewalMonth, services)).toBe(false);
            }
        });

        it('should return true if one or more of the services service.Date month is less than the renewalMonth and the service.Date year is current year', () => {
            // Because of the dependency on the current date, this test is only valid in months after January
            if(currentMonth > 0) {
                let renewalMonth = currentMonth + 1;

                services[0].DateEntered = new Date(currentYear, renewalMonth, 1);
                services[1].DateEntered = new Date(currentYear, renewalMonth - 2, 1);
    
                expect(closeClaimOptionsService.allowEstimateOption(renewalMonth, services)).toBe(true);
            }
        });
    });
});
