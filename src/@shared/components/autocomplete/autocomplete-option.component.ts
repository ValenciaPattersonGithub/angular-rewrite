import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { Highlightable } from "@angular/cdk/a11y";

@Component({
  selector: "autocomplete-option",
  templateUrl: "./autocomplete-option.component.html",
  styleUrls: ["./autocomplete-option.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteOptionComponent<T> implements Highlightable {
  @Input() item: T;
  @Output() onSelected = new EventEmitter<T>();

  isActive: boolean = false;

  constructor(
    private cd: ChangeDetectorRef) {
      this.cd.detach(); 
    }

  autocompleteOptionClick(): void {
    this.onSelected.emit(this.item);
  }

  setActiveStyles(): void {
    if (!this.isActive) {
      this.isActive = true;
      if (!this.cd['destroyed']) {
        this.cd.detectChanges();
      }
    }
  }

  setInactiveStyles(): void {
    if (this.isActive) {
      this.isActive = false;
      if (!this.cd['destroyed']) {
        this.cd.detectChanges();
      }
    }
  }
}
