import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaypageModalComponent } from './paypage-modal.component';

describe('PaypageModalComponent', () => {
  let component: PaypageModalComponent;
  let fixture: ComponentFixture<PaypageModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaypageModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaypageModalComponent);
    component = fixture.componentInstance;
    spyOn(sessionStorage, 'removeItem');
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.close, 'emit');
    fixture.detectChanges();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onIframeLoad',()=>{
    it('should handle iframe load correctly', () => {
      component.onIframeLoad();
      expect(component.iframeLoadCount).toBe(1);
  
      component.onIframeLoad();
      expect(component.isLoading).toBe(false);
      expect(component.iframeLoadCount).toBe(0);
    });
  })


  describe('clearPaypageModal',()=>{
    it('should close the modal after confirmation', () => {
      spyOn(component, 'clearPaypageModal');
  
      component.closeModal();
  
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to close the paypage? All incomplete transactions will be lost.');
      expect(component.clearPaypageModal).toHaveBeenCalled();
    });

    it('should clear the paypage modal', () => {
      component.clearPaypageModal();
  
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('isPaypageModalOpen');
      expect(component.isVisible).toBe(false);
    });

    it('should unsubscribe from paypageRedirectEvent and clear the paypage modal on destroy', () => {
      spyOn(component.paypageRedirectEventSubscription, 'unsubscribe');
      spyOn(component, 'clearPaypageModal');
  
      component.ngOnDestroy();
  
      expect(component.paypageRedirectEventSubscription.unsubscribe).toHaveBeenCalled();
      expect(component.clearPaypageModal).toHaveBeenCalled();
    })
  })


  describe('paypageRedirectCallBackEvent',()=>{
    it('should emit paypageRedirectCallBackEvent and clear modal on paypage transaction callback', () => {
      spyOn(component.paypageRedirectCallBackEvent, 'emit');
      spyOn(component, 'clearPaypageModal');
  
      component.handlePayPageTransactionCallback();
  
      expect(component.paypageRedirectCallBackEvent.emit).toHaveBeenCalled();
      expect(component.clearPaypageModal).toHaveBeenCalled();
    });
  
    it('should subscribe to fromEvent for paypageRedirectEvent', () => {
      spyOn(component.paypageRedirectEvent, 'subscribe');
  
      component.ngOnInit();
  
      expect(component.paypageRedirectEventSubscription).toBeDefined();
    });

  })

  it('should unsubscribe from paypageRedirectEvent and clear the paypage modal on destroy', () => {
    spyOn(component.paypageRedirectEventSubscription, 'unsubscribe');
    spyOn(component, 'clearPaypageModal');

    component.ngOnDestroy();

    expect(component.paypageRedirectEventSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.clearPaypageModal).toHaveBeenCalled();
  });


  describe('preventRefreshPage',()=>{
    it('should prevent page refresh if isVisible is true', () => {
      component.isVisible = true;
      const event = new Event('beforeunload');
      spyOn(event, 'preventDefault');
      spyOn(window, 'addEventListener');
  
      component.preventRefreshPage(event);
  
      expect(event.preventDefault).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalledWith('unload', jasmine.any(Function));
    });

    it('should not prevent page refresh if isVisible is false', () => {
      component.isVisible = false;
      const event = new Event('beforeunload');
      spyOn(event, 'preventDefault');
  
      component.preventRefreshPage(event);
  
      expect(event.preventDefault).not.toHaveBeenCalled();
    });


  })

});
