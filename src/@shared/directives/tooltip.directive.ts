import { Directive, Input, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[tooltip]'
})
export class TooltipDirective {
    @Input('tooltip') tooltipTitle: string;
    @Input() placement: string;
    @Input() delay: string;
    tooltip: HTMLElement;

    offset = 10;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    @HostListener('mouseenter') onMouseEnter() {
        if (!this.tooltip) { this.show(); }
    }

    @HostListener('mouseleave') onMouseLeave() {
        if (this.tooltip) { this.hide(); }
    }

    show() {
        this.create();
        this.setPosition();
        if (this.tooltip.innerHTML) {
            this.renderer.addClass(this.tooltip, 'ng-tooltip-show');
        }
    }

    hide() {
        this.renderer.removeClass(this.tooltip, 'ng-tooltip-show');
        window.setTimeout(() => {
            if (this.renderer && this.tooltip) {
                this.renderer.removeChild(document.body, this.tooltip);
                this.tooltip = null;
            }
        }, Number(this.delay));
    }

    create() {
        this.tooltip = this.renderer.createElement('span');

        this.renderer.appendChild(
            this.tooltip,
            this.renderer.createText(this.tooltipTitle) // textNode
        );

        this.renderer.appendChild(document.body, this.tooltip);
        this.renderer.addClass(this.tooltip, `ng-tooltip-${this.placement}`);

        // delay
        this.renderer.setStyle(this.tooltip, '-webkit-transition', `opacity ${this.delay}ms`);
        this.renderer.setStyle(this.tooltip, '-moz-transition', `opacity ${this.delay}ms`);
        this.renderer.setStyle(this.tooltip, '-o-transition', `opacity ${this.delay}ms`);
        this.renderer.setStyle(this.tooltip, 'transition', `opacity ${this.delay}ms`);
    }

    setPosition() {
        const hostPos = this.el.nativeElement.getBoundingClientRect();

        // tooltip
        const tooltipPos = this.tooltip.getBoundingClientRect();

        const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

        let top, left;
        if (this.placement) {
            if (this.placement.includes('top')) {
                top = hostPos.top - tooltipPos.height - this.offset;
                left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
            }

            if (this.placement.includes('bottom')) {
                top = hostPos.bottom + this.offset;
                left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
            }

            if (this.placement.includes('left')) {
                top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
                left = hostPos.left - tooltipPos.width - this.offset;
            }

            if (this.placement.includes('right')) {
                top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
                left = hostPos.right + this.offset;
            }
        }

        this.renderer.setStyle(this.tooltip, 'top', `${top + scrollPos}px`);
        this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
    }
}
