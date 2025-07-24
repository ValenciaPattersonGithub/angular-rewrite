import { Component, OnInit, Input, Inject,Output ,EventEmitter} from '@angular/core';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss']
})
export class PageNavigationComponent implements OnInit {

  @Input() navigationData: string;

 @Output() currentPath : EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  changPath = (name) => {
    this.currentPath.emit(name);
  }

}
