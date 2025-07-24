import { Component, OnInit, Input, ElementRef, AfterViewInit, NgZone, OnDestroy, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ViewportRuler, ScrollDispatcher, CdkScrollable, OverlayRef, PositionStrategy, OverlayConfig, Overlay } from '@angular/cdk/overlay';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'resizable-drawer',
    templateUrl: './resizable-drawer.component.html',
})
export class ResizableDrawerComponent implements OnInit, OnDestroy {

    open: Boolean = false;

    document: Document;

    zone: NgZone;
    ruler: ViewportRuler;
    scrollDispatcher: ScrollDispatcher;
    drawerHeight: number = 525; // default value before height is calculated in the code

    resize: Subscription;
    $resize: Observable<Event>;
    scroll: Subscription;
    $scroll: Observable<void | CdkScrollable>;

    protected overlayRef: OverlayRef;


    // tells me if the drawer is absolutely positioned
    hasAlteredPage: boolean = false;

    resizeProcessing() {
        //console.log('Resize calculation happening');
        if (this.hasAlteredPage == true) {
            // Calculation ViewPort size - (height of header) - (height of drawer title) - (padding added by view-container class) - (space I cannot explain yet)
            this.drawerHeight = this.ruler.getViewportSize().height - 45 - 40 - 22; // do not ask me why the random number at the end I do not know ... because it looks good today
        }
        else {
            // Calculation ViewPort size - (height of browser area) - (height of header) - (height of drawer title) - (padding added by view-container class) - (space I cannot explain yet)
            this.drawerHeight = this.ruler.getViewportSize().height - 124 - 45 - 40 - 22; // do not ask me why the random number at the end I do not know ... because it looks good today
        }
    }

    scrollProcessing() {
        //console.log('Scroll calculation happening');
        let scrollPosition = this.ruler.getViewportScrollPosition();

        // this code is nasty DOM manipulation ... we will want to change this when the entire drawer area is in angular
        // if you have an alternative way of doing this ... by all means try
        if (scrollPosition.top >= 118) {
            if (this.hasAlteredPage == false) {
                //console.log('I need to add a class to a DOM element, and remove a class from another.');
                let element: HTMLElement = this.document.getElementById('complete_drawer_area') as HTMLElement;
                element.classList.add('scroll-drawer-position'); // works in browsers above IE 9
                this.hasAlteredPage = true;
                let hiddenElement: HTMLElement = this.document.getElementById('hidden-drawer') as HTMLElement;
                hiddenElement.classList.remove('hidden-drawer'); // works in browsers above IE 9
                //debugger;
                // I need to manually update the zone because of how updates work in the scroll observable.
                this.zone.run(() => this.resizeProcessing());
            }
        } else {
            // scroll is less then 118
            if (this.hasAlteredPage == true) {
                // we need to reset the view
                //console.log('I need to remove a class from a DOM element, and add a class to another.');
                let element: HTMLElement = this.document.getElementById('complete_drawer_area') as HTMLElement;
                element.classList.remove('scroll-drawer-position'); // works in browsers above IE 9
                let hiddenElement: HTMLElement = this.document.getElementById('hidden-drawer') as HTMLElement;
                hiddenElement.classList.add('hidden-drawer'); // works in browsers above IE 9
                this.hasAlteredPage = false;
                //debugger;
                // I need to manually update the zone because of how updates work in the scroll observable
                this.zone.run(() => this.resizeProcessing());
            }
        }
    }

    constructor(private _ruler: ViewportRuler,
        private _scrollDispatcher: ScrollDispatcher,
        @Inject(DOCUMENT) private _document: Document,
        private _zone: NgZone,
        private overlay: Overlay) {
        this.zone = _zone;
        this.ruler = _ruler;
        this.scrollDispatcher = _scrollDispatcher;
        this.document = _document;
    }

    ngOnInit() {
        this.resizeProcessing()

        // native resize event object ... when the browser height changes we reset this components content area height
        this.$resize = this.ruler.change();
        this.resize = this.$resize.subscribe(resizeEvent => {
            this.resizeProcessing();
        });

        // native on scroll notification for the window
        this.$scroll = this.scrollDispatcher.scrolled();
        this.scroll = this.$scroll.subscribe(x => this.scrollProcessing());
    }

    ngOnDestroy() {
        // clean up items
        if (this.hasAlteredPage == true) {
            //console.log('I need to remove a class from a DOM element.');
            let element: HTMLElement = this.document.getElementById('complete_drawer_area') as HTMLElement;
            element.classList.remove('scroll-drawer-position'); // works in browsers above IE 9
            let hiddenElement: HTMLElement = this.document.getElementById('hidden-drawer') as HTMLElement;
            hiddenElement.classList.add('hidden-drawer'); // works in browsers above IE 9
        }

        // very important to clean these up.
        this.resize.unsubscribe();
        this.scroll.unsubscribe();
    }
}
