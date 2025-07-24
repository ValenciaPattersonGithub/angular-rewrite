import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { configureTestSuite } from 'src/configure-test-suite';

import { DentalRecordsComponent } from './dental-records.component';

describe('DentalRecordsComponent', () => {
    let component: DentalRecordsComponent;
    let fixture: ComponentFixture<DentalRecordsComponent>;
    const mockservice = {
        States: () => new Promise((resolve, reject) => {
            // the resolve / reject functions control the fate of the promise
        }),
        PhoneTypes: () => new Promise((resolve, reject) => {
            // the resolve / reject functions control the fate of the promise
        })
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            declarations: [DentalRecordsComponent, AppLabelComponent],
            providers: [
                { provide: 'StaticData', useValue: mockservice }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DentalRecordsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
