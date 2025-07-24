import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'column-sort',
  templateUrl: './column-sort.component.html',
  styleUrls: []
})

export class ColumnSortComponent implements OnInit {
  @Input() col: string;
  @Input() sortField: string;
  @Input() asc: number;

  constructor() { }

  ngOnInit(): void {
  }
}