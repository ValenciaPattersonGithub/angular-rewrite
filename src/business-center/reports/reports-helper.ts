import { Injectable } from "@angular/core";

@Injectable()
export class ReportsHelper {
    constructor() {
    }
    setLocationHeaderV1(ofcLocation, rowNumber, previousRowNumber, name, offset, offset1 = 2, offset2 = 1) {
        if (previousRowNumber < rowNumber && (rowNumber == 0 || rowNumber - 1 == 0)) {
            ofcLocation = document.getElementById(name + rowNumber)['value'];
        }
        else {
            var headerDivTop = document.getElementById('headerLocationDiv').getBoundingClientRect().top
            var locBatch = rowNumber - 1;
            var locChanged = false;
            var minimumTop = 0;
            while (locBatch <= rowNumber + offset) {
                if (document.getElementById('subHeaderLocationDiv' + locBatch)) {
                    var subLocDivTop = document.getElementById('subHeaderLocationDiv' + locBatch).getBoundingClientRect().top - 20
                    if (subLocDivTop >= headerDivTop && minimumTop < subLocDivTop) {
                        ofcLocation = document.getElementById(name + locBatch)['value'];
                        minimumTop = subLocDivTop;
                        locChanged = true;
                    }
                }
                locBatch++;
            }
            var batch = rowNumber - 1;
            while (batch <= rowNumber + offset) {
                if (document.getElementById('locationTotalDiv' + batch)) {
                    var locDivTop = document.getElementById('locationTotalDiv' + batch).getBoundingClientRect().top - 20;
                    if (locDivTop >= headerDivTop
                        && ((locChanged && minimumTop > locDivTop) || (minimumTop < locDivTop))) {
                        minimumTop = locDivTop;
                        ofcLocation = document.getElementById(name + batch)['value'];
                        locChanged = true;
                    }
                }
                batch++;
            }
            batch = previousRowNumber < rowNumber ? rowNumber - offset1 : rowNumber + offset2;
            while (batch <= rowNumber + offset) {
                if (document.getElementById('divMainInfo' + batch)) {
                    var infoDivTop = document.getElementById('divMainInfo' + batch).getBoundingClientRect().top - 20;
                    if (infoDivTop >= headerDivTop && (minimumTop > infoDivTop || minimumTop == 0)) {
                        minimumTop = infoDivTop;
                        ofcLocation = document.getElementById(name + batch)['value'];
                    }
                }
                batch++;
            }
        }
        return ofcLocation;
    }

    setLocationHeader(ofcLocation, rowNumber, name) {
        var rowNumber = rowNumber + 1;
        var headerDivTop = document.getElementById('headerLocationDiv').getBoundingClientRect().top
        if ((document.getElementById('divMainInfo' + rowNumber)
            && document.getElementById('divMainInfo' + rowNumber).getBoundingClientRect().top + 30 >= headerDivTop)
            || (document.getElementById('subHeaderLocationDiv' + rowNumber)
                && document.getElementById('subHeaderLocationDiv' + rowNumber).getBoundingClientRect().top - 15 >= headerDivTop)) {
            ofcLocation = document.getElementById(name + rowNumber)['value'];
        }
        return ofcLocation;
    }

    setDateHeader(date, rowNumber, name) {
        var rowNumber = rowNumber + 1;
        var headerDivTop = document.getElementById('headerDateDiv').getBoundingClientRect().top
        if ((document.getElementById('divMainInfo' + rowNumber)
            && document.getElementById('divMainInfo' + rowNumber).getBoundingClientRect().top + 30 >= headerDivTop)
            || (document.getElementById('subHeaderDateDiv' + rowNumber)
              && document.getElementById('subHeaderDateDiv' + rowNumber).getBoundingClientRect().top - 15 >= headerDivTop)) {
            date = document.getElementById(name + rowNumber)['value'];
        }
        return date;
    }

    setLocationHeaderV2(header, rowNumber, previousRowNumber, name, headerDiv, subgroupDiv, totalDiv, offset, mainDiv = 'divMainInfo', offset1 = 2, offset2 = 1) {
        if (previousRowNumber < rowNumber && (rowNumber == 0 || rowNumber - 1 == 0)) {
            header = document.getElementById(name + rowNumber)['value'];
        }
        else {
            var headerDivTop = document.getElementById(headerDiv).getBoundingClientRect().top
            var locBatch = rowNumber - offset;
            var locChanged = false;
            var minimumTop = 0;
            while (locBatch <= rowNumber + offset) {
                if (document.getElementById(subgroupDiv + locBatch)) {
                    var subLocDivTop = document.getElementById(subgroupDiv + locBatch).getBoundingClientRect().top - 20;
                    if (subLocDivTop >= headerDivTop && minimumTop < subLocDivTop) {
                        header = document.getElementById(name + locBatch)['value'];
                        minimumTop = subLocDivTop;
                        locChanged = true;
                    }
                }
                locBatch++;
            }
            var batch = rowNumber - offset;
          
            // var batch = rowNumber - offset;
            while (batch <= rowNumber + offset) {
                if (document.getElementById(totalDiv + batch)) {
                    var locDivTop = document.getElementById(totalDiv + batch).getBoundingClientRect().top - 20;
                    if (locDivTop >= headerDivTop
                        && ((locChanged && minimumTop > locDivTop) || (minimumTop < locDivTop))) {
                        minimumTop = locDivTop;
                        header = document.getElementById(name + batch)['value'];
                        locChanged = true;
                    }
                }
                batch++;
            }
            batch = previousRowNumber < rowNumber ? rowNumber - offset1 : rowNumber + offset2;
            while (batch <= rowNumber + offset) {
                if (document.getElementById(mainDiv + batch)) {
                    var infoDivTop = document.getElementById(mainDiv + batch).getBoundingClientRect().top - 20;
                    if (infoDivTop >= headerDivTop && (minimumTop > infoDivTop || minimumTop == 0)) {
                        minimumTop = infoDivTop;
                        header = document.getElementById(name + batch)['value'];
                    }
                }
                batch++;
            }
        }
        return header;
    }
}