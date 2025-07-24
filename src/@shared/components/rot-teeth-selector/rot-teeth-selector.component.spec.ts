import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, EventEmitter, OnInit, ViewChild, Input, Output, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../../@shared/shared.module';
import { RotTeethSelectorComponent } from './rot-teeth-selector.component';
import { ToothUtilityService } from 'src/@shared/providers/tooth-utility-service.service';
import { RotTeethDisplayPipe } from '../../pipes';
import { ToothAreaDataService } from '../../providers/tooth-area-data.service';
import { ToothAreaData } from '../../providers/tooth-area-data.model';
import { componentFactoryName } from '@angular/compiler';
import { configureTestSuite } from 'src/configure-test-suite';

//let mockToothUtility = {
//    quadrants: jasmine.createSpy().and.returnValue([]),

//    getAndSetupTeethDefinitions: jasmine.createSpy().and.returnValue([]) 
//}

describe('RotTeethSelectorComponent', () => {
    let component: RotTeethSelectorComponent;
    let fixture: ComponentFixture<RotTeethSelectorComponent>;

    let mockToothAreaDataService = {
        quadrants: ['UL', 'UR'],
        setupDataForRangeOfTeeth: jasmine.createSpy().and.returnValue([1, 2, 3, 4, 5, 6, 7, 9, 10]),
        setValuesOnServiceTransaction: jasmine.createSpy().and.callFake(function (x) { return x; }),
        rotToothChange: jasmine.createSpy().and.callFake(function (x) { return x; })
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [RotTeethSelectorComponent, RotTeethDisplayPipe],
            imports: [
                FormsModule,
                TranslateModule.forRoot()
            ],
            providers: [
                { provide: ToothAreaDataService, useValue: mockToothAreaDataService }
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RotTeethSelectorComponent);
        component = fixture.componentInstance;

        const selectedTeeth: any[] = [];
        component.selectedTeeth = selectedTeeth;
        let toothAreaData = new ToothAreaData();
        toothAreaData.serviceCode = { ServiceCodeId: 5, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true };
        toothAreaData.originalServiceCode = { ServiceCodeId: 5, AffectedAreaId: 5, UseCodeForRangeOfTeeth: true };
        component.service = { $toothAreaData: toothAreaData };
        component.input = '1,2,3';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });



    describe('inputKeydown function ->', () => {
        beforeEach(() => {

        });

        it('should set showDropdown and showTeethList to false when Tab is pressed without shift', () => {
            component.showDropdown = true;
            component.showTeethList = true;

            component.inputKeydown({ shiftKey: false, key: 'Tab' });
            expect(component.showDropdown).toBe(false);
            expect(component.showTeethList).toBe(false);
        });

        it('should set showDropdown and showTeethList to false when Tab is pressed without shift', () => {
            component.showDropdown = true;
            component.showTeethList = true;

            component.inputKeydown({ shiftKey: true, key: 'Tab' });
            expect(component.showDropdown).toBe(true);
            expect(component.showTeethList).toBe(true);
        });
    });

    describe('select function ->', () => {
        beforeEach(() => {
            component.toggleSelectedProperty = jasmine.createSpy();
            component.markTeethAsVisible = jasmine.createSpy();
            component.focusInput = jasmine.createSpy();
            component.updateSelected = jasmine.createSpy();
        });

        //Calls toggleSelectedProperty
        it('should call toggleSelectedProperty', () => {
            component.select(1);
            expect(component.toggleSelectedProperty).toHaveBeenCalled();
        });



        //Calls updateSelected
        it('should call updateSelected', () => {
            component.select(1);
            expect(component.updateSelected).toHaveBeenCalled();
        });

        //calls markTeethAsVisible and focusInput when inputValue is not empty
        it('should call markTeethAsVisible and focusInput when inputValue is not empty', async () => {
            component.inputValue = 1;
            await component.select(1);
            expect(component.markTeethAsVisible).toHaveBeenCalled();
            expect(component.focusInput).toHaveBeenCalled();
        });

        it('should not call markTeethAsVisible and focusInput when inputValue is empty', async () => {
            component.inputValue = '';
            await component.select(1);
            expect(component.markTeethAsVisible).not.toHaveBeenCalled();
            expect(component.focusInput).not.toHaveBeenCalled();
        });

        //Sets inputValue to null
        it('should set inputValue to null', async () => {
            component.inputValue = '1';
            await component.select(1);
            expect(component.inputValue).toEqual(null);
        });
    });


    describe('selectQuadrant function ->', () => {
        beforeEach(() => {
            component.selectRange = jasmine.createSpy();
            component.markTeethAsVisible = jasmine.createSpy();
            component.focusInput = jasmine.createSpy();
            component.updateSelected = jasmine.createSpy();
        });

        //Calls toggleSelectedProperty
        it('should call selectRange', async () => {
            await component.selectQuadrant(1);
            expect(component.selectRange).toHaveBeenCalled();
        });

        //calls markTeethAsVisible and focusInput when inputValue is not empty
        it('should call markTeethAsVisible and focusInput when inputValue is not empty', async () => {
            component.inputValue = 1;
            await component.selectQuadrant(1);
            expect(component.markTeethAsVisible).toHaveBeenCalled();
            expect(component.focusInput).toHaveBeenCalled();
        });

        it('should not call markTeethAsVisible and focusInput when inputValue is empty', async () => {
            component.inputValue = '';
            await component.selectQuadrant(1);
            expect(component.markTeethAsVisible).not.toHaveBeenCalled();
            expect(component.focusInput).not.toHaveBeenCalled();
        });

        //Sets inputValue to null
        it('should set inputValue to null', async () => {
            component.inputValue = '1';
            await component.selectQuadrant(1);
            expect(component.inputValue).toEqual(null);
        });
    });

    describe('selectIndividual function ->', () => {
        beforeEach(() => {
            component.toggleSelectedProperty = jasmine.createSpy();
            component.updateSelected = jasmine.createSpy();
        });

        //Does not call toggleSelectedProperty and updateSelected when tooth is not null
        it('should not call toggleSelectedProperty and updateSelected when tooth is not null', () => {
            component.findToothByUSNumber = jasmine.createSpy().and.returnValue(null);
            component.selectIndividual(1);
            expect(component.toggleSelectedProperty).not.toHaveBeenCalled();
            expect(component.updateSelected).not.toHaveBeenCalled();
        });


        //calls toggleSelectedProperty and updateSelected when tooth is not null
        it('should call toggleSelectedProperty and updateSelected when tooth is not null', () => {
            component.findToothByUSNumber = jasmine.createSpy().and.returnValue('1');
            component.selectIndividual(1);
            expect(component.toggleSelectedProperty).toHaveBeenCalled();
            expect(component.updateSelected).toHaveBeenCalled();
            expect(component.findToothByUSNumber).toHaveBeenCalled();
        });
    });

    describe('findToothByUSNumber function ->', () => {
        beforeEach(() => {
        });

        it('Should return tooth when match is found', () => {
            component.possibleTeeth = [{ USNumber: 1 }, { USNumber: 2 }]
            let result = component.findToothByUSNumber(1);
            expect(result).toEqual({ USNumber: 1 });
        });

        it('Should return null when no match is found', () => {
            component.possibleTeeth = [{ USNumber: 1 }, { USNumber: 2 }]
            let result = component.findToothByUSNumber(3);
            expect(result).toEqual(null);
        });
    });

    describe('findIndexByUSNumber function ->', () => {
        beforeEach(() => {
        });

        it('Should return tooth index when match is found', () => {
            component.possibleTeeth = [{ USNumber: 1 }, { USNumber: 2 }]
            let result = component.findToothByUSNumber(1);
            expect(result).toEqual({ USNumber: 1 });
        });

        it('Should return null when no match is found', () => {
            component.possibleTeeth = [{ USNumber: 1 }, { USNumber: 2 }]
            let result = component.findToothByUSNumber(3);
            expect(result).toEqual(null);
        });
    });


    describe('markTeethAsVisible function ->', () => {
        beforeEach(() => {
        });

        it('should set all possible teeth and quadrants to visible', () => {
            component.possibleTeeth = [{ visible: false }, { visible: false }]
            component.quadrants = [{ visible: false }, { visible: false }]
            let result = component.markTeethAsVisible();
            component.possibleTeeth.forEach(x => {
                expect(x.visible).toBe(true);
            });

            component.quadrants.forEach(x => {
                expect(x.visible).toBe(true);
            });
        });
    });

    describe('inputChanged function ->', () => {
        beforeEach(() => {
        });

        //From enter
        it('should do nothing if from enter', () => {
            component.fromEnter = true;
            component.showTeethList = true;
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }]
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }]
            let result = component.inputChanged(null, '1');
            expect(component.showTeethList).toBe(true);
        });


        //New value empty
        it('should set showTeethList to true when new value is empty', () => {
            component.fromEnter = false;
            component.showTeethList = false;
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }]
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }]
            let result = component.inputChanged(null, null);
            expect(component.showTeethList).toBe(true);
        });

        //New value with neither - nor ,
        it('should set showTeethList to true when new value contains no comma or dash', () => {
            component.fromEnter = false;
            component.showTeethList = false;
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }]
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }]
            let result = component.inputChanged(null, '2');
            expect(component.showTeethList).toBe(true);
        });


        //New value with -
        it('should set showTeethList to true when new value contains dash', () => {
            component.fromEnter = false;
            component.showTeethList = true;
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }]
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }]
            let result = component.inputChanged(null, '2-3');
            expect(component.showTeethList).toBe(false);
        });

        //New value with - and ,     

        it('should set showTeethList to true when new value contains dash and comma', () => {
            component.fromEnter = false;
            component.showTeethList = true;
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }]
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }]
            let result = component.inputChanged(null, '2-3, 5');
            expect(component.showTeethList).toBe(false);
        });
    });

    describe('filterBasedOnInput function ->', () => {
        beforeEach(() => {
        });

        it('should highlight first matching tooth', () => {
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }]
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }]
            let result = component.filterBasedOnInput('1');
            expect(component.possibleTeeth[0]).toEqual({ USNumber: '1', highlight: true, visible: true });
        });

        it('should highlight first matching quadrant', () => {
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }]
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }]
            let result = component.filterBasedOnInput('1');
            expect(component.quadrants[0]).toEqual({ USNumber: '1', highlight: true, visible: true });
        });
    });

    describe('updateSelected function ->', () => {
        beforeEach(() => {
        });



        it('should call updateTags', () => {
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }];
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }];
            component.updateTags = jasmine.createSpy();
            let result = component.updateSelected();
            expect(component.updateTags).toHaveBeenCalled();
        });

        it('should update selected list', () => {
            component.possibleTeeth = [{ USNumber: '1', selected: true }, { USNumber: '2', selected: true }, { USNumber: '3', selected: true },
            { USNumber: '4', selected: false }, { USNumber: '5', selected: true }];
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }];
            component.updateTags = jasmine.createSpy();
            let result = component.updateSelected();
            expect(component.selected).toEqual(['1-3', '5'])
        });

    });

    describe('updateTags function ->', () => {
        beforeEach(() => {
        });

        //Not loaded, updates selected teeth list
        it('should update selectedTeeth list', () => {
            component.isLoaded = false;
            component.selected = ['1-3', '5'];
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }];
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }];
            let result = component.updateTags();
            expect(component.selectedTeeth).toEqual(['1-3', '5']);
        });

        it('should update selectedTeeth list', () => {
            component.isLoaded = false;
            component.selected = ['1-3', '5'];
            component.possibleTeeth = [{ USNumber: '1', highlight: false, visible: false }];
            component.quadrants = [{ USNumber: '1', highlight: false, visible: false }];
            let result = component.updateTags();
            expect(component.selectedTeeth).toEqual(['1-3', '5']);
        });

    });

    describe('removeIndividual function ->', () => {
        beforeEach(() => {
        });


        it('should call findToothByUSNumber and methods when tooth is returned', () => {
            component.findToothByUSNumber = jasmine.createSpy().and.returnValue('0');
            component.toggleSelectedProperty = jasmine.createSpy();
            component.updateSelected = jasmine.createSpy();
            component.removeIndividual('tooth');
            expect(component.findToothByUSNumber).toHaveBeenCalled();
            expect(component.toggleSelectedProperty).toHaveBeenCalled();
            expect(component.updateSelected).toHaveBeenCalled();
        });

        it('should not call findToothByUSNumber and methods when tooth is not returned', () => {
            component.findToothByUSNumber = jasmine.createSpy().and.returnValue(null);
            component.toggleSelectedProperty = jasmine.createSpy();
            component.updateSelected = jasmine.createSpy();
            component.removeIndividual('tooth');
            expect(component.findToothByUSNumber).toHaveBeenCalled();
            expect(component.toggleSelectedProperty).not.toHaveBeenCalled();
            expect(component.updateSelected).not.toHaveBeenCalled();
        });
    });


    describe('removeRange function ->', () => {
        beforeEach(() => {
            component.toggleSelectedProperty = jasmine.createSpy();
            component.updateSelected = jasmine.createSpy();
            component.possibleTeeth = [{ USNumber: '1', selected: true }, { USNumber: '2', selected: true }, { USNumber: '3', selected: true },
            { USNumber: '4', selected: false }, { USNumber: '5', selected: true }];
        });


        it('should call toggleSelectedProperty and updateSelected', () => {
            component.isLoaded = false;
            component.selected = ['1-3', '5'];
            let result = component.removeRange('1-3');
            expect(component.toggleSelectedProperty).toHaveBeenCalled();
            expect(component.updateSelected).toHaveBeenCalled();
        });
    });

    describe('loadPreselectedTeeth function ->', () => {
        beforeEach(() => {
            component.selectIndividual = jasmine.createSpy();
            component.selectRange = jasmine.createSpy();
            component.updateSelected = jasmine.createSpy();
            component.possibleTeeth = [{ USNumber: '1', selected: true }, { USNumber: '2', selected: true }, { USNumber: '3', selected: true },
            { USNumber: '4', selected: false }, { USNumber: '5', selected: true }];
        });


        it('should call toggleSelectedProperty and updateSelected', async () => {
            component.isLoaded = false;
            component.selected = ['1-3', '5'];
            await component.loadPreselectedTeeth('1-3, 5');
            expect(component.selectRange).toHaveBeenCalled();
            expect(component.updateSelected).toHaveBeenCalled();
        });

        it('should call toggleSelectedProperty and updateSelected', async () => {
            component.isLoaded = false;
            component.selected = ['7', '5'];
            await component.loadPreselectedTeeth('2, 5');
            expect(component.selectIndividual).toHaveBeenCalled();
            expect(component.updateSelected).toHaveBeenCalled();
        });
    });

    describe('rangeToCode function ->', () => {
        beforeEach(() => {
        });

        it('should Translate Range to Code 1-8', () => {
            let input = '1-8';
            let result = component.rangeToCode(input);
            expect(result).toEqual('UR');
        });

        it('should Translate Range to Code A-E', () => {
            let input = 'A-E';
            let result = component.rangeToCode(input);
            expect(result).toEqual('UR');
        });

        it('should Not Translate Range to Code if input is has no associated code', () => {
            let input = '1';
            let result = component.rangeToCode(input);
            expect(result).toEqual('1');
        });
    });

    describe('remove(tooth) function Single Tooth ->', () => {
        beforeEach(() => {
            component.removeIndividual = jasmine.createSpy();
            component.focusInput = jasmine.createSpy();
        });

        it('Should remove single tooth 1', () => {
            let tooth = '1';
            component.remove(tooth);
            expect(component.removeIndividual).toHaveBeenCalled();
        });

        it('Should remove single tooth A', () => {
            let tooth = 'A';
            component.remove(tooth);
            expect(component.removeIndividual).toHaveBeenCalled();
        });
    });

    describe('remove(tooth) function a range of teeth ->', () => {
        beforeEach(() => {
            component.removeRange = jasmine.createSpy();
            component.focusInput = jasmine.createSpy();
        });

        it('should remove range of teeth 1-8', () => {
            let tooth = '1-8';
            component.remove(tooth);
            expect(component.removeRange).toHaveBeenCalled();
        });

        it('should remove range of teeth A-E', () => {
            let tooth = 'A-E';
            component.remove(tooth);
            expect(component.removeRange).toHaveBeenCalled();
        });
    });
});
