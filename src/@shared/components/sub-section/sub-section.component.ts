import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sub-section',
  templateUrl: './sub-section.component.html',
  styleUrls: ['./sub-section.component.scss']
})
export class SubSectionComponent implements OnInit {

  @Input() sectionTitle: string;

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove logs while migration
    console.log("sub-section");
    console.log(this.sectionTitle);
  }

}
