// purpose of this services it to encapsulate the basic operations related to tooth handling.
// we have need to have tooth handling exposed to several different area of our site
// thus a centralized common way to manipulate and work with (a tooth/teeth) seems like a good idea.

import { Inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToothUtilityService {

    quadrants : any[] = [
        {
            USNumber: 'UL',
            range: '9-16',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UR',
            range: '1-8',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LL',
            range: '17-24',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LR',
            range: '25-32',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UA',
            range: '1-16',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LA',
            range: '17-32',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'FM',
            range: '1-32',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UL',
            range: 'F-J',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UR',
            range: 'A-E',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LL',
            range: 'K-O',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LR',
            range: 'P-T',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UA',
            range: 'A-J',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LA',
            range: 'T-K',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'FM',
            range: 'A-T',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        }
    ];

    constructor(@Inject('StaticData') private staticData) {
    }

    public setMapTooth(tooth): any {
        if (tooth.ToothId === 4) {
            tooth.toothIdOfOtherDentitionInSamePosition = 33;
        } else if (tooth.ToothId === 5) {
            tooth.toothIdOfOtherDentitionInSamePosition = 34;
        } else if (tooth.ToothId === 6) {
            tooth.toothIdOfOtherDentitionInSamePosition = 35;
        } else if (tooth.ToothId === 7) {
            tooth.toothIdOfOtherDentitionInSamePosition = 36;
        } else if (tooth.ToothId === 8) {
            tooth.toothIdOfOtherDentitionInSamePosition = 37;
        } else if (tooth.ToothId === 9) {
            tooth.toothIdOfOtherDentitionInSamePosition = 38;
        } else if (tooth.ToothId === 10) {
            tooth.toothIdOfOtherDentitionInSamePosition = 39;
        } else if (tooth.ToothId === 11) {
            tooth.toothIdOfOtherDentitionInSamePosition = 40;
        } else if (tooth.ToothId === 12) {
            tooth.toothIdOfOtherDentitionInSamePosition = 41;
        } else if (tooth.ToothId === 13) {
            tooth.toothIdOfOtherDentitionInSamePosition = 42;
        } else if (tooth.ToothId === 20) {
            tooth.toothIdOfOtherDentitionInSamePosition = 43;
        } else if (tooth.ToothId === 21) {
            tooth.toothIdOfOtherDentitionInSamePosition = 44;
        } else if (tooth.ToothId === 22) {
            tooth.toothIdOfOtherDentitionInSamePosition = 45;
        } else if (tooth.ToothId === 23) {
            tooth.toothIdOfOtherDentitionInSamePosition = 46;
        } else if (tooth.ToothId === 24) {
            tooth.toothIdOfOtherDentitionInSamePosition = 47;
        } else if (tooth.ToothId === 25) {
            tooth.toothIdOfOtherDentitionInSamePosition = 48;
        } else if (tooth.ToothId === 26) {
            tooth.toothIdOfOtherDentitionInSamePosition = 49;
        } else if (tooth.ToothId === 27) {
            tooth.toothIdOfOtherDentitionInSamePosition = 50;
        } else if (tooth.ToothId === 28) {
            tooth.toothIdOfOtherDentitionInSamePosition = 51;
        } else if (tooth.ToothId === 29) {
            tooth.toothIdOfOtherDentitionInSamePosition = 52;
        } else if (tooth.ToothId === 33) {// prim > perm
            tooth.toothIdOfOtherDentitionInSamePosition = 4;
        } else if (tooth.ToothId === 34) {
            tooth.toothIdOfOtherDentitionInSamePosition = 5;
        } else if (tooth.ToothId === 35) {
            tooth.toothIdOfOtherDentitionInSamePosition = 6;
        } else if (tooth.ToothId === 36) {
            tooth.toothIdOfOtherDentitionInSamePosition = 7;
        } else if (tooth.ToothId === 37) {
            tooth.toothIdOfOtherDentitionInSamePosition = 8;
        } else if (tooth.ToothId === 38) {
            tooth.toothIdOfOtherDentitionInSamePosition = 9;
        } else if (tooth.ToothId === 39) {
            tooth.toothIdOfOtherDentitionInSamePosition = 10;
        } else if (tooth.ToothId === 40) {
            tooth.toothIdOfOtherDentitionInSamePosition = 11;
        } else if (tooth.ToothId === 41) {
            tooth.toothIdOfOtherDentitionInSamePosition = 12;
        } else if (tooth.ToothId === 42) {
            tooth.toothIdOfOtherDentitionInSamePosition = 13;
        } else if (tooth.ToothId === 43) {
            tooth.toothIdOfOtherDentitionInSamePosition = 20;
        } else if (tooth.ToothId === 44) {
            tooth.toothIdOfOtherDentitionInSamePosition = 21;
        } else if (tooth.ToothId === 45) {
            tooth.toothIdOfOtherDentitionInSamePosition = 22;
        } else if (tooth.ToothId === 46) {
            tooth.toothIdOfOtherDentitionInSamePosition = 23;
        } else if (tooth.ToothId === 47) {
            tooth.toothIdOfOtherDentitionInSamePosition = 24;
        } else if (tooth.ToothId === 48) {
            tooth.toothIdOfOtherDentitionInSamePosition = 25;
        } else if (tooth.ToothId === 49) {
            tooth.toothIdOfOtherDentitionInSamePosition = 26;
        } else if (tooth.ToothId === 50) {
            tooth.toothIdOfOtherDentitionInSamePosition = 27;
        } else if (tooth.ToothId === 51) {
            tooth.toothIdOfOtherDentitionInSamePosition = 28;
        } else if (tooth.ToothId === 52) {
            tooth.toothIdOfOtherDentitionInSamePosition = 29;
        }

        return tooth;
    }
    
    getAndSetupTeethDefinitions(): Promise<any>{
        // get teeth from static list and combine them with the quadrants collection so we can treat the two as the same collection moving forward.
        var innerMethod = this; // I could not reference the external method so adding this code.
        return this.staticData.TeethDefinitions().then(function (response) {
            var list = [];
            if (response && response.Value) {
                var result = response.Value.Teeth;
                for (let i = 0; i < result.length; i++) {
                    if (result[i].ToothId !== null && result[i]['ToothId'] < 53) {
                        var tooth = result[i];
                        tooth = innerMethod.setMapTooth(tooth);

                        tooth.visible = true;
                        tooth.selected = false;
                        tooth.positionAlreadyTaken = false;
                        
                        list.push(tooth);
                    }
                }
                return list;
            }
        });
    }
  
}
