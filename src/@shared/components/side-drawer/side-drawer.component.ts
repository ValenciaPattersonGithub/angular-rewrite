import { Component, Input } from '@angular/core';

export enum SideDrawerAnchor {
    top = 'top',
    left = 'left',
    bottom = 'bottom',
    right = 'right'
}

@Component({
    selector: 'side-drawer',
    templateUrl: './side-drawer.component.html',
    styleUrls: ['./side-drawer.component.scss']
})
export class SideDrawerComponent {
    private _anchor: SideDrawerAnchor;
    private _height: number;
    private _width: number;

    className: string;
    heightStyle: string = '100%';
    widthStyle: string = '100%';
    marginStyle: string = '0';
    isPartialAxis: boolean = false;

    @Input()
    set anchor(a: SideDrawerAnchor) {
        this._anchor = a;
        this.updateMargin();
    }
    get anchor() {
        return this._anchor;
    }

    @Input() isOpen: boolean;

    @Input() setHeightUsingVH: boolean;

    @Input()
    set height(h: number | undefined) {
        if (this.setHeightUsingVH) {
            this._height = h;
            this.heightStyle = 'calc(100vh -  ' + h + 'px)';
        }
        else if (h > 0) {
            this._height = h;
            this.heightStyle = h + 'px';
        }
        else {
            this._height = -1
            this.heightStyle = '100%';
        }

        this.updateMargin();
    }

    @Input()
    set width(w: number | undefined) {
        if (w > 0) {
            this._width = w;
            this.widthStyle = w + 'px';
        } else {
            this._width = -1
            this.widthStyle = '100%';
        }

        this.updateMargin();
    }

    updateMargin() {
        switch (this._anchor) {
            case SideDrawerAnchor.left:
            case SideDrawerAnchor.right:
                this.marginStyle = this._height > 0 ? `${(0 - Math.floor(this._height / 2))}px 0 0 0` : '0';
                this.isPartialAxis = this._height > 0;

                break;
            case SideDrawerAnchor.top:
            case SideDrawerAnchor.bottom:
                this.marginStyle = this._width > 0 ? `0 0 0 ${(0 - Math.floor(this._width / 2))}px` : '0';
                this.isPartialAxis = this._width > 0;

                break;
        }
    }
}
