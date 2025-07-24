'use strict';

angular.module('Soar.Patient').factory('TemplatePatientFormPrintFactory', [
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
      newTab.document.write(' <title>Print Patient Registration</title>');

      newTab.document.write(
        "<div id='Progress'>Please wait while patient registration form is being generated...</div>"
      );
      var progressDiv = newTab.document.getElementById('Progress');

      var data = factory.query.getData({
        uiSuppressModal: true,
      });

      var success = function (results) {
        var style =
          '<style>' +
          '.printBtn{ position:fixed; top:20px;}' +
          '.form-body {background-color: #dddddd;padding: 0;border: 0;margin: -20px;padding-top: 35px; font-family: "Open Sans", sans-serif;}' +
          '.form-page {background-color: #ffffff;width: 8.5in;height: 11in;margin: .25in auto;outline: 1px dashed #888888;}' +
          '.page-content {}' +
          '.page-content::after {content: " ";display: block;height: 0;clear: both;}' +
          '.patient-form {width: 8.5in;height: 11in;float: left;overflow: hidden;outline: 1px dotted #888888;}' +
          '.patient-form-content {position: relative;padding-top: 1in; padding-left: .5in; padding-right:.5in}' +
          '.patient-form-message {width: 2.75in;float: left;padding-top: .25in;padding-left: .25in;max-height: 380px;overflow: hidden;min-height: 250px;}' +
          '.patient-form-address {float: left;padding-top: .25in;padding-left: .5in;width: 180px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;}' +
          'div.square {border: solid 2px black; width: 9px; height: 9px;border-radius: 3px;display:inline-block}' +
          'div.header {font-size: 24px; font-weight: 800; text-align: -webkit-center; padding-bottom: 30px;}' +
          'div.title {font-size: 18px; font-weight: 600; padding-top: 20px; padding-bottom: 18px;}' +
          'div.label {font-size: 15px; font-weight: 600; padding-bottom: 18px;}' +
          'div.normal {font-size: 14px; font-weight: 100;}' +
          'div.field {width:5px; display: inline;}' +
          'div.container {width: 60px; display: inline-block;}' +
          'div.pad-left {padding-left:10px;}' +
          'div.pad-left-5 {padding-left:5px;}' +
          'div.margin-left {margin-left:6px;}' +
          'div.identifier {position: absolute; z-index: 99; background-color: white;}' +
          'button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }' +
          '@media screen {.patient-form-stamp {width: .87in;height: .979in;position: absolute;top: .125in;right: .125in;outline: 4px double #888888;}}' +
          '@media print {.form-body {background-color: transparent; margin: 0;padding-top: 0px;}' +
          '.printBtn { display: none;}' +
          '.form-page {background-color: transparent;outline: none;page-break-after: always;height: auto;margin: 0;}' +
          '.patient-form {outline: none;max-height: 11in;}}' +
          '</style>';

        progressDiv.hidden = true;

        var divFirstPage =
          '<div class="form-page">' +
          '  <div class="page-content">' +
          '      <div class="patient-form">' +
          '          <div class="patient-form-content">' +
          '              <div class="header">Patient Registration</div>' +
          '              <div class="label">' +
          '                  <div class="field">First Name: _________________________________</div>' +
          '                  <div class="field pad-left">MI: _____</div>' +
          '                  <div class="field pad-left">Last Name: _____________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Preferred Name: _____________________________</div>' +
          '                  <div class="field pad-left">Date of Birth: ___________________</div>' +
          '                  <div class="field pad-left">Gender: </div>' +
          '<div class="container pad-left-5"><div class=" normal field"><div class="square"></div> Male</div> <div class=" normal field"><div class="square"></div> Female</div></div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Responsible Party: </div>' +
          '<div class="normal field pad-left"><div class="square"></div> Self <div class="square margin-left"></div> Other</div>' +
          '              </div>' +
          '              <div class="title">' +
          '                  <div class="field">Contact Information</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Patient Address: </div>' +
          '<div class="normal field pad-left"><div class="square"></div> Own <div class="square margin-left"></div> Other</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Address 1: ______________________________________________________________________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Address 2: ______________________________________________________________________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">City: _______________________________________</div>' +
          '                  <div class="field pad-left">State: __________</div>' +
          '                  <div class="field pad-left">Zip Code: _______________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Phone Number: _____________________________</div>' +
          '                  <div class="container pad-left-5">' +
          '                     <div class="normal field"><div class="square"></div> Home</div> ' +
          '                     <div class="normal field"><div class="square"></div> Work</div>' +
          '                  </div>' +
          '                  <div class="container">' +
          '                     <div class="normal field"><div class="square"></div> Mobile</div> ' +
          '                     <div class="normal field"><div class="square"></div> Fax</div>' +
          '                  </div>' +
          '                  <div class="field">Notes: ____________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Phone Number: _____________________________</div>' +
          '                  <div class="container pad-left-5">' +
          '                     <div class="normal field"><div class="square"></div> Home</div> ' +
          '                     <div class="normal field"><div class="square"></div> Work</div>' +
          '                  </div>' +
          '                  <div class="container">' +
          '                     <div class="normal field"><div class="square"></div> Mobile</div> ' +
          '                     <div class="normal field"><div class="square"></div> Fax</div>' +
          '                  </div>' +
          '                  <div class="field">Notes: ____________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Phone Number: _____________________________</div>' +
          '                  <div class="container pad-left-5">' +
          '                     <div class="normal field"><div class="square"></div> Home</div> ' +
          '                     <div class="normal field"><div class="square"></div> Work</div>' +
          '                  </div>' +
          '                  <div class="container">' +
          '                     <div class="normal field"><div class="square"></div> Mobile</div> ' +
          '                     <div class="normal field"><div class="square"></div> Fax</div>' +
          '                  </div>' +
          '                  <div class="field">Notes: ____________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Phone Number: _____________________________</div>' +
          '                  <div class="container pad-left-5">' +
          '                     <div class="normal field"><div class="square"></div> Home</div> ' +
          '                     <div class="normal field"><div class="square"></div> Work</div>' +
          '                  </div>' +
          '                  <div class="container">' +
          '                     <div class="normal field"><div class="square"></div> Mobile</div> ' +
          '                     <div class="normal field"><div class="square"></div> Fax</div>' +
          '                  </div>' +
          '                  <div class="field">Notes: ____________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Email: _____________________________________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Email: _____________________________________________________</div>' +
          '              </div>' +
          '              <div class="title">' +
          '                  <div class="field">Preferences</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Dentist: _________________________________________</div>' +
          '                  <div class="field pad-left">Hygienist: ___________________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Pharmacy: _____________________________________________________________________________________</div>' +
          '              </div>' +
          '              </div>' +
          '          </div>' +
          '      </div>' +
          '  </div>';

        var divIdentifiers = '';
        var divIdentifierTitle = '';
        if (results.Value.length > 0) {
          divIdentifierTitle =
            '' +
            '              <div class="title">' +
            '                  <div class="field">Additional Identifiers</div>' +
            '              </div>';

          angular.forEach(results.Value, function (res) {
            divIdentifiers +=
              '<div class="label"><div class="identifier">' +
              res.Description +
              ':&nbsp;</div>' +
              '<div class="field"> ________________________________________________________________________________________________</div></div>';
          });
        }

        var divSecondPage =
          '<div class="form-page">' +
          '  <div class="page-content">' +
          '      <div class="patient-form">' +
          '          <div class="patient-form-content">' +
          '              <div class="header">Patient Registration</div>' +
          '              <div class="label">' +
          '                  <div class="field">Previous Dentist: ________________________________________________________________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Address 1: ______________________________________________________________________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Address 2: ______________________________________________________________________________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">City: _______________________________________</div>' +
          '                  <div class="field pad-left">State: __________</div>' +
          '                  <div class="field pad-left">Zip Code: _______________________</div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Notes: </div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field"></div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field"></div>' +
          '              </div>' +
          '              <div class="label">' +
          '                  <div class="field">Referral: _______________________________________</div>' +
          '                  <div class="field pad-left">Referral Source: ________________________________</div>' +
          '              </div>' +
          divIdentifierTitle +
          divIdentifiers +
          '              </div>' +
          '          </div>' +
          '      </div>' +
          '  </div>';

        var outputHtml =
          '<html>' +
          '<head>' +
          '<title>Print Patient Registration</title>' +
          style +
          '</head>' +
          '<body><div class="form-body"><div class="printBtn"><button onclick="window.print(); window.document.close()">Print</button></div>' +
          divFirstPage +
          divSecondPage +
          '</div></body></html>';

        newTab.document.write(outputHtml);
        newTab.document.title = 'Print Patient Registration';
        newTab.document.close();
      };

      var failure = function (result) {
        progressDiv.hidden = true;
        newTab.document.write(' <title>Print Patient Registration</title>');
        newTab.document.write('Patient registration form generation failed.');
        newTab.document.close();
      };
      data.$promise.then(success, failure);
    };

    return {
      Setup: function () {
        return new templateSetup();
      },
    };
  },
]);
