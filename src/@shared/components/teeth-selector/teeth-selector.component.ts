import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener, QueryList, ViewChildren } from '@angular/core';
import { ToothAreaService } from '../../providers/tooth-area.service';
import { Subject } from 'rxjs';
import { ToothAreaData } from '../../providers/tooth-area-data.model';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'teeth-selector',
    templateUrl: './teeth-selector.component.html',
    styleUrls: ['./teeth-selector.component.scss'],
})
export class TeethSelectorComponent implements OnInit {

    @Input() serviceTransaction: any;
    //@Input() data: any[] = [];
    //@Input() inputModel: any;
    //@Input() toothSelection: any;

    @Input() isDisabled: boolean = false;
    @Output() inputModelChange = new EventEmitter();

    customId: string = 'test';
    dataForDropdown: any[] = [];
    toothSelection: any[] = [];
    possibleTeeth: any[] = [];
    quadrants: any[] = [];
    selected: any[] = [];
    selectedTeeth: any[] = [];
    showDropdown: boolean = false;
    placeholderText: string = '';
    subject = new Subject();
    fromEnter: boolean = false;
    inputValue: any;
    isLoaded: boolean = false;
    isUsingArrowKeys: boolean = false;
    toothAreaData: ToothAreaData
    teethSearchUpdate: boolean = false;

    @ViewChild('toothInput', { static: false }) toothInputElement: ElementRef
    @ViewChild('toothDropdown', { static: false }) toothDropdown: ElementRef
    @ViewChildren('toothDropdownOption') listItems!: QueryList<ElementRef>

    constructor(
        public toothAreaService: ToothAreaService
    ) { }

    ngOnInit() {
    }

    clickedInside: boolean = false;
    @HostListener('click')
    clickInside() {
        this.clickedInside = true;
    }

    @HostListener('document:click')
    clickout() {
        if (!this.clickedInside) {
            this.showDropdown = false;
            this.inputValue = null;
        }
        this.clickedInside = false;
    }

    async onChange(tooth) {
        let toothAreaData = await this.toothAreaService.toothChange(tooth)
        this.serviceTransaction = this.toothAreaService.setValuesOnServiceTransaction(this.serviceTransaction, toothAreaData);

        this.inputModelChange.emit(tooth);
    }

    toggleDropdownKeypress(event) {
        if (event.key != "Tab" && event.key != "Shift") {
            if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)) {
                //If we typed in a number or letter
                this.toggleDropdown(event.key);
            } else if (event.key === "ArrowDown" || event.key === "Enter") {
                //Optionally, we could also open the dropdown using ArrowDown or Enter
                event.preventDefault();
                this.toggleDropdown(null);
            }
            //Every other keypress should be ignored and not cause the dropdown to change
        }
    }

    toggleDropdown(value) {
        value = value ? value.toUpperCase() : value;
        this.showDropdown = !this.showDropdown;

        if (this.showDropdown === true) {
            this.focusInput(value);
        }
    }

    focusInput(value) {
        let retries = 0;
        this.inputValue = '';
        var checkExist = setInterval(() => {
            if (this.toothInputElement) {
                this.isUsingArrowKeys = false;
                this.toothInputElement.nativeElement.focus();
                this.inputValue = value != null ? value : '';
                this.forceToothSearchUpdate();
                clearInterval(checkExist);
            }
            if (retries > 10) {
                //Something went wrong and the element didn't appear after a second
                //Stop checking to see if the element exists
                clearInterval(checkExist);
            }
            retries = retries + 1;
        }, 100); // check every 100ms        
    }

    async enter(event: any) {
        if (this.inputValue !== null) {
            var cloneInput = cloneDeep(this.inputValue);
            cloneInput = cloneInput.replace(/ /g, '');
            this.fromEnter = true;

            let validTooth = this.toothAreaService.toothAreaData.availableTeeth.find(x => x.USNumber.startsWith(cloneInput));

            if (validTooth) {
                await this.select(validTooth.USNumber);
            }

            this.fromEnter = false;
        }

        this.forceToothSearchUpdate();
    };

    inputKeydown(e) {
        if (e.key === 'Tab') {
            this.showDropdown = false;
            this.inputValue = null;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            this.isUsingArrowKeys = true;
            if (this.inputValue && this.inputValue != '') {
                let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'toothDropdownOption2' });
                if (nextElement) {
                    nextElement.nativeElement.focus();
                }
                else {
                    let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'toothDropdownOption0' });
                    nextElement.nativeElement.focus();
                }

            }
            else {
                let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'toothDropdownOption0' });
                nextElement.nativeElement.focus();
            }

        }

        if (e.key === "ArrowUp") {
            e.preventDefault();

            if (this.inputValue && this.inputValue != '') {
                let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'toothDropdownOption0' });
                nextElement.nativeElement.focus();
                this.isUsingArrowKeys = true;

            }

        }
    }

    navigateToNextOption(e, nextIndex) {
        e.preventDefault();
        if (nextIndex < 0) {
            //We were on the very first item in the list, the placeholder, go back to the input
            this.toothInputElement.nativeElement.focus();
            this.isUsingArrowKeys = false;
        }
        else {
            let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'toothDropdownOption' + (nextIndex) });
            if (nextElement) {
                nextElement.nativeElement.focus();
            }

        }
    }

    async select(tooth) {
        await this.onChange(tooth);
        this.inputValue = null;
        this.forceToothSearchUpdate();
        this.toothDropdown.nativeElement.focus();
        this.showDropdown = !this.showDropdown;
    }

    tabbedOnOption(event, index) {
        if (!event.shiftKey) {
            //We're trying to go forward an element in the tab index
            let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'toothDropdownOption' + (index + 2) });
            if (!nextElement) {
                //The next element isn't in the listItems, so we are on the last option
                //Proceed to the next tabIndex outside of the dropdown and close the dropdown
                this.toggleDropdown(null);
            }
        }

    }

    inputChanged($event, nv) {
        this.inputValue = nv ? nv.toUpperCase() : nv;
        if (!this.fromEnter) {
            if (nv) {
                this.forceToothSearchUpdate();
            }
        }
    }

    forceToothSearchUpdate() {
        this.teethSearchUpdate = !this.teethSearchUpdate;
    }
}
