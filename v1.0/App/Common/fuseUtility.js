/* eslint-disable no-console */
(function () {
  window.$fuseUtil = {
    log: log,
    diff: diff,
  };

  /*
   * config = {
   *
   *
   * */

  function log(func, args, config) {
    var defaultConfig = {
      group: true,
      groupName: null,
      collapseGroup: false,
      includeCount: false,
      includeCallStack: true,
      style: 'color: blue',
    };
    config = _.merge(defaultConfig, config);
    // Convenience rules applied
    if (config.collapseGroup === true) {
      config.group = true;
    }

    var caller = 'anonymous';
    if (_.isFunction(func.caller) && !_.isEmpty(func.caller.name)) {
      caller = func.caller.name;
    } else if (_.isFunction(func.caller)) {
      func.caller.toString().substring(0, 50);
    }
    var callee = !_.isEmpty(args.callee.name)
      ? args.callee.name
      : args.callee.toString().substring(0, 50);

    var msg = "'" + callee + "'" + " called by '" + caller + "'";

    if (config.group === true) {
      config.groupName = _.isEmpty(config.groupName)
        ? callee
        : config.groupName;
      if (config.collapseGroup === true) {
        console.groupCollapsed(config.groupName);
      } else {
        console.group(config.groupName);
      }
    }

    if (config.includeCount === true) {
      console.count(msg);
    } else {
      console.log('%c' + msg, config.style);
    }

    console.dirxml(args);

    if (config.includeCallStack === true) {
      console.groupCollapsed('Call Stack');
      console.trace();
      console.groupEnd();
    }

    if (config.group === true) {
      console.groupEnd();
    }
  }

  function diff(changedObject, originalObject) {
    function changes(changedObject, originalObject) {
      return _.transform(changedObject, function (result, value, key) {
        if (!_.isEqual(value, originalObject[key])) {
          result[key] =
            _.isObject(value) && _.isObject(originalObject[key])
              ? changes(value, originalObject[key])
              : value;
        }
      });
    }

    return changes(changedObject, originalObject);
  }
})();
/* eslint-enable no-console */
