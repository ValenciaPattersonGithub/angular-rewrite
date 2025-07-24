import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementsComponent } from './statements.component';
import { LocationHttpService } from 'src/practices/http-providers';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('StatementsComponent', () => {
  let component: StatementsComponent;
  let fixture: ComponentFixture<StatementsComponent>;
  let mockLocations = [
    { NameLine1: 'Location 1', LocationId: 'loc-1' },
    { NameLine1: 'Location 2', LocationId: 'loc-2' },
    { NameLine1: 'Location 3', LocationId: 'loc-3' },
  ];
  let mockLocationHttpService;

  beforeEach(async () => {

    mockLocationHttpService = jasmine.createSpyObj<LocationHttpService>('LocationHttpService', ['getLocationsWithDetailsByPermissionsObservable']);
    mockLocationHttpService.getLocationsWithDetailsByPermissionsObservable.and.returnValue(of(mockLocations));

    await TestBed.configureTestingModule({
      declarations: [ StatementsComponent ],
      providers: [
        { provide: LocationHttpService, useValue: mockLocationHttpService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.filteredLocations.length).toEqual(3);
    expect(component['locationHttpService'].getLocationsWithDetailsByPermissionsObservable).toHaveBeenCalledWith(2271);
  });

  it('should filter locations from a text value', () => {
    component.filterChange('1');
    expect(component.filteredLocations.length).toEqual(1);
    component.filterChange('');
    expect(component.filteredLocations.length).toEqual(3);
  });

  it('should set a valid date in the datepicker fields', () => {
    component.form.controls['dueDate'].setValue('01/01/2001');
    expect(component.form.controls['dueDate'].value).toEqual('01/01/2001');
    
    component.form.controls['startDate'].setValue('01/01/2001');
    expect(component.form.controls['startDate'].value).toEqual('01/01/2001');
  });

  it('should check that future dates are disabled', () => {
    let today: Date = new Date();
    let tomorrow: Date = new Date();
    tomorrow.setDate(today.getDate() + 1);
    expect(component.futureDates(today)).toBeFalsy();
    expect(component.futureDates(tomorrow)).toBeTruthy();
  });

});
