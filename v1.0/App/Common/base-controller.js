function BaseCtrl($scope, className) {
  $scope.$on('$destroy', cleanupScope);
  $scope.$instantiatedBy = className;
  $scope.$rootScopeRegistrations = [];
  $scope.$observerRegistrations = [];

  function cleanupScope(event) {
    if (event && event.currentScope) {
      if (
        event.currentScope.$onScopeDestroy &&
        typeof event.currentScope.$onScopeDestroy === 'function'
      ) {
        event.currentScope.$onScopeDestroy();
      }

      if (
        event.currentScope.$rootScopeRegistrations &&
        event.currentScope.$rootScopeRegistrations.length
      ) {
        for (
          var i = 0;
          i < event.currentScope.$rootScopeRegistrations.length;
          i++
        ) {
          if (event.currentScope.$rootScopeRegistrations[i]) {
            event.currentScope.$rootScopeRegistrations[i]();
            event.currentScope.$rootScopeRegistrations[i] = null;
          }
        }
        event.currentScope.$rootScopeRegistrations = null;
      }

      if (
        event.currentScope.$observerRegistrations &&
        event.currentScope.$observerRegistrations.length
      ) {
        for (
          var j = 0;
          j < event.currentScope.$observerRegistrations.length;
          j++
        ) {
          if (event.currentScope.$observerRegistrations[j]) {
            event.currentScope.$observerRegistrations[j]();
            event.currentScope.$observerRegistrations[j] = null;
          }
        }
        event.currentScope.$observerRegistrations = null;
      }

      for (var scopeItem in event.currentScope) {
        if (
          scopeItem &&
          event.currentScope.hasOwnProperty(scopeItem) &&
          !scopeItem.startsWith('$')
        ) {
          event.currentScope[scopeItem] = null;
        }
      }

      if (
        event.currentScope.$$watchers &&
        event.currentScope.$$watchers.length
      ) {
        for (var k = 0; k < event.currentScope.$$watchers.length; k++) {
          event.currentScope.$$watchers[k].fn = null;
        }

        event.currentScope.$$watchers = [];
      }

      if (
        event.currentScope.$$listeners &&
        event.currentScope.$$listeners.$destroy
      ) {
        delete event.currentScope.$$listeners.$destroy;
      }
      if (
        event.currentScope.$$listenerCount &&
        event.currentScope.$$listenerCount.$destroy
      ) {
        delete event.currentScope.$$listenerCount.$destroy;
      }

      if (
        event.currentScope.$$watchers &&
        event.currentScope.$$watchers.length
      ) {
        event.currentScope.$$watchers = [];
      }

      if (event.currentScope.$$childHead) {
        var nextChild = event.currentScope.$$childHead;
        while (nextChild) {
          var currentChild = nextChild;
          nextChild = nextChild.$$nextSibling;
          currentChild.$destroy();
          currentChild.$$watchers = [];
          currentChild.$$nextSibling = null;
          currentChild.$$previousSibling = null;
        }
      }

      cleanupListeners(
        event.currentScope.$$listeners,
        event.currentScope.$$listenerCount
      );
    }
  }

  function cleanupListeners(listeners, listenerCount) {
    var listenerName = null;
    if (listeners && Object.keys(listeners).length > 0) {
      for (listenerName in listeners) {
        if (
          listeners.hasOwnProperty(listenerName) &&
          listeners[listenerName] &&
          listeners[listenerName].length
        ) {
          for (var i = listeners[listenerName].length - 1; i >= 0; i--) {
            delete listeners[listenerName][i];
          }
        }

        if (listenerCount && listenerCount.hasOwnProperty(listenerName)) {
          delete listenerCount[listenerName];
        }
      }
    }
  }
}
