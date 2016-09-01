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
            jsPlumb.ready(cb);
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
        scrollToElement: function(){
            $(this).get(0).scrollIntoView();
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
        /* MOONLIGHTUI - UI components */
        tabs : function() {
            $(this).each(function(){
                $(this).on('click', function(){
                    $(this).parent().find('.active').removeClass('active');
                    $(this).addClass('active');
                    var tab = $(this).data('ml-tab');
                    $('#' + tab).parent().find('.active').removeClass('active');
                    $('#' + tab).addClass('active');
                });
            });
        },
        tabSwitch : function() {
            $(this).each(function(){
                $(this).on('click', function(){
                    var collection = $(this).data('ml-tab-switch');
                    var tab = {};
                    if (collection.indexOf(',') !== -1) {
                        var tabs = collection.split(',');
                        for (var i = 0; i < tabs.length; i++) {
                            $('#' + tabs[i]).parent().find('.active').removeClass('active');
                            $('#' + tabs[i]).addClass('active');
                            tab = $('#' + tabs[i]).data('ml-tab');
                            $('#' + tab).parent().find('.active').removeClass('active');
                            $('#' + tab).addClass('active');
                        }
                    } else {
                        $('#' + collection).parent().find('.active').removeClass('active');
                        $('#' + collection).addClass('active');
                        tab = $('#' + collection).data('ml-tab');
                        $('#' + tab).parent().find('.active').removeClass('active');
                        $('#' + tab).addClass('active');
                    }
                });
            });
        },
        buttons : function() {
            $(this).each(function() {
                $(this).on('mousedown', function () {
                    $(this).addClass('down');
                });
                $(this).on('mouseup', function () {
                    $(this).removeClass('down');
                    if (typeof $(this).data('click') !== 'undefined') {
                        var click = $(this).data('click');
                        click();
                    }
                });
            });
        },
        trees: function(){
            $(this).each(function(){
                $(this).jstree();
                $(this).removeClass('hidden');
            });
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
        draggableComponents: function(){
            $('.moonlightui-layout-left').droppable({
                accept: '.moonlightui-component',
                drop: function (event, ui) {
                    $(this).append(ui.draggable);
                }
            });
            $('.moonlightui-layout-right').droppable({
                accept: '.moonlightui-component',
                drop: function (event, ui) {
                    $(this).append(ui.draggable);
                }
            });

            /* Draggable */
            $('.moonlightui-component-draggable').draggable({revert: true, scroll: false});
        },
        tooltips: function() {
            $('[data-ml-tooltip-active="true"]').on('mouseover', function () {
                var title = $(this).data('ml-tooltip');
                $('.moonlightui-tooltip').html(title);
                $('.moonlightui-tooltip').removeClass('hidden');
            });
            $('[data-ml-tooltip-active="true"]').on('mousemove', function (event) {
                $('.moonlightui-tooltip').css('left', event.pageX + 'px');
                $('.moonlightui-tooltip').css('top', (event.pageY + 10) + 'px');
            });
            $('[data-ml-tooltip-active="true"]').on('mouseout', function () {
                var title = $(this).data('ml-tooltip');
                $('.moonlightui-tooltip').css('left', '-1000px');
                $('.moonlightui-tooltip').css('top', '-1000px');
                $('.moonlightui-tooltip').html('');
                $('.moonlightui-tooltip').addClass('hidden');
            });
        },
        showModal: function() {
            this.css({top:'50%',left:'50%',margin:'-'+($(this).height() / 2)+'px 0 0 -'+($(this).width() / 2)+'px'});
            this.removeHidden();
        },
        hideModal: function() {
            this.addHidden();
        },
        centerModal: function () {
            this.css({top:'50%',left:'50%',margin:'-'+($(this).height() / 2)+'px 0 0 -'+($(this).width() / 2)+'px'});
            return this;
        },
        modals: function(){
            var bottomScale = false;
            $('.moonlightui-modal').draggable({
                scroll: false,
                start: function(){
                    if ($(this).hasClass('max')) {
                        $(this).css('left', '0px');
                        $(this).css('top', '0px');
                        $(this).css('bottom', '0px');
                        $(this).css('right', '0px');
                    }
                },
                drag: function() {
                    if ($(this).hasClass('max')) {
                        $(this).css('left', '0px');
                        $(this).css('top', '0px');
                        $(this).css('bottom', '0px');
                        $(this).css('right', '0px');
                    }
                },
                stop: function(){
                    if ($(this).hasClass('max')) {
                        $(this).css('left', '0px');
                        $(this).css('top', '0px');
                        $(this).css('bottom', '0px');
                        $(this).css('right', '0px');
                    }
                }
            });
            $('.moonlightui-modal-resizable').resizable({
                stop: function(){
                    $(this).attr('data-ml-preheight', $(this).height());
                    $(this).attr('data-ml-prewidth', $(this).width());
                }
            });
            $('.moonlightui-modal .moonlightui-modal-close').on('click', function() {
                if(!$(this).hasClass('moonlightui-modal-disable')) {
                    $(this).parent().parent().addClass('hidden');
                }
            });
            $('.moonlightui-modal .moonlightui-modal-close.destroy').on('click', function() {
                if(!$(this).hasClass('moonlightui-modal-disable')) {
                    $(this).remove();
                }
            });
            $('.moonlightui-modal .moonlightui-modal-close-btn.destroy').on('click', function() {
                $(this).remove();
            });
            $('.moonlightui-modal .moonlightui-modal-ok-btn.destroy').on('click', function() {
                $(this).remove();
            });
            $('.moonlightui-modal .moonlightui-modal-min').on('click', function() {
                if(!$(this).hasClass('moonlightui-modal-disable')) {
                    if ($(this).parent().parent().hasClass('min')) {
                        $(this).parent().parent().removeClass('min');
                        if (!$(this).parent().parent().hasClass('moonlightui-modal-fixed')) {
                            $(this).parent().find('.moonlightui-modal-max').removeClass('moonlightui-modal-disable');
                        }
                        $(this).parent().parent().find('.moonlightui-modal-body').removeClass('hidden');
                        $(this).parent().parent().css('height', $(this).parent().parent().attr('data-ml-preheight') + 'px');
                    } else {
                        if (!$(this).parent().parent().hasClass('moonlightui-modal-fixed')) {
                            $(this).parent().find('.moonlightui-modal-max').addClass('moonlightui-modal-disable');
                        }
                        $(this).parent().parent().attr('data-ml-preheight', $(this).parent().parent().height());
                        $(this).parent().parent().attr('data-ml-prewidth', $(this).parent().parent().width());
                        $(this).parent().parent().find('.moonlightui-modal-body').addClass('hidden');
                        $(this).parent().parent().css('height', '22px');
                        $(this).parent().parent().addClass('min');
                    }
                }
            });
            $('.moonlightui-modal .moonlightui-modal-max').on('click', function() {
                if(!$(this).hasClass('moonlightui-modal-disable')) {
                    if ($(this).parent().parent().hasClass('max')) {
                        $(this).parent().find('.moonlightui-modal-min').removeClass('moonlightui-modal-disable');
                        $(this).parent().parent().removeClass('max');
                        $(this).parent().parent().css('height', $(this).parent().parent().attr('data-ml-preheight') + 'px');
                        $(this).parent().parent().css('width', $(this).parent().parent().attr('data-ml-prewidth') + 'px');
                        $(this).parent().parent().css('left', $(this).parent().parent().attr('data-ml-preleft') + 'px');
                        $(this).parent().parent().css('top', $(this).parent().parent().attr('data-ml-pretop') + 'px');
                        $(this).parent().parent().css('margin-left', $(this).parent().parent().attr('data-ml-premarginleft'));
                    } else {
                        $(this).parent().find('.moonlightui-modal-min').addClass('moonlightui-modal-disable');
                        $(this).parent().parent().attr('data-ml-preheight', $(this).parent().parent().height());
                        $(this).parent().parent().attr('data-ml-prewidth', $(this).parent().parent().width());
                        $(this).parent().parent().attr('data-ml-preleft', $(this).parent().parent().position().left);
                        $(this).parent().parent().attr('data-ml-pretop', $(this).parent().parent().position().top);
                        $(this).parent().parent().attr('data-ml-premarginleft', $(this).parent().parent().css('margin-left'));
                        $(this).parent().parent().css('height', $(document).height() + 'px');
                        $(this).parent().parent().css('width', $(document).width() + 'px');
                        $(this).parent().parent().css('left', '0px');
                        $(this).parent().parent().css('top', '0px');
                        $(this).parent().parent().css('margin-left', '0px');
                        $(this).parent().parent().addClass('max');
                    }
                }
            });
        },
        showHelp: function() {
            $(this).each(function() {
                var url = $(this).data('ml-help-url');
                var title = $(this).data('ml-help-title');
                if (typeof url === 'undefined') {
                    console.warn('MOONLIGHTUI - You must specify url to load the help page from.');
                }
                if (typeof title === 'undefined') {
                    console.warn('MOONLIGHTUI - You must specify title for the help dialog.');
                }
                $(this).on('click', function () {
                    var newHelp = $('<div></div>').html(
                        '<div class="moonlightui-modal-header">' +
                        '<div class="moonlightui-modal-close destroy"></div>' +
                        '<div class="moonlightui-modal-min moonlightui-modal-disable"></div>' +
                        '<div class="moonlightui-modal-max moonlightui-modal-disable"></div>' +
                        title +
                        '</div>' +
                        '<div class="moonlightui-modal-body table-add">' +
                        '<iframe src="' + url + '" target="_parent" class="moonlightui-modal-help-iframe"></iframe>' +
                        '<div class="moonlightui-modal-body-btn-bottom-fixed">' +
                        '<div id="fillableAddOk" class="moonlightui-btn moonlightui-modal-ok-btn destroy">' +
                        '<div class="moonlightui-btn-inner">ok</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>');
                    newHelp.addClass('moonlightui-modal moonlightui-modal-fixed');
                    $('body').append(newHelp);
                    newHelp.draggable({
                        scroll: false
                    });
                    newHelp.find('.moonlightui-modal-close.destroy').on('click', function() {
                        $(newHelp).remove();
                    });
                    newHelp.find('.moonlightui-modal-close-btn.destroy').on('click', function() {
                        $(newHelp).remove();
                    });
                    newHelp.find('.moonlightui-modal-ok-btn.destroy').on('click', function() {
                        $(newHelp).remove();
                    });
                    newHelp.css({
                        top: '50%',
                        left: '50%',
                        margin: '-' + ($(newHelp).height() / 2) + 'px 0 0 -' + ($(newHelp).width() / 2) + 'px'
                    });
                });
            });
        },
        /* MOONLIGHTUI - lodash */
        lodash: _,
        /* MOONLIGHTUI - External Libraries */
        async: async,
        jsPlumb: jsPlumb,
        /* MOONLIGHTUI - Laravel API automation */
        laravel: {
            http: {
                get: function (url, data, cb, fail) {
                    $.ajax({
                        url: url,
                        method: 'GET',
                        data: data,
                        context: document.body
                    }).done(function (data) {
                        cb(data);
                    }).fail(function (data) {
                        fail(data);
                    });
                },
                post: function (url, data, cb, fail) {
                    var settings = $().getModel('moonlightui', 'settings');
                    data._token = settings.get('csrfToken');
                    $.ajax({
                        url: url,
                        method: 'POST',
                        data: data,
                        context: document.body
                    }).done(function (data) {
                        cb(data);
                    }).fail(function (data) {
                        fail(data);
                    });
                },
                put: function (url, data, cb, fail) {
                    data._token = window.csrfToken;
                    $.ajax({
                        url: url,
                        method: 'PUT',
                        data: data,
                        context: document.body
                    }).done(function (data) {
                        cb(data);
                    }).fail(function (data) {
                        fail(data);
                    });
                },
                delete: function (url, data, cb, fail) {
                    data._token = window.csrfToken;
                    $.ajax({
                        url: url,
                        method: 'DELETE',
                        data: data,
                        context: document.body
                    }).done(function (data) {
                        cb(data);
                    }).fail(function (data) {
                        fail(data);
                    });
                }
            }
        },
        /* MOONLIGHTUI - Lets GO */
        reenergize: function(element) {

            /* MOONLIGHT UI - Tab's */
            $(element + ' .moonlightui-tab').off();

            /* MOONLIGHT UI - Main tabs */
            $(element + ' .moonlightui-main-tab').off();

            // Attach tab switches again
            $(element + ' .moonlightui-tab-switch').off();

            // Attach show components
            $(element + ' .moonlightui-show').off();

            // Attach show components
            $(element + ' .moonlightui-hide').off();

            // Attach actions and clicks again.
            $(element).find('[data-ml-action]').off();

            // Attach buttons
            $(element + ' .moonlightui-btn-inner').off();

            /* MOONLIGHT UI - Show help */
            $(element + ' .moonlightui-show-help').off();

            // Attach tooltips
            $(element).find('[data-ml-tooltip-active="true"]').off();

            // Attach modals
            $(element + ' .moonlightui-modal .moonlightui-modal-close').off();
            $(element + ' .moonlightui-modal .moonlightui-modal-min').off();
            $(element + ' .moonlightui-modal .moonlightui-modal-max').off();

            /* Detach all events */
            $(element).off();

            /* Detach two-way databinding */
            $(element).find('[data-ml-model]').off();

            /* Attach model two way databinding */
            for (var module in modules) {
                for (var model in modules[module].models) {
                    modules[module].models[model].__initTwoWayBinding();
                }
            }

            $(element).energize(element);

        },
        energize: function(element) {

            /* MOONLIGHT UI - Tree's */
            $(element + ' .moonlightui-tree').trees();

            /* MOONLIGHT UI - Tab's */
            $(element + ' .moonlightui-component-title-main-options').sortable();
            $(element + ' .moonlightui-tab').tabs();

            /* MOONLIGHT UI - Main tabs */
            $(element + ' .moonlightui-main-tab').tabs();

            /* MOONLIGHT UI - Tab switches */
            $(element + ' .moonlightui-tab-switch').tabSwitch();

            /* MOONLIGHT UI - Show items */
            $(element + ' .moonlightui-show').showComponents();

            /* MOONLIGHT UI - Hide items */
            $(element + ' .moonlightui-hide').hideComponents();

            /* MOONLIGHT UI - Draggable components */
            $(element + ' moonlightui').draggableComponents();

            /* MOONLIGHT UI - Will activate all custom click */
            $(element).find('[data-ml-action]').actions();

            /* MOONLIGHT UI - Show help */
            $(element + ' .moonlightui-show-help').showHelp();

            /* MOONLIGHT UI - Buttons */
            $(element + ' .moonlightui-btn-inner').buttons();

            /* Init all scrollbars */
            $(element + ' .moonlightui-scrollbar-inner').scrollbar();

            /* MOONLIGHT UI - Activate all tooltips */
            $(element + ' .moonlightui').tooltips();

            /* MOONLIGHT UI - Enable all modal dialogs */
            $(element + ' .moonlightui').modals();

        }
    });
    window.$ml = window.moonlightui = $.noConflict();
}));