
sigcidev.factory('dataElementsResource', ['$resource', function( $resource ) {
  return $resource(baseUrl + '/api/dataElements/:id.json', {'id': '@id'}, {
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

sigcidev.factory('dataElementsResourceJson', ['$resource', function( $resource ) {
  return $resource(baseUrl + '/api/dataElements/:id', {'id': '@id'}, {
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

sigcidev.factory('sharingResource', ['$resource', function( $resource ) {
  return $resource(baseUrl + '/api/sharing', null, {
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