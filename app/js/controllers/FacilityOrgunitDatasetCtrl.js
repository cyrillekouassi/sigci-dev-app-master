sigcidev.controller('FacilityOrgunitDatasetCtrl', ['$scope', '$rootScope', 'orgUnitResource','DataSetResource',
    function ($scope, $rootScope, orgUnitResource,DataSetResource) {
        var allDataSet = [],compte = 0;
        $scope.collecteOrgUnits = [];
        $scope.collecteDataSets = [];
        $scope.loadingOrg = false;
        $scope.loadingData = false;
        $scope.leDataSet;
        $scope.orgUnitID;

        getDataSet();

        function getDataSet() {
            $scope.loadingDataSet = true;
            DataSetResource.query({
                paging: false,
                fields: 'id,name'
            }, function (resultat) {
                allDataSet = resultat.dataSets;
                $scope.loadingDataSet = false;
            }, function (err) {
                compte = 1;
                getDataSetDetail();
            });
        }

        function getDataSetDetail() {
            DataSetResource.query({
                fields: 'id,name'
            }, function (resultat) {
                allDataSet = resultat.dataSets;
                comptePageCount = resultat.pager.pageCount;
                if (compte < comptePageCount) {
                    compte++;
                    getDataSetDetailAll();
                }
            }, function (err) {

            });
        }

        function getDataSetDetailAll() {
            DataSetResource.query({
                paging: compte,
                fields: 'id,name'
            }, function (resultat) {
                var tempo1 = [], tempo2 = [];
                tempo1 = angular.copy(allDataSet);
                tempo2 = resultat.dataSets;
                allDataSet = tempo1.concat(tempo2);
                if (compte < comptePageCount) {
                    compte++;
                    getDataSetDetailAll();
                } else {
                    $scope.loadingDataSet = false;
                }
            }, function (err) {

            });
        }

        $scope.my_tree_handler = function (branch) {
            console.log("entrer dans brancheSelectionner");
            console.log(branch);
            $scope.collecteOrgUnits = [];
            $scope.collecteDataSets = [];
            orgUnitSelect(branch.data);
        }
        
        $scope.orgUnitChoisir = function (idOrgUnit) {
            console.log("entrer dans orgUnitChoisir");
            $scope.collecteDataSets = [];
            $scope.orgUnitID = idOrgUnit;
            $scope.leDataSet = "";
            $scope.loadingData = true;
            getOrgUnit(idOrgUnit);

        }

        $scope.dataSetChoisir = function (idDataSet) {
            console.log("entrer dans dataSetChoisir");
            $scope.collecteOrgUnits = [];
            $scope.leDataSet = idDataSet;
            $scope.orgUnitID = "";
            $scope.loadingOrg = true;
            getdataSetOrgUnit(idDataSet);
        }
        
        $scope.voirAllDataSets = function () {
            console.log("entrer dans voirAllDataSets");
            $scope.collecteDataSets = allDataSet;
        }
        
        function orgUnitSelect(orgUnit) {
            console.log("entrer dans orgUnitSelect");
            $scope.collecteOrgUnits.push(orgUnit);
            $scope.orgUnitID = orgUnit.id;
            getOrgUnit(orgUnit.id);
        }

        function getOrgUnit(idOrgUnit) {
            console.log("entrer dans getOrgUnit");
            orgUnitResource.query({
                id: idOrgUnit,
                fields: 'dataSets'
            },function (data) {
                /*console.log("resultat getOrgUnit");
                 console.log(data);*/
                dataSetCollection(data.dataSets);
            });
        }

        function dataSetCollection(collecte) {
            console.log("entrer dans dataSetCollection");
            console.log("collecte");
            console.log(collecte);
            j=collecte.length;
            if(j != 0){
                for(var i=0;i<j;i++){
                    for(var a=0,b=allDataSet.length;a<b;a++){
                        if(collecte[i].id == allDataSet[a].id){
                            $scope.collecteDataSets.push(allDataSet[a]);
                            break;
                        }
                    }
                }
            }
            $scope.loadingData = false;
        }

        function getdataSetOrgUnit(idDataSet) {
            console.log("entrer dans getdataSetOrgUnit");
            DataSetResource.query({
                id: idDataSet,
                fields: 'organisationUnits'
            }, function (resultat) {
                orgUnitCollection(resultat.organisationUnits);
            }, function (err) {
                compte = 1;
                getDataSetDetail();
            });
        }

        function orgUnitCollection(collecte) {
            console.log("entrer dans orgUnitCollection");
            j = collecte.length;
            if(j != 0){
                for(var i=0;i<j;i++){
                    for(var a=0,b=$rootScope.allOrgUnit.length;a<b;a++){
                        if(collecte[i].id == $rootScope.allOrgUnit[a].id){
                            $scope.collecteOrgUnits.push($rootScope.allOrgUnit[a]);
                        }
                    }
                }
            }
            $scope.loadingOrg = false;
        }
        

    }
]);