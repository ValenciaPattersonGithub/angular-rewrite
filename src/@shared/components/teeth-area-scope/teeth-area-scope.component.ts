import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { ToothAreaService } from '../../providers/tooth-area.service';

@Component({
  selector: 'teeth-area-scope',
  templateUrl: './teeth-area-scope.component.html',
    styleUrls: ['./teeth-area-scope.component.scss'],
    providers: [ToothAreaService]
})
export class TeethAreaScopeComponent {

    constructor(public toothAreaService: ToothAreaService) { }
    @Input() template: TemplateRef<this>;
    @Input() service;    



    ngOnInit() {
        if (this.service.$toothAreaData) {
            this.toothAreaService.toothAreaData = this.service.$toothAreaData;
        }        
    }



}
