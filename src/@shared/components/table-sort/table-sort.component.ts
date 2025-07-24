import { Component, OnInit, Input } from '@angular/core';
declare var angular: any;

@Component({
  selector: 'table-sort',
  templateUrl: './table-sort.component.html',
  styleUrls: ['./table-sort.component.scss']
})
export class TableSortComponent implements OnInit {
  // tslint:disable-next-line: variable-name
  private _sortDirection: any;
  // tslint:disable-next-line: variable-name
  private _listSortedBy: any;
  @Input() columnName: any;

  @Input()
  set listSortedBy(value: any) {
    this._listSortedBy = value;
  }
  get listSortedBy() {
    return this._listSortedBy;
  }

  @Input()
  set sortDirection(value: any) {
    this._sortDirection = value;
  }

  get sortDirection() {
    return this._sortDirection;
  }

  constructor() { }

  ngOnInit() {

  }

}

