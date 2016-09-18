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
        tempModule;
    $.fn.extend({
        /* MOONLIGHTUI - System */
        onready: function(cb) {
            $(document).ready(function() {
                cb();
            });
        },
        url: window.location,
        /* MOONLIGHTUI - Interaction from modules and controller */
        removeSelect: function(){
            $(this).each(function(){
                $(this).removeClass('selected');
            });
        },
        addSelect: function(){
            $(this).each(function(){
                $(this).addClass('selected');
            });
        },
        removeHidden: function(){
            $(this).each(function(){
                $(this).removeClass('hidden');
            });
        },
        addHidden: function(){
            $(this).each(function(){
                $(this).addClass('hidden');
            });
        },
        removeErrorInput: function(){
            $(this).each(function(){
                $(this).removeClass('error-input');
            });
        },
        addErrorInput: function(){
            $(this).each(function(){
                $(this).addClass('error-input');
            });
        },
        registerCallback: function(identifier, fn) {
            callbacks[identifier] = fn;
        },
        actions: function(){
            function findModuleAndController(element, fnc)
            {
                var controller = $(element).closest('[data-ml-controller]').data('ml-controller');
                var module = $(element).closest('[data-ml-module]').data('ml-module');
                if (typeof modules[module] === 'undefined') {
                    console.warn('MOONLIGHTUI - Module "' + module + '" is not defined');
                    return true;
                }
                if (typeof modules[module].controllers[controller] === 'undefined') {
                    console.warn('MOONLIGHTUI - Controller "' + controller + '" on module "' + module + '" is not defined');
                    return true;
                } else {
                    if (typeof modules[module].controllers[controller][fnc] === 'undefined') {
                        console.warn('MOONLIGHTUI - Controller "' + controller + '" on module "' + module + '" with function "' + fnc + '" is not defined');
                        return true;
                    }
                }
                return false;
            }
            this.each(function(){
                $(this).on('click', function(){
                    var tabAction = $(this).data('ml-action'),
                        controller = $(this).closest('[data-ml-controller]').data('ml-controller'),
                        module = $(this).closest('[data-ml-module]').data('ml-module');
                    var error = findModuleAndController(this, tabAction);
                    if (error === false) {
                        if (tabAction.indexOf(',') !== -1) {
                            var tabActions = tabAction.split(',');
                            for (var i = 0; i < tabActions.length; i++) {
                                modules[module].controllers[controller][tabActions[i]](this);
                            }
                        } else {
                            modules[module].controllers[controller][tabAction](this);
                        }
                    }
                });
            });
        },
        /* MOONLIGHTUI - MVC mechanism */
        module: function(name) {
            tempModule = name;
            if (typeof modules[name] === 'undefined') {
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
            return this;
        },
        view: function(name, view) {
            var vw = view(),
                engine = this,
                module = tempModule.slice(0);
            vw.__name = name;
            vw.__error = '';
            vw.__module = module;
            vw.__template = false;
            vw.__containerId = false;
            vw.__container = false;
            vw.__models = false;
            vw.__initialized = false;
            vw.__render = function(html) {
                return html;
            };
            vw.render = function(cb) {
                if (modules[module].views[name].__template === false) {
                    console.warn(
                        'MOONLIGHTUI - The template is eighter not set with the variable "template" or "templateURL".'
                    );
                }
                if (modules[module].views[name].__container === false) {
                    console.warn(
                        'MOONLIGHTUI - The view does not have a property "container". Inside the variable "container" needs to be a CSS selector for an HTML element.'
                    );
                }
                if (typeof cb === "undefined") {
                    modules[module].views[name].__container.html(modules[module].views[name].__render(modules[module].views[name].__template));
                    if (modules[module].views[name].__initialized === true) {
                        engine.reenergize(modules[module].views[name].container);
                    } else {
                        engine.energize(modules[module].views[name].container);
                    }
                } else {
                    modules[module].views[name].__loadTemplate(function(){
                        modules[module].views[name].__container.html(modules[module].views[name].__render(modules[module].views[name].__template));
                        if (modules[module].views[name].__initialized === true) {
                            engine.reenergize(modules[module].views[name].container);
                        } else {
                            engine.energize(modules[module].views[name].container);
                        }
                        cb(modules[module].views[name].__template, modules[module].views[name].__container);
                    });
                }
            };
            vw.__loadTemplate = function(cb) {
                if (typeof modules[module].views[name].templateURL !== 'undefined') {
                    $.ajax({
                        url: modules[module].views[name].templateURL,
                        type: 'GET'
                    }).done(function(data){
                        modules[module].views[name].__template = data;
                        if (typeof cb !== "undefined") {
                            cb(data);
                        } else {
                            return data;
                        }
                    }).fail(function(){
                        console.warn('MOONLIGHTUI - We cant load template with url: ' + this.templateURL);
                        if (typeof cb !== "undefined") {
                            cb("");
                        } else {
                            return "";
                        }
                    });
                }
                if (typeof this.template !== 'undefined') {
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
                    modules[module].views[name].__models = this.models;
                }
                cb();
            };
            vw.__init = function() {
                if (typeof modules[module].views[name].container !== 'undefined') {
                    modules[module].views[name].__container = $(modules[module].views[name].container);
                }
                var self = this;
                this.__loadTemplate(function(){
                    self.__loadModels(function(){
                        self.render();
                        self.__initialized = true;
                    });
                });
            };
            modules[module].views[name] = vw;
            vw.__init();
            return this;
        },
        model: function(name, model) {
            // Instantiate new model
            var mdl = model(),
                module = tempModule.slice(0);

            // Attach new variables and new functions. Will override existing functions.
            mdl.__name = name;
            mdl.__error = '';
            mdl.__module = module;
            mdl.removeError = function() {
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
                return modules[module].models[name].__error;
            };
            mdl.get = function(param, defaultValue) {
                if (typeof defaultValue === 'undefined') {
                    defaultValue = '';
                }
                if (typeof modules[module].models[name][param] !== 'undefined') {
                    return modules[module].models[name][param];
                } else {
                    console.warn('MOONLIGHTUI - Model "' + mdl.__name + '" in module "' + mdl.__module + '" does not have property "' + param + '"');
                    return defaultValue;
                }
            };
            mdl.set = function(param, value) {
                mdl[param] = value;
                $('[data-ml-module="' + mdl.__module + '"').find('[data-ml-model="' + mdl.__name + '.' + param + '"]').each(function()
                {
                    if ($(this).is( "input" ) ||
                        $(this).is( "textarea" ) ||
                        $(this).is( "select" ) ||
                        $(this).is( "checkbox" ) ||
                        $(this).is( "radio" )) {
                        $(this).val(value);
                    } else {
                        $(this).html(value);
                    }
                });
            };
            mdl.__on = {};
            mdl.receive = function(cb) {
                mdl.__on = cb;
            };
            mdl.__broadcast = function(model, param){
                $('[data-ml-module="' + module+ '"]').find('[data-ml-model="' + model + '.' + param + '"]').each(function() {
                    if ($(this).is( "input" ) ||
                        $(this).is( "textarea" ) ||
                        $(this).is( "select" ) ||
                        $(this).is( "checkbox" ) ||
                        $(this).is( "radio" )) {
                        $(this).val(modules[module].models[model][param]);
                    } else {
                        $(this).html(modules[module].models[model][param]);
                    }
                });
                modules[module].models[model].__on(param);
            };
            mdl.__initTwoWayBinding = function(){
                // Attach two-way databinding
                $('[data-ml-module="' + module+ '"]').find('[data-ml-model*="' + name + '."]').each(function(){
                    if ($(this).data('ml-model').indexOf('.') !== -1) {
                        var modelParameter = $(this).data('ml-model').split('.'),
                            model = modelParameter[0],
                            param = modelParameter[1];
                        if ($(this).is( "input" ) ||
                            $(this).is( "textarea" ) ||
                            $(this).is( "select" ) ||
                            $(this).is( "checkbox" ) ||
                            $(this).is( "radio" )) {
                            $(this).val(modules[module].models[model][param]);
                            if ($(this).is( "input" ) || $(this).is( "textarea" )) {
                                $(this).on('keyup', function () {
                                    modules[module].models[model][param] = $(this).val();
                                    modules[module].models[model].__broadcast(model, param);
                                });
                            }
                            if ($(this).is( "select" ) ||
                                $(this).is( "checkbox" ) ||
                                $(this).is( "radio" )) {
                                $(this).on('change', function () {
                                    modules[module].models[model][param] = $(this).val();
                                    modules[module].models[model].__broadcast(model, param);
                                });
                            }
                        } else {
                            $(this).html(modules[module].models[model][param]);
                        }
                    } else {
                        console.warn('MOONLIGHTUI - You must specify a model and its parameter (example "modelName.param") in the ml-model attribute. I got: ' + $(this).data('ml-model') + ' in module "' + module + '"');
                    }
                });
            };

            // Save model into the module.
            modules[module].models[name] = mdl;

            mdl.__initTwoWayBinding();


            return this;
        },
        getModel: function(parent, name)
        {
            if (typeof modules[parent].models[name] !== 'undefined') {
                return modules[parent].models[name];
            }
        },
        getController: function(parent, name)
        {
            if (typeof modules[parent].controllers[name] !== 'undefined') {
                return modules[parent].controllers[name];
            }
        },
        getView: function(parent, name)
        {
            if (typeof modules[parent].views[name] !== 'undefined') {
                return modules[parent].views[name];
            }
        },
        showComponents: function() {
            $(this).each(function(){
                $(this).on('click', function(){
                    var show = $(this).data('ml-show');
                    if (show.indexOf(',') !== -1) {
                        var elements = show.split(',');
                        for (var i = 0; i < elements.length; i++) {
                            $('#' + elements[i]).removeClass('hidden');
                        }
                    } else {
                        $('#' + show).removeClass('hidden');
                    }
                });
            });
        },
        hideComponents: function() {
            $(this).each(function(){
                $(this).on('click', function(){
                    var hide = $(this).data('ml-hide');
                    if (hide.indexOf(',') !== -1) {
                        var elements = hide.split(',');
                        for (var i = 0; i < elements.length; i++) {
                            $('#' + elements[i]).addClass('hidden');
                        }
                    } else {
                        $('#' + hide).addClass('hidden');
                    }
                });
            });
        },
        /* MOONLIGHTUI - Lets GO */
        reenergize: function(element) {

            // Attach actions and clicks again.
            $(element).find('[data-ml-action]').off();

            $(element).energize(element);

        },
        energize: function(element) {

            /* MOONLIGHT UI - Will activate all custom click */
            $(element).find('[data-ml-action]').actions();

        }
    });
    window.$ml = window.moonlightui = $.noConflict();
}));