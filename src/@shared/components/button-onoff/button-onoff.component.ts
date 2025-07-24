import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-button-onoff',
    templateUrl: './button-onoff.component.html',
    styleUrls: ['./button-onoff.component.scss']
})
export class ButtonOnoffComponent implements OnInit {        
    @Input() id: string; // required    
    @Input() buttonText: string;
    // checked prop controls the starting position of the switch.
    @Input() isChecked: boolean = false;    
    @Output() checkChanged: EventEmitter<boolean> = new EventEmitter<boolean>();        

    ngOnInit() {        
    }
    
    toggleSelection = () => {
        var value = !this.isChecked;
        this.isChecked = value;        
        this.checkChanged.emit(value);
    }
    
    ngOnDestroy() {        
        this.checkChanged.unsubscribe();
    }

}
