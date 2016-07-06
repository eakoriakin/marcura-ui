angular.module('marcuraUI.components').directive('maButton', maButton);

function maButton(maHelper) {
    var blockName = 'ma-button';

    return {
        restrict: 'E',
        scope: {
            model: '='
        },
        replace: true,
        template: function() {
            var html = '\
                <div class="ma-button">\
                    Button\
                </div>';

            return html;
        },
        link: function(scope, element) {

        }
    };
}
