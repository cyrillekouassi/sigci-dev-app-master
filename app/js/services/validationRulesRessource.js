sigcidev.factory('validationRules', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/validationRules/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false,
            /*transformResponse: function(data) {
             return JSON.parse(data).users;
             }*/
        }
    });
}]);