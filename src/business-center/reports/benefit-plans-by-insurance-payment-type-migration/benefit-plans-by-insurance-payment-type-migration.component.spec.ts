import { ComponentFixture, TestBed, async, tick } from '@angular/core/testing';
import { BenefitPlansByInsurancePaymentTypeMigrationComponent } from './benefit-plans-by-insurance-payment-type-migration.component';
import { SimpleChange } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('BenefitPlansByInsurancePaymentTypeMigrationComponent', () => {
    let component: BenefitPlansByInsurancePaymentTypeMigrationComponent;
    let fixture: ComponentFixture<BenefitPlansByInsurancePaymentTypeMigrationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BenefitPlansByInsurancePaymentTypeMigrationComponent],
            imports: [
                TranslateModule.forRoot(),
            ],
            providers: [
                TranslateService,
            ],
        });
        fixture = TestBed.createComponent(BenefitPlansByInsurancePaymentTypeMigrationComponent);
        component = fixture.componentInstance;
    });

    const testData = {
        "paymentTypes": [
            {
                "currencyTypeId": 0,
                "description": "Check",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "P3",
                        "planGroupNumber": "P3P3P"
                    },
                    {
                        "name": "Cardinal Plan",
                        "planGroupNumber": "123123"
                    },
                    {
                        "name": "BugTesting",
                        "planGroupNumber": "121212"
                    },
                    {
                        "name": "A Kim ProgressiveQ",
                        "planGroupNumber": "21213213"
                    },
                    {
                        "name": "Test"
                    },
                    {
                        "name": "Landon Test Plan",
                        "planGroupNumber": "12345"
                    },
                    {
                        "name": "Plan for Elk",
                        "planGroupNumber": "1231231321"
                    },
                    {
                        "name": "Sharon's plan",
                        "planGroupNumber": "112233445566"
                    },
                    {
                        "name": "Brand new plan",
                        "planGroupNumber": "324234234"
                    },
                    {
                        "name": "0 coverage but has deductible"
                    },
                    {
                        "name": "PDemoo2",
                        "planGroupNumber": "PD02"
                    },
                    {
                        "name": "0FeeSchedule",
                        "planGroupNumber": "Grp0001"
                    },
                    {
                        "name": "Copy of 0FeeSchedule",
                        "planGroupNumber": "Grp0001"
                    },
                    {
                        "name": "Inactive Plan",
                        "planGroupNumber": "963521"
                    },
                    {
                        "name": "Plan_463536",
                        "planGroupNumber": "463536"
                    },
                    {
                        "name": "Kim Progressive"
                    },
                    {
                        "name": "Testing1"
                    },
                    {
                        "name": "TerrencePlan",
                        "planGroupNumber": "33333333"
                    },
                    {
                        "name": "TestingPlanForBug"
                    },
                    {
                        "name": "Copy of 463536_03PLAN",
                        "planGroupNumber": "44444"
                    },
                    {
                        "name": "PlanB",
                        "planGroupNumber": "Grp002"
                    },
                    {
                        "name": "463536_03PLAN",
                        "planGroupNumber": "44444"
                    },
                    {
                        "name": "GlobalPlan",
                        "planGroupNumber": "Globe120"
                    },
                    {
                        "name": "Do Not Submit"
                    },
                    {
                        "name": "PlanInsurance001",
                        "planGroupNumber": "30001"
                    },
                    {
                        "name": "Copy of Sharon's plan",
                        "planGroupNumber": "112233445566"
                    },
                    {
                        "name": "Copy of AA A'ron",
                        "planGroupNumber": "asrjt"
                    },
                    {
                        "name": "463536_01plan",
                        "planGroupNumber": "444444"
                    },
                    {
                        "name": "Demo007Plan",
                        "planGroupNumber": "44444"
                    },
                    {
                        "name": "463536_02",
                        "planGroupNumber": "33335"
                    },
                    {
                        "name": "Terrence2",
                        "planGroupNumber": "44444444444444444"
                    },
                    {
                        "name": "Terrence02",
                        "planGroupNumber": "333333"
                    },
                    {
                        "name": "Copy of Brand new plan testing",
                        "planGroupNumber": "324234234"
                    },
                    {
                        "name": "Test4plan"
                    },
                    {
                        "name": "Test1FusePlan"
                    },
                    {
                        "name": "Sharon Plan with Fee Schedule"
                    }
                ]
            },
            {
                "currencyTypeId": 0,
                "description": "aa ins type",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "New Plan test",
                        "planGroupNumber": "11223"
                    }
                ]
            },
            {
                "currencyTypeId": 0,
                "description": "AT TEST",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "Zz 20200121 Plan",
                        "planGroupNumber": "11235813"
                    },
                    {
                        "name": "OnePlan",
                        "planGroupNumber": "33333"
                    },
                    {
                        "name": "{{constructor.constructor('alert(document.domain)')()}}",
                        "planGroupNumber": "8549484"
                    },
                    {
                        "name": "Towplan",
                        "planGroupNumber": "33333"
                    }
                ]
            },
            {
                "currencyTypeId": 0,
                "description": "EFT",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "BugTest",
                        "planGroupNumber": "34343"
                    },
                    {
                        "name": "Copy of AbelHurst Benefit Plan edited",
                        "planGroupNumber": "12312312313"
                    },
                    {
                        "name": "BluePlan",
                        "planGroupNumber": "Blues0001 testing al"
                    },
                    {
                        "name": "Testy plan PP2",
                        "planGroupNumber": "pg1212121"
                    },
                    {
                        "name": "DeltaPlan",
                        "planGroupNumber": "33333333"
                    },
                    {
                        "name": "BugTest01",
                        "planGroupNumber": "345345"
                    },
                    {
                        "name": "AbelHurst Benefit Plan edited",
                        "planGroupNumber": "12312312313"
                    }
                ]
            },
            {
                "currencyTypeId": 0,
                "description": "B4 PayType1",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "A A'ron",
                        "planGroupNumber": "4000"
                    },
                    {
                        "name": "{{7*7}}<i>test (Nal{{7*7}}<i>test) {. {{7*7}}",
                        "planGroupNumber": "123123123123123"
                    },
                    {
                        "name": "Kyle Plan",
                        "planGroupNumber": "02-04"
                    }
                ]
            },
            {
                "currencyTypeId": 0,
                "description": "B3 insurance payment type",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "Copy of Test Plan",
                        "planGroupNumber": "1231231312"
                    },
                    {
                        "name": "Test Plan",
                        "planGroupNumber": "1231231312"
                    }
                ]
            },
            {
                "currencyTypeId": 0,
                "description": "insurance payment",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "LIC Anukur",
                        "planGroupNumber": "LIC ANK"
                    },
                    {
                        "name": "InnoPlan",
                        "planGroupNumber": "01234567890546656456"
                    },
                    {
                        "name": "Kim - Adjust at time of payment"
                    }
                ]
            },
            {
                "currencyTypeId": 0,
                "description": "Innovators Ins Payment",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "BarrettDelgado Benefit Plan"
                    },
                    {
                        "name": "Demo0010Plan",
                        "planGroupNumber": "44444"
                    }
                ]
            },
            {
                "currencyTypeId": 0,
                "description": "Ins Pymt",
                "isActive": false,
                "isSystemType": false,
                "paymentTypeCategory": 0,
                "benefitPlans": [
                    {
                        "name": "AbrahamGreene Benefit Plan",
                        "planGroupNumber": "120110"
                    }
                ]
            }
        ],
        "generatedAtDateTime": "2023-11-27T10:51:43.5302585Z",
        "generatedByUserCode": "ADMFU1",
        "locationOrPracticeEmail": "info@test.com",
        "locationOrPracticeName": "PracticePerf26899",
        "locationOrPracticePhone": "11111-222",
        "reportTitle": "Benefit Plans by Insurance Payment Type"
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
