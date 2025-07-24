import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { ProjectedNetProductionMigrationComponent } from './projected-production-migration.component';

describe('ProjectedNetProductionMigrationComponent', () => {
  let component: ProjectedNetProductionMigrationComponent;
  let fixture: ComponentFixture<ProjectedNetProductionMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectedNetProductionMigrationComponent ],  providers: [ReportsHelper]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectedNetProductionMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  let data =
  {
    "Locations": [
      {
        "Location": "Apollo",
        "Providers": [
          {
            "Provider": "Admin, Innovators - ADMIN1",
            "NumberOfAppointments": 2,
            "NumberOfAppointmentsNoProduction": 0,
            "ScheduledServicesProjectedProduction": "170645",
            "AppointmentTypeProjectedProduction": "0",
            "TotalProjectedNetProduction":"170645",
            "Appointments": [
              {
                "Patient": "Wilder, Brendan - WILBR11",
                "Appointment": "02/08/2022 - 1:30 PM",
                "Appointment Type": "Consultation",
                "Room": "",
                "Projected Net Production": "2,095",
              },
              {
                "Patient": "Wilder, Brendan - WILBR11",
                "Appointment": "02/08/2022 - 2:30 PM",
                "Appointment Type": "Consultation",
                "Room": "",
                "Projected Net Production": "2,095",
              }
            ]
          }
        ]
      },
      {
        "Location": "Innovators",
        "Providers": [
          {
            "Provider": "Admin, Innovators - ADMIN2",
            "NumberOfAppointments": 2,
            "NumberOfAppointmentsNoProduction": 0,
            "ScheduledServicesProjectedProduction": "170645",
            "AppointmentTypeProjectedProduction": "0",
            "TotalProjectedNetProduction":"170645",
            "Appointments": [
              {
                "Patient": "Wilder, Brendan - WILBR11",
                "Appointment": "03/08/2022 - 1:30 PM",
                "Appointment Type": "Consultation",
                "Room": "",
                "Projected Net Production": "2,095",
              },
              {
                "Patient": "Wilder, Brendan - WILBR12",
                "Appointment": "03/08/2022 - 2:30 PM",
                "Appointment Type": "Consultation",
                "Room": "",
                "Projected Net Production": "2,095",
              }
            ]
          }
        ]
      }
    ]
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Refresh the data', () => {
    it('Should refresh report data', () => {
      component.data = data;
      component.refreshData = jasmine.createSpy();
      component.ngOnChanges();
      expect(component.refreshData).toHaveBeenCalled();
    });
  });
});
