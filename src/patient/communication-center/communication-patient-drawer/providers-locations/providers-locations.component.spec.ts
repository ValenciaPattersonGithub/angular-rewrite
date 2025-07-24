import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { ProvidersLocationsComponent } from './providers-locations.component';

describe('ProvidersLocationsComponent', () => {
    let component: ProvidersLocationsComponent;
    let fixture: ComponentFixture<ProvidersLocationsComponent>;

    const mockreferenceDataService = {
        get: (a: any) => { },
        entityNames: {
            users: [{ UserId: '12', FirstName: 'FN', LastName: 'LN' }]
        }
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [ProvidersLocationsComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'referenceDataService', useValue: mockreferenceDataService }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProvidersLocationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
