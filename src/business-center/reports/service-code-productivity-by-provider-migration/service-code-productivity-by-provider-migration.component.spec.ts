import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ServiceCodeProductivityByProviderMigrationComponent } from './service-code-productivity-by-provider-migration.component';

describe('ServiceCodeProductivityByProviderMigrationComponent', () => {
    let component: ServiceCodeProductivityByProviderMigrationComponent;
    let fixture: ComponentFixture<ServiceCodeProductivityByProviderMigrationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ServiceCodeProductivityByProviderMigrationComponent],
            imports: [TranslateModule.forRoot()]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServiceCodeProductivityByProviderMigrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Refresh the data', () => {
        it('should create the component', () => {
            let data =
            {
                "Success": true,
                "ResultCode": 0,
                "Value": {
                    "Number": 1,
                    "Fee": 12345.00,
                    "AllowedAmount": 12.00,
                    "ProviderDetails": [
                        {
                            "Provider": "Admin, Innovators - ADMIN1",
                            "Number": 1,
                            "Fee": 12345.00,
                            "AllowedAmount": 12.00,
                            "ServiceTypes": [
                                {
                                    "ServiceType": "Diagnostic",
                                    "Details": [
                                        {
                                            "ServiceCode": "00120",
                                            "CdtCode": "D0120",
                                            "Description": "periodic oral evaluation - established patient",
                                            "Number": 1,
                                            "Fee": 12345.00,
                                            "AllowedAmount": 12.00
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "ReportTitle": "Service Code Productivity by Provider",
                    "GeneratedAtDateTime": "2024-06-04T14:04:01.9953039Z",
                    "GeneratedByUserCode": "ADMFU1",
                    "LocationOrPracticeName": "PracticePerf26899",
                    "LocationOrPracticePhone": "11111-222",
                    "LocationOrPracticeEmail": "info@test.com",
                    "FilterInfo": null,
                    "ReportRunDate": null
                },
                "Count": null,
                "InvalidProperties": null
            };

            component.data = data;
            component.refreshData = jasmine.createSpy();
            component.ngOnChanges();
            expect(component.refreshData).toHaveBeenCalled();
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
