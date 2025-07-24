import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

import { ConsentMessageComponent } from './consent-message.component';

describe('ConsentMessageComponent', () => {
  let component: ConsentMessageComponent;
  let fixture: ComponentFixture<ConsentMessageComponent>;

  //#region mocks
  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text'
  };
  //End region

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      declarations: [ConsentMessageComponent],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call getPageNavigation()', () => {
      spyOn(component, 'getPageNavigation');

      component.ngOnInit();

      expect(component.getPageNavigation).toHaveBeenCalled();
    });
  });

  describe('saveConsentMessage -> ', () => {
    it('should emit when save button is clicked', () => {
      spyOn(component.save, 'emit');
      component.saveConsentMessage();
      expect(component.save.emit).toHaveBeenCalled();
    });
  });

  describe('cancelConsentChanges -> ', () => {
    it('should emit when cancel button is clicked', () => {
      spyOn(component.cancel, 'emit');
      component.cancelConsentChanges();
      expect(component.cancel.emit).toHaveBeenCalled();
    });
  });

  describe('onConsentMessageChange -> ', () => {
    it('should emit when consent message is changed', () => {
      spyOn(component.consentMessageChange, 'emit');
      component.consentMessage = 'test';
      component.onConsentMessageChange();
      expect(component.consentMessageChange.emit).toHaveBeenCalledWith('test');
    });
  });

  describe('If the length of message is less than 500 ->', () => {
    it('should allow the message in textarea', () => {
      const element = fixture.nativeElement.querySelector('textarea');
      spyOn(component, 'onConsentMessageChange').and.callThrough();

      element.value = 'Informed consent message';
      element.length = 24;
      element.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.onConsentMessageChange);
      expect(element.value).toBe('Informed consent message');
    });

  });

  describe('If length of the message is equal to 500 ->', () => {
    it('should allow the message to be saved', () => {
      const element = fixture.nativeElement.querySelector('textarea');
      spyOn(component, 'onConsentMessageChange').and.callThrough();

      element.value = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis vestibulum rutrum. Donec mollis facilisis vehicula. Nullam ullamcorper placerat ipsum, et blandit orci cursus eget. Proin ornare luctus condimentum. Aliquam efficitur sollicitudin placerat. Praesent tristique purus quis metus ornare, ac pulvinar orci ultrices. Fusce sit amet varius tellus. Nam facilisis odio ut urna faucibus, quis consequat ex porttitor. Maecenas quis turpis pharetra, maximus eros sed, sollicitudin enim. Cras f`;
      element.length = 500;
      element.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.onConsentMessageChange);
      expect(element.value).toBe(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis vestibulum rutrum. Donec mollis facilisis vehicula. Nullam ullamcorper placerat ipsum, et blandit orci cursus eget. Proin ornare luctus condimentum. Aliquam efficitur sollicitudin placerat. Praesent tristique purus quis metus ornare, ac pulvinar orci ultrices. Fusce sit amet varius tellus. Nam facilisis odio ut urna faucibus, quis consequat ex porttitor. Maecenas quis turpis pharetra, maximus eros sed, sollicitudin enim. Cras f`);
    });

  });

});
