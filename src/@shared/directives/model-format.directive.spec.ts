import { ModelFormatDirective } from './model-format.directive';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { CurrencyPipe } from '@angular/common';


@Component({
  template: `
      <input name="currency"  modelformat type="text" />  
              `
})
class TestComponent { 
    dataModel: string
}

describe('ModelFormatDirective ->', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directive : ModelFormatDirective;
  configureTestSuite(() => {
      TestBed.configureTestingModule({
          imports: [FormsModule],
          providers: [CurrencyPipe],
          declarations: [ModelFormatDirective, TestComponent]
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
    var el = fixture.nativeElement.querySelector('input');
    el.value = 'abcd';
    fixture.detectChanges();
    el.dispatchEvent(event1);
    fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(spy1).toHaveBeenCalled(); 
    })
});

})