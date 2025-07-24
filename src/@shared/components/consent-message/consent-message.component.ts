import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'consent-message',
  templateUrl: './consent-message.component.html',
  styleUrls: ['./consent-message.component.scss']
})
export class ConsentMessageComponent implements OnInit {

  @Input() styles: any;
  @Input() title: string;
  @Input() checkAuthZ: string;
  @Input() dataHasChanged: boolean = false;
  @Input() consentMessage: string;
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() consentMessageChange = new EventEmitter<string>();
  breadCrumbs: { name: string, path: string, title: string }[] = [];

  constructor(@Inject('localize') private localize) { }

  ngOnInit(): void {
    this.getPageNavigation();
  }

  //#region breadcrumbs
  getPageNavigation() {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings',
        title: 'Practice Settings'
      },
      {
        name: this.localize.getLocalizedString(this.title),
        path: '/BusinessCenter/PracticeSettings',
        title: this.title
      }
    ];

  }
  //#end region

  saveConsentMessage = () => {
    this.save.emit();
  }

  cancelConsentChanges = () => {
    this.cancel.emit();
  }

  onConsentMessageChange = () => {
    this.consentMessageChange.emit(this.consentMessage);
  }

}
