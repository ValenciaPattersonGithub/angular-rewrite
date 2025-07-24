import { TestBed } from '@angular/core/testing';

import { ColorUtilitiesService } from './color-utilities.service';

describe('ColorUtilitiesService', () => {
        let service: ColorUtilitiesService;

        beforeEach(() => {
                TestBed.configureTestingModule({
                    providers: [ColorUtilitiesService],
                });
                service = TestBed.get(ColorUtilitiesService);
            }
        );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getHex should return same value for when 6 digit value is entered', () => {
        const original = '#A0A0A0';
        const result = service.getHex(original);
        expect(result).toEqual(original);
    });

    it('getHex should return 6 digit value for when 3 digit is entered', () => {
        const original = '#03F';
        const result = service.getHex(original);
        expect(result).toEqual('#0033FF');
    });

    it('getRgb should return same value for r, g, and b when given #A0A0A0', () => {
        var expectedResult = {
            r: 160,
            g: 160,
            b: 160
        };
        const original = '#A0A0A0';
        const result = service.getRgb(original);
        expect(result).toEqual(expectedResult);
    });

    it('getRgb should return three different numbers when given #FFa980', () => {
        var expectedResult = {
            r: 255,
            g: 169,
            b: 128
        };
        const original = '#FFa980';
        const result = service.getRgb(original);
        expect(result).toEqual(expectedResult);
    });

    it('getHexToRgb should return same value for r, g, and b when given #A0A0A0', () => {
        var expectedResult = {
            r: 160,
            g: 160,
            b: 160
        };
        const original = '#A0A0A0';
        const result = service.getHexToRgb(original);
        expect(result).toEqual(expectedResult);
    });

    it('getHexToRgb should return three different numbers when given #FFa980', () => {
        var expectedResult = {
            r: 255,
            g: 169,
            b: 128
        };
        const original = '#FFa980';
        const result = service.getHexToRgb(original);
        expect(result).toEqual(expectedResult);
    });

});
