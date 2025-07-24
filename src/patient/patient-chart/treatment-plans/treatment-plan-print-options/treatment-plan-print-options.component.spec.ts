import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TreatmentPlanPrintOptionsComponent } from './treatment-plan-print-options.component';

describe('TreatmentPlanPrintOptionsComponent', () => {
    let component: TreatmentPlanPrintOptionsComponent;
    let fixture: ComponentFixture<TreatmentPlanPrintOptionsComponent>;
    const mockTabLauncher: any = {
        launchNewTab: jasmine.createSpy()
    };
    const mockDocumentsLoadingService: any = {
        setDocument: jasmine.createSpy()
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TreatmentPlanPrintOptionsComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: 'DocumentsLoadingService', useValue: mockDocumentsLoadingService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TreatmentPlanPrintOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('updatePrintButton -> ', () => {
        beforeEach(() => {
            component.txPlanPrintOptions.forEach((option) => { option.checked = false; });
            component.txPlanOtherOptions.forEach((option) => { option.checked = false; });
        });

        it('should be disabled if none of the options are true', () => {
            component.updatePrintButton();

            expect(component.printButtonDisabled).toBeTruthy();
        });

        it('should be enabled if one of the column options are true', () => {
            let option = component.txPlanPrintOptions[0];
            option.checked = true;

            component.updatePrintButton();

            expect(component.printButtonDisabled).toBeFalsy();
        });

        it('should be enabled if one of the other options are true', () => {
            let option = component.txPlanOtherOptions[0];
            option.checked = true;

            component.updatePrintButton();

            expect(component.printButtonDisabled).toBeFalsy();
        });

        it('should be enabled if all of the options are true', () => {
            component.txPlanPrintOptions.forEach((option) => { option.checked = true; });
            component.txPlanOtherOptions.forEach((option) => { option.checked = true; });

            component.updatePrintButton();

            expect(component.printButtonDisabled).toBeFalsy();
        });
    });

    describe('printOptionChanged -> ', () => {
        beforeEach(() => {
            component.updatePrintButton = jasmine.createSpy();
        });

        it('should set checked to value passed in by event', () => {
            let index = 0;
            let event = {
                "currentTarget": {
                    "checked": true
                }
            };

            component.printOptionChanged(event, index);

            expect(component.txPlanPrintOptions[index].checked).toBe(event.currentTarget.checked);
        });

        it('should call updatePrintButton', () => {
            let index = 0;
            let event = {
                "currentTarget": {
                    "checked": true
                }
            };

            component.printOptionChanged(event, index);

            expect(component.updatePrintButton).toHaveBeenCalled();
        });
    });

    describe('printOtherOptionChanged -> ', () => {
        beforeEach(() => {
            component.updatePrintButton = jasmine.createSpy();
        });

        it('should set checked to value passed in by event', () => {
            let index = 0;
            let event = {
                "currentTarget": {
                    "checked": true
                }
            };

            component.printOtherOptionChanged(event, index);

            expect(component.txPlanOtherOptions[index].checked).toBe(event.currentTarget.checked);
        });

        it('should call updatePrintButton', () => {
            let index = 0;
            let event = {
                "currentTarget": {
                    "checked": true
                }
            };

            component.printOtherOptionChanged(event, index);

            expect(component.updatePrintButton).toHaveBeenCalled();
        });
    });

    describe('selectAllChanged -> ', () => {
        beforeEach(() => {
            component.updatePrintButton = jasmine.createSpy();
            component.txPlanPrintOptions.forEach((option) => { option.checked = true; });
        });

        it('should update all TxPlan options with new value', () => {
            let event = {
                "currentTarget": {
                    "checked": false
                }
            };

            component.selectAllChanged(event);

            let result = component.txPlanPrintOptions.some((option) => { option.checked === true });
            expect(result).toBeFalsy();
        });

        it('should call updatePrintButton', () => {
            let event = {
                "currentTarget": {
                    "checked": true
                }
            };

            component.selectAllChanged(event);

            expect(component.updatePrintButton).toHaveBeenCalled();
        });
    });

    describe('selectAllOptionsChanged -> ', () => {
        beforeEach(() => {
            component.updatePrintButton = jasmine.createSpy();
            component.txPlanOtherOptions.forEach((option) => { option.checked = true; });
        });

        it('should update all TxPlan other options with new value', () => {
            let event = {
                "currentTarget": {
                    "checked": false
                }
            };

            component.selectAllOptionsChanged(event);

            let result = component.txPlanOtherOptions.some((option) => { option.checked === true });
            expect(result).toBeFalsy();
        });

        it('should call updatePrintButton', () => {
            let event = {
                "currentTarget": {
                    "checked": true
                }
            };

            component.selectAllOptionsChanged(event);

            expect(component.updatePrintButton).toHaveBeenCalled();
        });
    });

    describe('closeModal -> ', () => {
        beforeEach(() => {
            component.modalinstance = {
                close: jasmine.createSpy()
            };
        });

        it('should call modalinstance close', () => {
            component.closeModal();

            expect(component.modalinstance.close).toHaveBeenCalled();
        });
    });

});
