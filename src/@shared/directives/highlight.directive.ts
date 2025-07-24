import {
  Directive,
  ElementRef,
  HostBinding,
  Input,
  SecurityContext,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Directive({
  selector: "[highlight]",
})
export class HighlightDirective {
  private _searchTerm: string = "";
  private _content: string = "";

  constructor(private el: ElementRef, private sanitizer: DomSanitizer) {}

  @Input("highlight") set searchTerm(value: string) {
    this.applyHighlighting(value);

    this._searchTerm = value;
  }

  @Input("highlightableContent") set content(value: string) {
    this._content = value;

    this.applyHighlighting(this._searchTerm);
  }

  @HostBinding("innerHtml") contentHtml: string;

  applyHighlighting(value: string) {
    if (!value) {
      this.contentHtml = this._content;
    } else {
      if (this._content){
        const regex = new RegExp(value, "gi");
        const textWithHighlights = this._content.replace(
          regex,
          (match: string) => {
            return `<b>${match}</b>`;
          }
        );
        this.contentHtml = this.sanitizer.sanitize(
          SecurityContext.HTML,
          textWithHighlights
        );
      }      
    }
  }
}
