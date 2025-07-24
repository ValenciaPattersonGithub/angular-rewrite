/// <binding AfterBuild='default' ProjectOpened='default' />
/// <vs AfterBuild='default' />
//currently the gruntfile is setup to read the file everytime a setting value is requested
//via the getSetting function. The correct way which reads the settings as a part of the initConfig is commented out
//This way the settings will be read only once and can be accessed using <%= settings.XXXX%> syntax.
//The vs2013 Task runner explorer fails to parse the gruntfile if I use this syntax.
//which means the grunt tasks are not run as part of the post build event.

/* global require:false, process:false */

module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        shell: {
            //Todo: this needs to toggle based on dev or prod builds
            ngCLILocalBuild: {
                command: 'ng build --configuration=dev'
            },
            ngCLILocalBuildWatch: {
                command: ' ng build --configuration=dev --watch'
            },
            ngCLIProdBuild: {
                command: 'ng build --configuration=production'
            },
            ngCLILowerBuild: {
                // Prod build + sourcemaps, for lower environments only
                command: 'ng build --configuration=production,add-sourcemaps'
            },
            ngCLITest: {
                // Turning off code coverage on CI per DevOps discussion in Teams, trying to diagnose intermittent failures
                command: 'ng test --karmaConfig="src/karma.ci.conf.js" --codeCoverage=false'
            },
            ngCLITestReport: {
                command: 'ng test --karmaConfig="src/karma.report.conf.js" --codeCoverage=true'
            }
        },

        less: {
            development: {
                options: {
                    sourceMap: true,
                    sourceMapFilename: 'v1.0/Content/public/style.css.map', // where file is generated and located
                    sourceMapURL: 'style.css.map', // the complete url and filename put in the compiled css file
                    sourceMapRootpath: '/', // adds this path onto the sourcemap filename and less file paths
                },
                files: {
                    "v1.0/Content/public/style.css": "Content/source/style.less"
                }
            },
            production: {
                options: {
                },
                files: {
                    "v1.0/Content/public/style.css": "Content/source/style.less"
                }
            }
        },
        watch: {
            styles: {
                files: ['Content/source/**/*.less', 'v1.0/App/**/*.less'],
                tasks: ['less:development'],
            },
            typeScript: {
                files: ['src/**/*.ts', 'src/**/*.html', 'src/**/*.less', 'src/**/*.scss'],
                tasks: ['AngularCLILocalBuild']
            }
        },
        replace: {
            settings: {
                src: ['Views/ConfigSettings/Index.tmpl.cshtml'],
                dest: ['Views/ConfigSettings/Index.cshtml'],
                replacements: [
                    {
                        from: '@@azureApplicationId',
                        to: function () {
                            return getSetting('azureApplicationId');
                        }
                    },
                    {
                        from: '@@VersionedEnterpriseUrl',
                        to: function () {
                            return getSetting('VersionedEnterpriseUrl');
                        }
                    },
                    {
                        from: '@@PlatformUserServiceUrl',
                        to: function() {
                            return getSetting('PlatformUserServiceUrl');
                        }
                    },
                    {
                        from: '@@EnterpriseApiUrl',
                        to: function () {
                            return getSetting('EnterpriseApiUrl');
                        }
                    },
                    {
                        from: '@@EnterpriseSettingsApiUrl',
                        to: function () {
                            return getSetting('EnterpriseSettingsApiUrl');
                        }
                    },
                    {
                        from: '@@DomainUrl',
                        to: function () {
                            return getSetting('DomainUrl');
                        }
                    },
                    {
                        from: '@@PaymentGatewayPaymentPageUrl',
                        to: function () {
                            return getSetting('PaymentGatewayPaymentPageUrl');
                        }
                    },
                    {
                        from: '@@ClaimApiUrl',
                        to: function () {
                            return getSetting('ClaimApiUrl');
                        }
                    },
                    {
                        from: '@@EraApiUrl',
                        to: function () {
                            return getSetting('EraApiUrl');
                        }
                    },
                    {
                        from: '@@RteApiUrl',
                        to: function () {
                            return getSetting('RteApiUrl');
                        }
                    },

                    {
                        from: '@@FileShareApiUrl',
                        to: function () {
                            return getSetting('FileShareApiUrl');
                        }
                    },
                    {
                        from: '@@RxApiUrl',
                        to: function () {
                            return getSetting('RxApiUrl');
                        }
                    },
                    {
                        from: '@@idm:rootUrl',
                        to: function () {
                            return getSetting('idm:rootUrl');
                        }
                    },
                    {
                        from: '@@ApplicationVariableForLoginToken',
                        to: function () {
                            return getSetting('ApplicationVariableForLoginToken');
                        }
                    },
                    {
                        from: '@@NewApplicationVariableForLoginToken',
                        to: function () {
                            return getSetting('NewApplicationVariableForLoginToken');
                        }
                    },
                    {
                        from: '@@rootUrl',
                        to: function () {
                            return getSetting('rootUrl');
                        }
                    },
                    {
                        from: '@@idm:rootUrl',
                        to: function () {
                            return getSetting('idm:rootUrl');
                        }
                    },
                    {
                        from: '@@FusePracticesUrl',
                        to: function () {
                            return getSetting('FusePracticesUrl');
                        }
                    },
                    {
                        from: '@@FusePracticesApimUrl',
                        to: function () {
                            return getSetting('FusePracticesApimUrl');
                        }
                    },
                    {
                        from: '@@FuseSchedulingApimUrl',
                        to: function () {
                            return getSetting('FuseSchedulingApimUrl');
                        }
                    },
                    {
                        from: '@@FuseInsuranceUrl',
                        to: function () {
                            return getSetting('FuseInsuranceUrl');
                        }
                    },
                    {
                        from: '@@FuseReportingUrl',
                        to: function () {
                            return getSetting('FuseReportingUrl');
                        }
                    },
                    {
                        from: '@@EnterpriseApiUrl',
                        to: function () {
                            return getSetting('EnterpriseApiUrl');
                        }
                    },
                    {
                        from: '@@FuseSchedulingUrl',
                        to: function () {
                            return getSetting('FuseSchedulingUrl');
                        }
                    },
                    {
                        from: '@@PrescriptionApiUrl',
                        to: function () {
                            return getSetting('PrescriptionApiUrl');
                        }
                    },
                    {
                        from: '@@BlueImagingApiUrl',
                        to: function () {
                            return getSetting('BlueImagingApiUrl');
                        }
                    },
                    {
                        from: '@@TreatmentPlansApiUrl',
                        to: function () {
                            return getSetting('TreatmentPlansApiUrl');
                        }
                    },
                    {
                        from: '@@ServerlessSignalRApiUrl',
                        to: function () {
                            return getSetting('ServerlessSignalRApiUrl');
                        }
                    },
                    {
                        from: '@@FuseClinicalUrl',
                        to: function () {
                            return getSetting('FuseClinicalUrl');
                        }
                    },
                    {
                        from: '@@FuseSAPISchedulingUrl',
                        to: function () {
                            return getSetting('FuseSAPISchedulingUrl');
                        }
                    },
                    {
                        from: '@@FuseInsuranceSapiUrl',
                        to: function () {
                            return getSetting('FuseInsuranceSapiUrl');
                        }
                    },
                    {
                        from: '@@EnvironmentName',
                        to: function () {
                            return getSetting('EnvironmentName');
                        }
                    },
                    {
                        from: '@@FuseNewReportingApiUrl',
                        to: function () {
                            return getSetting('FuseNewReportingApiUrl');
                        }
                    },
                    {
                        from: '@@FuseExportApiUrl',
                        to: function () {
                            return getSetting('FuseExportApiUrl');
                        }
                    },
                    {
                        from: '@@FuseReferralManagementApiUrl',
                        to: function () {
                            return getSetting('FuseReferralManagementApiUrl');
                        }
                    },
                    {
                        from: '@@PatientOverviewMFEUrl',
                        to: function () {
                            return getSetting('PatientOverviewMFEUrl');
                        }
                    },
                    {
                        from: '@@InsuranceMFEUrl',
                        to: function () {
                            return getSetting('InsuranceMFEUrl');
                        }
                    },
                    {
                        from: '@@ScheduleMFEUrl',
                        to: function () {
                            return getSetting('ScheduleMFEUrl');
                        }
                    },
                    {
                        from: '@@ScheduleMFEAltUrl',
                        to: function () {
                            return getSetting('ScheduleMFEAltUrl');
                        }
                    },
                    {
                        from: '@@ClinicalMFEUrl',
                        to: function () {
                            return getSetting('ClinicalMFEUrl');
                        }
                    },
                    {
                        from: '@@ContractsMFEUrl',
                        to: function () {
                            return getSetting('ContractsMFEUrl');
                        }
                    },                    
                    {
                        from: '@@TurnOffSingleSpa',
                        to: function () {
                            return getSetting('TurnOffSingleSpa');
                        }
                    },
                    {
                        from: '@@PRMUrl',
                        to: function () {
                            return getSetting('PRMUrl');
                        }
                    },
                    {
                        from: '@@FuseNotificationGatewayServiceUrl',
                        to: function () {
                            return getSetting('FuseNotificationGatewayServiceUrl');
                        }
                    },
                    {
                        from: '@@PracticeSettingsMFEUrl',
                        to: function () {
                            return getSetting('PracticeSettingsMFEUrl');
                        }
                    }
                ]
            }
        },
        cacheBust: {
            options: {
                encoding: 'utf8',
                length: 16,
                algorithm: 'md5',
                deleteOriginals: false
            },
            loginwebshell: {
                options: {
                    baseDir: './',
                    assets: [
                        'enterprisecore/core-shell.js'
                    ]
                },
                src: ['index.html']
            },
            webshell: {
                options: {
                    baseDir: './',
                    assets: [
                        'enterprisecore/core-shell.js',
                        'v1.0/enterprisecore/core-v1.0.js'
                    ]
                },
                src: ['v1.0/index.html']
            }
        },
        htmlbuild: {
            v1: {
                src: 'v1.0/index.html.tmpl',
                dest: 'v1.0/index.html',
                overwrite: true,
                options: {
                    allowUnknownTags: true,
                    parseTag: 'bundle',
                    relative: false,
                    prefix: '/',
                    beautify: true,
                    scripts: {
                        businesscenter: ['v1.0/App/BusinessCenter/businessCenter.js', 'v1.0/App/BusinessCenter/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js'],
                        common: ['v1.0/App/Common/common-modules.js', 'v1.0/App/Common/base-controller.js', 'v1.0/App/Common/base-scheduler-controller.js', 'v1.0/App/Common/angular/angular-modules.js', 'v1.0/App/Common/**/*.js', '!v1.0/App/Common/common.js', '!v1.0/App/Common/fuseUtility.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js', '!v1.0/App/Common/components/elapsedTime/elapsedTime-controller.js', '!v1.0/App/Common/components/elapsedTime/elapsedTime-directive.js', '!v1.0/App/Common/components/elapsedTime/elapsedTime.html'],
                        widget: ['v1.0/App/Widget/widget-module.js', 'v1.0/App/Widget/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js'],
                        dashboard: ['v1.0/App/Dashboard/dashboard.js', 'v1.0/App/Dashboard/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js'],
                        help: ['v1.0/App/Help/help.js', 'v1.0/App/Help/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js'],
                        main: ['v1.0/App/app.js', 'v1.0/App/Common/common.js', 'v1.0/App/Common/fuseUtility.js'],
                        patient: ['v1.0/App/Patient/patient.js', 'v1.0/App/Patient/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js'],
                        patShared: ['v1.0/App/PatShared/patShared.js', 'v1.0/App/PatShared/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js', '!v1.0/App/PatShared/patShared-services.js'],
                        schedule: ['v1.0/App/Schedule/schedule.js', 'v1.0/App/Schedule/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js'],
                        scheduler: ['v1.0/App/Scheduler/scheduler.js', 'v1.0/App/Scheduler/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js'],
                        externallibs: [
                            "v1.0/Scripts/jquery-2.1.4.min.js",
                            "v1.0/Scripts/toastr.min.js",
                            "v1.0/Scripts/lodash.min.js",
                            "v1.0/Scripts/moment.min.js",
                            "v1.0/Scripts/moment-timezone-with-data-2000-2035.min.js",
                            "v1.0/Scripts/bootstrap.min.js",
                            "v1.0/Scripts/angular-components/api-check.min.js",
                            "v1.0/Scripts/angular.min.js",
                            "v1.0/Scripts/angular-cache.min.js",
                            "v1.0/Scripts/angular-animate.min.js",
                            "v1.0/Scripts/angular-cookies.min.js",
                            "v1.0/Scripts/angular-filter.min.js",
                            "v1.0/Scripts/angular-infinite-scroll.min.js",
                            //"v1.0/Scripts/angular-mocks.js",
                            "v1.0/Scripts/angular-sanitize.min.js",
                            "v1.0/Scripts/angular-route.min.js",
                            "v1.0/Scripts/angular-resource.min.js",
                            "v1.0/Scripts/angular-components/formly.min.js",
                            "v1.0/Scripts/angular-components/angular-formly-templates-bootstrap.min.js",
                            "v1.0/Scripts/angular-components/pdf.js",
                            "v1.0/Scripts/angular-components/angular-pdfjs.min.js",
                            "v1.0/Scripts/angular-components/angular-bootstrap-confirm.js",
                            "v1.0/Scripts/angular-ui/ui-bootstrap.min.js",
                            "v1.0/Scripts/angular-ui/ui-bootstrap-tpls.min.js",
                            "v1.0/Scripts/select.min.js",
                            "v1.0/Scripts/angular-ui/angular-ui-router.min.js",
                            "v1.0/Scripts/ui-utils.js",
                            "v1.0/Scripts/angular-strap.min.js",
                            "v1.0/Scripts/chosen.jquery.js",
                            "v1.0/Scripts/chosen.js",
                            "v1.0/Scripts/signature_pad.min.js",
                            "v1.0/Scripts/canvg.js",
                            //"v1.0/Scripts/jquery.signalR-2.4.1.min.js",
                            "v1.0/Scripts/angular-gridster/angular-gridster.min.js",
                            "v1.0/Scripts/dynamsoft/dynamsoft.webtwain.config.js",
                            "v1.0/Scripts/dynamsoft/dynamsoft.webtwain.initiate.js"
                        ],
                        externallibsmin: ["v1.0/Scripts/kendo.all.js"],
                        styleguide: ['v1.0/App/StyleGuide/styleguide.js', 'v1.0/App/StyleGuide/**/*.js', '!v1.0/App/**/*_test.js', '!v1.0/App/**/*_tests.js'],
                        ngclioutputes5: [
                            'v1.0/Scripts/ng-cli/runtime-es5*.js',
                            'v1.0/Scripts/ng-cli/polyfills-es5*.js',
                            'v1.0/Scripts/ng-cli/styles-es5*.js',
                            'v1.0/Scripts/ng-cli/vendor-es5*.js',
                            'v1.0/Scripts/ng-cli/main-es5*.js',
                            '!v1.0/Scripts/ng-cli/*.map'
                        ],
                        ngclioutputes2015: [
                            'v1.0/Scripts/ng-cli/runtime-es2015*.js',
                            'v1.0/Scripts/ng-cli/polyfills-es2015*.js',
                            'v1.0/Scripts/ng-cli/styles-es2015*.js',
                            'v1.0/Scripts/ng-cli/vendor-es2015*.js',
                            'v1.0/Scripts/ng-cli/main-es2015*.js',
                            '!v1.0/Scripts/ng-cli/*.map'
                        ]
                    },
                    styles: {
                        css: [
                            'v1.0/Content/public/style.css',
                            'v1.0/Content/angular-gridster/angular-gridster.min.css',
                            'v1.0/Scripts/ng-cli/*.css'
                        ]
                    }
                }
            },
            v1templates: {
                src: 'v1.0/index.html',
                dest: 'v1.0/index.html',
                overwrite: true,
                options: {
                    allowUnknownTags: true,
                    parseTag: 'bundletmpl',
                    relative: false,
                    prefix: '/',
                    beautify: true,
                    scripts: {
                        templates: ['v1.0/App/dist/templates.min.js']
                    }
                }
            },
            shell: {
                src: 'index.html.tmpl',
                dest: 'index.html',
                options: {
                    allowUnknownTags: true,
                    parseTag: 'bundle',
                    relative: false,
                    prefix: '/',
                    beautify: true,
                    scripts: {
                        soarshell: ['shell/app.js', 'shell/**/*.js']
                    },
                    styles: {
                        coreshell: ['Content/shell.css']
                    }
                }
            }
        },
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16
            },
            js: {
                src: [
                    'v1.0/App/dist/*.js'
                ]
            },
            css: {
                src: [
                    'v1.0/Content/public/app.min.css'
                ]
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: [['@babel/preset-env', { forceAllTransforms: true }]]
            },
            files: {
                expand: true,
                src: ['.tmp/concat/v1.0/App/dist/!(external.min).js']
            }
        },
        useminPrepare: {
            html: ['v1.0/index.html', 'index.html'],
            options: {
                root: '.',
                dest: '.'
            }
        },
        usemin: {
            html: ['v1.0/index.html', 'index.html'],
            options: {
                assetsDirs: ['.']
            }
        },
        clean: ['v1.0/App/dist', '.tmp/**/*', 'dist/**/*', 'v1.0/Content/public/app.min.*.css'],
        ngtemplates: {
            dev: {
                options: {
                    module: 'Soar.Common',
                    htmlmin: { collapseWhitespace: false }
                    //usemin: '/v1.0/App/dist/templates.min.js'  // <~~ This came from the <!-- build:js --> block
                },
                cwd: 'v1.0',
                src: ['App/**/*.html'],
                dest: 'v1.0/App/dist/templates.min.js'
            }
        },
        // unit test configs
        karma: {
            options: {
                configFile: 'v1.0/App/Test/karma.conf.js',
                autoWatch: true,
                htmlReporter: {
                    outputDir: 'v1.0/App/Test/reports/html',
                    namedFiles: true
                },
                reporters: ['progress', 'html']
            },
            business: getKarmaSubTaskConfig('business'),
            common: getKarmaSubTaskConfig('common'),
            dashboard: getKarmaSubTaskConfig('dashboard'),
            patient: getKarmaSubTaskConfig('patient'),
            patshared: getKarmaSubTaskConfig('patshared'),
            schedule: getKarmaSubTaskConfig('schedule'),
            widget: getKarmaSubTaskConfig('widget')
        },
        karmaci: {
            options: {
                configFile: 'v1.0/App/Test/ci.conf.js',
                autoWatch: false,
                htmlReporter: {
                    outputDir: 'v1.0/App/Test/reports/html',
                    namedFiles: true
                },
                reporters: ['progress', 'html']
            },
            business: getKarmaSubTaskConfig('business'),
            common: getKarmaSubTaskConfig('common'),
            dashboard: getKarmaSubTaskConfig('dashboard'),
            patient: getKarmaSubTaskConfig('patient'),
            patshared: getKarmaSubTaskConfig('patshared'),
            schedule: getKarmaSubTaskConfig('schedule'),
            widget: getKarmaSubTaskConfig('widget')
        },
        eslint: {
            options: {
            },
            app: ['v1.0/App/*.js'],
            business: ['v1.0/App/BusinessCenter/**/*.js'],
            common: ['v1.0/App/Common/**/*.js'],
            dashboard: ['v1.0/App/dashboard/**/*.js'],
            patient: ['v1.0/App/Patient/**/*.js'],
            patshared: ['v1.0/App/PatShared/**/*.js'],
            schedule: ['v1.0/App/Schedule/**/*.js'],
            widget: ['v1.0/App/Widget/**/*.js'],
            newInsurance: ['src/insurance/**/*.ts'],
            alljs: ['v1.0/App/**/*.js'],
            allts: ['src/**/*.ts'],
            all: ['v1.0/App/**/*.js', 'src/**/*.ts']
        },
        concurrent: {
            build: {
                tasks: ['eslint:all', 'unittest:build', 'fullbuildsteps'],
                options: {
                    logConcurrentOutput: false
                }
            }
        }
    });

    //#region helper functions

    function getSetting(settingName) {
        if (!grunt.option('devConfig') || grunt.option('devConfig') == 'devlocal') {
            return settingName;
        } else {
            return grunt.option('devConfig') + '_' + settingName;
        }
    }

    function getKarmaSubTaskConfig(suiteName) {
        var folderName;
        switch (suiteName) {
            case 'business':
                folderName = 'BusinessCenter';
                break;
            case 'common':
                folderName = 'Common';
                break;
            case 'dashboard':
                folderName = 'Dashboard';
                break;
            case 'patient':
                folderName = 'Patient';
                    break;
            case 'patshared':
                folderName = 'PatShared';
                break;
            case 'schedule':
                folderName = 'Schedule';
                break;
            case 'widget':
                folderName = 'Widget';
                break;
            default:
                return null;
        }

        var config = {
            exclude: [`../!(${folderName})/**/*_test?(s).js`],
            preprocessors: { '../**/*.html': ['ng-html2js'] },
            htmlReporter: {
                reportName: `${suiteName}`
            },
            fuseReporter: {
                outputFile: `v1.0/App/Test/reports/json/${suiteName}.json`
            },
            coverageReporter: {
                dir: 'reports/coverage',
                reporters: [
                    { type: 'html', subdir: `${suiteName}` },
                    { type: 'text-summary' },
                    { type: 'json', subdir: '.', file: `${suiteName}-coverage.json` },
                    { type: 'json-summary', dir: 'reports/coverage', subdir: '.', file: `${suiteName}-coverage-summary.json` }
                ]
            }
        };
        config.preprocessors[`v1.0/App/${folderName}/**/!(*_test|*_tests).js`] = ['coverage'];

        return config;
    }

    //#endregion

    require('load-grunt-tasks')(grunt);

    //#region alias tasks

    // entry-point tasks
    var target = grunt.option('target') || 'devlocal';
    grunt.registerTask('default', [target]);
    grunt.registerTask('defaultmin', ['default', 'minify']);
    grunt.registerTask('devlocal', ['set-api:local', 'AngularCLILocalBuild', 'build']);
    grunt.registerTask('devazure', ['set-api:test', 'AngularCLILocalBuild', 'build']);
    grunt.registerTask('masterazure', ['set-api:stage', 'AngularCLILocalBuild', 'build']);

    // tasks used by tfs build process
    grunt.registerTask('soardev', ['fullbuild']);
    grunt.registerTask('soarqa', ['fullbuild']);
    grunt.registerTask('soardemo', ['fullbuild']);

    // full build
    grunt.registerTask('fullbuildsteps', ['AngularCLIProdBuild', 'build', 'minify']);
    grunt.registerTask('fullbuild', ['clean', 'concurrent:build']);

    // eslint dev alias, skips the 'all' subtask
    grunt.registerTask('lint', function (arg) {
        if (arg) {
            grunt.task.run(`eslint:${arg}`);
        } else {
            delete grunt.config.data.eslint.all;
            grunt.task.run('eslint');
        }
    });

    // main build process tasks
    //grunt.registerTask('build', ['less:development', 'replace', 'htmlbuild']);
    grunt.registerTask('build', ['clean', 'less:development', 'replace', 'htmlbuild:shell', 'htmlbuild:v1']);
    grunt.registerTask('minify', ['jstemplates', 'useminPrepare', 'concat:generated', 'cssmin:generated', 'babel', 'uglify:generated', 'filerev', 'usemin', 'cacheBust']);

    // helper alias tasks
    grunt.registerTask('do-less', ['less:development']);
    grunt.registerTask('jstemplates', ['ngtemplates:dev', 'htmlbuild:v1templates']);

    // Angular CLI Build tasks
    grunt.registerTask('AngularCLILocalBuild', ['shell:ngCLILocalBuild']);
    grunt.registerTask('AngularCLIProdBuild', ['shell:ngCLIProdBuild']);
    grunt.registerTask('AngularCLILowerBuild', ['shell:ngCLILowerBuild']);
    grunt.registerTask('ngbuild', ['shell:ngCLILocalBuildWatch']);

    //#endregion

    //#region custom tasks

    grunt.registerTask('set-api', function (arg) {
        switch (arg) {
            case 'local':
                grunt.option('devConfig', 'devlocal');
                break;
            case 'azure':
                grunt.option('devConfig', 'devazure');
                break;
            case 'test':
                grunt.option('devConfig', 'devazure');
                break;
            case 'stage':
                grunt.option('devConfig', 'masterazure');
                break;
        }
    });

    grunt.registerTask('unittest', function (suite, ...args) {
        grunt.config.requires('karma.options');

        var options = {};
        var task = 'karma';

        if (suite === 'build') {
            // task = ['continue:on'];
            task = [];
            options.options = { configFile: 'v1.0/App/Test/ci.conf.js' };
            ['BusinessCenter', 'Common', 'Dashboard', 'Patient', 'Schedule', 'Widget'].forEach(function (suite) {
                options[suite] = getKarmaBuildSubTaskConfig(suite);
                task.push(`karma:${suite}`);
            });
            task.push('shell:ngCLITest');

            // this line will cause a failure if any suite fails
            // task.push('continue:off', 'continue:fail-on-warning');

            // this line will continue if a unit test suite fails
            //task.push('continue:off');

            // below can be used to run the other suites without requiring all passes
            // task.push('continue:on');
            // ['Widget'].forEach(function (suite) {
            //     options[suite] = getKarmaBuildSubTaskConfig(suite);
            //     options[suite].coverageReporter = {
            //         type: 'text-summary',
            //         check: {
            //             global: {
            //                 statements: 45
            //             }
            //         }
            //     };
            //     task.push(`karma:${suite}`);
            // });
            // task.push('continue:off');
            grunt.config.data.karma = options;
        } else {
            if (!suite || suite === 'savereport') {
                const puppeteer = require('puppeteer');
                process.env.CHROME_BIN = puppeteer.executablePath();
                options.autoWatch = false;
                options.singleRun = true;
                options.reporters = [null, null, 'coverage', 'fuse'];
                options.browsers = ['ChromeHeadless'];
                grunt.config.data.makeReport = {
                    src: 'v1.0/App/Test/reports/coverage/*-coverage.json',
                    options: {
                        print: 'summary',
                        reporters: {
                            'html': { dir: 'v1.0/App/Test/reports/summary/coverage' },
                            'json-summary': { dir: 'v1.0/App/Test/reports/summary', file: 'coverage.json' }
                        }
                    }
                };
                if (suite === 'savereport') {
                    grunt.config.data.fuseCombineReports = {
                        saveReport: 'true'
                    };
                }
                task = [`force:${task}`, 'force:shell:ngCLITestReport', 'makeReport', 'fuse-combine-reports'];
            } else {
                grunt.config.requires(['karma', suite]);
                task = task + ':' + suite;

                if (args.includes('coverage') || args.includes('html')) {
                    options.reporters = [null, null, args.includes('coverage') ? 'coverage' : null, args.includes('html') ? 'kjhtml' : null];
                }

                if (args.includes('headless')) {
                    options.browsers = ['ChromeHeadless'];
                }

            }

            grunt.config.merge({ karma: { options: options } });
        }

        grunt.task.run(task);
    });

    function getKarmaBuildSubTaskConfig(suite) {
        let options = {};
        options.exclude = [`../!(${suite})/**/*_test?(s).js`];
        options.preprocessors = { '../**/*.html': ['ng-html2js'] };
        options.preprocessors[`v1.0/App/${suite}/**/!(*_test|*_tests).js`] = ['coverage'];

        // if desired, set coverage minimum for the suite
        //coverageReporter = {
        //         type: 'text-summary',
        //         check: {
        //             global: {
        //                 statements: 45
        //             }
        //         }
        //     };

        return options;
    }

    grunt.registerTask('fuse-combine-reports', function () {
        require('./v1.0/App/Test/fuse-combine-reports')(grunt);
    });

    //#endregion

};