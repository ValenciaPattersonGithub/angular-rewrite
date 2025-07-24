import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChartCustomColorsComponent } from './chart-custom-colors.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import { ExpectedConditions } from 'protractor';
import { of } from 'rxjs';

describe('ChartCustomColors', () => {
    let component: ChartCustomColorsComponent;
    let fixture: ComponentFixture<ChartCustomColorsComponent>;
    let mockChartColorHttpService: any;
    let mockPatSecurityService: any;
    let mockDiscardChangesService: any;
    let mockToastService: any;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ChartCustomColorsComponent]
        });
    });

    mockChartColorHttpService = {
        getAllChartColors: jasmine.createSpy().and.returnValue({
            subscribe: jasmine.createSpy(),
        }),
        update: jasmine.createSpy().and.returnValue({
            subscribe: jasmine.createSpy(),
        }),
    };

    mockPatSecurityService = {
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true)
    };

    mockDiscardChangesService = {
        onRegisterController: jasmine.createSpy(),
        currentChangeRegistration: {hasChange: false, controller: 'ChartCustomColorsController'}
    };

    mockToastService = {
        show: jasmine.createSpy(),
        close: jasmine.createSpy()
    };


    beforeEach(() => {
        component = new ChartCustomColorsComponent(mockChartColorHttpService,
            mockPatSecurityService,
            mockDiscardChangesService,
            mockToastService
        );
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });


    describe('ngOnInit ->', () => {
        it('should set sortOrder to 0', () => {
            component.sortOrder = 1;

            component.ngOnInit();

            expect(component.sortOrder).toEqual(0);
        });

        it('should call getEditPermissions', () => {
            component.getEditPermissions = jasmine.createSpy();

            component.ngOnInit();

            expect(component.getEditPermissions).toHaveBeenCalled();
        });

        it('should call chartColorsHttpService.getAllChartColors', () => {           
            component.ngOnInit();

            expect(mockChartColorHttpService.getAllChartColors).toHaveBeenCalled();
        });
    });

    describe('registerController ->', () => {
        
        it('should call discardChangesService.onRegisterController', () => {
            component.registerController();

            expect(mockDiscardChangesService.onRegisterController).toHaveBeenCalled();
        });
    });

    describe('getEditPermissions ->', () => {
        it('should set hasEditAmfa to true when user has amfa', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.hasEditAmfa = false;

            component.getEditPermissions();            

            expect(component.hasEditAmfa).toEqual(true);
        });

        it('should set hasEditAmfa to true when user has amfa', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.hasEditAmfa = true;

            component.getEditPermissions();

            expect(component.hasEditAmfa).toEqual(false);
        });
        
    });



    describe('resetColorToDefault ->', () => {
        beforeEach(() => {
            mockChartColorHttpService.update = jasmine.createSpy().and.returnValue({ 
                subscribe: jasmine.createSpy(),
            });
        });       

        it('should call chartColorsHttpService.update when isDisabled false and hasEditAmfa', () => {
            component.colorChanged = jasmine.createSpy();

            var colorToReset = { isDisabled: false, Color: "test", StatusName: "Accepted" };
            component.hasEditAmfa = true;

            component.resetColorToDefault(colorToReset);

            expect(component.colorChanged).toHaveBeenCalled();
        });



        
    });

    describe('colorChanged ->', () => {
        beforeEach(() => {
            component.setResetColorDisabledStatus = jasmine.createSpy();
            component.registerControllerHasChanges = jasmine.createSpy();
        });   

        it('should call setResetColorDisabledStatus', () => {
            component.isApplyEnabled = false;

            var colorObject = { isDisabled: false, Color: "test", StatusName: "Accepted" };
            component.hasEditAmfa = true;

            component.colorChanged(colorObject, 'newColor');

            expect(component.setResetColorDisabledStatus).toHaveBeenCalled();
        });

        it('should call if path when newColor is different from passed color', () => {
            component.isApplyEnabled = false;

            var colorObject = { isDisabled: false, Color: "test", StatusName: "Accepted" };
            component.hasEditAmfa = true;

            component.colorChanged(colorObject, 'newColor');

            expect(component.registerControllerHasChanges).toHaveBeenCalled();
            expect(component.isApplyEnabled).toBe(true);
        });

        it('should not call if path when newColor is same as passed color', () => {
            component.isApplyEnabled = false;

            var colorObject = { isDisabled: false, Color: "test", StatusName: "Accepted" };
            component.hasEditAmfa = true;

            component.colorChanged(colorObject, 'test');

            expect(component.registerControllerHasChanges).not.toHaveBeenCalled();
            expect(component.isApplyEnabled).toBe(false);
        });


    });

    describe('saveColorChanges ->', () => {
        beforeEach(() => {
            component.setResetColorDisabledStatus = jasmine.createSpy();
            component.registerControllerHasChanges = jasmine.createSpy();
        });

        it('on success should set isApplyEnabled to false', () => {
            component.isApplyEnabled = true;
            component.isSaving = false;
            component.chartColorsItems = [{ StatusName: 'Proposed', Value: 'old' }];

            mockChartColorHttpService.update = ()=> {
                return {
                    subscribe: (success, failure) => success({ Value: [{StatusName: 'Proposed', Value: 'new'}]})
                }                
            };
            
            component.hasEditAmfa = true;            

            component.saveColorChanges();

            expect(component.isApplyEnabled).toBe(false);
            expect(component.isSaving).toBe(false);
        });

        it('on success should set chartColorsItems to new values from response', () => {
            component.isApplyEnabled = true;
            component.isSaving = false;
            component.chartColorsItems = [{ StatusName: 'Proposed', Value: 'old' }];

            mockChartColorHttpService.update = () => {
                return {
                    subscribe: (success, failure) => success({ Value: [{ StatusName: 'Proposed', Value: 'new' }] })
                }                
            };
            
            component.hasEditAmfa = true;            

            component.saveColorChanges();

            expect(component.chartColorsItems).toEqual([{ StatusName: 'Proposed', Value: 'new' }]);            
        });

        it('on success should call methods', () => {
            component.isApplyEnabled = true;
            component.isSaving = false;
            component.chartColorsItems = [{ StatusName: 'Proposed', Value: 'old' }];
            component.registerControllerHasChanges = jasmine.createSpy();
            component.setResetColorDisabledStatus = jasmine.createSpy();

            mockChartColorHttpService.update = () => {
                return {
                    subscribe: (success, failure) => success({ Value: [{ StatusName: 'Proposed', Value: 'new' }] })
                }                
            };
            
            component.hasEditAmfa = true;

            component.saveColorChanges();

            expect(component.registerControllerHasChanges).toHaveBeenCalled();
            expect(component.setResetColorDisabledStatus).toHaveBeenCalled();
            expect(mockToastService.show).toHaveBeenCalled();
        });
          
        it('on error should call methods', () => {
            component.isApplyEnabled = true;
            component.isSaving = false;
            component.hasEditAmfa = true;
            component.chartColorsItems = [{ StatusName: 'Proposed', Value: 'old' }];
            component.registerControllerHasChanges = jasmine.createSpy();
            component.setResetColorDisabledStatus = jasmine.createSpy();

            mockChartColorHttpService.update = () => {
                return {
                    subscribe: (success, failure) => failure({ status: 409 })
                }
            };

            component.hasEditAmfa = true;

            component.saveColorChanges();

            expect(component.registerControllerHasChanges).toHaveBeenCalled();
            expect(component.hasEditAmfa).toBe(false);
            expect(mockToastService.show).toHaveBeenCalled();
        });


    });

    describe('changeSortOrder ->', () => {
        beforeEach(() => {
            component.chartColorsItems = [{ StatusName: 'billy' }, { StatusName: 'zebra' }, { StatusName: 'adam' }];
            component.originalSortOrder = ['billy', 'zebra', 'adam'];
            component.setResetColorDisabledStatus = jasmine.createSpy();
        });

        it('should call setResetColorDisabledStatus', () => {
            component.sortOrder = 2;            
            component.chartColorsItems = ['test'];

            component.changeSortOrder();

            expect(component.setResetColorDisabledStatus).toHaveBeenCalled();
        });

        it('should order chartColorItems in originalOrder when sortOrder is 2', () => {
            component.sortOrder = 2;            
            component.chartColorsItems = [{ StatusName: 'adam' }, { StatusName: 'billy' }, { StatusName: 'zebra' }];
            var expectedList = [{ StatusName: 'billy' }, { StatusName: 'zebra' }, { StatusName: 'adam' }];

            component.changeSortOrder();

            expect(component.sortOrder).toEqual(0);
            expect(component.chartColorsItems).toEqual(expectedList);
        });

        it('should order chartColorItems in ascending when sortOrder is 0', () => {
            component.sortOrder = 0;            
            var expectedOrder = [{ StatusName: 'adam' }, { StatusName: 'billy' }, { StatusName: 'zebra' }];

            component.changeSortOrder();

            expect(component.sortOrder).toEqual(1);
            expect(component.chartColorsItems).toEqual(expectedOrder);
        });

        it('should order chartColorItems in descending when sortOrder is 1', () => {
            component.sortOrder = 1;            
            var expectedOrder = [{ StatusName: 'zebra' }, { StatusName: 'billy' }, { StatusName: 'adam' } ];

            component.changeSortOrder();

            expect(component.sortOrder).toEqual(2);
            expect(component.chartColorsItems).toEqual(expectedOrder);
        });

    });

    describe('setResetColorDisabledStatus ->', () => {
        beforeEach(() => {            
        });

        it('should set isDisabled on chartColorsItems', () => {
            component.sortOrder = 2;
            component.chartColorsItems = [
                { StatusName: "Proposed/Pending", Color: "#ea4b35", isDisabled: false },
                { StatusName: "Accepted", Color: "notAMatch", isDisabled: false },
                { StatusName: "Referred", Color: "#9c56b9", isDisabled: false },
                { StatusName: "Referred Completed", Color: "#notAMatch", isDisabled: true },
                { StatusName: "Rejected", Color: "#6c5547", isDisabled: false },
                { StatusName: "Completed", Color: "#notAMatch", isDisabled: true },
                { StatusName: "Existing", Color: "#000000", isDisabled: false },
                { StatusName: "Condition Present", Color: "#2c97dd", isDisabled: false },
                { StatusName: "Condition Resolved", Color: "#14527a", isDisabled: false }
            ];
            var expectedList = [
                { StatusName: "Proposed/Pending", Color: "#ea4b35", isDisabled: true },
                { StatusName: "Accepted", Color: "notAMatch", isDisabled: false },
                { StatusName: "Referred", Color: "#9c56b9", isDisabled: true },
                { StatusName: "Referred Completed", Color: "#notAMatch", isDisabled: false },
                { StatusName: "Rejected", Color: "#6c5547", isDisabled: true },
                { StatusName: "Completed", Color: "#notAMatch", isDisabled: false },
                { StatusName: "Existing", Color: "#000000", isDisabled: true },
                { StatusName: "Condition Present", Color: "#2c97dd", isDisabled: true },
                { StatusName: "Condition Resolved", Color: "#14527a", isDisabled: true }
            ];

            component.setResetColorDisabledStatus();

            expect(component.chartColorsItems).toEqual(expectedList);
        });
    });

    describe('ngOnDestroy ->', () => {

        it('should call toastService.close and registerControllerHasChanges', () => {
            component.registerControllerHasChanges = jasmine.createSpy();

            component.ngOnDestroy();

            expect(mockToastService.close).toHaveBeenCalled();
            expect(component.registerControllerHasChanges).toHaveBeenCalled();
        });
    });

});
