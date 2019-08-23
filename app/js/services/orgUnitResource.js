
sigcidev.factory('orgUnitResource',['$resource', function ($resource) {
    console.log('****************** entrer dans orgUnitResource');

    return $resource(
            //baseUrl + '/api/organisationUnits.json/:id', null, {
            baseUrl + '/api/organisationUnits/:id.json', {id: "@id"}, {
            query:  {
                method:'GET',
                //params: {id: "@id"},
                isArray:false
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
        }

    );

} ]);

sigcidev.factory('orgUnitDelete',['$resource', function ($resource) {
    return $resource(
        baseUrl + '/api/organisationUnits/:id', {id: "@id"},{
            update: {
                method:'PUT',
                isArray:false,
                header: {"Content-Type": "application/json"},
                // params: {id: "@id"},
            },
            save: {
                method:'POST',
                header: {"Content-Type": "application/json"},
                // params: {id: "@id"},
                isArray:false
            }
        }
    )
} ]);

sigcidev.factory('orgUnitLevel',['$resource', function ($resource) {
    return $resource(baseUrl + '/api/organisationUnitLevels/:id.json', {id: "@id"},{
            update: {
                method:'PUT',
                isArray:false,
                header: {"Content-Type": "application/json"},
                // params: {id: "@id"},
            },
            save: {
                method:'POST',
                header: {"Content-Type": "application/json"},
                // params: {id: "@id"},
                isArray:false
            }
        }
    )
} ]);