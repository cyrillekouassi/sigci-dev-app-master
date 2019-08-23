
sigcidev.factory('trackedEntityInstances', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/trackedEntityInstances/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
        }
    });
}]);

sigcidev.factory('programs', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/programs/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
        }
    });
}]);

sigcidev.factory('programTrackedEntityAttributes', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/programTrackedEntityAttributes/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
        }
    });
}]);

sigcidev.factory('trackedEntityAttributes', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/trackedEntityAttributes/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
        }
    });
}]);

sigcidev.factory('optionSets', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/optionSets/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
        }
    });
}]);

sigcidev.factory('options', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/options/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
        }
    });
}]);

sigcidev.factory('enrollments', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/enrollments/:id.json', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
        }
    });
}]);

sigcidev.factory('deleteTrackedEntityInstances', ['$resource', function( $resource ) {
    return $resource(baseUrl + '/api/trackedEntityInstances/:id', {'id': '@id'}, {
        query: {
            method: 'GET',
            isArray: false
        },
        save: {
            method:'POST',
            header: {"Content-Type": "application/json"},
            isArray:false
        },
        update: {
            method:'PUT',
            isArray:false,
            header: {"Content-Type": "application/json"}
        }
    });
}]);