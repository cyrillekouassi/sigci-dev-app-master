fredApp.directive('ngDisabled', function() {
    return {
        controller: function($scope, $attrs) {
            var self = this;
            $scope.$watch($attrs.ngDisabled, function(isDisabled) {
                self.isDisabled = isDisabled;
            });
        }
    };
});