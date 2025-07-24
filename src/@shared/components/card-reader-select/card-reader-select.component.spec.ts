import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardReaderSelectComponent } from './card-reader-select.component';
import { SimpleChanges } from '@angular/core';

describe('CardReaderSelectComponent', () => {
  let component: CardReaderSelectComponent;
  let fixture: ComponentFixture<CardReaderSelectComponent>;

  let mockCardReaders = [
    { PartnerDeviceId: 'bogus-reader' },
    { PartnerDeviceId: 'bogus-reader-2' },
  ];

  let mockLocationServices = {
    getPaymentDevicesByLocationAsync: jasmine.createSpy('LocationServices.getPaymentDevicesByLocationAsync').and.returnValue(
      { $promise: Promise.resolve({ Value: mockCardReaders }) }
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: 'LocationServices', useValue: mockLocationServices }
      ],
      declarations: [ CardReaderSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardReaderSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(component, 'loadCardReaders');
      spyOn(component, 'handleLoadedCardReaders');
    });

    it('should load card readers when location is passed', () => {
      component.location = { locationId: 'bogus' };
      component.ngOnInit();
      expect(component.loadCardReaders).toHaveBeenCalled();
      expect(component.handleLoadedCardReaders).not.toHaveBeenCalled();
    });

    it('should handle preloaded card readers', () => {
      component.location = null;
      component.preLoadedCardReaders = [{ id: 'bogus' }];
      component.ngOnInit();
      expect(component.loadCardReaders).not.toHaveBeenCalled();
      expect(component.handleLoadedCardReaders).toHaveBeenCalled();
    });
  });

  describe('loadCardReaders', () => {

    beforeEach(() => {
      spyOn(component.isCardReaderExist, 'emit');
    });

    it('should handle loaded card readers', () => {
      component.loadCardReaders();
      expect(component['locationServices'].getPaymentDevicesByLocationAsync).toHaveBeenCalled();
      expect(component.isCardReaderExist.emit).not.toHaveBeenCalled();
    });

  });

  describe('handleLoadedCardReaders', () => {

    beforeEach(() => {
      spyOn(component.isCardReaderExist, 'emit');
      component.cardReaders = [];
      spyOn(component, 'change');
    });

    it('should handle two card readers', () => {
      component.handleLoadedCardReaders(mockCardReaders);
      expect(component.change).not.toHaveBeenCalled();
      expect(component.isCardReaderExist.emit).toHaveBeenCalledWith(true);
      expect(component.cardReaders.length).toEqual(2);
    });

    it('should handle one card reader', () => {
      component.handleLoadedCardReaders([{ PartnerDeviceId: 'bogus-reader' }]);
      expect(component.change).toHaveBeenCalled();
      expect(component.isCardReaderExist.emit).toHaveBeenCalledWith(true);
      expect(component.cardReaders.length).toEqual(1);
    });

    it('should handle no card readers', () => {
      component.handleLoadedCardReaders([]);
      expect(component.change).not.toHaveBeenCalled();
      expect(component.isCardReaderExist.emit).toHaveBeenCalledWith(false);
      expect(component.cardReaders.length).toEqual(0);
    });

  });

  describe('ngOnChanges when location changed',()=> {
    it('should call loadCardReaders when location changes', () => {
      spyOn(component, 'loadCardReaders');
    
      // Simulate ngOnChanges with a proper SimpleChanges object
      const changes: SimpleChanges = {
        location: {
          previousValue: 'Old Location',
          currentValue: 'New Location',
          firstChange: false,
          isFirstChange: () => false
        }
      };
    
      component.ngOnChanges(changes); // Manually call ngOnChanges
    
      expect(component.loadCardReaders).toHaveBeenCalled();
    });

    it('should not call loadCardReaders when location changes from undefined to some value (this happened first time when component is rendered in UI)', () => {
      spyOn(component, 'loadCardReaders');
    
      // Simulate ngOnChanges with a proper SimpleChanges object
      const changes: SimpleChanges = {
        location: {
          previousValue: undefined,
          currentValue: 'New Location',
          firstChange: false,
          isFirstChange: () => false
        }
      };
    
      component.ngOnChanges(changes); // Manually call ngOnChanges
    
      expect(component.loadCardReaders).not.toHaveBeenCalled();
    });
  })
});
