import {
  Component,
  Input,
  Output,
  OnInit,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  EventEmitter,
  AfterContentInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { ActiveDescendantKeyManager } from "@angular/cdk/a11y";
import { AutocompleteOptionComponent } from "./autocomplete-option.component";

let uniqueAutocompleteIdCounter = 0;

@Component({
  selector: "autocomplete",
  templateUrl: "./autocomplete.component.html",
  styleUrls: ["./autocomplete.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent<T> implements OnInit, AfterContentInit {
  private _selectedItem: T = null;

  @Input() items: T[] = [];
  @Input() get selectedItem(): T {
    return this._selectedItem;
  }
  set selectedItem(item: T) {
    this._selectedItem = item;
    this.autocompleteControl.setValue(this.displayFn(item));
    this.selectedItemChange.emit(item);
  }

  @Input() autoActiveFirstOption: boolean = false;
  @Input() itemFilter: (items: T[], value: string) => T[] = this
    .defaultItemFilter;
  @Input() placeholderText: string = "";
  @Input() errorTooltipMessage?: string;
  @Input() disabled: boolean = false;
  @Input() hasError: boolean = false;
  @Input() maxLength: number = 100;
  @Input() displayFn: (item: T) => string = this.defaultDisplayFn;
  @Input("aria-label") ariaLabel: string;
  @Input() showResultsForEmptySearch: boolean = false;
  @Output() onSearch: EventEmitter<
    AutoCompleteSearchEvent<T>
  > = new EventEmitter<AutoCompleteSearchEvent<T>>();
  @Output() selectedItemChange: EventEmitter<T> = new EventEmitter<T>();

  @ViewChild("autocompleteInput") autocompleteInput: ElementRef;

  @ContentChildren(AutocompleteOptionComponent, { descendants: true })
  options: QueryList<AutocompleteOptionComponent<T>>;

  autocompleteControl = new FormControl("");
  isFiltered = false;
  isHidden = false;
  id: string = `autocomplete-${uniqueAutocompleteIdCounter++}`;
  keyManager: ActiveDescendantKeyManager<AutocompleteOptionComponent<T>>;

  constructor() {}

  ngOnInit(): void {
    this.autocompleteControl.valueChanges
      .pipe(
        startWith(this.displayFn(this._selectedItem) || ""),
        map((value) => {
          const searchValue = value || "";

          let filtered: T[] = [];
          if (searchValue) filtered = this.itemFilter(this.items, searchValue);
          else if (this.showResultsForEmptySearch) filtered = this.items;

          this.isFiltered = searchValue.length > 0;
          this.isHidden = filtered.length === 0;

          this.onSearch.emit({
            filteredResults: filtered,
            searchTerm: searchValue,
          });
        })
      )
      .subscribe();
  }

  ngAfterContentInit(): void {
    this.keyManager = new ActiveDescendantKeyManager<
      AutocompleteOptionComponent<T>
    >(this.options);
    if (this.autoActiveFirstOption) {
      this.keyManager.setFirstItemActive();
    }

    this.options.changes.subscribe(() => {
      this.autoActiveFirstOption
        ? this.keyManager.setFirstItemActive()
        : this.keyManager.setActiveItem(-1);
    });
  }

  clearSearch(event: MouseEvent): void {
    this.selectedItem = null;
    event.preventDefault();
  }

  defaultDisplayFn(item: T): string {
    return item ? item.toString() : "";
  }

  defaultItemFilter(items: T[], value: string): T[] {
    return items;
  }

  onDrawerClick(): void {
    // This disengages the hover state so the overlay will close.
    this.isHidden = true;
    setTimeout(() => (this.isHidden = false), 100);
  }

  selectActiveOption(): void {
    this.selectedItem = this.keyManager.activeItem.item;
    this.autocompleteInput.nativeElement.blur();
  }

  setActiveOptionUp(): void {
    this.keyManager.setPreviousItemActive();
  }

  setActiveOptionDown(): void {
    this.keyManager.setNextItemActive();
  }
}

export interface AutoCompleteSearchEvent<T> {
  filteredResults: T[];
  searchTerm: string;
}
