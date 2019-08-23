
sigcidev.factory('DataSetResource', ['$resource', function( $resource ) {
  return $resource(baseUrl + '/api/dataSets/:id.json', {'id': '@id'}, {
    query: {
      method: 'GET',
      isArray: false
    }
  });
}]);

sigcidev.factory('completeDataSetRegistrations', ['$resource', function( $resource ) {
  return $resource(baseUrl + '/api/completeDataSetRegistrations.json', null, {
    query: {
      method: 'GET',
      isArray: false
    }
  });
}]);
