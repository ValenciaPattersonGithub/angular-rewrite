import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { ScheduledAppointmentsMigrationComponent } from './scheduled-appointments-migration.component';

describe('ScheduledAppointmentsMigrationComponent', () => {
  let component: ScheduledAppointmentsMigrationComponent;
  let fixture: ComponentFixture<ScheduledAppointmentsMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScheduledAppointmentsMigrationComponent],
      providers: [ReportsHelper]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledAppointmentsMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "Appointments": [
          {
            "Date": "2021-12-01T13:30:00",
            "Location": "Innovators",
            "Patient": "Andrews, Reid - ANDRE3",
            "DateOfBirth": "1985-07-28T05:00:00",
            "PhoneNumber": "1045559889",
            "StartTime": "1:30pm",
            "EndTime": "2:00pm",
            "Duration": "30 minutes",
            "Room": "Room 108",
            "AppointmentType": "Preventive Apt Type",
            "Note": "Note: utgshwlovbzllmblfyej",
            "Plans": [
              {
                "PolicyHolder": "Andrews, Muhammad - ANDMU1",
                "PolicyHolderBirthDate": "1981-11-24T06:00:00",
                "PolicyHolderId": null,
                "Plan": "PhillipMclean Benefit Plan",
                "PlanNumber": null,
                "Priority": "Primary",
                "Carrier": "GabrielTrujillo Insurance Company",
                "PhoneNumber": "3165190579"
              }
            ],
            "Codes": [
              {
                "Provider": "User, Test - USETE3",
                "ServiceCode": "D5983: radiation carrier (D5983)",
                "Tooth": null,
                "Area": null,
                "Charge": 248.88
              },
              {
                "Provider": "User, Test - USETE3",
                "ServiceCode": "D7461: removal of benign nonodontogenic cyst or tumor - lesion diameter greater than 1.25 cm (D7461)",
                "Tooth": null,
                "Area": null,
                "Charge": 57.75
              },
              {
                "Provider": "User, Test - USETE3",
                "ServiceCode": "D7521: incision and drainage of abscess - extraoral soft tissue - complicated (includes drainage of multiple fascial spaces) (D7521)",
                "Tooth": null,
                "Area": null,
                "Charge": 275.4
              },
              {
                "Provider": "User, Test - USETE3",
                "ServiceCode": "D9410: house/extended care facility call (D9410)",
                "Tooth": null,
                "Area": null,
                "Charge": 168.3
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