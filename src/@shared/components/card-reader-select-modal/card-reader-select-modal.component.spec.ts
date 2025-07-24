import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardReaderSelectModalComponent } from './card-reader-select-modal.component';
import { CardReaderSelectComponent } from '../card-reader-select/card-reader-select.component';

describe('CardReaderSelectModalComponent', () => {
  let component: CardReaderSelectModalComponent;
  let fixture: ComponentFixture<CardReaderSelectModalComponent>;

  let mockCardReaders = [
    { PartnerDeviceId: 'bogus-reader' },
    { PartnerDeviceId: 'bogus-reader-2' },
  ];

  let mockLocationServices = {
    getPaymentDevicesByLocationAsync: jasmine.createSpy('LocationServices.getPaymentDevicesByLocationAsync').and.returnValue(
      { $promise: Promise.resolve({ Value: mockCardReaders }) }
    ),
  };

  let mockLocalizeService = {
    getLocalizedString: () => 'translated text',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: 'LocationServices', useValue: mockLocationServices },
        { provide: 'localize', useValue: mockLocalizeService },
      ],
      declarations: [ CardReaderSelectModalComponent, CardReaderSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardReaderSelectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a card reader', () => {
    spyOn(component.onCardReaderSelectionComplete, 'emit');
    expect(component['selectedCardReader']).toEqual(undefined);
    component.cardReaderSelected('bogus');
    expect(component['selectedCardReader']).toEqual('bogus');
    component.next();
    expect(component.onCardReaderSelectionComplete.emit).toHaveBeenCalledWith('bogus');
  });

  it('should check if there is a card reader selected', () => {
    expect(component.hasSelectedCardReader).toBeFalsy();
    component.cardReaderSelected('bogus');
    expect(component.hasSelectedCardReader).toBeTruthy();
    component.cardReaderSelected('0');
    expect(component.hasSelectedCardReader).toBeFalsy();
  });

  it('should cancel the card reader selection', () => {
    spyOn(component.onCancel, 'emit');
    component.cancel();
    expect(component.onCancel.emit).toHaveBeenCalled();
  });

});
