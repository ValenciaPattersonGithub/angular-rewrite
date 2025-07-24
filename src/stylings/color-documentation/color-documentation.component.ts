import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
    // example component used only in Storybook
    selector: 'color-example',
    templateUrl: './color-documentation.component.html',
    styleUrls: ['./color-documentation.component.scss']
})

export class ColorDocumentationComponent {
    @Input() color: string;

}
