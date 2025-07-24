import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { TaxrateDirective } from './taxrate.directive';

@Component({
  template: `
      <input [(ngModel)]="dataModel"
               taxrate type="text" /> `
})
class TestComponent { 
    dataModel: string
}

const specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

describe('TaxrateDirective ->', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  configureTestSuite(() => {
      TestBed.configureTestingModule({
          imports: [FormsModule],
          declarations: [TaxrateDirective, TestComponent]
      });
  });

  beforeEach(async() => {
      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', async () => {
      expect(component).toBeTruthy();
  });

  it('allow valid decimal value to enter', async () => {
      const event1 = new KeyboardEvent("keydown",{
          "key": "1",
      });
      const spy1 = spyOn(event1,'preventDefault');
      var el = fixture.nativeElement.querySelector('input');
      el.value = '12.3';
      fixture.detectChanges();
      el.dispatchEvent(event1);
      fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(spy1).not.toHaveBeenCalled(); 
      })
  });
  it('not allow special key to enter', async () => {
    const event1 = new KeyboardEvent("keydown",{
        "key": "2",
    });
    const spy1 = spyOn(event1,'preventDefault');
    const el = fixture.nativeElement.querySelector('input');
    el.value = '22..';
    fixture.detectChanges();
    el.dispatchEvent(event1);
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(spy1).toHaveBeenCalled();
    });
  });

  it('should allow acceptable keys and return', async () => {
    const el = fixture.nativeElement.querySelector('input');
    const directive = new TaxrateDirective(el);

    el.value = '27';
    specialKeys.forEach((key) => {
      const event = new KeyboardEvent("keydown", { "key": key });

      fixture.detectChanges();
      el.dispatchEvent(event);
      const result = directive.onKeyDown(event);

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(result).toBe(true);
      })
    });
  });

  it('allow decimal after second place automatically', async () => {
    const event1 = new KeyboardEvent("keydown",{
        "key": "27",
    });
    const spy1 = spyOn(event1,'preventDefault');
    var el = fixture.nativeElement.querySelector('input');
    el.value = '27.';
    fixture.detectChanges();
    el.dispatchEvent(event1);
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(spy1).not.toHaveBeenCalled();
    });
  });

})
