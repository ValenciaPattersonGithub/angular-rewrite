'use strict';

angular.module('common.controllers').factory('GridPrintFactory', [
  function () {
    var Options = function () {
      var self = this;
      self.query = {};
      self.filterCriteria = [];
      self.sortCriteria = [];
      self.columnDefinition = [];
      self.tabTitle = '';
      self.locations = [];
      self.headerCaption = '';

      self.isUpdating = true;

      return self;
    };

    Options.prototype.getPrintHtml = function () {
      var factory = this;
      factory.columnDefinition.length = _.escape(
        factory.columnDefinition.length
      );
      factory.headerCaption = _.escape(factory.headerCaption);
      var selectedLocations = '';
      if (typeof factory.filterCriteria['LocationId'] !== 'undefined') {
        factory.filterCriteria['LocationId'] = [];
        angular.forEach(factory.locations, function (obj) {
          if (obj.LocationName !== 'All Locations') {
            factory.filterCriteria['LocationId'] = obj.LocationId;
          }
          selectedLocations =
            selectedLocations + ' ' + _.escape(obj.LocationName);
        });
      } else {
        if (factory.locations.length !== 0) {
          angular.forEach(factory.locations, function (obj) {
            selectedLocations =
              selectedLocations !== ''
                ? selectedLocations + ','
                : selectedLocations;
            selectedLocations =
              selectedLocations + ' ' + _.escape(obj.NameLine1);
          });
        } else {
          selectedLocations = 'All Locations';
        }
      }

      var newTab = window.open();
      newTab.document.write(
        "<div id='Progress'>Please wait while report is being generated...</div>"
      );
      newTab.document.title = factory.tabTitle;
      var progressDiv = newTab.document.getElementById('Progress');

      var data = factory.query.getData({
        uiSuppressModal: true,
        FilterCriteria: this.filterCriteria,
        SortCriteria: this.sortCriteria,
      });

      var success = function (res) {
        var colWidth = 100 / factory.columnDefinition.length;

        var style =
          '<style>' +
          "table {border-collapse: collapse; font-family:' Open Sans', sans-serif;  font-size: 12px; word-wrap: break-word; width: 100%;}" +
          'tr > td {text-align: left; padding: 8px;  width:' +
          colWidth +
          '% ; max-width: 70px}' +
          'tbody > tr:nth-child(even) {background-color:  #eee; }' +
          'thead > tr:nth-child(1) > th { text-align: center; }' +
          'thead > tr:nth-child(2) > th { text-align: left; height: 50px; }' +
          'thead > tr:nth-child(3) > th { text-align: left;  border-bottom: 3px solid  #eee; }' +
          'thead > tr:nth-child(4) { display: none; }' +
          'thead > tr:nth-child(5) { display: none; }' +
          'tfoot > tr { height: 70px; }' +
          '#printBtn {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px;padding: 8px 12px;border: 1px solid transparent; }' +
          "#dateTime {display: none; font-family:'Open Sans', sans-serif;  font-size: 12px; position: fixed; }" +
          "#dateTimePreview {display: block; font-family:'Open Sans', sans-serif;  font-size: 12px;}" +
          '#topMargin {display: none;}' +
          '@media print { #printBtn { display: none;} thead > tr:nth-child(4) { display: block; position: fixed; bottom: 0px;} @page {margin: 3px 10px auto 10px; } #dateTime {display: block;}' +
          'thead > tr:nth-child(5) { display: block; position: fixed; bottom: 0px; } tfoot > tr {display: none} #topMargin {display: block;} #dateTimePreview {display: none;} }' +
          '.balanceGraph{ margin-bottom: 30px; margin-top: 30px; width: 70px; height: 25px; -webkit-transform: rotate(90deg); transform: rotate(90deg); }' +
          '.balanceCurrent { background-color: #3C3; float: left; height: 100%; }' +
          '.balance30 { background-color: #FF9516; float: left; height: 100%; }' +
          '.balance60 { background-color: #FF9516; float: left; height: 100%; }' +
          '.balance90 { background-color: #F00; float: left; height: 100%; }' +
          '.tab {text-align: center; display: table-cell; padding-top: 5px; padding-right: 3px}' +
          '#tiles > .tab > .body { text-align: center; display: table-cell; padding-right: 3px; min-width: 187px; width: 100%; border: 2px solid #AEB5BA;}' +
          '#tiles > .tab > .body > button {width: 100%; height: 100%; background-color: white; color: dimgray; outline: none; border: none;}' +
          '#tiles > .tab > .body > .selected {background-color:  dimgray; color: white;width:102%;}' +
          '#tiles > .tab > .header {background-color: darkgray; color:  white; font-size: 21px;}' +
          '.breakdown-balance {font-weight: normal;}' +
          '.HideOnPrint {display: none !important;}' +
          '.tab .body h4, .tab .body h6{margin: 10px 10px}' +
          "ul > li {width: 300px !important; text-align: left !important; border-right: 2px solid  #e8e4e4;padding-right: 10px !important;padding-left: 50px !important;font-family: 'Open Sans',sans-serif;}" +
          'ul { padding-top:70px; }' +
          '.difference-equal-icon {float: right;}' +
          '.est-ins-adj-equal {line-height: 1;float: right;font-weight: bolder;font-size: xx-large;}' +
          '.box-info p{margin: 0;}' +
          ".lblTotalBalance {font-weight: bold; font-size: 20px;font-family:'Open Sans', sans-serif;}" +
          '.minusIcon {display:block; text-align:right;height: 10px; width: 15px;}' +
          'strong {font-size: 20px;}' +
          '#tiles > .tab > .red { background-color: #ff927f !important; }' +
          '#tiles {padding-right: 150px; padding-bottom: 20px; padding-left: 10px;-webkit-print-color-adjust: exact;}' +
          '</style>';

        var printedDate = _.escape(moment().format('MM/DD/YYYY - hh:mm a'));
        var outputDiv =
          '<html>' +
          '<head>' +
          '<title></title>' +
          style +
          '</head>' +
          '<body>' +
          "<div id='dateTime'>" +
          printedDate +
          '</div>' +
          '' +
          '<div>' +
          "<button id='printBtn' onclick='window.print(); window.document.close()'>Print</button>" +
          "<div id='dateTimePreview'><br/>" +
          printedDate +
          '<br/><br/><br/></div>' +
          '<table>' +
          '<thead>' +
          '<tr>' +
          "<th colspan='" +
          factory.columnDefinition.length +
          "'>" +
          "<h1><span id='topMargin'><br/><br/></span>" +
          factory.headerCaption +
          '</h1>' +
          '</th>' +
          '</tr>' +
          '<tr>' +
          "<th colspan='" +
          factory.columnDefinition.length +
          "'>" +
          '<h3>' +
          'Location: ' +
          selectedLocations +
          '</h3>' +
          '</th>' +
          '</tr>' +
          '<tr>';
        angular.forEach(factory.columnDefinition, function (obj) {
          outputDiv = outputDiv + '<th>' + obj.title + '</th>';
        });

        var timezone = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1];
        outputDiv =
          outputDiv +
          '</tr>' +
          '<tr>' +
          "<th colspan='" +
          factory.columnDefinition.length +
          "'>" +
          '' +
          '</th>' +
          '</tr>' +
          '<tr>' +
          "<th colspan='" +
          factory.columnDefinition.length +
          "'> " +
          //"Printed on: " +
          //printedDate +
          //" " +
          //timezone +
          '</th>' +
          '</tr>';

        outputDiv = outputDiv + '</thead><tbody>';
        if (
          !_.isUndefined(factory.gridTotals) &&
          !_.isUndefined(factory.tabTiles) &&
          !_.isNull(factory.gridTotals) &&
          !_.isNull(factory.tabTiles)
        ) {
          outputDiv =
            outputDiv +
            '<tr>' +
            factory.gridTotals +
            factory.tabTiles +
            '</tr>';
        }
        var result = res.Value;

        angular.forEach(result.Rows, function (row) {
          outputDiv = outputDiv + '<tr>';
          angular.forEach(factory.columnDefinition, function (col) {
            var td =
              col.type === 'number-range'
                ? "<td style='text-align:right;padding-right:85px'>"
                : '<td>';
            var data = row[col.field];
            if (typeof col.printTemplate !== 'undefined') {
              outputDiv =
                outputDiv + td + col.printTemplate(data, row) + '</td>';
            } else {
              var cell =
                data === null ? col.ifEmpty : col.template[0](data, row);
              outputDiv = outputDiv + td + cell + '</td>';
            }
          });
          outputDiv = outputDiv + '</tr>';
        });

        outputDiv = outputDiv + '</tbody>';

        outputDiv =
          outputDiv +
          "<tfoot><tr><td colspan='" +
          factory.columnDefinition.length +
          "'>" +
          '<h4>' +
          //+ printedDate
          //+ " "
          //+ timezone
          '</h4></td></tr></tfoot>' +
          '</table></div></body></html>';

        progressDiv.hidden = true;
        newTab.document.write(outputDiv);
        newTab.document.title = factory.tabTitle;
        newTab.document.close();
      };

      var failure = function () {
        progressDiv.hidden = true;
        newTab.document.write('Report generation failed.');
        newTab.document.title = factory.tabTitle;
        newTab.document.close();
      };

      data.$promise.then(success, failure);
    };

    // Public functions
    return {
      CreateOptions: function () {
        return new Options();
      },
    };
  },
]);
