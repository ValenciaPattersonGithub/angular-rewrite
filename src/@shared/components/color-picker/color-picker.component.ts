import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';

//Note: Based on https://github.com/LukasMarx/angular-color-picker
@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit, OnChanges {
    constructor() { }

    @Input() setColor: string;
    @Input() isDisabled: boolean;
    @Output() colorChanged = new EventEmitter();

    currentColorSelection: string;
    currentHue: string;

    recommendedColors: string[] = ['#c35250', '#527b0e', '#73578e', '#0044b3', '#1e7a8f', '#5917c4', '#3369ff',
        '#885330', '#88306c', '#e03400', '#007da3', '#6a00a3', '#008a07', '#bd593d', '#5e7548', '#4573a7'];
    recommendedTabActive: boolean;
    customTabActive: boolean;
    isPickerOpen: boolean;



    clickedInside: boolean = false;
    @HostListener('click')
    clickInside() {
        this.clickedInside = true;
    }

    @HostListener('document:click')
    clickout() {
        if (!this.clickedInside && this.isPickerOpen) {
            this.isPickerOpen = false;
            this.emitNewColor();
        }
        this.clickedInside = false;
    }

    ngOnInit() {
        //TODO: Add call to get recommendedColors?

        this.currentColorSelection = this.setColor ? this.setColor : '';
        this.currentHue = this.getHue(this.setColor);
        this.isPickerOpen = false;
        this.recommendedTabActive = true;
        this.customTabActive = false;

    }

    ngOnChanges() {
        this.currentColorSelection = this.setColor ? this.setColor : '';
        this.currentHue = this.getHue(this.setColor);
        this.isPickerOpen = false;
        this.recommendedTabActive = true;
        this.customTabActive = false;
    }

    changeActiveTab(tabIndex) {
        if (tabIndex == 1) {
            this.recommendedTabActive = true;
            this.customTabActive = false;
        }
        else if (tabIndex == 2) {
            this.recommendedTabActive = false;
            this.customTabActive = true;
        }
    }

    togglePicker() {
        if (!this.isDisabled) {
            this.isPickerOpen = !this.isPickerOpen;
            if (!this.isPickerOpen) {
                this.emitNewColor()
            }

            this.recommendedTabActive = true;
            this.customTabActive = false;
        }        
    }

    selectRecommendedColor(color) {
        if (color) {
            this.currentColorSelection = color;
            this.currentHue = this.getHue(this.setColor);
        }
    }

    paletteChanged(newHue) {
        this.currentHue = newHue;
    }

    sliderChanged(newColor) {
        this.currentColorSelection = newColor;
    }

    getHue(color) {
        var r = parseInt(color.substring(0, 2), 16) / 255;
        var g = parseInt(color.substring(2, 4), 16) / 255;
        var b = parseInt(color.substring(4, 6), 16) / 255;

        var hue;
        if ((r >= g) && (g >= b)) {
            hue = 60 * (g - b) / (r - b);
        } else if ((g > r) && (r >= b)) {
            hue = 60 * (2 - (r - b) / (g - b));
        }
        return hue;
    }

    componentToHex(c) {
        var intValue = parseInt(c);
        var hex = intValue.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(rgb) {
        var a = rgb.split("(")[1].split(")")[0];
        a = a.split(",");
        var r = a[0];
        var g = a[1];
        var b = a[2];
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    emitNewColor() {
        var emitColor = this.currentColorSelection;
        if (this.currentColorSelection) {
            if (this.currentColorSelection.startsWith('rgb')) {
                //We used the custom color picker, convert the rgb value back to a hex value before passing it back
                emitColor = this.rgbToHex(this.currentColorSelection);
            }
        }
        this.colorChanged.emit(emitColor);
    }
}
