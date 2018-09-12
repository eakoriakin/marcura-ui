angular.module('marcuraUI.components').directive('maLabel', [function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            shouldCutOverflow: '=',
            for: '@',
            isRequired: '=',
            hasWarning: '='
        },
        replace: true,
        template: function () {
            var html = '\
                <div class="ma-label" ng-class="{\
                    \'ma-label-is-required\': isRequired,\
                    \'ma-label-has-content\': hasContent,\
                    \'ma-label-has-warning\': hasWarning,\
                    \'ma-label-cut-overflow\': _shouldCutOverflow\
                }">\
                    <label class="ma-label-text" for="{{for}}"><ng-transclude></ng-transclude></label><!--\
                    --><div class="ma-label-star" ng-if="isRequired">&nbsp;<i class="fa fa-star"></i></div><!--\
                    --><div class="ma-label-warning" ng-if="hasWarning">&nbsp;\
                    <i class="fa fa-exclamation-triangle"></i></div>\
                </div>';

            return html;
        },
        link: function (scope, element) {
            scope._shouldCutOverflow = scope.shouldCutOverflow !== undefined ? scope.shouldCutOverflow : true;
            scope.hasContent = element.find('span').contents().length > 0;
        }
    };
}]);