import { Component, ViewChild, ElementRef, AfterViewInit, Output, HostListener, EventEmitter, Input, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss']
})
export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('canvas')
    canvas: ElementRef<HTMLCanvasElement>;

    @Input() hue: string;

    @Output()
    color: EventEmitter<string> = new EventEmitter();

    private ctx: CanvasRenderingContext2D;
    private mousedown: boolean = false;
    private selectedHeight: number;

    ngAfterViewInit() {
        this.draw();
    }

    draw() {
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d');
        }
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;

        this.ctx.clearRect(0, 0, width, height);

        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);

        gradient.addColorStop(0, this.hue || 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

        this.ctx.beginPath();
        this.ctx.rect(0, 0, width, height);

        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.closePath();

        if (this.selectedHeight) {
            this.roundRect(0, this.selectedHeight - 5);
        }
    }

    roundRect(x, y) {
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d');
        }

        const width = 20;
        const height = 10;
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;


        var radiusValue = 5;
        var radius = { tl: radiusValue, tr: radiusValue, br: radiusValue, bl: radiusValue };

        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius.tl, y);
        this.ctx.lineTo(x + width - radius.tr, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        this.ctx.lineTo(x + width, y + height - radius.br);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        this.ctx.lineTo(x + radius.bl, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        this.ctx.lineTo(x, y + radius.tl);
        this.ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        this.ctx.closePath();

        var rgb = this.hexToRgb("#2596be");
        this.ctx.shadowColor = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", .24)";
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        var stroke = true;
        if (stroke) {
            this.ctx.stroke();
        }

        this.ctx.shadowColor = "";
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }



    @HostListener('window:mouseup', ['$event'])
    onMouseUp(evt: MouseEvent) {
        this.mousedown = false;
    }

    onMouseDown(evt: MouseEvent) {
        this.mousedown = true;
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;

        if (evt.offsetY > 0 && evt.offsetY < height) {
            this.selectedHeight = evt.offsetY;
            this.draw();
            this.emitColor(width / 2, evt.offsetY);
        }
    }

    onMouseMove(evt: MouseEvent) {
        if (this.mousedown) {
            const width = this.canvas.nativeElement.width;
            const height = this.canvas.nativeElement.height;

            if (evt.offsetY > 0 && evt.offsetY < height) {
                this.selectedHeight = evt.offsetY;
                this.draw();
                this.emitColor(width / 2, evt.offsetY);
            }
        }
    }

    emitColor(x: number, y: number) {
        const rgbaColor = this.getColorAtPosition(x, y);
        this.color.emit(rgbaColor);
    }

    getColorAtPosition(x: number, y: number) {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
    }

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['hue'] && this.canvas && this.canvas.nativeElement) {
            if (!this.selectedHeight || this.selectedHeight == 0) {
                this.selectedHeight = 1;
            }

            this.draw();

            const width = this.canvas.nativeElement.width;

            this.color.emit(this.getColorAtPosition(width / 2, this.selectedHeight));
        }
    }
}