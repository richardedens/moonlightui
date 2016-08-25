/* MOONLIGHT UI */
moonlightui('document').ready(function() {

    /* MOONLIGHT UI - Tree's */
    moonlightui('.moonlightui-tree').energize();

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

    moonlightui().module('demo').model('demoModel', function() {

        var demoModel = {
            greeting: ''
        };

        return demoModel;

    });

    /* MOONLIGHT UI - Register a module and a controller on the module. */
    moonlightui().module('demo').controller('demoController', function(){

        /*
         * Using a model can be achieved by using the method getModel.
         * Notice that you can also easily grab a model from a different module?
         * The first parameter is the module.
         * So you can use this model in every controller of every module if you wish.
         */
        var demoModel = moonlightui().getModel('demo','demoModel');

        var demoController = {

            init: function() {

                demoModel.receive(function(name){
                    console.log('Got new value from "' + name + '": ' + demoModel.get(name));
                });

            }

        };
        demoController.init();

        return demoController;

    });
});