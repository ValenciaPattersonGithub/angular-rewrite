'use strict';

angular.module('common.controllers').factory('TemplatePrintFactory', [
  function () {
    var templateSetup = function () {
      var self = this;
      self.data = {};
      self.query = {};
      self.dataGrid = [];
      self.communicationTemplateId = 0;
      self.communicationTypeId = 0;
      self.isPostcard = false;
      return self;
    };

    templateSetup.prototype.getPrintHtml = function () {
      var factory = this;

      var newTab = window.open();
      if (factory.isPostcard) {
        newTab.document.write(' <title>Print Post Card</title>');
      } else {
        newTab.document.write(' <title>Print US Mail</title>');
      }

      newTab.document.write(
        "<div id='Progress'>Please wait while report is being generated...</div>"
      );
      var progressDiv = newTab.document.getElementById('Progress');
      var data = factory.query.getData(
        {
          uiSuppressModal: true,
        },
        this.dataGrid
      );

      var success;

      if (factory.isPostcard) {
        success = function (results) {
          var style =
            '<style>' +
            'body {background-color: #dddddd;padding: 0;border: 0;margin: 0;padding-top: 10px; font-family: "Open Sans", sans-serif;}' +
            '.page {background-color: #ffffff;width: 11in;height: 8.5in;margin: .25in auto;outline: 1px dashed #888888;}' +
            '.page-content {}' +
            '.page-content::after {content: " ";display: block;height: 0;clear: both;}' +
            '.postcard {width: 5.5in;height: 4.25in;float: left;overflow: hidden;outline: 1px dotted #888888;}' +
            '.postcard-content {position: relative;padding-top: 1.525in;}' +
            '.postcard-message {width: 2.75in;float: left;padding-top: .25in;padding-left: .25in;max-height: 380px;overflow: hidden;min-height: 250px;}' +
            '.postcard-address {float: left;padding-top: .25in;padding-left: .5in;width: 190px; nowrap;overflow: hidden;}' +
            'button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }' +
            '@media screen {.postcard-stamp {width: .87in;height: .979in;position: absolute;top: .125in;right: .125in;outline: 4px double #888888;}}' +
            '@media print {.body {background-color: transparent;}' +
            '.printBtn { display: none;}' +
            '.page {background-color: transparent;outline: none;page-break-after: always;height: auto;margin: 0;}' +
            '.postcard {outline: none;max-height: 4.16in;}}' +
            '</style>';

          progressDiv.hidden = true;

          var postcardHTML = '';
          var i = 0;
          var j = 0;
          var lenghtArray = results.Value.length - 1;
          var divPostcard = '';

          angular.forEach(results.Value, function (res) {
            if (i <= 3) {
              var divMessage =
                '<div class="postcard-message">' + res.Content + '</div>';
              var pcPatientName = _.escape(res.PatientName);
              var pcAddressLine1 = '<br />' + res.AddressLine1;
              var pcAddressLine2 =
                res.AddressLine2 === '' ? '' : '<br />' + res.AddressLine2;
              var pcLocationCityStateZip = '<br />' + res.LocationCityStateZip;

              divPostcard +=
                '<div class="postcard">' +
                divMessage +
                '<div class="postcard-content">' +
                '    <div class="postcard-stamp"></div>' +
                '    <div class="postcard-address">' +
                pcPatientName +
                pcAddressLine1 +
                pcAddressLine2 +
                pcLocationCityStateZip +
                '    </div>' +
                '</div>' +
                '</div>';
            }
            if (i === 3 || j === lenghtArray) {
              var pcHTML =
                '<div class="page"><div class="page-content">' +
                divPostcard +
                '</div></div>';

              postcardHTML += pcHTML;
              divPostcard = '';
              i = 0;
            } else {
              i++;
            }
            j++;
          });

          var outputHtml =
            '<html>' +
            '<head>' +
            '<title>Print Post Card</title>' +
            style +
            '</head>' +
            '<body><div class="printBtn"><button onclick="window.print(); window.document.close()">Print</button></div>' +
            postcardHTML +
            '</body></html>';

          newTab.document.write(outputHtml);
          newTab.document.title = 'Post Card Preview';
          newTab.document.close();
        };
      } else {
        success = function (res) {
          var style =
            '<style>' +
            'body { background-color:#ffffff; padding: 0; border: 0; margin: 0; }' +
            '.page { background-color: #ffffff; margin: .25in auto;}' +
            '.page-content { margin-top: .5in; margin-left: .27in; }' +
            ".page-content::after { content: ' '; display: block; height: 0; clear: both; }" +
            '.page-content { margin-top: .5in; margin-left: .27in; }' +
            'button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }' +
            '@media print { .body { background-color: transparent; } button { display: none;} .page { background-color: transparent; border: none; page-break-after: always; width: 8.5in; height: auto; } .label { border: none; } }' +
            '</style>';

          var outputlabelRows = '';
          var outputlabelRowsTemp = '';
          var outputlabelRowsTemp2 = '';
          var results = res;
          var printButton = '';
          var pageCount = results.TotalCount / 10;
          var startItem = 0;

          if (results.Value == null || results.Value.length == 0) {
            outputlabelRows +=
              '<div class="page"><div class="page-content">The Template is null or empty and no output could be generated. Please select a different template.</div></div>';
          }
          angular.forEach(results.Value, function (row) {
            printButton = '';
            outputlabelRowsTemp = row;
            if (startItem === 0) {
              var printButton =
                "<div><button id='printBtn' onclick='window.print(); window.document.close()'>Print</button></div><br/>";
            }
            outputlabelRowsTemp2 =
              " <div class='page'>" +
              printButton +
              "<div class='page-content'>" +
              outputlabelRowsTemp +
              '<br />' +
              '</div>' +
              '</div>';

            outputlabelRows += outputlabelRowsTemp2;
            startItem = startItem + 1;
          });

          progressDiv.hidden = true;

          var outputTemplates =
            '<html>' +
            '<head>' +
            "<meta charset='utf-8'>" +
            ' <title>Print US Mail</title>' +
            style +
            '</head>' +
            '<body>' +
            outputlabelRows +
            '</body>' +
            '</html>';

          newTab.document.write(outputTemplates);
          newTab.document.close();
        };
      }
      var failure = function (result) {
        progressDiv.hidden = true;
        if (factory.isPostcard) {
          newTab.document.write(' <title>Print Post Card</title>');
        } else {
          newTab.document.write(' <title>Print US Mail</title>');
        }
        newTab.document.write('Report generation failed.');
        newTab.document.close();
      };
      data.$promise.then(success, failure);
      //self.templatePrint();
    };

    return {
      Setup: function () {
        return new templateSetup();
      },
    };
  },
]);
