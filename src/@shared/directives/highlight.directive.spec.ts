import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HighlightDirective } from "./highlight.directive";
import { By, DomSanitizer } from '@angular/platform-browser';

@Component({
  template: `
    <span highlight="ea" highlightableContent="I like to leave work after my eight-hour tea-break."></span>
    <span highlight="fish" highlightableContent="The fish dreamed of escaping the fishbowl and into the toilet where he saw his friend go."></span>
    <span>No Highlight</span>
    `,
})
class TestComponent {}

describe("HighlightDirective", () => {
  let fixture: ComponentFixture<TestComponent>;
  let highlightedElements: DebugElement[] = [];
  let nonHighlightedElement: DebugElement = null;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [HighlightDirective, TestComponent],
      providers: [
        {
            provide: DomSanitizer,
            useValue: {
                sanitize: (ctx: any, val: string) => val,
              }
        }
      ]
    }).createComponent(TestComponent);

    fixture.detectChanges();

    highlightedElements = fixture.debugElement.queryAll(By.directive(HighlightDirective));
    nonHighlightedElement = fixture.debugElement.query(By.css('span:not([highlight])'));
  });

  it("should have 2 highlighted elements", () => {
    expect(highlightedElements.length).toBe(2);
  });

  it('should highlight 1st <span> 3 times', () => {
    const el = highlightedElements[0].nativeElement;
    const regex = new RegExp("<b", "gi");
    const highlightCount = el.innerHTML.match(regex).length;
    expect(highlightCount).toBe(3);
  });

  it("should highlight 2nd <span> 2 times", () => {
    const el = highlightedElements[1].nativeElement;
    const regex = new RegExp("<b", "gi");
    const highlightCount = el.innerHTML.match(regex).length;
    expect(highlightCount).toBe(2);
  });

  it("should not highlight 3rd <span>", () => {
    const el = nonHighlightedElement.nativeElement;
    const regex = new RegExp("<b", "gi");
    const highlightMatch = el.innerHTML.match(regex);
    expect(highlightMatch).toBeNull();
  });
});
