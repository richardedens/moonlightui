/* Moonlight UI with jQuery / jQuery UI and */
$ml('document').ready(function() {

    /* MOONLIGHT UI - Tree's */
    $ml('.moonlightui-tree').trees();

    /* MOONLIGHT UI - Tab's */
    $ml('.moonlightui-component-title-main-options').sortable();
    $ml('.moonlightui-tab').tabs();

    /* MOONLIGHT UI - Main tabs */
    $ml('.moonlightui-main-tab').tabs();

    /* MOONLIGHT UI - Tab switches */
    $ml('.moonlightui-tab-switch').tabSwitch();

    /* MOONLIGHT UI - Show items */
    $ml('.moonlightui-show').showComponents();

    /* MOONLIGHT UI - Hide items */
    $ml('.moonlightui-hide').hideComponents();

    /* MOONLIGHT UI - Draggable components */
    $ml('.moonlightui').draggableComponents();

    /* MOONLIGHT UI - Buttons */
    $ml('.moonlightui-btn-inner').buttons();

    /* Init all scrollbars */
    $ml('.moonlightui-scrollbar-inner').scrollbar();

    /* MOONLIGHT UI - Activate all tooltips */
    $ml('.moonlightui').tooltips();

    /* MOONLIGHT UI - Enable all modal dialogs */
    $ml('.moonlightui').modals();

    /* MOONLIGHT UI - Register a callback, hook any moonlight component to an action. */
    $ml('.moonlightui').registerCallback('demoShowDialog', function(element){
        $ml('#demoDialog').css('top', ($ml(element).offset().top) + 'px');
        $ml('#demoDialog').css('left', ($ml(element).offset().left) + 'px');
        $ml('#demoDialog').css('margin-left', '0px');
        $ml('#demoDialog').removeClass('hidden');
    });
});