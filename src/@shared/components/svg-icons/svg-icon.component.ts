import { Component, Input } from '@angular/core';

@Component({
    selector: 'svg-icon',
    templateUrl: './svg-icon.component.html',
    styleUrls: ['./svg-icon.component.scss']
})

export class SvgIconComponent {
    // Name must be equal to the ID of the requested icon in svg-definitions.component.html to return
    // the correct SVG sprite.
    @Input() name: string;
    @Input() iconHeight: string;
    @Input() iconWidth: string;
    @Input() iconColor = 'inherit';

    constructor() { }
}
