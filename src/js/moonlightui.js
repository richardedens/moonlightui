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
            $('[data-ml-action]').each(function(){
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
            $('[data-ml-click]').each(function(){
                $(this).on('click', function(){
                    var tabClick = $(this).data('ml-click'),
                        controller = $(this).closest('[data-ml-controller]').data('ml-controller'),
                        module = $(this).closest('[data-ml-module]').data('ml-module');
                    var error = findModuleAndController(this, tabClick);
                    if (error === false) {
                        if (tabClick.indexOf(',') !== -1) {
                            var tabClicks = tabClick.split(',');
                            for (var i = 0; i < tabClicks.length; i++) {
                                modules[module].controllers[controller][tabClicks[i]](this);
                            }
                        } else {
                            modules[module].controllers[controller][tabClick](this);
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
            var ctrl = controller();
            ctrl.__module = tempModule;
            modules[tempModule].controllers[name] = ctrl;
            return this;
        },
        view: function(name, view) {
            var vw = view();
            vw.__module = tempModule;
            modules[tempModule].views[name] = vw;
            return this;
        },
        model: function(name, model) {
            // Instantiate new model
            var mdl = model();

            // Attach new variables and new functions. Will override existing functions.
            mdl.__name = name;
            mdl.__error = '';
            mdl.__module = tempModule;
            mdl.removeError = function() {
                modules[tempModule].models[name].__error = '';
                $('[data-ml-module="' + tempModule+ '"]').find('[data-ml-error="' + name + '.error"]').each(function() {
                    if ($(this).is( "input" ) || $(this).is( "textarea" ) || $(this).is( "select" )) {
                        $(this).val('');
                    } else {
                        $(this).html('');
                    }
                    $(this).addHidden();
                });
            };
            mdl.addError = function(value) {
                modules[tempModule].models[name].__error = value;
                $('[data-ml-module="' + tempModule+ '"]').find('[data-ml-error="' + name + '.error"]').each(function() {
                    if ($(this).is( "input" ) || $(this).is( "textarea" ) || $(this).is( "select" )) {
                        $(this).val(modules[tempModule].models[name].__error);
                    } else {
                        $(this).html(modules[tempModule].models[name].__error);
                    }
                    $(this).removeHidden();
                });
            };
            mdl.getError = function(value) {
                return modules[tempModule].models[name].__error;
            };
            mdl.get = function(param) {
                if (typeof modules[tempModule].models[name][param] !== 'undefined') {
                    return modules[tempModule].models[name][param];
                } else {
                    console.warn('MOONLIGHTUI - Model "' + mdl.__name + '" in module "' + mdl.__module + '" does not have property "' + param + '"');
                }
            };
            mdl.set = function(param, value) {
                mdl[param] = value;
                $('[data-ml-module="' + mdl.__module + '"').find('[data-ml-model="' + mdl.__name + '.' + param + '"]').each(function()
                {
                    if ($(this).is( "input" ) || $(this).is( "textarea" ) || $(this).is( "select" )) {
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
                $('[data-ml-module="' + tempModule+ '"]').find('[data-ml-model="' + model + '.' + param + '"]').each(function() {
                    if ($(this).is( "input" ) || $(this).is( "textarea" ) || $(this).is( "select" )) {
                        $(this).val(modules[tempModule].models[model][param]);
                    } else {
                        $(this).html(modules[tempModule].models[model][param]);
                    }
                });
                modules[tempModule].models[model].__on(param);
            };

            // Save model into the module.
            modules[tempModule].models[name] = mdl;

            // Attach two-way databinding
            $('[data-ml-module="' + tempModule+ '"]').find('[data-ml-model*="' + name + '."]').each(function(){
                if ($(this).data('ml-model').indexOf('.') !== -1) {
                    var modelParameter = $(this).data('ml-model').split('.'),
                        model = modelParameter[0],
                        param = modelParameter[1];
                    if (typeof modules[tempModule].models[model] !== 'undefined' && typeof modules[tempModule].models[model][param] !== 'undefined'){
                        if ($(this).is( "input" ) || $(this).is( "textarea" ) || $(this).is( "select" )) {
                            $(this).val(modules[tempModule].models[model][param]);
                            $(this).on('keyup', function () {
                                modules[tempModule].models[model][param] = $(this).val();
                                modules[tempModule].models[model].__broadcast(model, param);
                            });
                        } else {
                            $(this).html(modules[tempModule].models[model][param]);
                        }
                    }
                } else {
                    console.warn('MOONLIGHTUI - You must specify a model and its parameter (example "modelName.param") in the ml-model attribute. I got: ' + $(this).data('ml-model') + ' in module "' + tempModule + '"');
                }
            });
            return this;
        },
        getModel: function(parent, name)
        {
            if (typeof modules[parent].models[name] !== 'undefined') {
                return modules[parent].models[name];
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
            $('[data-ml-tooltip-active="true"]').mouseover(function () {
                var title = $(this).data('ml-tooltip');
                $('.moonlightui-tooltip').html(title);
                $('.moonlightui-tooltip').removeClass('hidden');
            });
            $('[data-ml-tooltip-active="true"]').mousemove(function (event) {
                $('.moonlightui-tooltip').css('left', event.pageX + 'px');
                $('.moonlightui-tooltip').css('top', (event.pageY + 10) + 'px');
            });
            $('[data-ml-tooltip-active="true"]').mouseout(function () {
                var title = $(this).data('ml-tooltip');
                $('.moonlightui-tooltip').css('left', '-1000px');
                $('.moonlightui-tooltip').css('top', '-1000px');
                $('.moonlightui-tooltip').html('');
                $('.moonlightui-tooltip').addClass('hidden');
            });
        },
        centerModal: function () {
            $(this).css({top:'50%',left:'50%',margin:'-'+($(this).height() / 2)+'px 0 0 -'+($(this).width() / 2)+'px'});
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
        /* MOONLIGHTUI - External Libraries */
        async: async,
        jsPlumb: jsPlumb,
        /* MOONLIGHTUI - Lets GO */
        energize: function() {

            /* MOONLIGHT UI - Tree's */
            $('.moonlightui-tree').trees();

            /* MOONLIGHT UI - Tab's */
            $('.moonlightui-component-title-main-options').sortable();
            $('.moonlightui-tab').tabs();

            /* MOONLIGHT UI - Main tabs */
            $('.moonlightui-main-tab').tabs();

            /* MOONLIGHT UI - Tab switches */
            $('.moonlightui-tab-switch').tabSwitch();

            /* MOONLIGHT UI - Show items */
            $('.moonlightui-show').showComponents();

            /* MOONLIGHT UI - Hide items */
            $('.moonlightui-hide').hideComponents();

            /* MOONLIGHT UI - Draggable components */
            $('.moonlightui').draggableComponents();

            /* MOONLIGHT UI - Will activate all custom click */
            $('.moonlightui').actions();

            /* MOONLIGHT UI - Buttons */
            $('.moonlightui-btn-inner').buttons();

            /* Init all scrollbars */
            $('.moonlightui-scrollbar-inner').scrollbar();

            /* MOONLIGHT UI - Activate all tooltips */
            $('.moonlightui').tooltips();

            /* MOONLIGHT UI - Enable all modal dialogs */
            $('.moonlightui').modals();

        }
    });
    window.$ml = window.moonlightui = $.noConflict();
}));