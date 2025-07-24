import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from "@angular/core/testing";
import { Component } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DateInputComponent, DatePickerModule } from "@progress/kendo-angular-dateinputs";
import { By } from "@angular/platform-browser";
import { AppDatePickerComponent } from "./date-picker.component";
import { AppLabelComponent } from "../form-label/form-label.component";

@Component({
    template: `
    <app-date-picker [(value)]="value" (dateChanged)="change($event)"></app-date-picker>
    `,
})
class TemplateFormComponent {
    public value: Date | null = null;
    public change: any = jasmine.createSpy('change');
}

@Component({
    template: `
    <app-date-picker [(ngModel)]="value" (dateChanged)="change($event)"></app-date-picker>
    `,
})
class TemplateModelFormComponent {
    public value: Date | null = null;
    public change: any = jasmine.createSpy('change');
}

@Component({
    template: `
    <app-date-picker [formControl]="value" (dateChanged)="change($event)"></app-date-picker>
    `,
})
class ReactiveFormComponent {
    value = new FormControl(null);
    public change: any = jasmine.createSpy('change');
}

describe('DatePickerComponent', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [TemplateFormComponent, TemplateModelFormComponent, ReactiveFormComponent, AppDatePickerComponent, AppLabelComponent],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                DatePickerModule
            ]
        });
    }));

    describe('Template-driven form', () => {
        let fixture: ComponentFixture<TemplateFormComponent>;
        let component: TemplateFormComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(TemplateFormComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize value', fakeAsync(() => {
            const value = new Date(2000, 10, 10);
            component.value = value;
            fixture.detectChanges();
            expect(component.value).toEqual(value);

            const input = fixture.debugElement.query(By.directive(DateInputComponent));
            expect(input.componentInstance.value).toEqual(value);
        }));

        it('should emit dateChanged event when date is changed', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(DateInputComponent));

            const value = new Date(2000, 10, 10);
            input.triggerEventHandler('valueChange', value);

            tick(301);

            expect(fixture.componentInstance.change).toHaveBeenCalledWith(value);
            // Notice that the value is not changed in the component when using [(value)] binding
            expect(component.value).not.toEqual(value);
        }));
    });

    describe('Template-driven form (ngModel)', () => {
        let fixture: ComponentFixture<TemplateModelFormComponent>;
        let component: TemplateModelFormComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(TemplateModelFormComponent);
            component = fixture.componentInstance;
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize value', fakeAsync(() => {
            const value = new Date(2000, 10, 10);
            component.value = value;
            fixture.detectChanges();
            expect(component.value).toEqual(value);

            const input = fixture.debugElement.query(By.directive(DateInputComponent));
            // Notice the initial value is not set in the input
            expect(input.componentInstance.value).not.toEqual(value);
        }));

        it('should emit dateChanged event when date is changed', fakeAsync(() => {
            fixture.detectChanges();
            const input = fixture.debugElement.query(By.directive(DateInputComponent));

            const value = new Date(2000, 10, 10);
            input.triggerEventHandler('valueChange', value);

            tick(301);

            expect(fixture.componentInstance.change).toHaveBeenCalledWith(value);
            expect(component.value).toEqual(value);
        }));
    });

    describe('Reactive form', () => {
        let fixture: ComponentFixture<ReactiveFormComponent>;
        let component: ReactiveFormComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(ReactiveFormComponent);
            component = fixture.componentInstance;
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize value', fakeAsync(() => {
            const value = new Date(2000, 10, 10);
            component.value.setValue(value);
            fixture.detectChanges();
            expect(component.value.value).toEqual(value);

            const input = fixture.debugElement.query(By.directive(DateInputComponent));
            expect(input.componentInstance.value).toEqual(value);
        }));

        it('should emit dateChanged event when date is changed', fakeAsync(() => {
            fixture.detectChanges();
            const input = fixture.debugElement.query(By.directive(DateInputComponent));

            const value = new Date(2000, 10, 10);
            input.triggerEventHandler('valueChange', value);

            tick(301);

            expect(fixture.componentInstance.change).toHaveBeenCalledWith(value);
            expect(component.value.value).toEqual(value);
        }));
    });

    describe('Component', () => {
        let fixture: ComponentFixture<AppDatePickerComponent>;
        let component: AppDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(AppDatePickerComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should emit dateChanged event when date is changed', fakeAsync(() => {
            const date = new Date();
            spyOn(component.dateChanged, 'emit');
            spyOn(component, 'onChange');

            component.onDateChange(date);
            tick(301);
            expect(component.dateChanged.emit).toHaveBeenCalledWith(date);
            expect(component.onChange).toHaveBeenCalledWith(date);
        }));
    });
});