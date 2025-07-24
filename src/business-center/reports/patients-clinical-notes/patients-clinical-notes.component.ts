import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'patients-clinical-notes',
  templateUrl: './patients-clinical-notes.component.html',
  styleUrls: ['./patients-clinical-notes.component.scss']
})
export class PatientsClinicalNotesComponent implements OnInit {

  constructor() { }
  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
  
  ngOnInit(): void {

  }
  refreshData() { 

  }

  ngOnChanges() { 
    this.refreshData();
    this.isDataLoaded = true;
  }
}
