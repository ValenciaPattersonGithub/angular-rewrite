import { Component, EventEmitter, Input, Optional, Output } from "@angular/core";
import { FilterService,   BaseFilterCellComponent} from "@progress/kendo-angular-grid";

import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
 
@Component({
  selector: 'drop-down-list-filter',
  templateUrl: './drop-down-list-filter.component.html',
  styleUrls: ['./drop-down-list-filter.component.scss']
})
export class DropDownListFilterComponent extends BaseFilterCellComponent  {
  @Output() clearGridFilter = new EventEmitter<any>();
  public get selectedValue(): any {
    const filter = this.filterByField(this.valueField);
    return filter ? filter.value : null;
  }

  @Input() public filter: CompositeFilterDescriptor;
  @Input() public data: any[];
  @Input() public defaultTextField: string;
  @Input() public textField: string;
  @Input() public valueField: string;
  @Input() public field: string;

  public get defaultItem(): { [Key: string]: any } {
    return {
      [this.textField]: this.defaultTextField != null ? this.defaultTextField : "Select",
      [this.valueField]: null
    };
  }
  constructor(@Optional()  filterService: FilterService) {
    super(filterService);
  }
    // ngOninit() {
    //     this.removeFilter(this.field);
    // }

  public onChange(value: any): void {
    this.applyFilter(
      value === null // value of the default item
        ? this.removeFilter(this.field) // remove the filter
        :
        this.updateFilter({
            // add a filter for the field with the value
            field: this.field,
            operator: "eq",
            value: value == 0 ? null : value
          })
    ); // update the root filter
  }
}
