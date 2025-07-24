'use strict';

angular.module('common.directives').directive('panel', function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      editData: '=?',
      additionalData: '=?',
      id: '@',
      template: '@',
      title: '@',
      //valid: '=?',
      autoSave: '=?',
      defaultExpanded: '=?',
      access: '=?',
      changeConfirmRequired: '=?',
      editPersonalContactInfo: '=',
      editAccountMembers: '=?',
    },
    templateUrl: 'App/Common/components/panel/panel.html',
    controller: 'PanelCtrl',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },

    // Implementation Documentation:
    /*
            
                <panel panel-config="[1]" panel-live="[2]" panel-saving="[3]" cancel="[4]" update="[5]"></panel>
                
                [1] Object that contains all panel data
                [2] Boolean to warn parent scope that a panel is active
                [3] Boolean to toggle the state of the save/cancel buttons (to disable when saving)
                [4] Function to flush changes in child scope by resetting parent scope.
                [5] Function to update changes on parent scope and propagate across other child scopes and/or services.

                // 1: panelConfig Object required fields

                    panelConfig = {
                        data: {},            // Data to render inside of views bound to parent scope
                        id: '',              // ID of elements inside of scope
                        title: '',           // Title of panel
                        templateUrl: '',     // URL of HTML template to render inside of panel
                        valid: true,         // Boolean for validation of panel
                        editIsActive: false  // Boolean to toggle the edit/view modes
                    };



                View HTML:

                    <div ng-controller="[Add a controller here!]">
                        <!-- VIEW -->
                        <div ng-show="panelConfig.editIsActive == false">
                            <!-- VIEW CONTENT HERE -->
                        </div>
                        <!-- EDIT -->
                        <div ng-show="panelConfig.editIsActive == true">
                            <!-- EDIT CONTENT HERE -->
                        </div>
                    </div>
            */
  };
});
