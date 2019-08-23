
sigcidev.controller('FacilityInteroperability', ['$scope', '$rootScope', 'DataSetResource','dataElementsResource','categoryComboResource','categoryOptionCombosResource',
    function ($scope, $rootScope, DataSetResource, dataElementsResource,categoryComboResource, categoryOptionCombosResource) {

        getDataSet();

        function getDataSet() {
            DataSetResource.query({
                paging: false,
                fields: 'id,name'
            }, function (resultat) {
                //console.log(resultat);
                allDataSet = resultat.dataSets;
                $scope.collecteDataSets = allDataSet;
                $scope.loadingDataSet = false;
            }, function (err) {
                /*compte = 1;
                getDataSetDetail();*/
            });
        }
        
        
        
        
    }
]);
