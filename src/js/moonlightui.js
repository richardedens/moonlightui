/* Extend it with moonlight ui functions */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root.jQuery);
    }
}(this, function ($) {
    var callbacks = [];
    $.fn.extend({
        registerCallback: function(identifier, fn) {
            callbacks[identifier] = fn;
        },
        tabs : function() {
            $(this).each(function(){
                $(this).on('click', function(){
                    $(this).parent().find('.active').removeClass('active');
                    $(this).addClass('active');
                    var tab = $(this).data('ml-tab');
                    var tabAction = $(this).data('ml-action');
                    $('#' + tab).parent().find('.active').removeClass('active');
                    $('#' + tab).addClass('active');
                    if (tabAction !== null) {
                        callbacks[tabAction](this);
                    }
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
                    var click = $(this).data('click');
                    click();
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
        }
    });
    window.$ml = window.moonlightui = $.noConflict();
}));