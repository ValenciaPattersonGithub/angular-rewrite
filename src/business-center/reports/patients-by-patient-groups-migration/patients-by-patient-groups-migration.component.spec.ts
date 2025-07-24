import { ComponentFixture, TestBed, async, tick } from '@angular/core/testing';
import { PatientsByPatientGroupsMigrationComponent } from './patients-by-patient-groups-migration.component';
import { SimpleChange } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('PatientsByPatientGroupsMigrationComponent', () => {
    let component: PatientsByPatientGroupsMigrationComponent;
    let fixture: ComponentFixture<PatientsByPatientGroupsMigrationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PatientsByPatientGroupsMigrationComponent],
            imports: [
                TranslateModule.forRoot(),
            ],
            providers: [
                TranslateService,
            ],
        });
        fixture = TestBed.createComponent(PatientsByPatientGroupsMigrationComponent);
        component = fixture.componentInstance;
    });

    const testData = {
        "patientGroups": [
            {
                "patientGroupName": "11456",
                "patients": [
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2022-12-08T11:00:00",
                        "patientCode": "SISFE1",
                        "totalBalance": 5682.88,
                        "serviceTransactions": [],
                        "codePrefix": "SISFE",
                        "codeSequence": "1",
                        "firstName": "Fellsi",
                        "lastName": "Sister",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2022-06-06T11:47:49.886",
                        "patientCode": "REFDI1",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "REFDI",
                        "codeSequence": "1",
                        "firstName": "Discounts",
                        "lastName": "Refferals",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2023-10-11T15:01:17.871",
                        "patientCode": "ANGAN1",
                        "totalBalance": 10967.61,
                        "serviceTransactions": [],
                        "codePrefix": "ANGAN",
                        "codeSequence": "1",
                        "firstName": "AnglersPatientFF",
                        "lastName": "AnglersPatientFF",
                        "middleName": "M"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2022-05-17T17:31:37.82",
                        "patientCode": "REPAP1",
                        "totalBalance": 585.03,
                        "serviceTransactions": [],
                        "codePrefix": "REPAP",
                        "codeSequence": "1",
                        "firstName": "API",
                        "lastName": "Reporting",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "patientCode": "KUMSA1",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "KUMSA",
                        "codeSequence": "1",
                        "firstName": "Samuel",
                        "lastName": "Kumar",
                        "middleName": ""
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "patientCode": "ROMSH17",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "ROMSH",
                        "codeSequence": "17",
                        "firstName": "Sharon",
                        "lastName": "Romie",
                        "middleName": "T"
                    }
                ],
                "patientCount": 6,
                "totalBalance": 17235.52
            },
            {
                "patientGroupName": "10",
                "patients": [
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2023-10-16T11:52:48.202",
                        "patientCode": "PTE1",
                        "totalBalance": 211,
                        "serviceTransactions": [],
                        "codePrefix": "PTE",
                        "codeSequence": "1",
                        "firstName": "TestUserp",
                        "lastName": "P",
                        "middleName": ""
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2022-06-06T11:47:49.886",
                        "patientCode": "REFDI1",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "REFDI",
                        "codeSequence": "1",
                        "firstName": "Discounts",
                        "lastName": "Refferals",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2023-02-28T10:41:52.028",
                        "patientCode": "HENDA13",
                        "totalBalance": 915.08,
                        "serviceTransactions": [],
                        "codePrefix": "HENDA",
                        "codeSequence": "13",
                        "firstName": "Davis",
                        "lastName": "Henry",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "patientCode": "LALPA1",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "LALPA",
                        "codeSequence": "1",
                        "firstName": "Patient",
                        "lastName": "Lal",
                        "middleName": ""
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2023-02-10T22:00:00",
                        "patientCode": "TESPR5",
                        "totalBalance": 950,
                        "serviceTransactions": [],
                        "codePrefix": "TESPR",
                        "codeSequence": "5",
                        "firstName": "ProfilePatient",
                        "lastName": "Test",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "patientCode": "ROMSH17",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "ROMSH",
                        "codeSequence": "17",
                        "firstName": "Sharon",
                        "lastName": "Romie",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "patientCode": "PATPR3",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "PATPR",
                        "codeSequence": "3",
                        "firstName": "Prod",
                        "lastName": "PatientInformation",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "2023-02-24T10:45:59.16",
                        "patientCode": "ORMLI1",
                        "totalBalance": 43.74,
                        "serviceTransactions": [],
                        "codePrefix": "ORMLI",
                        "codeSequence": "1",
                        "firstName": "Lisa",
                        "lastName": "Ormsby",
                        "middleName": ""
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "patientCode": "TESVE9",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "TESVE",
                        "codeSequence": "9",
                        "firstName": "VerifyContact",
                        "lastName": "Test",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "patientCode": "ACTPA2",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "ACTPA",
                        "codeSequence": "2",
                        "firstName": "PatientProfile",
                        "lastName": "Activitylog",
                        "middleName": "T"
                    },
                    {
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "patientCode": "PATVE1",
                        "totalBalance": 0,
                        "serviceTransactions": [],
                        "codePrefix": "PATVE",
                        "codeSequence": "1",
                        "firstName": "Verify_Modify",
                        "lastName": "PatientInfo",
                        "middleName": "T"
                    }
                ],
                "patientCount": 11,
                "totalBalance": 2119.82
            }
        ],
        "generatedAtDateTime": "2023-11-07T16:14:01.3130163Z",
        "generatedByUserCode": "ADMFU1",
        "locationOrPracticeEmail": "info@test.com",
        "locationOrPracticeName": "PracticePerf26899",
        "locationOrPracticePhone": "11111-222",
        "reportTitle": "Patients By Patient Groups"
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
