import { Inject } from '@angular/core';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'no-results',
  templateUrl: './no-results.component.html',
  styleUrls: ['./no-results.component.scss']
})
export class NoResultsComponent implements OnInit, OnChanges {
  //loadingMessage: any;

    constructor(@Inject('localize') private localize) { }
  @Input() message: any;
  @Input() filteringMessage: any;
  @Input() loadingMessage: any;
  @Input() loading: any;
  @Input() filtering: any;
  ngOnInit(): void {
    this.setDefaultMessage();
    }
    ngOnChanges(changes: SimpleChanges) {
       
        if (changes.loading.currentValue != changes.loading.previousValue) {
            this.onChangeLoading(changes.loading.currentValue);
        }
    }

  setDefaultMessage =  ()=> {

    if (this.filteringMessage==undefined || this.filteringMessage === null || this.filteringMessage == '') {
        this.filteringMessage = this.localize.getLocalizedString('There are no results that match the filter.');
    }
    if (this.loadingMessage==undefined || this.loadingMessage === null || this.loadingMessage == '') {
        this.loadingMessage = this.localize.getLocalizedString('There are no results.');
    }
  }

  onChangeFilter = (nv: any) => {
    if (nv == true) {
      this.message = this.filteringMessage;
    }
    return true;
  }

  onChangeLoading = (nv: any) => {
    if (nv == true) {
      this.message = this.loadingMessage;
    } else if (this.filtering == true) {
      this.message = this.filteringMessage;
    }
    return true;
  }

}