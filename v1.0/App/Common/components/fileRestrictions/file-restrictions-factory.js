'use strict';

angular.module('common.factories').factory('FileRestrictionsFactory', [
  function () {
    var factory = this;

    var allowedList = [
      {
        Ext: 'RTF',
      },
      {
        Ext: 'TXT',
      },
      {
        Ext: 'PDF',
      },
      {
        Ext: 'DOC',
      },
      {
        Ext: 'DOCX',
      },
      {
        Ext: 'XLS',
      },
      {
        Ext: 'XLSX',
      },
      {
        Ext: 'PPT',
      },
      {
        Ext: 'PPTX',
      },
      {
        Ext: 'TIF',
      },
      {
        Ext: 'TIFF',
      },
      {
        Ext: 'BMP',
      },
      {
        Ext: 'GIF',
      },
      {
        Ext: 'JPG',
      },
      {
        Ext: 'PNG',
      },
      {
        Ext: 'JPEG',
      },
      {
        Ext: 'IMG',
      },
      {
        Ext: 'CSV',
      },
      {
        Ext: 'JFF',
      },
      {
        Ext: 'MPG',
      },
      {
        Ext: 'MPEG',
      },
      {
        Ext: 'MP4',
      },
      {
        Ext: 'MP3',
      },
      {
        Ext: 'MOV',
      },
      {
        Ext: 'WMV',
      },
      {
        Ext: 'AVI',
      },
      {
        Ext: 'M4A',
      },
    ];

    factory.checkRestrictions = function (fileExt) {
      var restricted = true;

      if (fileExt) {
        angular.forEach(allowedList, function (obj) {
          if (obj.Ext.toLowerCase() == fileExt.toLowerCase()) {
            restricted = false;
          }
        });
      }
      return restricted;
    };

    return {
      CheckRestrictions: function (fileExt) {
        return factory.checkRestrictions(fileExt);
      },
    };
  },
]);
