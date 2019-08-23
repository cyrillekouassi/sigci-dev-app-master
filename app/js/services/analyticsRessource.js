sigcidev.factory('analyticsResource', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/analytics', null, {
        query: {
            method: 'GET',
            isArray: false
        }
    });
}]);
