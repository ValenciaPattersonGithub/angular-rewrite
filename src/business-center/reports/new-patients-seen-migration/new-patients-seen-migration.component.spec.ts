import { ComponentFixture, TestBed, async, tick } from '@angular/core/testing';
import { NewPatientsSeenMigrationComponent } from './new-patients-seen-migration.component';
import { SimpleChange } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

describe('NewPatientsSeenMigrationComponent', () => {
    let component: NewPatientsSeenMigrationComponent;
    let fixture: ComponentFixture<NewPatientsSeenMigrationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NewPatientsSeenMigrationComponent],
            imports: [
                TranslateModule.forRoot(),
            ],
            providers: [
                TranslateService,
            ],
        });
        fixture = TestBed.createComponent(NewPatientsSeenMigrationComponent);
        component = fixture.componentInstance;
    });

    const testData = {
        "locationPatients": [
            {
                "location": "Innovators",
                "patients": [
                    {
                        "address": {
                            "state": ""
                        },
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "location": {
                            "appointments": [],
                            "nameLine1": "Innovators",
                            "rooms": []
                        },
                        "patientCode": "JOEHE1",
                        "totalBalance": 0,
                        "responsibleParty": {
                            "address": {
                                "state": ""
                            },
                            "appointments": [],
                            "encounters": [],
                            "lastServiceDate": "0001-01-01T00:00:00",
                            "patientCode": "JOEHE1",
                            "totalBalance": 0,
                            "serviceTransactions": [],
                            "codePrefix": "JOEHE",
                            "codeSequence": "1",
                            "firstName": "Herry ",
                            "lastName": "Joe",
                            "middleName": "",
                            "suffixName": ""
                        },
                        "serviceTransactions": [
                            {
                                "amount": 0,
                                "area": "",
                                "description": "00120: periodic oral evaluation - established patient (D0120)",
                                "discount": 0,
                                "discountRate": 0,
                                "estimateInsurances": [],
                                "fee": 0,
                                "location": {
                                    "appointments": [],
                                    "nameLine1": "Innovators",
                                    "rooms": []
                                },
                                "patient": {
                                    "address": {
                                        "state": ""
                                    },
                                    "appointments": [],
                                    "encounters": [],
                                    "lastServiceDate": "0001-01-01T00:00:00",
                                    "patientCode": "JOEHE1",
                                    "totalBalance": 0,
                                    "serviceTransactions": [],
                                    "codePrefix": "JOEHE",
                                    "codeSequence": "1",
                                    "firstName": "Herry ",
                                    "lastName": "Joe",
                                    "middleName": "",
                                    "suffixName": ""
                                },
                                "patientPortion": 0
                            }
                        ],
                        "codePrefix": "JOEHE",
                        "codeSequence": "1",
                        "firstName": "Herry ",
                        "lastName": "Joe",
                        "middleName": "",
                        "suffixName": ""
                    },
                    {
                        "address": {
                            "line1": "111 Patterson Drive",
                            "line2": "",
                            "city": "Effingham",
                            "state": "IL",
                            "zipCode": "62401"
                        },
                        "appointments": [],
                        "encounters": [],
                        "lastServiceDate": "0001-01-01T00:00:00",
                        "location": {
                            "appointments": [],
                            "nameLine1": "Innovators",
                            "rooms": []
                        },
                        "patientCode": "PATPR1",
                        "totalBalance": 0,
                        "phone": {
                            "number": "2173421616",
                            "type": "Home"
                        },
                        "responsibleParty": {
                            "address": {
                                "line1": "111 Patterson Drive",
                                "line2": "",
                                "city": "Effingham",
                                "state": "IL",
                                "zipCode": "62401"
                            },
                            "appointments": [],
                            "encounters": [],
                            "lastServiceDate": "0001-01-01T00:00:00",
                            "patientCode": "PATPR1",
                            "totalBalance": 0,
                            "serviceTransactions": [],
                            "codePrefix": "PATPR",
                            "codeSequence": "1",
                            "firstName": "Prescription",
                            "lastName": "Patient",
                            "middleName": "",
                            "suffixName": ""
                        },
                        "serviceTransactions": [
                            {
                                "amount": 0,
                                "area": "",
                                "description": "D0180: comprehensive periodontal evaluation - new or established patient (D0180)",
                                "discount": 0,
                                "discountRate": 0,
                                "estimateInsurances": [],
                                "fee": 0,
                                "location": {
                                    "appointments": [],
                                    "nameLine1": "Innovators",
                                    "rooms": []
                                },
                                "patient": {
                                    "address": {
                                        "line1": "111 Patterson Drive",
                                        "line2": "",
                                        "city": "Effingham",
                                        "state": "IL",
                                        "zipCode": "62401"
                                    },
                                    "appointments": [],
                                    "encounters": [],
                                    "lastServiceDate": "0001-01-01T00:00:00",
                                    "patientCode": "PATPR1",
                                    "totalBalance": 0,
                                    "serviceTransactions": [],
                                    "codePrefix": "PATPR",
                                    "codeSequence": "1",
                                    "firstName": "Prescription",
                                    "lastName": "Patient",
                                    "middleName": "",
                                    "suffixName": ""
                                },
                                "patientPortion": 0
                            }
                        ],
                        "codePrefix": "PATPR",
                        "codeSequence": "1",
                        "firstName": "Prescription",
                        "lastName": "Patient",
                        "middleName": "",
                        "suffixName": ""
                    }
                ]
            }
        ],
            "totalPatientsSeen": 2,
                "generatedAtDateTime": "2024-01-08T14:34:48.5147559Z",
                    "generatedByUserCode": "ADMFU1",
                        "locationOrPracticeEmail": "info@test.com",
                            "locationOrPracticeName": "PracticePerf26899",
                                "locationOrPracticePhone": "11111-222",
                                    "reportTitle": "New Patients Seen Beta"
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
