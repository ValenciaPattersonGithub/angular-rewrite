import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PotentialDuplicatePatientsMigrationComponent } from './potential-duplicate-patients-migration.component';

describe('PotentialDuplicatePatientsMigrationComponent', () => {
  let component: PotentialDuplicatePatientsMigrationComponent;
  let fixture: ComponentFixture<PotentialDuplicatePatientsMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PotentialDuplicatePatientsMigrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PotentialDuplicatePatientsMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "Patients": [
          {
            "LastName": null,
            "DOB": "0001-01-01T00:00:00",
            "Patients": [
              {
                "PatientName": "Kristen, Gary T. Jr",
                "PatientID": "KRIGA1",
                "PerferredName": "Gray",
                "DOB": "1992-01-01T00:00:00",
                "Address": "Address 1 Address 2,  Honululu HI 55555",
                "Phone": null,
                "PhoneNumberType": null,
                "Email": null,
                "PrimaryLocation": "Innovators",
                "ResponsibleParty": "",
                "Status": "Inactive",
                "RowNumber": 1
              },
              {
                "PatientName": "Kristen, Gbry T. Jr",
                "PatientID": "KRIGB1",
                "PerferredName": "Gary",
                "DOB": "1992-01-01T00:00:00",
                "Address": "Address 1 Address 2,  Honululu HI 55555",
                "Phone": null,
                "PhoneNumberType": null,
                "Email": null,
                "PrimaryLocation": "Innovators",
                "ResponsibleParty": "",
                "Status": "Inactive",
                "RowNumber": 1
              }
            ]
          },
          {
            "LastName": "",
            "DOB": "0001-01-01T00:00:00",
            "Patients": [
              {
                "PatientName": "New, Patient1 T.",
                "PatientID": "NEWPA4",
                "PerferredName": "",
                "DOB": "1923-01-01T00:00:00",
                "Address": "Address 1 Address 2,  Minnesotta AK 44444",
                "Phone": "2222222222",
                "PhoneNumberType": "Home",
                "Email": null,
                "PrimaryLocation": "Innovators",
                "ResponsibleParty": "New, Patient1 T.",
                "Status": "Inactive",
                "RowNumber": 2
              },
              {
                "PatientName": "New, Patient3 T.",
                "PatientID": "NEWPA6",
                "PerferredName": "",
                "DOB": "1923-01-01T00:00:00",
                "Address": "Address 1 Address 2,  Minnesotta AK 44444",
                "Phone": "2222222222",
                "PhoneNumberType": "Home",
                "Email": null,
                "PrimaryLocation": "Innovators",
                "ResponsibleParty": "New, Patient1 T.",
                "Status": "Inactive",
                "RowNumber": 2
              }
            ]
          }
        ]
      }

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
