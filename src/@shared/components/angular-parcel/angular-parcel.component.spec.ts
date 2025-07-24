import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularParcelComponent } from './angular-parcel.component';

describe('AngularParcelComponent', () => {
  let component: AngularParcelComponent;
  let fixture: ComponentFixture<AngularParcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AngularParcelComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularParcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call mountParcel on ngAfterViewInit', () => {
    spyOn(component, 'mountParcel');
    component.ngAfterViewInit();
    expect(component.mountParcel).toHaveBeenCalled();
  });

  it('should call singleSpa.loadApp if available', () => {
    const mockLoadApp = jasmine.createSpy('loadApp');
    window['singleSpa'] = { loadApp: mockLoadApp };

    component.baseAppName = 'mfe-app';
    component.containerId = 'mfe-container';
    component.parcelKey = 'mfe-key';
    component.inputProps = JSON.stringify({ patientId: 'b314b782-f475-44a1-843f-94b8f1e81def' });
    component.routeProps = JSON.stringify({ patientId: 'b314b782-f475-44a1-843f-94b8f1e81def' });
    component.onDataEmittedFromMfe = jasmine.createSpy('onDataEmittedFromMfe');

    component.mountParcel();

    expect(mockLoadApp).toHaveBeenCalledWith({
      baseAppName: 'mfe-app',
      containerId: 'mfe-container',
      parcelKey: 'mfe-key',
      inputProps: JSON.stringify({ patientId: 'b314b782-f475-44a1-843f-94b8f1e81def' }),
      routeProps: JSON.stringify({ patientId: 'b314b782-f475-44a1-843f-94b8f1e81def' }),
      onDataEmittedFromMfe: jasmine.any(Function),
    });
  });

  it('should log an error if singleSpa.loadApp is not available', () => {
    spyOn(console, 'error');
    window['singleSpa']  = undefined;

    component.mountParcel();

    expect(console.error).toHaveBeenCalledWith('singleSpa.loadApp is not available.');
  });

  it('should call onDataEmittedFromMfe when handleMfeCallback is triggered', () => {
    const mockCallback = jasmine.createSpy('onDataEmittedFromMfe');
    component.onDataEmittedFromMfe = mockCallback;

    const mockData = JSON.stringify({ key: 'received from mfe' });
    component.handleMfeCallback(mockData);

    expect(mockCallback).toHaveBeenCalledWith(mockData);
  });
});