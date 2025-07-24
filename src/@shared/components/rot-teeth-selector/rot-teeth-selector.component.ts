/// <reference path="../../providers/tooth-utility-service.service.ts" />
import { Component, EventEmitter, OnInit, ViewChild, Input, Output, ElementRef, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import cloneDeep from 'lodash/cloneDeep';
import { ToothAreaDataService } from 'src/@shared/providers/tooth-area-data.service';
import { Subject } from 'rxjs';
import { ToothAreaData } from '../../providers/tooth-area-data.model';

@Component({
    selector: 'rot-teeth-selector',
    templateUrl: 'rot-teeth-selector.component.html',
    styleUrls: ['./rot-teeth-selector.component.scss']
})
export class RotTeethSelectorComponent implements OnInit {
    possibleTeeth: any[] = [];
    quadrants: any[] = [];
    selected: any[] = [];
    selectedTeeth: any[] = [];
    translatedTeeth: any[] = [];
    showDropdown: boolean = false;
    showTeethList: boolean = false;
    placeholderText: string = '';
    subject = new Subject();
    fromEnter: boolean = false;
    inputValue: any;
    isLoaded: boolean = false;
    toothAreaData: ToothAreaData
    @ViewChild('toothInput', { static: false }) toothInputElement: ElementRef
    @Input() input: any = null;
    @Input() service: any;
    @Input() customid?: string;
    @Input() customClass: string;
    @Output() inputModelChange = new EventEmitter<any>();

    constructor(private translate: TranslateService,
        private toothAreaDataService: ToothAreaDataService) {
    }

    async ngOnInit() {
        this.toothAreaData = new ToothAreaData();
        this.toothAreaData.areaSelection = [];
        this.toothAreaData.availableAreas = [];
        this.toothAreaData.serviceCode = this.service.$toothAreaData.serviceCode;
        this.toothAreaData.originalServiceCode = this.service.$toothAreaData.originalServiceCode;

        this.inputValue = cloneDeep(this.input);
        this.placeholderText = this.translate.instant('Select teeth...');
        this.possibleTeeth = this.toothAreaDataService.setupDataForRangeOfTeeth();
        await this.loadPreselectedTeeth(this.input);
        this.quadrants = this.toothAreaDataService.quadrants;
        this.isLoaded = true;
        this.inputValue = null;
    }

    // funny way to tell if someone clicked outside of the current control.
    clickedInside: boolean = false;
    @HostListener('click')
    clickInside() {
        this.clickedInside = true;
    }

    @HostListener('document:click')
    clickout() {
        if (!this.clickedInside) {
            this.showDropdown = false;
        }
        this.clickedInside = false;
    }
    // ending funny way to tell a person clicked out side of the current control

    toggleDropdown() {
        if (!this.showDropdown) {
            this.showTeethList = true;
        }
        this.showDropdown = !this.showDropdown;

        if (this.showDropdown === true) {
            this.focusInput();
        }
    }

    focusInput() {
        setTimeout(() => {
            this.toothInputElement.nativeElement.focus();
            this.toothInputElement.nativeElement.value = '';
        }, 100);
    }

    inputKeydown(e) {
        if (!e.shiftKey && e.key === 'Tab') {
            this.showDropdown = false;
            this.showTeethList = false;
        }
    }

    async select(tooth) {
        this.toggleSelectedProperty(tooth, true);
        await this.updateSelected();
        if (this.inputValue && this.inputValue != '') {
            this.markTeethAsVisible();
            this.focusInput();
        }
        this.inputValue = null;

    }

    async selectQuadrant(quadrant) {
        await this.selectRange(quadrant.range);
        if (this.inputValue && this.inputValue != '') {
            this.markTeethAsVisible();
            this.focusInput();
        }
        this.inputValue = null;
    }

    // selects an individual tooth
    async selectIndividual(toothNumber) {
        var tooth = this.findToothByUSNumber(toothNumber);
        if (tooth) {
            this.toggleSelectedProperty(tooth, true);
            await this.updateSelected();
        }
    };

    findToothByUSNumber(tooth) {
        var result = null;
        for (let x = 0; x < this.possibleTeeth.length; x++) {
            if (this.possibleTeeth[x].USNumber === tooth) {
                result = this.possibleTeeth[x];
            }
        }

        return result;
    }

    findIndexByUSNumber(tooth) {
        var result = null;
        for (let x = 0; x < this.possibleTeeth.length; x++) {
            if (this.possibleTeeth[x].USNumber === tooth) {
                result = x;
            }
        }
        return result;
    }

    async enter(event: any) {
        if (this.inputValue !== null) {
            var cloneInput = cloneDeep(this.inputValue);
            cloneInput = cloneInput.replace(/ /g, '');
            var entrys = cloneInput.split(',');
            for (let i = 0; i < entrys.length; i++) {
                if (typeof entrys[i] === 'string') {
                    entrys[i] = entrys[i].toUpperCase();
                }
                switch (entrys[i]) {
                    case 'UR':
                        entrys[i] = '1-8';
                        break;
                    case 'UL':
                        entrys[i] = '9-16';
                        break;
                    case 'LR':
                        entrys[i] = '25-32';
                        break;
                    case 'LL':
                        entrys[i] = '17-24';
                        break;
                    case 'UA':
                        entrys[i] = '1-16';
                        break;
                    case 'LA':
                        entrys[i] = '17-32';
                        break;
                    case 'FM':
                        entrys[i] = '1-32';
                        break;
                    default:
                        break;
                }
                if (entrys[i].indexOf('-') === -1) {
                    await this.selectIndividual(entrys[i]);
                }
                else if (entrys[i].indexOf('-') >= 1 && entrys[i].length >= 3) {
                    await this.selectRange(entrys[i]);
                }
            }
            this.fromEnter = true;

            this.markTeethAsVisible();

            this.inputValue = null;
            this.showTeethList = true
            this.fromEnter = false;
        }
    };

    rangeToCode(value: any) {
        switch (value) {
            case '1-8':
            case 'A-E':
            case 'E-A':
                return 'UR';
            case '9-16':
            case 'F-J':
            case 'J-F':
                return 'UL';
            case '25-32':
            case 'T-P':
            case 'P-T':
                return 'LR';
            case '17-24':
            case 'O-K':
            case 'K-O':
                return 'LL';
            case '1-16':
            case 'A-J':
            case 'J-A':
                return 'UA';
            case '17-32':
            case 'K-T':
            case 'T-K':
                return 'LA';
            case '1-32':
            case 'A-T':
            case 'T-A':
                return 'FM';
            default:
                return value;
        }
    };

    markTeethAsVisible() {
        for (let i = 0; i < this.possibleTeeth.length; i++) {
            this.possibleTeeth[i].visible = true;

        }
        for (let i = 0; i < this.quadrants.length; i++) {
            this.quadrants[i].visible = true;
        }
    }

    // selects a range of teeth, '1-8', etc.
    async selectRange(toothRange) {
        var firstIndex = this.findIndexByUSNumber(toothRange.slice(0, toothRange.indexOf('-')));
        var lastIndex = this.findIndexByUSNumber(toothRange.slice(toothRange.indexOf('-') + 1));
        if (firstIndex !== -1 &&
            lastIndex !== -1 &&
            lastIndex >= firstIndex &&
            this.possibleTeeth[firstIndex].ToothStructure === this.possibleTeeth[lastIndex].ToothStructure) {
            var list = this.possibleTeeth.slice(firstIndex, lastIndex + 1);
            for (let i = 0; i < list.length; i++) {
                this.toggleSelectedProperty(list[i], true);
            }
            await this.updateSelected();
        }
        else if (firstIndex !== -1 &&
            lastIndex !== -1 &&
            lastIndex < firstIndex &&
            this.possibleTeeth[firstIndex].ToothStructure === this.possibleTeeth[lastIndex].ToothStructure) {
            var list = this.possibleTeeth.slice(lastIndex, firstIndex + 1);
            for (let i = 0; i < list.length; i++) {
                this.toggleSelectedProperty(list[i], true);
            }
            await this.updateSelected();
        }
    };

    toggleSelectedProperty(tooth, flag) {
        if (tooth.toothIdOfOtherDentitionInSamePosition) {
            var toothOfOtherDentitionInSamePosition = null;
            for (let i = 0; i < this.possibleTeeth.length; i++) {
                if (tooth.toothIdOfOtherDentitionInSamePosition === this.possibleTeeth[i].ToothId) {
                    toothOfOtherDentitionInSamePosition = this.possibleTeeth[i];
                }
            }
            if (toothOfOtherDentitionInSamePosition && !toothOfOtherDentitionInSamePosition.selected) {
                tooth.selected = flag;
                toothOfOtherDentitionInSamePosition.positionAlreadyTaken = flag;
            }
        }
        else {
            tooth.selected = flag;
        }
    }

    inputChanged($event, nv) {
        if (!this.fromEnter) {
            if (this.possibleTeeth) {
                for (let i = 0; i < this.possibleTeeth.length; i++) {
                    this.possibleTeeth[i].visible = true;
                    this.possibleTeeth[i].highlight = false;
                }
            }
            if (nv) {
                if (nv.indexOf('-') === -1) {
                    if (nv.indexOf('-') === -1 && nv.indexOf(',') === -1) {
                        this.showTeethList = true;
                    }
                    else {
                        this.showTeethList = false;
                    }
                    if (typeof nv === 'string') {
                        nv = nv.toUpperCase();
                    }
                    this.filterBasedOnInput(nv);
                }
                else {
                    this.showTeethList = false;
                }
            }
            else {
                this.showTeethList = true;
            }
        }
    }

    filterBasedOnInput(inputValue) {
        var foundOne = false;
        for (let i = 0; i < this.possibleTeeth.length; i++) {
            this.possibleTeeth[i].visible = this.possibleTeeth[i].USNumber.startsWith(inputValue);
            if (!foundOne && this.possibleTeeth[i].visible && !this.possibleTeeth[i].selected) {
                this.possibleTeeth[i].highlight = true;
                foundOne = true;
            }
        }
        foundOne = false;
        for (let i = 0; i < this.quadrants.length; i++) {
            this.quadrants[i].visible = this.quadrants[i].USNumber.startsWith(inputValue);
            if (!foundOne && this.quadrants[i].visible && !this.quadrants[i].selected) {
                this.quadrants[i].highlight = true;
                foundOne = true;
            }
        }
    };

    async updateSelected() {
        if (this.selected) {
            this.selected.length = 0;
        }
        var selectedNumbers = '';
        for (let i = 0; i < this.possibleTeeth.length; i++) {
            if (this.possibleTeeth[i].selected) {
                if (this.possibleTeeth[i - 1] && this.possibleTeeth[i].ToothStructure !== this.possibleTeeth[i - 1].ToothStructure) {
                    selectedNumbers = selectedNumbers.concat(',-', this.possibleTeeth[i].USNumber);
                }
                else {
                    selectedNumbers = selectedNumbers.concat('-', this.possibleTeeth[i].USNumber);
                }
            }
            else {
                selectedNumbers = selectedNumbers.concat(',');
            }
        }
        var selectedSplitNumbers = selectedNumbers.split(',');
        for (let i = 0; i < selectedSplitNumbers.length; i++) {
            if (selectedSplitNumbers[i]) {
                selectedSplitNumbers[i] = selectedSplitNumbers[i].slice(1);
                if (selectedSplitNumbers[i].indexOf('-') === -1) {
                    this.selected.push(selectedSplitNumbers[i]);
                }
                else {
                    var firstNumber = selectedSplitNumbers[i].slice(0, selectedSplitNumbers[i].indexOf('-'));
                    var lastNumber = selectedSplitNumbers[i].slice(selectedSplitNumbers[i].lastIndexOf('-') + 1);
                    this.selected.push(firstNumber + '-' + lastNumber);
                }
            }
        }
        await this.updateTags();
    }

    async updateTags() {
        this.selectedTeeth = [];
        this.translatedTeeth = [];

        for (let i = 0; i < this.selected.length; i++) {
            this.selectedTeeth[i] = this.selected[i];
        }
        for (let i = 0; i < this.selectedTeeth.length; i++) {
            var types = [];
            for (let x = 0; x < this.quadrants.length; x++) {
                if (this.quadrants[x].range === this.selectedTeeth[i]) {
                    types.push(this.selectedTeeth[i]);
                }
            }
            if (types.length > 0 && types[0].range == this.selectedTeeth[i]) {
                this.selectedTeeth[i] = types[0].USNumber;
            }
        }

        if (this.isLoaded) {
            this.input = this.selectedTeeth ? this.selectedTeeth.join(',') : '';
            this.toothAreaData.toothSelection = this.selectedTeeth;
            this.toothAreaData = await this.toothAreaDataService.rotToothChange(this.toothAreaData);
            this.service = this.toothAreaDataService.setValuesOnServiceTransaction(this.service, this.toothAreaData);

            this.inputModelChange.emit(this.input);
        }

        // translate for UI
        for (let i = 0; i < this.selectedTeeth.length; i++) {
            this.translatedTeeth[i] = this.rangeToCode(this.selectedTeeth[i]);
        }
    }

    async remove(tooth) {
        //map back to selected tooth

        var increment = 0;
        for (let i = 0; i < this.quadrants.length; i++) {
            if (this.quadrants[i].USNumber === tooth) {
                for (let j = 0; j < this.selectedTeeth.length; j++) {
                    if (this.selectedTeeth[j] === this.quadrants[i].range) {
                        tooth = this.selectedTeeth[j];
                    }
                }
            }
        }

        if (tooth.indexOf('-') === -1) {
            await this.removeIndividual(tooth);
        }
        else {
            await this.removeRange(tooth);
        }
        this.focusInput();
    }

    // removes an individual tooth
    async removeIndividual(toothNumber) {
        var tooth = this.findToothByUSNumber(toothNumber);
        if (tooth) {
            this.toggleSelectedProperty(tooth, false);
            await this.updateSelected();
        }
    };

    // removes a range of teeth, '1-8', etc.
    async removeRange(toothRange) {
        var firstIndex = this.findIndexByUSNumber(toothRange.slice(0, toothRange.indexOf('-')));
        var lastIndex = this.findIndexByUSNumber(toothRange.slice(toothRange.indexOf('-') + 1));
        var list = this.possibleTeeth.slice(firstIndex, lastIndex + 1);
        for (let i = 0; i < list.length; i++) {
            this.toggleSelectedProperty(list[i], false);
        }
        await this.updateSelected();
    };

    async loadPreselectedTeeth(nv) {
        //Assumes we are passing in a comma separated string
        let teethList = [];
        if (nv && nv.toString().indexOf(',') !== -1) {
            teethList = nv.split(',');
        }
        else {
            teethList.push(nv);
        }
        for (let i = 0; i < teethList.length; i++) {
            teethList[i] = isNaN(teethList[i]) ? teethList[i] : teethList[i].toString();
            var tooth = null;
            for (let x = 0; x < this.possibleTeeth.length; x++) {
                if (this.possibleTeeth[x].USNumber === teethList[i]) {
                    tooth = teethList[i];
                }
            }
            if (tooth) {
                //this.toggleSelectedProperty(tooth, true);
                //this.updateSelected();
                await this.selectIndividual(tooth);
            }
            else if (teethList[i].indexOf('-') >= 1 && teethList[i].length >= 3) {
                await this.selectRange(teethList[i]);
            }
        }
        await this.updateSelected();
    };
}
