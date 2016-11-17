/* MOONLIGHT UI */
moonlightui('document').ready(function() {

    /* MOONLIGHT UI - Tree's */
    moonlightui().energize('.moonlightui-main');

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

    /* MOONLIGHT UI - Demo view one */
    moonlightui().module('demo').view('viewOne', function(){
        var viewOne = {
            container: '#demoView',
            templateURL: 'demoView.html'
        };
        return viewOne;
    });

    /* MOONLIGHT UI - Demo view two */
    moonlightui().module('demo').view('viewTwo', function(){
        var viewTwo = {
            container: '#demoView',
            template: 'This is a template from a string.'
        };
        return viewTwo;
    });

    /* MOONLIGHTUI - Demo model */
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

            demoShowViewOne: function() {
                var viewOne = moonlightui().getView('demo', 'viewOne');
                viewOne.render(function(template, container){
                    console.log('Altered view to view one.');
                });
            },

            demoShowViewTwo: function() {
                var viewTwo = moonlightui().getView('demo', 'viewTwo');
                viewTwo.render(function(template, container){
                    console.log('Altered view to view one.');
                });
            },

            init: function() {

                demoModel.receive(function(name){
                    console.log('Got new value from "' + name + '": ' + demoModel.get(name));
                });

            }

        };
        demoController.init();

        return demoController;

    });

    /* Lets create a model for our service. */
    moonlightui().module('demo').model('demoServiceModel', function(){

        return {

            numberOfPeople: 0

        };

    });

    /* Lets create a service. */
    moonlightui().module('demo').service('demoService', function(){

        return {

            // Public properties
            numberOfPeople: 0,

            // Public functions
            init: function() {

                // Initialize the model and two way data binding on the service model.
                var model = moonlightui().getModel('demo','demoServiceModel');
                model.init();

            }

        };

    });

    /* Lets create a new controller */
    moonlightui().module('demo').controller('demoController1', function(){

        var demoController1 = {

            init: function() {

                var service = moonlightui().getService('demo', 'demoService');
                service.init();

                var self = this;
                service.attach('onNumberOfPeopleChange', function(value) {

                    var model = moonlightui().getModel('demo','demoServiceModel');
                    model.set('numberOfPeople', value);

                });
            },

            increasePeople: function() {

                var service = moonlightui().getService('demo', 'demoService'),
                    number = service.get('numberOfPeople') || 0;

                number++;

                service.set('numberOfPeople', number);

            }

        };
        demoController1.init();

        return demoController1;

    });

    /* Lets create a service. */
    moonlightui().module('demo').controller('demoController2', function(){

        var demoController2 = {

            init: function() {
                var service = moonlightui().getService('demo', 'demoService');
                var self = this;
                service.attach('onNumberOfPeopleChange', function(value) {

                    var model = moonlightui().getModel('demo','demoServiceModel');
                    model.set('numberOfPeople', value);

                });
            },

            decreasePeople: function() {

                var service = moonlightui().getService('demo', 'demoService'),
                    number = service.get('numberOfPeople') || 0;

                number--;

                service.set('numberOfPeople', number);

            }

        };
        demoController2.init();

        return demoController2;

    });

    /* Lets create a model for our service. */
    moonlightui().module('demo').model('demoAdvancedModel', function(){

        return [{
            get: 'js/demoAdvancedModel.json',
            post: 'js/demoAdvancedModel.json',
            put: 'js/demoAdvancedModel.json',
            delete: 'js/demoAdvancedModel.json',
        }, {

            loadedFromFile: "no"

        }];

    });

    /* Lets create a model for our service. */
    moonlightui().module('demo').controller('demoAdvancedModelController', function() {

        var demoAdvancedModelController = {

            init: function() {
                var model = moonlightui().getModel('demo', 'demoAdvancedModel');
                // Advanced models always automaticly load there settings from serverside with the init function.
                // You have to provide "false" to disable this functionality.
                model.init(false);
            },

            load: function() {

                var model = moonlightui().getModel('demo', 'demoAdvancedModel');
                model.load().then(function(){
                    console.log('Loaded model demoAdvancedModel from a JSON file.');
                }, function() {
                    console.log('Could not load model demoAdvancedModel.');
                });

            },

            post: function() {

                var model = moonlightui().getModel('demo', 'demoAdvancedModel');
                model.create().then(function(){
                    console.log('Created model demoAdvancedModel from a JSON file.');
                }, function() {
                    console.log('Could not create model demoAdvancedModel.');
                });

            },

            put: function() {

                var model = moonlightui().getModel('demo', 'demoAdvancedModel');
                model.save().then(function(){
                    console.log('Updated model demoAdvancedModel from a JSON file.');
                }, function() {
                    console.log('Could not update model demoAdvancedModel.');
                });

            },

            delete: function() {

                var model = moonlightui().getModel('demo', 'demoAdvancedModel');
                model.delete().then(function(){
                    console.log('Delete model demoAdvancedModel.');
                }, function() {
                    console.log('Could not delete model demoAdvancedModel.');
                });

            }

        };
        demoAdvancedModelController.init();

        return demoAdvancedModelController;

    });

});