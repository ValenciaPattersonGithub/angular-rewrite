import { TestBed } from '@angular/core/testing';

import { PatientNotesService } from './patient-notes.service';
import { AuthAccess } from '../../../../@shared/models/auth-access.model';


describe('PatientNotesService', () => {

  let service = PatientNotesService;

  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text'
};

  const mockPatientServices = {
    ClinicalNotes: {
      get: jasmine.createSpy().and.callFake((array) => {
        return {
          then(callback) {
            callback(array);
          }
        };
      })
    }
  };

  const clinicalNotesMock = [
    {
      EntityId: '1234',
      NoteId: '12345',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'consectetur adipiscing elit.',
      NoteTypeId: 3,
      CreatedDate: '2020-04-17T18:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
    },
    {
      EntityId: '2345',
      NoteId: '12345',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'consectetur adipiscing elit. webbly',
      NoteTypeId: 3,
      CreatedDate: '2020-04-17T17:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
    },
    {
      EntityId: '3456',
      NoteId: '12346',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'adfdf daddaff fadfsadf',
      NoteTypeId: 3,
      CreatedDate: '2020-02-17T18:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
    },
    {
      EntityId: '4567',
      NoteId: '12355',
      PatientId: '5ab5d994-584d-41d9-a445-f42a00f35d4c',
      Note: 'dfadf dasdffd3aadf adfdffd2225adfadf',
      NoteTypeId: 3,
      CreatedDate: '2020-03-17T18:20:03.8791182',
      CreatedByName: 'Bond, James',
      NoteTitle: 'Clinical Note',
    }
  ];

  const mockSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatientNotesService,
        { provide: 'patSecurityService', useValue: mockSecurityService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'PatientServices', useValue: mockPatientServices},
        { provide: 'localize', useValue: mockLocalizeService},
      ],

    });
    service = TestBed.get(PatientNotesService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


