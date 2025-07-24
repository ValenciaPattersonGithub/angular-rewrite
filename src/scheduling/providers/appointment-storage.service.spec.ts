import { TestBed } from '@angular/core/testing';

import { AppointmentStorageService } from './appointment-storage.service';
import {PatSharedService} from "../../@shared/providers/pat-shared.service";

describe('AppointmentStorageService', () => {
    let service: AppointmentStorageService;

    beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [AppointmentStorageService],
            });
            service = TestBed.get(AppointmentStorageService);
        }
    );

  it('should be created', () => {
    //const service: AppointmentStorageService = TestBed.get(AppointmentStorageService);
    expect(service).toBeTruthy();
  });
});
