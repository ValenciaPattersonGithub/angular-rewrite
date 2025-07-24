import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'new-profile-section',
  templateUrl: './new-profile-section.component.html',
  styleUrls: ['./new-profile-section.component.scss']
})
export class NewProfileSectionComponent implements OnInit {

  @Input() sectionTitle: string;
  @Input() actions: [{ amfa: '', Path: '', Text: '', Inactive: false }];
  @Input() baseId: string;
  @Input() count: string;

  constructor() { }

  ngOnInit(): void {
  }

  redirectTo = (path: string) => {
    window.location.href = path;
  }

  clickHandler = () => {

  }

}
