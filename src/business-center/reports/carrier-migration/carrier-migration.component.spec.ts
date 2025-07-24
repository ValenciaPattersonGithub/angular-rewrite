import { ComponentFixture, TestBed, async, tick } from '@angular/core/testing';
import { CarrierMigrationComponent } from './carrier-migration.component';
import { SimpleChange } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

describe('CarrierMigrationComponent', () => {
    let component: CarrierMigrationComponent;
    let fixture: ComponentFixture<CarrierMigrationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CarrierMigrationComponent],
            imports: [
                TranslateModule.forRoot(),
            ],
            providers: [
                TranslateService,
            ],
        });
        fixture = TestBed.createComponent(CarrierMigrationComponent);
        component = fixture.componentInstance;
    });

    const testData = {
        "carriers": [
            {
                "address": "3393 B",
                "address2": "Peachtree Corners Circle",
                "benefitPlans": [],
                "city": "Norcross",
                "email": "apollofuse@gmail.com",
                "name": "AProgressive",
                "payerId": "65412",
                "phoneNumbers": [
                    "3165190579"
                ],
                "state": "GA",
                "zipCode": "30092"
            },
            {
                "benefitPlans": [],
                "name": "BryceWilkinson Insurance Company",
                "phoneNumbers": []
            },
            {
                "address": "Address 1",
                "address2": "Address 2",
                "benefitPlans": [],
                "city": "Minnesotta",
                "name": "Carrier_463536",
                "payerId": "22244",
                "phoneNumbers": [
                    "1333234342"
                ],
                "state": "AK",
                "zipCode": "44444"
            },
            {
                "benefitPlans": [],
                "name": "MiguelPorter Insurance Company",
                "phoneNumbers": []
            },
            {
                "address": "abcd",
                "benefitPlans": [],
                "city": "xyz",
                "name": "carrierz",
                "payerId": "06126",
                "phoneNumbers": [
                    "6236245624"
                ],
                "state": "AL",
                "zipCode": "45678"
            },
            {
                "benefitPlans": [],
                "name": "AbramHardin Insurance Company",
                "phoneNumbers": []
            },
            {
                "benefitPlans": [],
                "name": "CristianGriffin Insurance Company",
                "phoneNumbers": []
            },
            {
                "address": "Auto Address 1",
                "address2": "Auto Address 2",
                "benefitPlans": [],
                "city": "Minnesotta",
                "email": "test@test.com",
                "name": "AutoCarrier",
                "payerId": "06126",
                "phoneNumbers": [
                    "1231231231"
                ],
                "state": "AK",
                "zipCode": "78888"
            },
            {
                "address": "Address 1 Verify the maximum length of the address field  Address 1 Verify the maximum length of the address field",
                "address2": "Address  Address 1 VerifAddress 1 Verify the maximum length of the address field y the maximum length of the address field",
                "benefitPlans": [],
                "city": "Effignham Address 1 Verify the maximum length of the address fie",
                "email": "allamt@test.com",
                "name": "AllowedAmtCarrier",
                "payerId": "06126",
                "phoneNumbers": [],
                "state": "MN",
                "zipCode": "44444"
            },
            {
                "address": "Address 1 maximum characters for this as a test to see how this looks on the add person field. It's only a test do not pass gend",
                "address2": "Address 2 another very long address for this as a test to see how this looks on the new add person screen and selecting a plaend",
                "benefitPlans": [],
                "city": "Minnesotta testing a very long city this is a test to see howend",
                "name": "zz444testinglongcarriernametoseeifthisstopsmeornotidon'tremember",
                "payerId": "44424",
                "phoneNumbers": [
                    "4644644444"
                ],
                "state": "AK",
                "zipCode": "44444-1234"
            },
            {
                "address": "123 Main St",
                "benefitPlans": [],
                "city": "Atlanta",
                "name": "BruceNorman Insurance Company",
                "payerId": "00000",
                "phoneNumbers": [],
                "state": "GA",
                "zipCode": "44433"
            }
        ],
        "generatedAtDateTime": "2024-05-23T08:40:57.9046294Z",
        "generatedByUserCode": "ADMFU1",
        "locationOrPracticeEmail": "info@test.com",
        "locationOrPracticeName": "PracticePerf26899",
        "locationOrPracticePhone": "11111-222",
        "reportTitle": "Carriers"
    };

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should set isDataLoaded to true when reportData$ emits data', async(() => {
        
        component.ngOnChanges({
            data: {
                previousValue: null,
                currentValue: testData,
                firstChange: true,
                isFirstChange: () => true,
            },
        });

        expect(component.isDataLoaded).toBe(false);

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(component.isDataLoaded).toBe(true);
        });
    }));

    it('should call ngOnChanges when data changes', () => {
        
        spyOn(component, 'ngOnChanges').and.callThrough();

        const changes: { [key: string]: SimpleChange } = {
            data: new SimpleChange(null, testData, false),
        };

        component.ngOnChanges(changes);

        expect(component.ngOnChanges).toHaveBeenCalledWith(changes);
    });
});
