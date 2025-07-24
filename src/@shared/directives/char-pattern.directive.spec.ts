import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { CharPatternDirective } from './char-pattern.directive';

@Component({
    template: `
      <input id="testInp"
              name="inpFax" type="text" charPattern="[a-zA-Z0-9\d]$"/> `
})

class TestComponent {
    dataModel: string
}

describe('CharPatternDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [CharPatternDirective, TestComponent]
        });
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const directive = new CharPatternDirective();
        expect(directive).toBeTruthy();
    });

    describe('should call validate method', () => {
        it('should allow keys to be entered', () => {
            var el = fixture.nativeElement.querySelector('input');
            el.value = "Text1";
            fixture.detectChanges();
            const event = new KeyboardEvent('keydown', { bubbles: true, key:"enter" });
            spyOn(event, 'preventDefault');
            el.dispatchEvent(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });
    });

});
