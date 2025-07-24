import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SelectOptionsComponent } from './select-options.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
describe('SelectOptionsComponent', () => {
    let component: SelectOptionsComponent;
    let fixture: ComponentFixture<SelectOptionsComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [SelectOptionsComponent],
            imports: [
                TranslateModule.forRoot()  // Required import for componenets that use ngx-translate in the view or componenet code
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectOptionsComponent);
        component = fixture.componentInstance;
        component.widgetId = 14;
        component.selectedFinanceValue = 1;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('dropDownData method ->', () => {
        it('dropDownData should be called with array data', () => {
            component.dropDownData();
            expect(component.selectOptions.length).toEqual(3);
        });

        it('dropDownData should be called with selectedFinanceValue is 1 for not 27', () => {
            component.dropDownData();
            expect(component.selectedFinanceValue).toEqual(1);
        });

        it('dropDownData should be called with selectedFinanceValue is 1 for 27', () => {
            component.widgetId = 27;
            component.dropDownData();
            expect(component.selectedFinanceValue).toEqual(2);
        });

        it('dropDownData should be called with array data for 27', () => {
            component.widgetId = 27;
            component.dropDownData();
            expect(component.selectOptions.length).toEqual(2);
        });
    });
});
