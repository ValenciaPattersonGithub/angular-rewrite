import { Component, EventEmitter, OnInit, ViewChild, Input, Output, Inject, ViewChildren, ElementRef, QueryList, HostListener } from '@angular/core';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { ToothAreaService } from '../../providers/tooth-area.service';

@Component({
    selector: 'root-surface-selector',
    templateUrl: 'root-surface-selector.component.html',
    styleUrls: ['./root-surface-selector.component.scss']
})
export class RootSurfaceSelectorComponent implements OnInit {

    //View Properties
    @ViewChild('kendoMultiSelect', { static: false }) kendoMultiSelect: MultiSelectComponent;
    //Input Properties - Parent to Child
    @Input() serviceTransaction: any;
    @Input() id: any;
    @Input() customClass: string;
    @Input() name: string;
    @Input() isDisabled: boolean = false;
    //Input Properties - Child to Parent
    @Output() inputModelChange = new EventEmitter<any>();





    inputValue: any;
    showDropdown: boolean = false;

    @ViewChild('areaInput', { static: false }) areaInputElement: ElementRef
    @ViewChild('areaDropdown', { static: false }) areaDropdown: ElementRef
    @ViewChildren('areaDropdownOption') listItems!: QueryList<ElementRef>

    constructor(
        public toothAreaService: ToothAreaService
    ) { }

    async ngOnInit() {
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

    onFocus() {

        this.kendoMultiSelect.searchbar.readonly = true;

    }

    isItemSelected(value: any[], itemText: string): boolean {
        return value.some(item => item === itemText);
    }

    async onChange(area): Promise<void> {
        //Check the areaSelection list

        let indexOfArea = this.toothAreaService.toothAreaData.areaSelection.indexOf(area.target.value)
        if (indexOfArea != -1) {
            //If the toggled item isn't in areaSelection... add it to the selection
            this.toothAreaService.toothAreaData.areaSelection.splice(indexOfArea, 1);
        } else {
            //The toggled item was in the areaSelection already... remove it from the selection
            this.toothAreaService.toothAreaData.areaSelection.push(area.target.value);
        }

        await this.callToothAreaServiceAndEmit();
    }

    async callToothAreaServiceAndEmit() {
        let toothAreaData = await this.toothAreaService.areaChange(this.toothAreaService.toothAreaData.areaSelection)
        this.serviceTransaction = this.toothAreaService.setValuesOnServiceTransaction(this.serviceTransaction, toothAreaData);

        this.inputModelChange.emit(this.toothAreaService.toothAreaData.areaSelection);
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
        if (!this.toothAreaService.toothAreaData.availableAreas.includes(value)) {
            value = null;
        }
        this.showDropdown = !this.showDropdown;

        if (this.showDropdown === true) {
            this.focusInput(value);
        }
    }

    focusInput(value) {
        let retries = 0;
        this.inputValue = '';
        var checkExist = setInterval(() => {
            if (this.areaInputElement) {
                this.areaInputElement.nativeElement.focus();
                this.inputValue = value != null ? value : '';
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


    enter(event) {
        let attemptedSelections = [];
        if (this.inputValue) {
            if (this.toothAreaService.toothAreaData.serviceCode.AffectedAreaId === 3) {
                //Root
                //S
                //D and M
                //B and P
                //DP, P, and MB
                attemptedSelections = this.translateRootSummaryToSelections(this.inputValue);
            }
            else {

                //Surfaces with no overlap...
                //M, I, O, D

                //Surfaces with some possible overlap
                //B, L, F, B5, L5, F5            
                //Switch statement for converting surface abbreviations to actual selections            
                //["M", "O", "D", "B", "L", "B5", "L5"]
                //["M", "I", "D", "F", "L", "F5", "L5"]

                switch (this.inputValue) {
                    case 'MODBL5':
                        attemptedSelections = ['M', 'O', 'D', 'B', 'L', 'B5', 'L5']
                        break;
                    case 'MIDFL5':
                        attemptedSelections = ['M', 'I', 'D', 'F', 'L', 'F5', 'L5']
                        break;
                    default:
                        break;
                }

                if (attemptedSelections.length == 0) {
                    //We didn't have an input that was meant to select all surfaces
                    //Start dissecting the input value
                    //Remove any instances of M, I, O, and D in the input string
                    //Add the respective items to the selection list
                    let singleSurfaceArray = ['M', 'I', 'O', 'D'];

                    for (var i = 0; i < singleSurfaceArray.length; ++i) {
                        if (this.inputValue.includes(singleSurfaceArray[i])) {
                            this.inputValue = this.inputValue.replace(singleSurfaceArray[i], '');

                            attemptedSelections.push(singleSurfaceArray[i]);
                        }
                    }

                    //Look through the remainder of the string and add the converted abbreviations as selections
                    let selections = this.translateSurfaceSummaryToSelections(this.inputValue);
                    selections.forEach((selection) => {
                        attemptedSelections.push(selection);
                    });
                }
            }
        }
        else {
            attemptedSelections = [];
        }
        this.toothAreaService.toothAreaData.areaSelection = attemptedSelections;
        this.inputValue = null;
        this.callToothAreaServiceAndEmit()
    }

    inputChanged(event, nv) {
        this.inputValue = nv ? nv.toUpperCase() : nv;
    }

    inputKeydown(e) {
        if (e.key === 'Tab') {
            this.showDropdown = false;
            this.inputValue = null;
        }
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (this.inputValue && this.inputValue != '') {
                let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'areaDropdownOption2' });
                if (nextElement) {
                    nextElement.nativeElement.focus();
                }
                else {
                    let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'areaDropdownOption0' });
                    nextElement.nativeElement.focus();
                }
            }
            else {
                let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'areaDropdownOption0' });
                nextElement.nativeElement.focus();
            }
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();

            if (this.inputValue && this.inputValue != '') {
                let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'areaDropdownOption0' });
                nextElement.nativeElement.focus();
            }
        }
        else if ((e.keyCode >= 65 && e.keyCode <= 90)) {
            //If we typed in a letter
            if (!this.toothAreaService.toothAreaData.availableAreas.find(x => x.contains(e.key.toUpperCase()))) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
        else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 97 && e.keyCode <= 122)) {
            //If we typed in a number 
            if (e.key != '5') {
                e.stopPropagation();
                e.preventDefault();
            }
        }
        else if (e.key == "Enter" || e.key == "Delete" || e.key == "Backspace") {

        }
        else {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    select(area) {
        let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'areaDropdownOption' + (area) });
        if (nextElement) {
            nextElement.nativeElement.click();
        }
    }

    tabbedOnOption(event, index) {
        if (!event.shiftKey) {
            //We're trying to go forward an element in the tab index
            let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'areaDropdownOption' + (index + 1) });
            if (!nextElement) {
                //The next element isn't in the listItems, so we are on the last option
                //Proceed to the next tabIndex outside of the dropdown and close the dropdown
                this.toggleDropdown(null);
            }
        }
    }

    navigateToNextOption(event, index) {
        event.preventDefault();
        if (index < 0) {
            //We were on the very first item in the list, the placeholder, go back to the input
            this.areaInputElement.nativeElement.focus();
        }
        else {
            let nextElement = this.listItems.find(x => { return x.nativeElement.id === 'areaDropdownOption' + (index) });
            if (nextElement) {
                nextElement.nativeElement.focus();
            }
        }
    }

    formatSurfaces(data: any[]) {
        let normal: string = '';
        if (data) {
            if (data.length > 0) {
                normal = data[0];
                for (let i = 1; i < data.length; ++i) {
                    normal = normal + ',' + data[i];
                }
                normal = this.normalizeSurfaces(normal);
            }
        }
        return normal;
    }

    // format surfaces in dental standard form
    normalizeSurfaces(surfaces: string): string {
        return this.getSurfacesInSummaryFormat(surfaces);
    }

    getSurfacesInSummaryFormat(surfaces: string) {
        surfaces = surfaces.trim();
        if (surfaces.length < 1) {
            return surfaces;
        }
        var surfaceArr: string[] = surfaces.split(',');
        if (surfaceArr.length === 1) {
            return surfaceArr[0];
        }
        var ordered: string = '';
        var normalOrder = ['M', 'O', 'I', 'D', 'B', 'B5', 'F', 'F5', 'L', 'L5'];
        for (var i = 0; i < normalOrder.length; ++i) {
            if (surfaceArr.includes(normalOrder[i])) {
                ordered += normalOrder[i];
            }
        }
        return this.translateSurfaceDetailToSummary(ordered);
    }

    translateSurfaceDetailToSummary(detailed: string) {
        if (detailed.includes('B')) {
            if (detailed.charAt(0) !== 'M') {
                detailed = detailed.replace('ODB', 'DOB');
            }

            detailed = detailed.replace('BB5LL5', 'BL5');
            detailed = detailed.replace('BB5', 'B5');
            detailed = detailed.replace('B5LL5', 'LB5');
            detailed = detailed.replace('LL5', 'L5');
            detailed = detailed.replace('B5L5', 'BL5');
            detailed = detailed.replace('B5L', 'LB5');
        }
        else if (detailed.includes('F')) {
            if (detailed.charAt(0) !== 'M') {
                detailed = detailed.replace('IDF', 'DIF');
            }

            detailed = detailed.replace('FF5LL5', 'FL5');
            detailed = detailed.replace('FF5', 'F5');
            detailed = detailed.replace('F5LL5', 'LF5');
            detailed = detailed.replace('LL5', 'L5');
            detailed = detailed.replace('F5L5', 'FL5');
            detailed = detailed.replace('F5L', 'LF5');
        }
        else {
            if (detailed.charAt(0) !== 'M') {
                detailed = detailed.replace('OD', 'DO');
                detailed = detailed.replace('ID', 'DI');
            }

            detailed = detailed.replace('LL5', 'L5');
        }
        return detailed;
    }


    translateSurfaceSummaryToSelections(detailed: string) {
        //This will convert a summary text back to actual selections
        //For example, typing F5 is the same as choosing F and F5        
        let tempSelection = [];

        switch (this.inputValue) {
            case 'F':
                tempSelection = ['F']
                break;
            case 'B':
                tempSelection = ['B']
                break;
            case 'L':
                tempSelection = ['L']
                break;
            case 'FL':
            case 'LF':
                tempSelection = ['L', 'F']
                break;
            case 'BL':
            case 'LB':
                tempSelection = ['L', 'B']
                break;
            case 'B5':
                tempSelection = ['B', 'B5']
                break;
            case 'L5':
                tempSelection = ['L', 'L5']
                break;
            case 'F5':
                tempSelection = ['F', 'F5']
                break;
            case 'B5':
                tempSelection = ['B', 'B5']
                break;
            case 'L5':
                tempSelection = ['L', 'L5']
                break;
            case 'L5F5':
            case 'F5L5':
                tempSelection = ['L5', 'F5']
                break;
            case 'L5B5':
            case 'B5L5':
                tempSelection = ['L5', 'B5']
                break;
            case 'BL5':
                tempSelection = ['B', 'L', 'L5']
                break;
            case 'FL5':
                tempSelection = ['F', 'L', 'L5']
                break;
            case 'LF5':
                tempSelection = ['L', 'F', 'F5']
                break;
            case 'LB5':
                tempSelection = ['L', 'B', 'B5']
                break;

            default:
                break;
        }

        if (tempSelection.length == 0) {
            //Nothing matched exactly above, start dissecting the remaining string..
            //First look for the '5' surfaces

            let surfacesWith5 = ['B5', 'F5', 'L5'];

            for (var i = 0; i < surfacesWith5.length; ++i) {
                if (this.inputValue.includes(surfacesWith5[i])) {
                    this.inputValue = this.inputValue.replace(surfacesWith5[i], '');

                    tempSelection.push(surfacesWith5[i]);
                }
            }
            this.inputValue = this.inputValue.replace('5', '');

            //Then look through the rest for the remaining surfaces
            let singleSurfaceArray = ['B', 'F', 'L'];

            for (var i = 0; i < singleSurfaceArray.length; ++i) {
                if (this.inputValue.includes(singleSurfaceArray[i])) {
                    this.inputValue = this.inputValue.replace(singleSurfaceArray[i], '');

                    tempSelection.push(singleSurfaceArray[i]);
                }
            }
        }

        return tempSelection;
    }

    formatRoots(data: any[]) {
        let normal: string = '';
        if (data) {
            if (data.length > 0) {
                normal = data[0];
                for (let i = 1; i < data.length; ++i) {
                    normal = normal + ',' + data[i];
                }
                normal = this.normalizeRoots(normal);
            }
        }
        return normal;
    }

    normalizeRoots(roots: string): string {
        return this.getRootsInSummaryFormat(roots);
    }

    getRootsInSummaryFormat(roots: string) {
        roots = roots.trim();
        if (roots.length < 1) {
            return roots;
        }
        var rootArr: string[] = roots.split(',');
        if (rootArr.length === 1) {
            return rootArr[0];
        }
        var ordered: string = '';
        var normalOrder = ['DB', 'S', 'B', 'P', 'D', 'M', 'MB'];
        for (var i = 0; i < normalOrder.length; ++i) {
            if (rootArr.includes(normalOrder[i])) {
                ordered += normalOrder[i];
            }
        }
        return ordered;
    }


    translateRootSummaryToSelections(detailed: string) {

        if (detailed) {
            let tempSelection = [];
            let availableRoots = this.toothAreaService.toothAreaData.availableAreas;
            let twoLetterRoots = availableRoots.filter(x => x.length == 2);
            let oneLetterRoots = availableRoots.filter(x => x.length == 1)

            if (twoLetterRoots) {
                for (var i = 0; i < twoLetterRoots.length; ++i) {
                    if (detailed.includes(twoLetterRoots[i])) {
                        tempSelection.push(twoLetterRoots[i]);
                    }
                }

                for (var i = 0; i < twoLetterRoots.length; ++i) {
                    //Replace the matching two letter roots in the string                    
                    detailed = detailed.replace(twoLetterRoots[i], '');
                }
            }

            if (oneLetterRoots) {
                for (var i = 0; i < oneLetterRoots.length; ++i) {
                    if (detailed.includes(oneLetterRoots[i])) {
                        detailed = detailed.replace(oneLetterRoots[i], '');

                        tempSelection.push(oneLetterRoots[i]);
                    }
                }
            }
            return tempSelection;
        }
        return [];
    }

}
