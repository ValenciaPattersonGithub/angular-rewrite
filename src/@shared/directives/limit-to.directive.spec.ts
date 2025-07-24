import {Component} from "@angular/core"
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { configureTestSuite } from "src/configure-test-suite";
import {LimitToDirective} from "./limit-to.directive"

@Component({
    template: `
        <input [(ngModel)]="dataModel"
                name="inpFax" limit-to="4" type="text" /> `
  })
  class TestComponent { 
      dataModel: string
  }

describe('LimitToDirective ->', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [LimitToDirective, TestComponent]
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

    it('allow key entered when less than limit', async () => {
        const event1 = new KeyboardEvent("keypress",{
            "key": "1",
        });
        const spy1 = spyOn(event1,'preventDefault');
        var el = fixture.nativeElement.querySelector('input');
        el.value = '123';
        fixture.detectChanges();
        el.dispatchEvent(event1);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(spy1).not.toHaveBeenCalled(); 
        })
    });
    it('not allow key entered when reach limit', async () => {
        const event1 = new KeyboardEvent("keypress",{
            "key": "2",
        });
        const spy1 = spyOn(event1,'preventDefault');
        var el = fixture.nativeElement.querySelector('input');
        el.value = '1234';
        fixture.detectChanges();
        el.dispatchEvent(event1);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(spy1).toHaveBeenCalled(); 
        })
    });

})