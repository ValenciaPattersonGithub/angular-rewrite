import { ComponentFixture, TestBed, async, tick } from '@angular/core/testing';
import { PatientsByFlagsMigrationComponent } from './patients-by-flags-migration.component';
import { SimpleChange } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

describe('PatientsByFlagsMigrationComponent', () => {
    let component: PatientsByFlagsMigrationComponent;
    let fixture: ComponentFixture<PatientsByFlagsMigrationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PatientsByFlagsMigrationComponent],
            imports: [
                TranslateModule.forRoot(),
            ],
            providers: [
                TranslateService,
            ],
        });
        fixture = TestBed.createComponent(PatientsByFlagsMigrationComponent);
        component = fixture.componentInstance;
    });

    const testData = {
        "patientsFlagsLocations": [
            {
                "customFlagPatients": [				
                    {
                        "name": "321",
                        "patients": [
                            {
                                "appointments": [],
                                "encounters": [],
                                "lastServiceDate": "0001-01-01T00:00:00",
                                "patientCode": "ASAS2",
                                "totalBalance": 0,
                                "serviceTransactions": [],
                                "codePrefix": "ASAS",
                                "codeSequence": "2",
                                "firstName": "AS2",
                                "lastName": "AS2",
                                "middleName": "",
                                "suffixName": ""
                            }
                        ],
                        "total": 2
                    },
                    {
                        "name": "custom flag1",
                        "patients": [
                            {
                                "appointments": [],
                                "encounters": [],
                                "lastServiceDate": "0001-01-01T00:00:00",
                                "patientCode": "SIDSI2",
                                "totalBalance": 0,
                                "serviceTransactions": [],
                                "codePrefix": "SIDSI",
                                "codeSequence": "2",
                                "firstName": "sidra",
                                "lastName": "sidra",
                                "middleName": "",
                                "suffixName": ""
                            },
                            {
                                "appointments": [],
                                "encounters": [],
                                "lastServiceDate": "0001-01-01T00:00:00",
                                "patientCode": "OPOOP1",
                                "totalBalance": 0,
                                "serviceTransactions": [],
                                "codePrefix": "OPOOP",
                                "codeSequence": "1",
                                "firstName": "opo",
                                "lastName": "opo",
                                "middleName": "",
                                "suffixName": ""
                            },
                            {
                                "appointments": [],
                                "encounters": [],
                                "lastServiceDate": "0001-01-01T00:00:00",
                                "patientCode": "HASHA1",
                                "totalBalance": 0,
                                "serviceTransactions": [],
                                "codePrefix": "HASHA",
                                "codeSequence": "1",
                                "firstName": "Hassan",
                                "lastName": "Hassan",
                                "middleName": "",
                                "suffixName": ""
                            }
                        ],
                        "total": 5
                    }
                ],
                "flagPatients": [
                    {
                        "name": "Allergic to Music's Edit ActLog1",
                        "patients": [
                            {
                                "appointments": [],
                                "encounters": [],
                                "lastServiceDate": "0001-01-01T00:00:00",
                                "patientCode": "CRECH1",
                                "totalBalance": 0,
                                "serviceTransactions": [],
                                "codePrefix": "CRECH",
                                "codeSequence": "1",
                                "firstName": "Charlie",
                                "lastName": "Creed",
                                "middleName": "",
                                "suffixName": ""
                            },
                            {
                                "appointments": [],
                                "encounters": [],
                                "lastServiceDate": "0001-01-01T00:00:00",
                                "patientCode": "CHAJA42",
                                "totalBalance": 0,
                                "serviceTransactions": [],
                                "codePrefix": "CHAJA",
                                "codeSequence": "42",
                                "firstName": "javier lopez",
                                "lastName": "chabelo ",
                                "middleName": "",
                                "suffixName": ""
                            }
                        ],
                        "total": 21
                    }
                ]
            }
        ],
        "generatedAtDateTime": "2023-09-11T14:33:19.7931929Z",
        "generatedByUserCode": "ADMFU1",
        "locationOrPracticeEmail": "info@test.com",
        "locationOrPracticeName": "PracticePerf26899",
        "locationOrPracticePhone": "11111-222",
        "reportTitle": "Patients By Flags"
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
