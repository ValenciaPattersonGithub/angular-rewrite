import { Component, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { AutoCompleteComponent, VirtualizationSettings } from '@progress/kendo-angular-dropdowns';
import { GroupResult, groupBy } from '@progress/kendo-data-query';
import { OrderByPipe } from 'src/@shared/pipes';
declare var angular;

@Component({
  selector: 'search-bar-autocomplete-by-id',
    templateUrl: './search-bar-autocomplete-by-id.component.html',
    styleUrls: ['./search-bar-autocomplete-by-id.component.scss']
})
export class SearchBarAutocompleteByIdComponent implements OnChanges {

    @Input() list: [];
    @Input() placeholder: string;
    @Input() template: string;
    @Input() useActiveGrouping: boolean;
    @Input() inputFieldLabel = '';
    @Input() valueF: string; //Coudl be used to pass in an alternate valueField other than "Name"
    @Input() inputValueBind: string;
    @Input() isDisabled: boolean = false;
    @Output() selectedValueChange = new EventEmitter<[]>();
    @Output() filterValueChange = new EventEmitter<[]>();
    @Input() showSuggestion : boolean = true;
    @ViewChild('autocomplete', { static: false })
    public autocomplete: AutoCompleteComponent;
    groupData: GroupResult[];
    searchString: string;
    public virtual: VirtualizationSettings = {
        itemHeight: 33,
        pageSize: 10
      };

  constructor() { }
    
    ngOnChanges(changes: any) {
        if (changes.list) {
            this.checkGrouping(changes.list.currentValue);
        }
    };

    handleFilter(value) {
        this.filterValueChange.emit(value);
        if (this.showSuggestion == false) {
            this.autocomplete.toggle(false);
        }
        this.searchString = value;
        var filteredData = this.filterByValue(this.list, value);
        filteredData = this.orderData(filteredData);
        this.checkGrouping(filteredData);
    }

    handleSelection(value) {
        this.selectedValueChange.emit(value);
    }

    checkGrouping(array) {
        if (this.useActiveGrouping) { this.setGroupData(array); }
        else { this.groupData = array; }
    }

    filterByValue(array, string) {
       return array?.filter(o => Object.keys(o).some(k => o[k] !== null && o[k].toString().toLowerCase().includes(string?.toString().toLowerCase())));
    }

    setGroupData = function (array) {
        const orderPipe = new OrderByPipe();
        if (array) {
            array.forEach(function (item) {
                item.IsActive ? item.$$group = 'Active' : item.$$group = 'Inactive'
            });

            this.groupData = groupBy(array, [{ field: "$$group" }]);

            this.groupData = orderPipe.transform(this.groupData, { sortColumnName: 'value', sortDirection: 1 });
        }
    }

    orderData(array) {
        const orderPipe = new OrderByPipe();
        if (array) { array = orderPipe.transform(array, { sortColumnName: 'Name', sortDirection: 1 }); }
        return array;
    }

}