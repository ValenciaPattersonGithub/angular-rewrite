import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BenefitPlanSearchComponent } from './benefit-plan-search.component';
import { SharedModule } from 'src/@shared/shared.module';
import { configureTestSuite } from 'src/configure-test-suite';

describe('BenefitPlanSearchComponent', () => {
    let component: BenefitPlanSearchComponent;
    let fixture: ComponentFixture<BenefitPlanSearchComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                SharedModule
            ],
            declarations: [BenefitPlanSearchComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BenefitPlanSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
