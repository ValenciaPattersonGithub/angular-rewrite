'use strict';

angular.module('common.controllers').factory('GridOptionsFactory', [
  function () {
    // Options class object
    var Options = function () {
      var self = this;
      self.id = 'grid';
      self.enableScroll = false;
      self.scrollHeight = '300px';
      self.isHidden = false;
      self.updateOnInit = true;
      self.query = {};
      self.pageSize = 50;
      self.actions = {};
      self.successAction = null;
      self.failAction = null;
      self.additionalFilters = [];
      self.columnDefinition = [];
      self.printColumnDefinition = [];
      self.expandable = false;
      self.expandableRowIdFromColumn = '';
      self.expandableRowColumn = '';
      self.expandableRowSortColumn = '';
      self.expandableRowSortOrder = 0;
      self.expandableColumnDefinition = {};
      self.rowTooltip = false;
      self.renderTooltip = null;
      self.hasUserAccessLocationToColumn = {};
      return self;
    };

    // Shared functionality
    Options.prototype.updateFilter = function (field, value) {
      for (var i = 0; i < this.additionalFilters.length; i++) {
        var item = this.additionalFilters[i];
        if (item.field === field) {
          item.filter = value;
          return;
        }
      }

      this.additionalFilters.push({
        field: field,
        filter: value,
      });
    };

    Options.prototype.resetFilters = function () {
      this.additionalFilters = this.additionalFilters.slice(0, 1);
    };

    Options.prototype.refresh = function () {};

    Options.prototype.rowStyle = function () {
      return '';
    };

    // Public functions
    return {
      createOptions: function () {
        return new Options();
      },
    };
  },
]);
