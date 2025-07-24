import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EncounterCartBalanceBarComponent } from './encounter-cart-balance-bar.component';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { TranslateModule } from '@ngx-translate/core';
import {
    EncounterTotalAmountPipe, EncounterTotalTaxPipe, EncounterTotalDiscountPipe,
    EncounterTotalFeePipe, EncounterTotalAdjEstPipe, EncounterTotalEstinsPipe, EncounterTotalPatientPortionPipe, EncounterTotalAllowedAmountPipe
} from 'src/@shared/pipes/encounter/encounter-totals.pipe';
import { configureTestSuite } from 'src/configure-test-suite';

describe('EncounterCartBalanceBarComponent', () => {
    let component: EncounterCartBalanceBarComponent;
    let fixture: ComponentFixture<EncounterCartBalanceBarComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [EncounterCartBalanceBarComponent,
                EncounterTotalAmountPipe, EncounterTotalTaxPipe, EncounterTotalDiscountPipe,
                EncounterTotalFeePipe, EncounterTotalAdjEstPipe, EncounterTotalEstinsPipe,
                EncounterTotalPatientPortionPipe, EncounterTotalAllowedAmountPipe]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EncounterCartBalanceBarComponent);
        component = fixture.componentInstance;
        component.services = [{ Fee: '100'}, {Fee: '150'}];
        fixture.detectChanges();
    });


    it('should create', () => {
        expect(component).toBeTruthy();
    });

});