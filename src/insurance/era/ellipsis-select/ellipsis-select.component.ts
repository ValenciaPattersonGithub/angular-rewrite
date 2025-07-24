import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnInit, OnDestroy, Output, Renderer2, ViewRef } from '@angular/core';

export class EllipsisSelectOption {
    click: any; // eslint-disable-line
    disabled: boolean = false;
}

export class EllipsisSelectEvent {
    func: any;
    ref: any;
}

@Component({
    selector: 'app-ellipsis-select',
    templateUrl: './ellipsis-select.component.html',
    styleUrls: ['./ellipsis-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EllipsisSelectComponent implements OnInit, OnDestroy {
    @Input() options: EllipsisSelectOption[] = [];
    @Input() refObject: any; // eslint-disable-line
    @Input() tooltipWidth: number;
    @Output() functionCall = new EventEmitter<EllipsisSelectEvent>();

    isOpen = false;
    clickOutListener: () => void;

    constructor(
        private cd: ChangeDetectorRef,
        private eRef: ElementRef,
        private renderer2: Renderer2,
        private zone: NgZone) {

        this.cd.detach();
    }

    ngOnInit() {
        this.cd.detectChanges();

        // https://medium.com/claritydesignsystem/four-ways-of-listening-to-dom-events-in-angular-part-3-renderer2-listen-14c6fe052b59
        // With following code that runs outside of Angular zone, when click event is triggered anywhere,
        // it will NOT start the default Angular change detection. Along with manual change detection with OnPush strategy, this
        // boosts performance when used in data centric components like grid. 
        this.zone.runOutsideAngular(() => {
            this.clickOutListener = this.renderer2.listen('body', 'click', event => {
                this.clickout(event);
            });
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;

        if (!(this.cd as ViewRef).destroyed)
            this.cd.detectChanges();
    }

    select(option: EllipsisSelectOption) {
        if (!option.disabled) {
            this.functionCall.emit({ func: option.click, ref: this.refObject });
        }
        this.toggle();
    }

    clickout(event: MouseEvent) {
        if (this.isOpen && !this.eRef.nativeElement.contains(event.target))
            this.toggle();
    }

    ngOnDestroy() {
        this.clickOutListener();
    }
}
