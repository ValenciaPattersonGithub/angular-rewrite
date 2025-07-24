import {
  Component,
  OnInit,
  Inject,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import * as moment from 'moment';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { ToDisplayTimePipe } from 'src/@shared/pipes/time/to-display-time.pipe';
declare let _: any;
@Component({
  selector: 'report-exportt',
  templateUrl: './report-export.component.html',
  styleUrls: ['./report-export.component.scss'],
})
export class ReportExportComponent implements OnInit {
  @Input() reportId: any;
  @Input() isCustomReport: boolean;
  @Input() parentData: any;
  @Input() originalReport: any;

  exportData = null;
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    @Inject('ReportIds') private reportIds,
    @Inject('$routeParams') private route,
    @Inject('ReportsFactory') private reportsFactory
  ) {}
  //#region Export to CSV

  formatMonetaryColumnValue(value) {
    value = (Math.round(value * 100) / 100).toFixed(2);
    value = parseFloat(value);
    if (value < 0) {
      value =
        '(' +
        '$' +
        value.toString().substring(1, value.toString().length) +
        ')';
    }
    value = value.toString().substring(0, 1) === '(' ? value : '$' + value;
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (value.indexOf(',') !== -1) {
      value = '"' + value + '"';
    }
    return value;
  }

  formatColumnValue(value) {
    const toShortDisplayDateLocal = new ToShortDisplayDateUtcPipe();
    const toDisplayTime = new ToDisplayTimePipe();
    if (_.isNull(value)) {
      value = 'N/A';
    }
    if (typeof value == 'string') {
      const date = new Date(value);
      if (value == '') {
        value = 'N/A';
      } else if (value.charAt(0) == '-') {
        value = 'Negative' + value.substr(1);
      } else if (value.charAt(0) == '+') {
        value = 'Positive' + value.substr(1);
      } else if (
        !isNaN(date.valueOf()) &&
        value.length >= 19 &&
        value.match(new RegExp('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}'))
      ) {
        return !this.isCustomReport &&
          this.reportId === this.reportIds.ActivityLogReportId
          ? toShortDisplayDateLocal.transform(value) +
              ' ' +
              toDisplayTime.transform(value)
          : date.getMonth() +
              1 +
              '/' +
              date.getDate() +
              '/' +
              date.getFullYear();
      } else {
        value =
          '"' +
          value
            .replace(new RegExp('"', 'g'), '""')
            .replace(/(?:\r\n|\r|\n)/g, '; ') +
          '"';
      }
    }
    return value;
  }

  getArrayKeys(array, skipEndLine) {
    const arrayProps = [];
    let string = '';
    for (let key in array[0]) {
      if (_.has(array[0], key) && key !== '$$hashKey') {
        if (_.isArray(array[0][key])) {
          let arrayIndex = 0;
          for (let i = 0; i < array.length; i++) {
            // Check if array is empty for initial entries to prevent headers from being excluded
            if (array[i][key].length > 0) {
              arrayIndex = i;
              break;
            }
          }
          if (typeof array[arrayIndex][key][0] == 'string') {
            key = this.formatColumnValue(key.replace(/([A-Z])/g, ' $1').trim());
            string = string.concat(key + ',');
          } else {
            arrayProps.push(array[arrayIndex][key]);
          }
        } else {
          key = this.formatColumnValue(key.replace(/([A-Z])/g, ' $1').trim());
          string = string.concat(key + ',');
        }
      }
    }
    if (_.isUndefined(arrayProps) || _.isEmpty(arrayProps)) {
      if (!skipEndLine) {
        string = string.substring(0, string.length - 1);
        string = string + '\r\n';
      }
      return string;
    } else {
      _.each(arrayProps, prop => {
        string = string + this.getArrayKeys(prop, true);
      });
      return string.includes('\r\n') ? string : string + '\r\n';
    }
  }

  // Do not compare to report Id without checking if its a custom report first. Otherwise custom report export will break.
  // TODO: Write function to handle report comparisons so this custom report comparison does not always have to be added.
  convertArrayToCSV(array) {
    const returnArray = [];
    _.each(array, item => {
      if (typeof item == 'string') {
        item = this.formatColumnValue(item);
        returnArray.push(item + '\r\n');
        return returnArray;
      } else {
        const arrayProp = [];
        let string = '';
        for (const prop in item) {
          if (_.has(item, prop) && prop !== '$$hashKey') {
            if (_.isArray(item[prop])) {
              if (
                !this.isCustomReport &&
                prop === 'Transactions' &&
                _.isEmpty(item[prop])
              ) {
                if (
                  this.reportId ===
                  this.reportIds.NetProductionByProviderReportId
                ) {
                  string = string.concat(',,,,,,,0,0,0,');
                } else if (
                  this.reportId ===
                  this.reportIds.NetCollectionByProviderReportId
                ) {
                  string = string.concat(',,,,,0,0,0,');
                }
              } else {
                arrayProp.push(item[prop]);
              }
            } else {
              let temp = item[prop];
              temp = this.formatColumnValue(temp);
              string = string.concat(temp + ',');
            }
          }
        }
        if (_.isUndefined(arrayProp) || _.isEmpty(arrayProp)) {
          string = string.substring(0, string.length - 1);
          returnArray.push(string + '\r\n');
        } else {
          if (arrayProp.length == 2) {
            const tempArray = [];
            tempArray.push(this.convertArrayToCSV(arrayProp[0]));
            tempArray.push(this.convertArrayToCSV(arrayProp[1]));
            if (_.isEmpty(tempArray[0])) {
              if (_.isEmpty(tempArray[1])) {
                returnArray.push(
                  string + this.GetEmptyColumns(true, true) + '\r\n'
                );
              } else {
                _.each(tempArray[1], val2 => {
                  returnArray.push(
                    string + this.GetEmptyColumns(true, false) + val2
                  );
                });
              }
            } else if (_.isEmpty(tempArray[1])) {
              _.each(tempArray[0], val1 => {
                val1 = val1.replace('\r\n', ',');
                returnArray.push(
                  string + val1 + this.GetEmptyColumns(false, true) + '\r\n'
                );
              });
            } else {
              _.each(tempArray[0], val1 => {
                val1 = val1.replace('\r\n', ',');
                _.each(tempArray[1], val2 => {
                  returnArray.push(string + val1 + val2);
                });
              });
            }
          } else {
            const stringArray = this.convertArrayToCSV(arrayProp[0]);
            if (stringArray.length < 1) {
              returnArray.push(string);
            }
            _.each(stringArray, value => {
              returnArray.push(string + value);
            });
          }
        }
      }
    });
    return returnArray;
  }

  AddNonArrayPropToCSV(csvString) {
    let valueString = '';
    let keyString = '';
    for (const prop in this.exportData) {
      if (_.has(this.exportData, prop)) {
        if (
          !_.isArray(this.exportData[prop]) &&
          prop !== 'GeneratedAtDateTime' &&
          prop !== 'GeneratedByUserCode' &&
          prop !== 'LocationOrPracticeEmail' &&
          prop !== 'LocationOrPracticeName' &&
          prop !== 'LocationOrPracticePhone' &&
          prop !== 'ReportTitle'
        ) {
          keyString = keyString.concat(prop + ',');
          valueString = valueString.concat(this.exportData[prop] + ',');
        }
      }
    }
    const csvStringArray = csvString.split('\r\n');
    csvString = '';
    _.each(csvStringArray, string => {
      if (string !== '') {
        string =
          string === csvStringArray[0]
            ? keyString + string + '\r\n'
            : valueString + string + '\r\n';
        csvString = csvString.concat(string);
      }
    });
    return csvString;
  }

  ConstructHeaderString(headerArray) {
    let csvString = '';
    if (!_.isEmpty(headerArray)) {
      _.each(headerArray, item => {
        csvString =
          csvString !== ''
            ? csvString.concat(',' + this.localize.getLocalizedString(item))
            : this.localize.getLocalizedString(item);
      });
    }
    return csvString + '\r\n';
  }

  // #Export report to csv
    exportCSV() {
        this.exportCSVAllDataComplete();
    }

  exportCSVAllDataComplete() {
    // iterate over filtered report
    let csvString = '';
    let array = [];
    // this.exportData = angular.copy(this.parentData);
    this.exportData = JSON.parse(JSON.stringify(this.parentData));
    _.each(this.exportData, item => {
      if (_.isArray(item)) {
        if (!this.isCustomReport) {
          item = this.checkIfTemplate(item);
        }

        csvString = this.getArrayKeys(item, false);
        array = this.convertArrayToCSV(item);
        // }
      }
    });

    array = this.removeColumnFromArray(array, [1, 2, 3]);
    // csvString = this.removeColumnFromString(csvString, [1, 2, 3]);
    csvString = this.ConstructHeaderString([
      'Provider',
      'Date',
      'Location',
      'Transaction Type',
      'Patient',
      'Description',
      'Original Transaction Date (voids)',
      'Production',
      'Collection',
      'Adjustments',
    ]);
    array = this.monetizeFinancialReport(
      array,
      [7, 8, 9],
      this.createBasicTotalsString('Report Totals', 7, [7, 8, 9], [1, 2, 3])
    );
    // }

    _.each(array, value => {
      csvString = csvString.concat(value);
    });

    const reportName = this.localize.getLocalizedString(
      this.route.ReportName
        ? this.route.ReportName
        : this.originalReport.Name
        ? this.originalReport.Name
        : undefined
    );
    const blob = new Blob([decodeURIComponent(encodeURI(csvString))], {
      type: 'text/csv;charset=utf-8;',
    });
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, reportName + ' ' + new Date() + '.csv');
    } else {
      const filename = reportName + ' ' + new Date() + '.csv';

      const element = document.createElement('a');
      element.setAttribute(
        'href',
        window.URL.createObjectURL(blob)
        // , { type: 'text/plain' }
      );
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }

  export() {
    this.exportCSV();
    if (this.reportId !== 'Create') {
      this.reportsFactory.AddExportedReportActivityEvent(
        this.reportId,
        this.isCustomReport
      );
    }
  }

  createBasicTotalsString(
    totalsStringHeader,
    numberOfCommas,
    columnsToMonetize,
    dtoProperties
  ) {
    let totalsString =
      '\r\n' + this.localize.getLocalizedString(totalsStringHeader);
    // totalsString is not an array, that's why didn't used lodash
    for (let i = 0; i < numberOfCommas; i++) {
      totalsString = totalsString.concat(',');
    }
    let column = numberOfCommas;
    let propNumber = 1;
    for (let prop in this.exportData) {
      if (_.has(this.exportData, prop)) {
        if (
          !_.isArray(this.exportData[prop]) &&
          prop !== 'GeneratedAtDateTime' &&
          prop !== 'GeneratedByUserCode' &&
          prop !== 'LocationOrPracticeEmail' &&
          prop !== 'LocationOrPracticeName' &&
          prop !== 'LocationOrPracticePhone' &&
          prop !== 'ReportTitle'
        ) {
          if (_.includes(dtoProperties, propNumber)) {
            if (_.includes(columnsToMonetize, column)) {
              totalsString = totalsString.concat(
                this.formatMonetaryColumnValue(this.exportData[prop]) + ','
              );
            } else {
              totalsString = totalsString.concat(this.exportData[prop] + ',');
            }
            column++;
          }
          propNumber++;
        }
      }
    }
    return totalsString;
  }

  monetizeFinancialReport(array, columnNumbers, totalsString) {
    array = this.monetizeColumnInArray(array, columnNumbers);
    return _.concat(array, totalsString);
  }

  monetizeColumnInString(line, columnNumbers) {
    let columns = this.splitStringIntoColumnArray(line);
    _.each(columnNumbers, column => {
      if (columns[column]) {
        columns[column] = this.formatMonetaryColumnValue(columns[column]);
      }
    });
    return this.buildStringFromColumns(columns);
  }

  monetizeColumnInArray(array, columnNumbers) {
    let returnArray = [];
    _.each(array, line => {
      returnArray.push(this.monetizeColumnInString(line, columnNumbers));
    });
    return returnArray;
  }

  addPercentToColumnInArray(array, columnNumbers) {
    let returnArray = [];
    _.each(array, line => {
      returnArray.push(this.addPercentToColumnInString(line, columnNumbers));
    });
    return returnArray;
  }

  addPercentToColumnInString(line, columnNumbers) {
    let columns = this.splitStringIntoColumnArray(line);
    _.each(columnNumbers, column => {
      columns[column] = columns[column] + this.localize.getLocalizedString('%');
    });
    return this.buildStringFromColumns(columns);
  }

  addAreaToColumnInArray(array, columnNumbers) {
    let returnArray = [];
    _.each(array, line => {
      returnArray.push(this.addAreaToColumnInString(line, columnNumbers));
    });
    return returnArray;
  }

  addAreaToColumnInString(line, columnNumbers) {
    let columns = this.splitStringIntoColumnArray(line);
    _.each(columnNumbers, column => {
      // columns[column] = $filter('getActivityArea')(parseInt(columns[column]));
    });
    return this.buildStringFromColumns(columns);
  }

  addTypeToColumnInArray(array, columnNumbers) {
    let returnArray = [];
    _.each(array, line => {
      returnArray.push(this.addTypeToColumnInString(line, columnNumbers));
    });
    return returnArray;
  }

  addTypeToColumnInString(line, columnNumbers) {
    let columns = this.splitStringIntoColumnArray(line);
    _.each(columnNumbers, column => {
      // columns[column] = $filter('getActivityType')(parseInt(columns[column]));
    });
    return this.buildStringFromColumns(columns);
  }

  addActionToColumnInArray(array, columnNumbers) {
    let returnArray = [];
    _.each(array, line => {
      returnArray.push(this.addActionToColumnInString(line, columnNumbers));
    });
    return returnArray;
  }

  addActionToColumnInString(line, columnNumbers) {
    let columns = this.splitStringIntoColumnArray(line);
    _.each(columnNumbers, column => {
      // columns[column] = $filter('getActivityAction')(parseInt(columns[column]));
    });
    return this.buildStringFromColumns(columns);
  }

  removeNasInArray(array, columnNumbers) {
    let returnArray = [];
    _.each(array, line => {
      returnArray.push(this.removeNasFromColumnInString(line, columnNumbers));
    });
    return returnArray;
  }

  removeNasFromColumnInString(line, columnNumbers) {
    let columns = this.splitStringIntoColumnArray(line);
    _.each(columnNumbers, column => {
      columns[column] =
        columns[column] === 'N/A' || columns[column] === '$NaN'
          ? ''
          : columns[column];
    });
    return this.buildStringFromColumns(columns);
  }

  addColumnInString(columnNumber, string) {
    let columns = this.splitStringIntoColumnArray(string);
    string = '';
    let index = 0;
    _.each(columns, column => {
      string = string + column + this.localize.getLocalizedString(',');
      index++;
      if (index == columnNumber) {
        string = string + this.localize.getLocalizedString(',');
      }
    });
    return string;
  }
  removeColumnFromString(string, columnNumbers) {
    let columns = this.splitStringIntoColumnArray(string);
    let rowsRemoved = 0;
    _.each(columnNumbers, column => {
      columns.splice(column - rowsRemoved, 1);
      rowsRemoved++;
    });
    return this.buildStringFromColumns(columns);
  }

  removeColumnFromArray(array, columnNumbers) {
    let returnArray = [];
    _.each(array, line => {
      returnArray.push(this.removeColumnFromString(line, columnNumbers));
    });
    return returnArray;
  }

  fixParenthesisSpacing(line, columnNumbers) {
    let columns = this.splitStringIntoColumnArray(line);
    _.each(columnNumbers, column => {
      columns[column] = columns[column].replace(/(\()(\s)/g, '$2$1');
    });
    return this.buildStringFromColumns(columns);
  }

  buildStringFromColumns(columns) {
    let string = '';
    _.each(columns, column => {
      string = string.concat(column + ',');
    });
    string = string.substring(0, string.length - 1);
    return string.concat('\r\n');
  }

  splitStringIntoColumnArray(line) {
    // Splits a string into columns for CSV format.
    // Handles quote, and commas embedded in strings,
    // Assumes quotes within strings are escaped as two quote chars: " -> ""
    let columns = [];
    let lineChars = line.replace(/(?:\r\n|\r|\n)/g, '').split('');
    let thisColumn = '';
    let textBlob = false;
    for (let thisChar of lineChars) {
      if (thisChar === ',' && !textBlob) {
        columns.push(thisColumn);
        thisColumn = '';
        continue;
      }
      thisColumn = thisColumn.concat(thisChar);
      if (thisChar === '"') {
        textBlob = !textBlob;
      }
    }
    if (!_.isEmpty(thisColumn)) {
      columns.push(thisColumn);
    }
    return columns;
  }

  formatPeriodReconciliationInnerArray(loc, arrayPropName, title, csvString) {
    let returnString = '';
    if (!_.isEmpty(loc[arrayPropName])) {
      let returnString = title + '\r\n' + csvString;
      _.each(this.convertArrayToCSV(loc[arrayPropName]), line => {
        returnString = returnString.concat(
          loc.Location + ',' + this.monetizeColumnInString(line, [6])
        );
      });
    }
    return returnString;
  }

  // Headers need to be added in order
  checkIfTemplate(array) {
    if (this.reportId === this.reportIds.ReceivablesByProviderReportId) {
      let summaryHeaders = [
        this.localize.getLocalizedString('CurrentBalance'),
        this.localize.getLocalizedString('BalanceThirty'),
        this.localize.getLocalizedString('BalanceSixty'),
        this.localize.getLocalizedString('BalanceNinety'),
        this.localize.getLocalizedString('PatientPortion'),
        this.localize.getLocalizedString('EstimatedInsurance'),
        this.localize.getLocalizedString('EstimatedInsuranceAdjustments'),
        this.localize.getLocalizedString('ProviderTotal'),
      ];
      _.each(array, loc => {
        loc = this.DeleteUnneededProperties(summaryHeaders, loc);
        _.each(loc.Providers, prov => {
          prov = this.FillEmptyDecimalProperties(summaryHeaders, prov);
        });
      });
    } else if (
      this.reportId === this.reportIds.ReceivablesByAccountId ||
      this.reportId === this.reportIds.ReceivablesByAccountBetaId
    ) {
      let receivablesByAccountHeaders = [
        this.localize.getLocalizedString('CurrentBalance'),
        this.localize.getLocalizedString('BalanceThirty'),
        this.localize.getLocalizedString('BalanceSixty'),
        this.localize.getLocalizedString('BalanceNinety'),
        this.localize.getLocalizedString('InCollections'),
        this.localize.getLocalizedString('AccountBalance'),
        this.localize.getLocalizedString('EstimatedInsurance'),
        this.localize.getLocalizedString('EstimatedInsuranceAdjustments'),
        this.localize.getLocalizedString('PatientPortion'),
      ];
      _.each(array, loc => {
        loc = this.DeleteUnneededProperties(receivablesByAccountHeaders, loc);
        _.each(loc.ResponsibleParties, res => {
          res = this.FillEmptyDecimalProperties(
            receivablesByAccountHeaders,
            res
          );
        });
      });
    }
    return array;
  }

  DeleteUnneededProperties(headers, array) {
    _.each(headers, header => {
      if (array.hasOwnProperty(header)) {
        delete array[header];
      }
    });
    return array;
  }

  FillEmptyDecimalProperties(headers, array) {
    _.each(headers, header => {
      if (!array.hasOwnProperty(header)) {
        array[header] = 0;
      } else {
        // This is done to get the correct order of properties for export
        let temp = array[header];
        delete array[header];
        array[header] = temp;
      }
    });
    return array;
  }

  GetEmptyColumns(emptyFirstArray, emptySecondArray) {
    let emptyString = this.localize.getLocalizedString('N/A,');
    if (
      this.reportId === this.reportIds.AppointmentsReportId ||
      this.reportId === this.reportIds.AppointmentsBetaReportId
    ) {
      if (emptyFirstArray && emptySecondArray) {
        return _.repeat(emptyString, 12) + '0';
      } else if (emptyFirstArray) {
        return _.repeat(emptyString, 8);
      } else {
        return _.repeat(emptyString, 4) + '0';
      }
    }
    return '';
  }

  formatTooth(tooth) {
    return tooth !== '' && !_.isNull(tooth) ? '="' + tooth + '"' : 'N/A';
  }

  ngOnInit() {}
}
