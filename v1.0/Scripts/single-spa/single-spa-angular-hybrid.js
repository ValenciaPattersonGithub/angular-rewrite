const defaultOpts = {
    // required opts
    angular: null,
    domElementGetter: null,
    mainAngularModule: null,

    // optional opts
    preserveGlobal: false,
    elementId: "__single_spa_angular_1",
    strictDi: false,
    template: undefined,
    startApp: undefined, 
};


function _singleSpaAngularHybrid(userOpts) {
    if (typeof userOpts !== "object") {
        throw new Error(`single-spa-angularjs requires a configuration object`);
    }

    const opts = {
        ...defaultOpts,
        ...userOpts,
    };

    if (!opts.angular) {
        throw new Error(`single-spa-angularjs must be passed opts.angular`);
    }

    if (!opts.mainAngularModule) {
        throw new Error(
            `single-spa-angularjs must be passed opts.mainAngularModule string`
        );
    }

    // A shared object to store mounted object state
    const mountedInstances = {};

    return {
        bootstrap: bootstrap.bind(null, opts, mountedInstances),
        mount: mount.bind(null, opts, mountedInstances),
        unmount: unmount.bind(null, opts, mountedInstances),
    };
}

window.singleSpaAngularHybrid = _singleSpaAngularHybrid; // expose to global.

function bootstrap(opts, mountedInstances, singleSpaProps) {
    return Promise.resolve().then(() => {                
        let module;
        try {
            module = opts.angular.module("single-spa-angularjs", []);
        } catch (err) {
            // ignore - this means that the module doesn't exist
        }
        if (module) {
            module.config([
                "$provide",
                ($provide) => {
                    $provide.value("singleSpaProps", singleSpaProps);
                },
            ]);
        }
    });
}

function mount(opts, mountedInstances, props = {}) {
    return Promise.resolve().then(() => {
        window.angular = opts.angular;

        const domElementGetter = chooseDomElementGetter(opts, props);
        const domElement = getRootDomEl(domElementGetter, props);
        const bootstrapEl = document.createElement("div");
        bootstrapEl.id = opts.elementId;

        domElement.appendChild(bootstrapEl);

        if (opts.template) {
            bootstrapEl.innerHTML = opts.template;
        }
        if (opts.startApp) {
            mountedInstances.instance = opts.startApp(
                bootstrapEl, opts.mainAngularModule
            ); // expecting two parameters.
        }
        else {
            if (opts.strictDi) {
                mountedInstances.instance = opts.angular.bootstrap(
                    bootstrapEl,
                    [opts.mainAngularModule],
                    { strictDi: opts.strictDi }
                );
            } else {
                mountedInstances.instance = opts.angular.bootstrap(bootstrapEl, [
                    opts.mainAngularModule,
                ]);
            }
            mountedInstances.instance.get("$rootScope").singleSpaProps = props;

            // https://github.com/single-spa/single-spa-angularjs/issues/51
            mountedInstances.instance.get("$rootScope").$apply();
        }
    });
}

function unmount(opts, mountedInstances, props = {}) {
    return new Promise((resolve, reject) => {

        mountedInstances.instance.get("$rootScope").$destroy();
        const domElementGetter = chooseDomElementGetter(opts, props);
        const domElement = getRootDomEl(domElementGetter, props);

        domElement.innerHTML = "";

        if (opts.angular === window.angular && !opts.preserveGlobal)
            delete window.angular;

        setTimeout(resolve);
    });
}

function chooseDomElementGetter(opts, props) {
    if (props.domElement) {
        return () => props.domElement;
    } else if (props.domElementGetter) {
        return props.domElementGetter;
    } else if (opts.domElementGetter) {
        return opts.domElementGetter;
    } else {
        return defaultDomElementGetter(props);
    }
}

function defaultDomElementGetter(props) {
    const appName = props.appName || props.name;
    if (!appName) {
        throw Error(
            `single-spa-angularjs was not given an application name as a prop, so it can't make a unique dom element container for the angularjs application`
        );
    }
    const htmlId = `single-spa-application:${appName}`;

    return function defaultDomEl() {
        let domElement = document.getElementById(htmlId);
        if (!domElement) {
            domElement = document.createElement("div");
            domElement.id = htmlId;
            document.body.appendChild(domElement);
        }

        return domElement;
    };
}

function getRootDomEl(domElementGetter, props) {
    if (typeof domElementGetter !== "function") {
        throw new Error(
            `single-spa-angularjs: the domElementGetter for angularjs application '${props.appName || props.name
            }' is not a function`
        );
    }

    const element = domElementGetter(props);

    if (!element) {
        throw new Error(
            `single-spa-angularjs: domElementGetter function for application '${props.appName || props.name
            }' did not return a valid dom element. Please pass a valid domElement or domElementGetter via opts or props`
        );
    }

    return element;
}