/* Extend it with moonlight ui functions */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root.jQuery);
    }
}(this, function ($) {
    var callbacks = [],
        modules = {},
        actions = [],
        routes = [],
        debugMode = false,
        labelLib = 'MOONLIGHTUI - ',
        tempModule,
        routerInit = false;

    $.fn.extend({
        /* MOONLIGHTUI - System */
        checkRoute: function() {
            var url = window.location.hash.splice(1);
            console.log(labelLib + 'Found url: ' + url);
            for(var i = 0; i < routes.length; i++) {
                if (routes[i].url === vw.routeUrl) {
                    console.error(labelLib + 'We would not do a render on: ' + routes[i].url + ' in module ' + routes[i].module + ' in view ' + routes[i].view);
                    break;
                }
            }
        },
        onready: function(cb) {
            if (routerInit === false) {
                window.onhashchange = this.checkRoute();
                routerInit = true;
            }
            if (debugMode) {
                console.info(labelLib + 'We are initializing the onready.');
            }
            $(document).ready(function() {
                cb();
            });
        },
        url: window.location,
        debug: function(setAs) {
            debugMode = setAs;
        },
        viewReady: function(module, view) {
            if (debugMode) {
                console.info(labelLib + 'Triggered viewReady for module: ' + module + ' view: ' + view);
            }
            if (modules[module].views[view].__template === false) {
                return false;
            } else {
                return true;
            }
        },
        viewsReady: function(cb) {
            if (debugMode) {
                console.info(labelLib + 'Triggered viewsReady.');
            }
            $.each( modules, function( module, value ) {
                $.each( modules[module].views, function( name, view ) {
                    if (modules[module].views[name].__template === false) {
                        if (typeof cb !== 'undefined') {
                            cb(false);
                        } else {
                            return false;
                        }
                    }
                });
            }).promise().done(function(){
                if (typeof cb !== 'undefined') {
                    cb(true);
                } else {
                    return true;
                }
            });
        },
        /* MOONLIGHTUI - Interaction from modules and controller */
        removeSelect: function(){
            if (debugMode) {
                console.info(labelLib + 'Remove select.');
            }
            $(this).each(function(){
                $(this).removeClass('selected');
            });
        },
        addSelect: function(){
            if (debugMode) {
                console.info(labelLib + 'Add select.');
            }
            $(this).each(function(){
                $(this).addClass('selected');
            });
        },
        removeHidden: function(){
            if (debugMode) {
                console.info(labelLib + 'Remove hidden.');
            }
            $(this).each(function(){
                $(this).removeClass('hidden');
            });
        },
        addHidden: function(){
            if (debugMode) {
                console.info(labelLib + 'Add hidden.');
            }
            $(this).each(function(){
                $(this).addClass('hidden');
            });
        },
        removeErrorInput: function(){
            if (debugMode) {
                console.info(labelLib + 'Remove error input.');
            }
            $(this).each(function(){
                $(this).removeClass('error-input');
            });
        },
        addErrorInput: function(){
            if (debugMode) {
                console.info(labelLib + 'Add error input.');
            }
            $(this).each(function(){
                $(this).addClass('error-input');
            });
        },
        scrollToElement: function(){
            if (debugMode) {
                console.info(labelLib + 'Scroll to element');
            }
            $(this).get(0).scrollIntoView();
        },
        registerCallback: function(identifier, fn) {
            if (debugMode) {
                console.info(labelLib + 'Register a callback. Identifier: ' + identifier);
            }
            callbacks[identifier] = fn;
        },
        actions: function(){
            if (debugMode) {
                console.info(labelLib + 'Attach actions.');
            }
            function findModuleAndController(element, fnc)
            {
                var controller = $(element).closest('[data-ml-controller]').data('ml-controller');
                var module = $(element).closest('[data-ml-module]').data('ml-module');
                if (typeof modules[module] === 'undefined') {
                    console.warn(labelLib + 'Module "' + module + '" is not defined');
                    return true;
                }
                if (typeof modules[module].controllers[controller] === 'undefined') {
                    console.warn(labelLib + 'Controller "' + controller + '" on module "' + module + '" is not defined');
                    return true;
                } else {
                    if (typeof modules[module].controllers[controller][fnc] === 'undefined') {
                        console.warn(labelLib + 'Controller "' + controller + '" on module "' + module + '" with function "' + fnc + '" is not defined');
                        return true;
                    }
                }
                return false;
            }
            this.each(function(){
                $(this).on('click', function(event){
                    var tabAction = $(this).data('ml-action'),
                        controller = $(this).closest('[data-ml-controller]').data('ml-controller'),
                        module = $(this).closest('[data-ml-module]').data('ml-module');
                    var error = findModuleAndController(this, tabAction);
                    if (debugMode) {
                        console.info(labelLib + 'Click event executed for module: ' + module + ' controller: ' + controller + ' action: ' + tabAction);
                    }
                    if (error === false) {
                        if (tabAction.indexOf(',') !== -1) {
                            var tabActions = tabAction.split(',');
                            for (var i = 0; i < tabActions.length; i++) {
                                modules[module].controllers[controller][tabActions[i]](this, event);
                            }
                        } else {
                            modules[module].controllers[controller][tabAction](this, event);
                        }
                    } else {
                        console.warn(labelLib + error);
                    }
                });
            });
        },
        /* MOONLIGHTUI - MVC mechanism */
        module: function(name) {
            tempModule = name;
            if (typeof modules[name] === 'undefined') {
                if (debugMode) {
                    console.info(labelLib + 'Created module: ' + name);
                }
                modules[name] = {
                    controllers: {},
                    models: {},
                    views: {}
                };
            }
            return this;
        },
        controller: function(name, controller) {
            var ctrl = controller(),
                module = tempModule.slice(0);
            ctrl.__module = module;
            modules[tempModule].controllers[name] = ctrl;
            if (debugMode) {
                console.info(labelLib + 'Created controller: ' + name);
            }
            return this;
        },
        view: function(name, view, render) {
            var vw = view(),
                engine = this,
                module = tempModule.slice(0),
                routeSet = false;
            if (typeof vw.routeUrl !== '') {
                for(var i = 0; i < routes.length; i++) {
                    if (routes[i].url === vw.routeUrl) {
                        console.error(labelLib + 'Already have a route configured with: ' + routes[i].url + ' in module ' + routes[i].module + ' in view ' + routes[i].view);
                        routeSet = true;
                        break;
                    }
                }
                if (routeSet === false) {
                    routes.push({
                        'url': vw.routeUrl,
                        'module': module,
                        'name': name
                    });
                }
            }
            vw.__name = name;
            vw.__error = '';
            vw.__module = module;
            vw.__template = false;
            vw.__containerId = false;
            vw.__container = false;
            vw.__models = false;
            vw.__initialized = false;
            vw.__cached = '';
            vw.__cachedOptions = {},
            vw.__usecached = false;
            vw.__render = function(html) {
                return html;
            };
            vw.refresh = function() {
                if (debugMode) {
                    console.info(labelLib + 'Refreshing module: ' + module + ' view: ' + name);
                }
                modules[module].views[name].__container.html(modules[module].views[name].__cached);
                if (modules[module].views[name].__initialized === true) {
                    engine.reenergize(modules[module].views[name].container);
                } else {
                    engine.energize(modules[module].views[name].container);
                }
            };
            vw.reset = function() {
                if (debugMode) {
                    console.info(labelLib + 'Reset module: ' + module + ' view: ' + name);
                }
                modules[module].views[name].__container.html('');
            };
            vw.useCache = function(value){
                vw.__usecached = value;
            };
            vw.renderCached = function(cb) {
                if (debugMode) {
                    console.info(labelLib + 'Render module: ' + module + ' view: ' + name);
                }
                modules[module].views[name].__container = $(modules[module].views[name].container);
                modules[module].views[name].__container.html('<div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-red"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-yellow"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-green"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>');
                if (typeof cb === "undefined") {
                    modules[module].views[name].__container = $(modules[module].views[name].container);
                    modules[module].views[name].__container.html(modules[module].views[name].__cached);
                    if (modules[module].views[name].__initialized === true) {
                        engine.reenergize(modules[module].views[name].container);
                    } else {
                        engine.energize(modules[module].views[name].container);
                    }
                } else {
                    modules[module].views[name].__container = $(modules[module].views[name].container);
                    modules[module].views[name].__container.html(modules[module].views[name].__cached);
                    if (modules[module].views[name].__initialized === true) {
                        engine.reenergize(modules[module].views[name].container);
                    } else {
                        engine.energize(modules[module].views[name].container);
                    }
                    cb(modules[module].views[name].__template, modules[module].views[name].__container);
                }
            };
            vw.render = function(cb, options) {
                if (typeof options !== 'undefined') {
                    vw.__cachedOptions = options;
                }
                if (debugMode) {
                    console.info(labelLib + 'Render module: ' + module + ' view: ' + name);
                }
                if (vw.__usecached === true && modules[module].views[name].__cached !== '') {
                    vw.renderCached(cb);
                } else {
                    modules[module].views[name].__container = $(modules[module].views[name].container);
                    modules[module].views[name].__container.html('<div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-red"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-yellow"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div><div class="spinner-layer spinner-green"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>');
                    modules[module].views[name].__cached = modules[module].views[name].__container.html();
                    if (typeof cb === "undefined") {
                        modules[module].views[name].__container = $(modules[module].views[name].container);
                        modules[module].views[name].__container.html(modules[module].views[name].__render(modules[module].views[name].__template));
                        modules[module].views[name].__cached = modules[module].views[name].__container.html();
                        if (modules[module].views[name].__initialized === true) {
                            engine.reenergize(modules[module].views[name].container);
                        } else {
                            engine.energize(modules[module].views[name].container);
                        }
                    } else {
                        modules[module].views[name].__loadTemplate(function () {
                            modules[module].views[name].__container = $(modules[module].views[name].container);
                            modules[module].views[name].__container.html(modules[module].views[name].__render(modules[module].views[name].__template));
                            modules[module].views[name].__cached = modules[module].views[name].__container.html();
                            if (modules[module].views[name].__initialized === true) {
                                engine.reenergize(modules[module].views[name].container);
                            } else {
                                engine.energize(modules[module].views[name].container);
                            }
                            cb(modules[module].views[name].__template, modules[module].views[name].__container);
                        }, options);
                    }
                }
            };
            vw.__loadTemplate = function(cb, options) {
                if (typeof modules[module].views[name].templateURL !== 'undefined') {
                    var ajaxOptions = {
                        url: modules[module].views[name].templateURL,
                        type: 'GET'
                    };
                    if (typeof options !== 'undefined' && typeof options.data !== 'undefined') {
                        ajaxOptions.type = 'POST';
                        ajaxOptions.data = {
                            data: options.data
                        };
                        if (typeof window.mlui_cfg.csrf_token !== 'undefined') {
                            ajaxOptions.data._token = window.mlui_cfg.csrf_token;
                        }
                    }
                    $.ajax(ajaxOptions).done(function(data){
                        if (debugMode) {
                            console.info(labelLib + 'Loadtemplate completed module: ' + module + ' view: ' + name);
                        }
                        modules[module].views[name].__template = data;
                        if (typeof cb !== "undefined") {
                            cb(data);
                        } else {
                            return data;
                        }
                    }).fail(function(){
                        console.warn(labelLib + 'We cant load template with url: ' + this.templateURL);
                        if (typeof cb !== "undefined") {
                            cb("");
                        } else {
                            return "";
                        }
                    });
                }
                if (typeof this.template !== 'undefined') {
                    if (debugMode) {
                        console.info(labelLib + 'Set the template from a string module: ' + module + ' view: ' + name + ' template: ' + this.template);
                    }
                    modules[module].views[name].__template = this.template;
                    if (typeof cb !== "undefined") {
                        cb(this.template);
                    } else {
                        return this.template;
                    }
                }
                return this.__template;
            };
            vw.__loadModels = function(cb) {
                if (typeof this.models !== 'undefined') {
                    if (debugMode) {
                        console.info(labelLib + 'Load models on view: ' + module + ' view: ' + name + ' models: ');
                        console.info(this.models);
                    }
                    modules[module].views[name].__models = this.models;
                }
                cb();
            };
            modules[module].views[name] = vw;
            if (debugMode) {
                console.info(labelLib + 'Created view: ' + name);
            }
            return this;
        },
        model: function(name, model) {
            // Instantiate new model
            var mdl = model(),
                module = tempModule.slice(0);

            function searchFor(param, key, nameOfObject) {
                var value = param[key];
                $('[data-ml-module="' + mdl.__module + '"').find('[data-ml-model="' + mdl.__name + '.' + nameOfObject + '.' + key + '"]').each(function () {
                    if ($(this).is(":checkbox")) {
                        if (value === 1) {
                            $(this).prop('checked', true);
                        } else {
                            $(this).prop('checked', false);
                        }
                    }
                    if ($(this).is("input") ||
                        $(this).is("textarea") ||
                        $(this).is("select") ||
                        $(this).is(":radio")) {
                        $(this).val(param[key]);
                    } else {
                        $(this).html(param[key]);
                    }
                });
            }

            // Attach new variables and new functions. Will override existing functions.
            mdl.__name = name;
            mdl.__error = '';
            mdl.__module = module;
            mdl.removeError = function() {
                if (debugMode) {
                    console.info(labelLib + 'Remove error: ' + module + ' model: ' + name);
                }
                modules[module].models[name].__error = '';
                $('[data-ml-module="' + module+ '"]').find('[data-ml-error="' + name + '.error"]').each(function() {
                    if ($(this).is( "input" ) ||
                        $(this).is( "textarea" ) ||
                        $(this).is( "select" ) ||
                        $(this).is( "checkbox" ) ||
                        $(this).is( "radio" )) {
                        $(this).val('');
                    } else {
                        $(this).html('');
                    }
                    $(this).addHidden();
                });
            };
            mdl.addError = function(value) {
                if (debugMode) {
                    console.info(labelLib + 'Add error: ' + module + ' model: ' + name);
                }
                modules[module].models[name].__error = value;
                $('[data-ml-module="' + module+ '"]').find('[data-ml-error="' + name + '.error"]').each(function() {
                    if ($(this).is( "input" ) ||
                        $(this).is( "textarea" ) ||
                        $(this).is( "select" ) ||
                        $(this).is( "checkbox" ) ||
                        $(this).is( "radio" )) {
                        $(this).val(modules[module].models[name].__error);
                    } else {
                        $(this).html(modules[module].models[name].__error);
                    }
                    $(this).removeHidden();
                });
            };
            mdl.getError = function(value) {
                if (debugMode) {
                    console.info(labelLib + 'Get error: ' + module + ' model: ' + name + ' value: ');
                    console.info(value);
                }
                return modules[module].models[name].__error;
            };
            mdl.bind = function(param) {
                var obj = mdl.get(param);
                mdl.set(obj, param);
            };
            mdl.get = function(param, defaultValue) {
                if (debugMode) {
                    console.info(labelLib + 'Get: ' + module + ' model: ' + name + ' default value: ');
                    console.info(defaultValue);
                }
                if (typeof defaultValue === 'undefined') {
                    defaultValue = '';
                }
                if (typeof modules[module].models[name][param] !== 'undefined') {
                    return modules[module].models[name][param];
                } else {
                    console.warn(labelLib + 'Model "' + mdl.__name + '" in module "' + mdl.__module + '" does not have property "' + param + '"');
                    return defaultValue;
                }
            };
            mdl.set = function(param, value) {
                if (debugMode) {
                    console.info(labelLib + 'Set: ' + module + ' model: ' + name + ' value: ');
                    console.info(value);
                }
                if (typeof param === 'object') {
                    for (var key in param) {
                        if (param.hasOwnProperty(key)) {
                            mdl[key] = param[key];
                            searchFor(param, key, value);
                        }
                    }
                } else {
                    mdl[param] = value;
                    $('[data-ml-module="' + mdl.__module + '"').find('[data-ml-model="' + mdl.__name + '.' + param + '"]').each(function () {
                        if ($(this).is(":checkbox")) {
                            if (value === 1) {
                                $(this).prop('checked', true);
                            } else {
                                $(this).prop('checked', false);
                            }
                        }
                        if ($(this).is("input") ||
                            $(this).is("textarea") ||
                            $(this).is("select") ||
                            $(this).is(":radio")) {
                            $(this).val(value);
                        } else {
                            $(this).html(value);
                        }
                    });
                }
            };
            mdl.__on = false;
            mdl.receive = function(cb) {
                if (debugMode) {
                    console.info(labelLib + 'Set receive module: ' + module + ' model: ' + name);
                }
                mdl.__on = cb;
            };
            mdl.__broadcast = function(model, param){
                if (debugMode) {
                    console.info(labelLib + 'Broadcast: ' + module + ' model: ' + name);
                }
                $('[data-ml-module="' + module+ '"]').find('[data-ml-model="' + model + '.' + param + '"]').each(function() {
                    var modelParameter = [];
                    if (param.indexOf('.') !== -1) {
                        modelParameter = param.split('.');
                    }
                    if ($(this).is( ":checkbox" )) {
                        $(this).prop('checked', modules[module].models[model][param]);
                        if (modelParameter.length > 1) {
                            $(this).prop('checked', modules[module].models[model][modelParameter[1]][modelParameter[2]]);
                        } else {
                            $(this).prop('checked', modules[module].models[model][param]);
                        }
                    }
                    if ($(this).is( "input" ) ||
                        $(this).is( "textarea" ) ||
                        $(this).is( "select" ) ||
                        $(this).is( ":radio" )) {
                        if (modelParameter.length > 1) {
                            modules[module].models[model][modelParameter[1]][modelParameter[2]] = $(this).val();
                        } else {
                            modules[module].models[model][param] = $(this).val();
                        }
                    } else {
                        $(this).html(modules[module].models[model][param]);
                    }
                });
                if (modules[module].models[model].__on !== false) {
                    modules[module].models[model].__on(param);
                }
            };
            mdl.__initTwoWayBinding = function(){
                if (debugMode) {
                    console.info(labelLib + 'Init two-way databinding module: ' + module + ' model: ' + name);
                }
                // Attach two-way databinding
                $('[data-ml-module="' + module+ '"]').find('[data-ml-model*="' + name + '."]').each(function(){
                    if ($(this).data('ml-model').indexOf('.') !== -1) {
                        var modelParameter = $(this).data('ml-model').split('.'),
                            model = modelParameter[0];
                            modelParameter.shift();
                        var param = modelParameter[0];
                        if ($(this).is( ":checkbox" )) {
                            if (modelParameter.length > 1) {
                                if (modules[module].models[model][modelParameter[0]][modelParameter[1]] === true)
                                {
                                    $(this).prop('checked', true);
                                } else {
                                    $(this).prop('checked', false);
                                }
                            } else {
                                if (modules[module].models[model][param] === true)
                                {
                                    $(this).prop('checked', true);
                                } else {
                                    $(this).prop('checked', false);
                                }
                            }
                            $(this).on('click', function () {
                                if (modelParameter.length > 1) {
                                    modules[module].models[model][modelParameter[0]][modelParameter[1]] =  $(this).prop('checked');
                                    modules[module].models[model].__broadcast(model, modelParameter.join('.'));
                                } else {
                                    modules[module].models[model][param] = $(this).prop('checked');
                                    modules[module].models[model].__broadcast(model, param);
                                }
                            });
                        }
                        if ($(this).is( ":radio" )) {
                            if (modelParameter.length > 1) {
                                if (modules[module].models[model][modelParameter[0]][modelParameter[1]] === true)
                                {
                                    $(this).prop('checked', true);
                                } else {
                                    $(this).prop('checked', false);
                                }
                            } else {
                                if (modules[module].models[model][param] === true)
                                {
                                    $(this).prop('checked', true);
                                } else {
                                    $(this).prop('checked', false);
                                }
                            }
                            $(this).on('click', function () {
                                if ($(this).prop('checked')) {
                                    if (modelParameter.length > 1) {
                                        modules[module].models[model][modelParameter[0]][modelParameter[1]] = $(this).prop();
                                        modules[module].models[model].__broadcast(model, modelParameter.join('.'));
                                    } else {
                                        modules[module].models[model][param] = $(this).val();
                                        modules[module].models[model].__broadcast(model, param);
                                    }
                                }
                            });
                        }
                        if ($(this).is( "input" ) ||
                            $(this).is( "textarea" ) ||
                            $(this).is( "select" ) ) {
                            $(this).val(modules[module].models[model][param]);
                            if ($(this).is( "input" ) || $(this).is( "textarea" )) {
                                $(this).on('keyup', function () {
                                    if (modelParameter.length > 1) {
                                        modules[module].models[model][modelParameter[0]][modelParameter[1]] = $(this).val();
                                        modules[module].models[model].__broadcast(model, modelParameter.join('.'));
                                    } else {
                                        modules[module].models[model][param] = $(this).val();
                                        modules[module].models[model].__broadcast(model, param);
                                    }
                                });
                            }
                            if ($(this).is( "select" )) {
                                $(this).on('change', function () {
                                    if (modelParameter.length > 1) {
                                        modules[module].models[model][modelParameter[0]][modelParameter[1]] = $(this).val();
                                        modules[module].models[model].__broadcast(model, modelParameter.join('.'));
                                    } else {
                                        modules[module].models[model][param] = $(this).val();
                                        modules[module].models[model].__broadcast(model, param);
                                    }
                                });
                            }

                        } else {
                            if (modelParameter.length > 1) {
                                $(this).html(modules[module].models[model][modelParameter[0]][modelParameter[1]]);
                            } else {
                                $(this).html(modules[module].models[model][param]);
                            }
                        }
                    } else {
                        console.warn(labelLib + 'You must specify a model and its parameter (example "modelName.param") in the ml-model attribute. I got: ' + $(this).data('ml-model') + ' in module "' + module + '"');
                    }
                });
            };
            mdl.strip = function(obj) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        switch (typeof obj[key]) {
                            case "object":
                                if (Array.isArray(obj[key])) {
                                    obj[key] = [];
                                } else {
                                    if (Object.prototype.toString.call(obj[key]) === '[object Date]') {
                                        obj[key] = new Date();
                                    } else {
                                        if (Object.prototype.toString.call(obj[key]) === '[object Boolean]') {
                                            obj[key] = false;
                                        } else {
                                            if (Object.prototype.toString.call(obj[key]) === '[object Number]') {
                                                obj[key] = 0;
                                            } else {
                                                if (Object.prototype.toString.call(obj[key]) === '[object String]') {
                                                    obj[key] = '';
                                                } else {
                                                    if (Object.prototype.toString.call(obj[key]) === '[object Function]') {
                                                        obj[key] = function() {};
                                                    } else {
                                                        obj[key] = {};
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                break;
                            case "boolean":
                                obj[key] = false;
                                break;
                            case "string":
                                obj[key] = '';
                                break;
                        }
                    }
                }
                return obj;
            };
            mdl.init = function() {
                mdl.__initTwoWayBinding();
            };

            // Save model into the module.
            modules[module].models[name] = mdl;

            mdl.__initTwoWayBinding();

            if (debugMode) {
                console.info(labelLib + 'Created model: ' + name);
            }
            return this;
        },
        getModule: function(name)
        {
            if (typeof modules[name] !== 'undefined') {
                if (debugMode) {
                    console.info(labelLib + 'Get model: ' + name);
                }
                return modules[name];
            }
        },
        getModel: function(parent, name)
        {
            if (typeof modules[parent].models[name] !== 'undefined') {
                if (debugMode) {
                    console.info(labelLib + 'Get model: ' + name);
                }
                return modules[parent].models[name];
            }
        },
        getController: function(parent, name)
        {
            if (typeof modules[parent].controllers[name] !== 'undefined') {
                if (debugMode) {
                    console.info(labelLib + 'Get controller: ' + name);
                }
                return modules[parent].controllers[name];
            }
        },
        getView: function(parent, name)
        {
            if (typeof modules[parent].views[name] !== 'undefined') {
                if (debugMode) {
                    console.info(labelLib + 'Get view: ' + name);
                }
                return modules[parent].views[name];
            }
        },
        showComponents: function() {
            if (debugMode) {
                console.info(labelLib + 'Init showComponents');
            }
            $(this).each(function(){
                $(this).on('click', function(){
                    var show = $(this).data('ml-show');
                    if (show.indexOf(',') !== -1) {
                        var elements = show.split(',');
                        for (var i = 0; i < elements.length; i++) {
                            if (debugMode) {
                                console.info(labelLib + 'Show component: ' + elements[i]);
                            }
                            $('#' + elements[i]).removeClass('hidden');
                        }
                    } else {
                        if (debugMode) {
                            console.info(labelLib + 'Show component: ' + show);
                        }
                        $('#' + show).removeClass('hidden');
                    }
                });
            });
        },
        hideComponents: function() {
            if (debugMode) {
                console.info(labelLib + 'Init hideComponents');
            }
            $(this).each(function(){
                $(this).on('click', function(){
                    var hide = $(this).data('ml-hide');
                    if (hide.indexOf(',') !== -1) {
                        var elements = hide.split(',');
                        for (var i = 0; i < elements.length; i++) {
                            if (debugMode) {
                                console.info(labelLib + 'Hide component: ' + elements[i]);
                            }
                            $('#' + elements[i]).addClass('hidden');
                        }
                    } else {
                        if (debugMode) {
                            console.info(labelLib + 'Hide component: ' + hide);
                        }
                        $('#' + hide).addClass('hidden');
                    }
                });
            });
        },
        createCookie: function(name, value, days) {
            if (debugMode) {
                console.info(labelLib + 'Create cookie name: ' + name + ' value: ' + JSON.stringify(value) + ' days: ' + days);
            }
            var dateVal, expiresVal;
            if (days) {
                dateVal = new Date();
                dateVal.setTime(dateVal.getTime() + (days * 24 * 60 * 60 * 1000));
                expiresVal = "; expires=" + dateVal.toGMTString();
            } else {
                expiresVal = "";
            }
            document.cookie = name + "=" + value + expiresVal + "; path=/";
        },
        readCookie: function(name) {
            if (debugMode) {
                console.info(labelLib + 'Read cookie name: ' + name);
            }
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            var c = 0;
            for (var i = 0; i < ca.length; i++) {
                c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) {
                        return c.substring(nameEQ.length, c.length);
                    }
                }
            }
            return null;
        },
        eraseCookie: function(name) {
            if (debugMode) {
                console.info(labelLib + 'Erase cookie name: ' + name);
            }
            this.createCookie(name, "", -1);
        },
        /* MOONLIGHTUI - Lets GO */
        deenergize: function(element) {
            if (debugMode) {
                console.info(labelLib + 'DE-ENERGIZE');
            }

            // Attach actions and clicks again.
            $(element).find('[data-ml-action]').off();

            /* Detach all events */
            $(element).off();

            /* Detach two-way databinding */
            $(element).find('[data-ml-model]').off();
        },
        reenergize: function(element) {
            if (debugMode) {
                console.info(labelLib + 'RE-ENERGIZE');
            }
            this.deenergize(element);
            $(element).energize(element);
        },
        energize: function(element) {
            if (debugMode) {
                console.info(labelLib + 'ENERGIZE');
            }
            $(element).find('[data-ml-action]').actions();
        },
        doGET: function(options, done, error){
            if (debugMode) {
                console.info(labelLib + 'doGET ' + JSON.stringify(options));
            }
            if (typeof window.mlui_cfg.jwt_token !== 'undefined') {
                $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                    jqXHR.setRequestHeader('X-CSRF-Token', window.mlui_cfg.jwt_token);
                    jqXHR.setRequestHeader('X-XSRF-TOKEN', window.mlui_cfg.jwt_token);
                    jqXHR.setRequestHeader('Authorization', 'Bearer ' + window.mlui_cfg.jwt_bearer);
                    options.async = true;
                });
            }
            $.ajax(options).done(function() {
                done();
            }).fail(function() {
                error();
            });
        },
        doPUT: function(options, done, error){
            if (debugMode) {
                console.info(labelLib + 'doPUT ' + JSON.stringify(options));
            }
            this.doPOSTPUTDELETE('PUT', options, done, error);
        },
        doPOST: function(options, done, error){
            if (debugMode) {
                console.info(labelLib + 'doPOST ' + JSON.stringify(options));
            }
            this.doPOSTPUTDELETE('POST', options, done, error);
        },
        doDELETE: function(options, done, error){
            if (debugMode) {
                console.info(labelLib + 'doDELETE ' + JSON.stringify(options));
            }
            this.doPOSTPUTDELETE('DELETE', options, done, error);
        },
        doPOSTPUTDELETE: function(type, options, done, error) {
            if (typeof options.data === 'undefined') {
                options.data = {};
            }
            if (typeof window.mlui_cfg.jwt_token !== 'undefined') {
                $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                    jqXHR.setRequestHeader('X-CSRF-Token', window.mlui_cfg.jwt_token);
                    jqXHR.setRequestHeader('X-XSRF-TOKEN', window.mlui_cfg.jwt_token);
                    jqXHR.setRequestHeader('Authorization', 'Bearer ' + window.mlui_cfg.jwt_bearer);
                    options.async = true;
                });
            } else {
                if (typeof window.mlui_cfg.csrf_token !== 'undefined') {
                    options.data._token = window.mlui_cfg.csrf_token;
                }
            }
            options.method = type;
            options.data = JSON.stringify(options.data);
            options.contentType = 'application/json; charset=utf-8';
            options.dataType = 'json';
            options.async = false;
            $.ajax(options).done(function(data) {
                done(data);
            }).fail(function() {
                error();
            });
        }
    });
    window.$ml = window.moonlightui = $.noConflict();
}));