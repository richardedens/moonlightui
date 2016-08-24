/* MOONLIGHT UI */
moonlightui('document').ready(function() {

    /* MOONLIGHT UI - Tree's */
    moonlightui('.moonlightui-tree').trees();

    /* MOONLIGHT UI - Tab's */
    moonlightui('.moonlightui-component-title-main-options').sortable();
    moonlightui('.moonlightui-tab').tabs();

    /* MOONLIGHT UI - Main tabs */
    moonlightui('.moonlightui-main-tab').tabs();

    /* MOONLIGHT UI - Tab switches */
    moonlightui('.moonlightui-tab-switch').tabSwitch();

    /* MOONLIGHT UI - Show items */
    moonlightui('.moonlightui-show').showComponents();

    /* MOONLIGHT UI - Hide items */
    moonlightui('.moonlightui-hide').hideComponents();

    /* MOONLIGHT UI - Draggable components */
    moonlightui('.moonlightui').draggableComponents();

    /* MOONLIGHT UI - Will activate all custom click */
    moonlightui('.moonlightui-show').actions();

    /* MOONLIGHT UI - Buttons */
    moonlightui('.moonlightui-btn-inner').buttons();

    /* Init all scrollbars */
    moonlightui('.moonlightui-scrollbar-inner').scrollbar();

    /* MOONLIGHT UI - Activate all tooltips */
    moonlightui('.moonlightui').tooltips();

    /* MOONLIGHT UI - Enable all modal dialogs */
    moonlightui('.moonlightui').modals();

    /* MOONLIGHT UI - Register a module and a controller on the module. */
    moonlightui().module('core').controller('mainController', function(){

        var mainController = {

            demoShowDialog: function(element) {
                moonlightui('#demoDialog').css('top', (moonlightui(element).offset().top) + 'px');
                moonlightui('#demoDialog').css('left', (moonlightui(element).offset().left) + 'px');
                moonlightui('#demoDialog').css('margin-left', '0px');
                moonlightui('#demoDialog').removeClass('hidden');
            }

        };

        return mainController;

    });
});