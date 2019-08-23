sigcidev.factory('usersResource', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/users/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false,
            /*transformResponse: function(data) {
                return JSON.parse(data).users;
            }*/
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            // params: {id: "@id"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
            // params: {id: "@id"},
        }
    });
}]);


sigcidev.factory('meResource', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/me/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false,
            /*transformResponse: function(data) {
             return JSON.parse(data).users;
             }*/
        }
    });
}]);