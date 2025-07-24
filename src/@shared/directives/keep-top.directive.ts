import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[keep-top]'
})
export class KeepTopDirective {


    constructor(private element: ElementRef) {

    }

    // Set disance from top
    ktEtop: number

    ngAfterViewInit(): any {
        const rect = this.element?.nativeElement?.getBoundingClientRect();
        this.ktEtop = rect.top + window.pageYOffset - document.documentElement.clientTop;
    }

    keepTop = () => {

        if (this.ktEtop === null) {
            return;
        }
        // Set distance for window.scrollTop
        let ktW = $(window).scrollTop();
        // Get height of header
        let ktHeader = $('header').height();

        if (ktW > (this.ktEtop - ktHeader)) {
            if (!(this.element?.nativeElement?.classList.contains('keepTop')))
                this.element.nativeElement.classList.add('keepTop')
        } else if ((ktW - ktHeader) < this.ktEtop) {
            if (this.element?.nativeElement?.classList.contains('keepTop'))
                this.element.nativeElement.classList.remove('keepTop')
        }
    };



    // Bind the scroll event
    @HostListener("window:scroll", [])
    onWindowScroll() {
        this.keepTop();
    }

    // Bind the resize event
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.keepTop();
    }

}
