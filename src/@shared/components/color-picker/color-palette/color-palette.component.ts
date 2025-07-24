import { Component, ViewChild, ElementRef, AfterViewInit, Input, Output, SimpleChanges, OnChanges, EventEmitter, HostListener } from '@angular/core';

@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss']
})
//export class ColorPaletteComponent implements AfterViewInit, OnChanges {
export class ColorPaletteComponent implements AfterViewInit {

    @Output()
    color: EventEmitter<string> = new EventEmitter(true);

    @ViewChild('canvas')
    canvas: ElementRef<HTMLCanvasElement>;

    private ctx: CanvasRenderingContext2D;

    private mousedown: boolean = false;

    public selectedPosition: { x: number; y: number };

    ngAfterViewInit() {
        this.drawColorWheel();
        this.draw();
    }

    drawColorWheel() {
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d');
        }

        let radius = 105;
        let image = this.ctx.createImageData(2 * radius, 2 * radius);
        let data = image.data;

        for (let x = -radius; x < radius; x++) {
            for (let y = -radius; y < radius; y++) {

                let [r, phi] = this.xy2polar(x, y);

                if (r > radius) {
                    // skip all (x,y) coordinates that are outside of the circle
                    continue;
                }

                let deg = this.rad2deg(phi);

                // Figure out the starting index of this pixel in the image data array.
                let rowLength = 2 * radius;
                let adjustedX = x + radius; // convert x from [-50, 50] to [0, 100] (the coordinates of the image data array)
                let adjustedY = y + radius; // convert y from [-50, 50] to [0, 100] (the coordinates of the image data array)
                let pixelWidth = 4; // each pixel requires 4 slots in the data array
                let index = (adjustedX + (adjustedY * rowLength)) * pixelWidth;

                let hue = deg;
                let saturation = r / radius;
                let value = 1.0;

                let [red, green, blue] = this.hsv2rgb(hue, saturation, value);
                let alpha = 255;

                data[index] = red;
                data[index + 1] = green;
                data[index + 2] = blue;
                data[index + 3] = alpha;
            }
        }

        this.ctx.putImageData(image, 0, 0);
    }

    draw() {
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d');
        }
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;

        this.ctx.clearRect(0, 0, width, height);
        this.drawColorWheel();

        if (this.selectedPosition) {
            var rgb = this.hexToRgb("#2596be");
            this.ctx.shadowColor = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", .24)";
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;

            this.ctx.stroke();
            this.ctx.strokeStyle = 'white';
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(this.selectedPosition.x, this.selectedPosition.y, 5, 0, 2 * Math.PI);
            this.ctx.lineWidth = 3;
            this.ctx.closePath();

            this.ctx.shadowColor = "";
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }
    }

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    xy2polar(x, y) {
        let r = Math.sqrt(x * x + y * y);
        let phi = Math.atan2(y, x);
        return [r, phi];
    }

    rad2deg(rad) {
        return ((rad + Math.PI) / (2 * Math.PI)) * 360;
    }


    hsv2rgb(hue, saturation, value) {
        let chroma = value * saturation;
        let hue1 = hue / 60;
        let x = chroma * (1 - Math.abs((hue1 % 2) - 1));
        let r1, g1, b1;
        if (hue1 >= 0 && hue1 <= 1) {
            ([r1, g1, b1] = [chroma, x, 0]);
        } else if (hue1 >= 1 && hue1 <= 2) {
            ([r1, g1, b1] = [x, chroma, 0]);
        } else if (hue1 >= 2 && hue1 <= 3) {
            ([r1, g1, b1] = [0, chroma, x]);
        } else if (hue1 >= 3 && hue1 <= 4) {
            ([r1, g1, b1] = [0, x, chroma]);
        } else if (hue1 >= 4 && hue1 <= 5) {
            ([r1, g1, b1] = [x, 0, chroma]);
        } else if (hue1 >= 5 && hue1 <= 6) {
            ([r1, g1, b1] = [chroma, 0, x]);
        }

        let m = value - chroma;
        let [r, g, b] = [r1 + m, g1 + m, b1 + m];

        // Change r,g,b values from [0,1] to [0,255]
        return [255 * r, 255 * g, 255 * b];
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(evt: MouseEvent) {
        this.mousedown = false;
    }

    onMouseDown(evt: MouseEvent) {
        this.mousedown = true;
        if (this.isInsideCircle(evt.offsetX, evt.offsetY)) {
            this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };

            this.draw();
            this.emitColor(evt.offsetX, evt.offsetY);
        }

        //this.color.emit(this.getColorAtPosition(evt.offsetX, evt.offsetY));
    }

    onMouseMove(evt: MouseEvent) {
        if (this.mousedown) {
            if (this.isInsideCircle(evt.offsetX, evt.offsetY)) {
                this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };

                this.draw();
                this.emitColor(evt.offsetX, evt.offsetY);
            }


        }
    }

    isInsideCircle(x: number, y: number) {
        //Is the mouse position inside of the color palette?
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;
        const radius = width / 2;
        const centerX = width / 2;
        const centerY = height / 2;

        //Use the pythagorean theorum to find the hypotenuse and make sure it is less than or equal to the radius
        var distanceX = Math.abs(centerX - x);
        var distanceY = Math.abs(centerY - y);
        var hypotenuse = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

        return hypotenuse <= radius;
    }

    emitColor(x: number, y: number) {
        const rgbaColor = this.getColorAtPosition(x, y);
        this.color.emit(rgbaColor);
    }

    getColorAtPosition(x: number, y: number) {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
    }
}