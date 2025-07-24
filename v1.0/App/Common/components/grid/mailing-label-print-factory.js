'use strict';

angular.module('common.controllers').factory('MailingLabelPrintFactory', [
  function () {
    var labelSetup = function () {
      var self = this;
      self.data = {};
      self.columnDefinition = [];

      return self;
    };

    labelSetup.prototype.getPrintHtml = function () {
      var factory = this;

      var newTab = window.open();
      newTab.document.write('');

      self.labelPrint = function () {
        var style =
          '<style>' +
          'body { background-color: #dddddd; padding: 0; border: 0; margin: 0; }' +
          '.page { background-color: #ffffff; width: 8.5in; height: 11in; margin: .25in auto; border: 1px dotted #888888; }' +
          '.page-content { margin-top: .5in; margin-left: .27in; }' +
          ".page-content::after { content: ' '; display: block; height: 0; clear: both; }" +
          '.label { width: 2.63in; height: 1in; margin-right: 0; float: left; text-align: center; overflow: hidden; border: 1px dotted; border-radius: 5px; }' +
          '.label-content { margin: .125in .125in 0; }' +
          'button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }' +
          '@media print { .body { background-color: transparent; } button { display: none;} .page { background-color: transparent; border: none; page-break-after: always; width: 8.5in; height: auto; } .label { border: none; } }' +
          '</style>';

        var outputlabelRows = '';
        var results = factory.data;

        var pageCount = results.TotalCount / 10;
        var startItem = 0;

        angular.forEach(results.Rows, function (row) {
          var name = _.escape(row.PatientName);
          var address1 =
            row.Address1 === null ||
            row.Address1 === 'undefined' ||
            row.Address1.trim() === ''
              ? ''
              : '<br /> ' + _.escape(row.Address1);
          var address2 =
            row.Address2 === null ||
            row.Address2 === 'undefined' ||
            row.Address2.trim() === ''
              ? ''
              : '<br /> ' + _.escape(row.Address2);
          var city =
            row.City === null || row.City === 'undefined'
              ? ''
              : _.escape(row.City);
          var state =
            row.State === null || row.State === 'undefined'
              ? ''
              : _.escape(row.State);
          var zip =
            row.ZipCode === null || row.ZipCode === 'undefined'
              ? ''
              : _.escape(row.ZipCode);
          var citystatezip = '';
          if (city !== '' && state !== '' && zip !== '') {
            citystatezip = '<br /> ' + city + ', ' + state + ' ' + zip;
          } else if (city === '' && state !== '' && zip !== '') {
            citystatezip = '<br /> ' + state + ' ' + zip;
          } else if (city === '' && state === '' && zip === '') {
            citystatezip = '';
          }

          console.log('current item: ' + startItem + ' - ' + (startItem % 30));
          if (startItem % 30 == 0) {
            console.log('Added page');
            outputlabelRows =
              outputlabelRows +
              "<div class='page'>" +
              "<div><button id='printBtn' onclick='window.print(); window.document.close()'>Print</button></div>" +
              "<div class='page-content'>";
          }

          outputlabelRows =
            outputlabelRows +
            "<div class='label'>" +
            "<div class='label-content'>" +
            name +
            address1 +
            address2 +
            citystatezip +
            '<br />' +
            '</div>' +
            '</div>';

          if (startItem % 30 == 29) {
            console.log('close page');
            outputlabelRows = outputlabelRows + '</div>' + '</div>';
          }

          startItem = startItem + 1;
        });

        var outputLabels =
          '<html>' +
          '<head>' +
          "<meta charset='utf-8'>" +
          '<title>Print Mailing Labels</title>' +
          style +
          '</head>' +
          '<body>' +
          outputlabelRows +
          '</body>' +
          '</html>';

        newTab.document.write(outputLabels);
        newTab.document.close();
      };

      self.labelPrint();
    };

    return {
      Setup: function () {
        return new labelSetup();
      },
    };
  },
]);
