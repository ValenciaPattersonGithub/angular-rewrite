import { TestBed } from '@angular/core/testing';
import { LocationChangeService } from './location-change.service';

describe('LocationChangeService', () => {
  let service: LocationChangeService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: []
    });
    service = TestBed.get(LocationChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribe, emit, and unsubscribe properly', () => {
    var a = jasmine.createSpy('testfunction');
    var b = jasmine.createSpy('testfunction2');
    var listener1 = service.subscribe(a);
    var listener2 = service.subscribe(b);
    service.emit();
    listener1();
    service.emit();
    listener2();
    service.emit();
    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(2);
  });
});
