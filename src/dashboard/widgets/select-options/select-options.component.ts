import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'select-options',
  templateUrl: './select-options.component.html',
  styleUrls: ['./select-options.component.scss']
})
export class SelectOptionsComponent implements OnInit {
@Output() chageOption =  new EventEmitter<any>();
  constructor() { }
 @Input() widgetId;
 selectOptions;
 selectedFinanceValue;
  /* Setting Dropdown options*/
  dropDownData() {
    if (this.widgetId === 27) {
      this.selectedFinanceValue = 2;
      this.selectOptions = [
        { text: 'Allowed Amount', value: 2 },
        { text: 'Charges', value: 3 }
      ];
    }
    else if (this.widgetId === 30)
      {
          this.selectedFinanceValue = 2;
          this.selectOptions = [
              { text: 'YTD', value: 1 },
              { text: 'MTD', value: 2 },
              { text: 'Last Year', value: 3 },
          ];
      }
    else {
      this.selectedFinanceValue = 1;
      this.selectOptions = [
        { text: 'Estimated Insurance', value: 1 },
        { text: 'Allowed Amount', value: 2 },
        { text: 'Charges', value: 3 }
      ];
    }
  }
  public changeOptionValue(value: any) {
    this.chageOption.emit(value);
     }
  ngOnInit() {
    this.dropDownData();
  }

}
