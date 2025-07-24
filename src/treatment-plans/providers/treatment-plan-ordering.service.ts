import { Injectable, Inject } from '@angular/core';

@Injectable()
export class TreatmentPlanOrderingService {

    constructor() { }

    orderServiceTypesByDescription(list: any[], ascending: boolean) {

        let nullPosition = ascending ? 1 : -1;

        if (list !== null && list !== undefined) {
            let newList = list.sort((a, b) => {
                let sort_a = a['Description'];
                let sort_b = b['Description'];

                return this.orderItems(sort_a, sort_b, nullPosition);
            });

            return newList;
        } else {
            return null;
        }
    }

    orderNumberAndStringListByNestedParameter(list: any[], parent: string, child: string, ascending: boolean) {

        let nullPosition = ascending ? 1 : -1;

        if (list !== null && list !== undefined) {

            // separate the numbers an the strings
            let numberList: number[] = [];
            let stringList = [];
            for (let i = 0; i < list.length; i++) {
                if (child !== null && list[i][parent][child] !== null) {
                    let value = Number(list[i][parent][child]);
                    if (!Number.isNaN(value)) {
                        numberList.push(list[i]);
                    } else {
                        stringList.push(list[i]);
                    }
                } else if (child == null && list[i][parent] !== null) {
                    let value = Number(list[i][parent]);
                    if (!Number.isNaN(value)) {
                        numberList.push(list[i]);
                    } else {
                        stringList.push(list[i]);
                    }
                }
                else {
                    stringList.push(list[i]);
                }
            }

            // sort the numbers
            let sortedNumberList = numberList.sort((a, b) => {
                let sort_a: number = 0
                let sort_b: number = 0

                if (child !== null) {
                    sort_a = Number(a[parent][child]);
                    sort_b = Number(b[parent][child]);
                } else {
                    sort_a = Number(a[parent]);
                    sort_b = Number(b[parent]);
                }

                if (sort_a < sort_b) {
                    return -nullPosition;
                } else if (sort_a > sort_b) {
                    return nullPosition;
                } else {
                    return 0;
                }
            });

            // sort the other values.
            let sortedStringList = stringList.sort((a, b) => {
                if (a[parent][child] !== null && a[parent][child] !== undefined) {
                    let sort_a = a[parent][child];
                    let sort_b = b[parent][child];

                    if (sort_a == null || sort_a === undefined) {
                        return nullPosition;
                    }

                    if (sort_b === null || sort_b === undefined) {
                        return -nullPosition;
                    }
                    if (sort_a < sort_b) {
                        return -nullPosition;
                    }

                    if (sort_a > sort_b) {
                        return nullPosition;
                    }

                    return 0
                }
                else {
                    return null;
                }
            });

            // combine the two lists together based on numbers or strings going first

            let newList = [];
            if (nullPosition === 1) {
                newList = sortedNumberList;
                for (let i = 0; i < sortedStringList.length; i++) {
                    newList.push(sortedStringList[i]);
                }
                // add sorted number list 
            } else {
                newList = sortedStringList;
                for (let i = 0; i < sortedNumberList.length; i++) {
                    newList.push(sortedNumberList[i]);
                }
            }

            return newList;
        } else {
            return null;
        }

    }

    orderListByNestedParameter(list: any[], parent: string, child: string, ascending: boolean) {

        let nullPosition = ascending ? 1 : -1;

        if (list !== null && list !== undefined) {
            let newList = list.sort((a, b) => {
                if (a[parent][child] !== null && a[parent][child] !== undefined) {
                    let sort_a = a[parent][child];
                    let sort_b = b[parent][child];

                    return this.orderItems(sort_a, sort_b, nullPosition);
                }
                else {
                    return null;
                }
            });

            return newList;
        } else {
            return null;
        }

    }

    orderProposedServices(proposed, order) {
        let value = parseInt(order);
        let orderedList: any[] = [];

        if (value === 1) {
            let list = this.orderNumberAndStringListByNestedParameter(proposed, 'ServiceTransaction', 'Tooth', true);
            orderedList = list;
        } else if (value === 2) {
            let list = this.orderListByNestedParameter(proposed, 'ServiceTransaction', 'ServiceCode', true);
            orderedList = list;
        } else if (value === 3) {
            let list = this.orderListByNestedParameter(proposed, 'ServiceTransaction', 'ProviderLastName', true);
            orderedList = list;
        } else if (value === 4) {
            let list = this.orderListByNestedParameter(proposed, 'ServiceTransaction', 'LocationName', true);
            orderedList = list;
        }

        return orderedList;
    }

    orderItems(a: any, b: any, position: number) {
        if (a == null || a === undefined) {
            return position;
        }

        if (b === null || b === undefined) {
            return -position;
        }
        if (a < b) {
            return -position;
        }

        if (a > b) {
            return position;
        }

        return 0

    }
}
