angular.module('common.directives').directive('objectStateItem', function () {
  return {
    link: function (scope, element, attrs, controller) {
      var item = scope.$eval(attrs.objectStateItem);
      scope.$watch(function (nv, ov) {
        if (nv && nv != ov) {
          //console.log(nv)
        }
      });
    },
  };
});
