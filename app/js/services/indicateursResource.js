
sigcidev.factory('indicateursResource', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/indicators/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        }
    });
}]);