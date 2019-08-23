sigcidev.controller('FacilityDataInformation', ['$scope', '$rootScope', 'DataSetResource','dataElementsResource','categoryComboResource','categoryOptionCombosResource','indicateursResource',
    function ($scope, $rootScope, DataSetResource, dataElementsResource,categoryComboResource, categoryOptionCombosResource,indicateursResource) {

        var allDataSet = [],compte = 0, compte1 = 0, dataElementDataSets = [], collectDataElement = [], collectCategoryCombo = [],
            collectCategoryOption = [], dataElementSearch = [], collectIndicateur = [];
        var dataElement = {}, categoryCombo = {}, categoryOptionCombos = [];
        var comptePageCount;
        $scope.collecteDataSets = [];
        $scope.ExeEnCours = false;
        $scope.resulat = false;
        $scope.InfoResultat = "";
        $scope.elementInfo = true;
        
        
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
                finExecution("erreur");
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
                finExecution("erreur");
            });
        }
        
        $scope.chargeDataSet = function () {
            //console.log("$scope.dataSet = "+$scope.dataSet);
            $scope.ExeEnCours = true;
            $scope.elementInfo = true;
            //console.log("$scope.ExeEnCours = "+$scope.ExeEnCours);
            getDataSetSelected();
        }
        
        function getDataSetSelected() {
            console.log("entrer dans getDataSetSelected");
            DataSetResource.query({
                id: $scope.dataSet,
                fields: "dataSetElements"
            }, function (resultat) {
                //console.log(resultat);
                if(resultat.dataSetElements && resultat.dataSetElements.length != 0){
                    dataElementDataSets = angular.copy(resultat.dataSetElements);
                    getDataElementID();
                }else{
                    finExecution("vide");
                }
            }, function (err) {
                finExecution("erreur");
            });
        }

        function getDataElementID() {
            console.log("entrer dans getDataElementID");

            for(var i =0,j=dataElementDataSets.length;i<j;i++){
                var temp = {};
                temp.id = dataElementDataSets[i].dataElement.id;
                dataElementDataSets[i] = temp;
            }
            /*console.log("dataElementDataSets");
            console.log(angular.copy(dataElementDataSets));*/
            dataElementSearch = getDataElementExist();
            if(dataElementSearch.length >0){
                compte = 0;
                DataElementName();
            }else{
                prepaAffiche();
            }

        }

        function getDataElementExist() {
            console.log("entrer dans getDataElementExist");
            /*console.log("dataElementDataSets");
            console.log(angular.copy(dataElementDataSets));
            console.log("collectDataElement");
            console.log(angular.copy(collectDataElement));*/
            var temp = [];
            var a = 0,conti = true;
            while(conti){
               // console.log("a = "+a+"// dataElementDataSets.length "+dataElementDataSets.length);
                var trouve = false;
                for(var i=0,j=collectDataElement.length; i<j;i++){
                    if(dataElementDataSets[a].id == collectDataElement[i].id){
                        trouve = true;
                        dataElementDataSets[a] = collectDataElement[i];
                        break;
                    }
                }
                if(!trouve){
                    temp.push(dataElementDataSets[a]);
                    dataElementDataSets.splice(a,1);
                    a--;
                }
                a++;
                if(a >= dataElementDataSets.length){
                    conti = false;
                }
            }
            /*console.log("dataElementDataSets");
            console.log(dataElementDataSets);
            console.log("temp");
            console.log(temp);
            */
            return temp;

        }

        function DataElementName() {
            console.log("entrer dans DataElementName");
            dataElementsResource.query({
                id: dataElementSearch[compte].id,
                fields: 'id,name,categoryCombo'
            },function (data) {
                //console.log(data);
                dataElement.id = data.id;
                dataElement.name = data.name;
                if(data.categoryCombo){
                    getCategoryCombo(data.categoryCombo.id);
                }else{
                    dataElementContinu();
                }
                
            }, function (err) {
                finExecution("erreur");
            });
        }

        function dataElementContinu() {
            console.log("entrer dans dataElementContinu");
            dataElementSearch[compte] = angular.copy(dataElement);
            collectDataElement.push(dataElement);
            dataElement = {};
            compte++;
            if(compte < dataElementSearch.length){
                DataElementName();
            }else{
                //$scope.collectData = dataElementDataSets;
                dataElementDataSets = dataElementDataSets.concat(dataElementSearch);
                prepaAffiche();
                //finExecution("ok");
                /*console.log("dataElementDataSets");
                console.log(dataElementDataSets);
                console.log("collectDataElement");
                console.log(collectDataElement);
                console.log("collectCategoryCombo");
                console.log(collectCategoryCombo);
                console.log("collectcategoryOptionCombos");
                console.log(collectcategoryOptionCombos);*/
            }
        }

        function getCategoryCombo(ID) {
            console.log("entrer dans getCategoryCombo");
            var trouver = false;
            for(var i = 0,j=collectCategoryCombo.length;i<j;i++){
                if(collectCategoryCombo[i].id == ID){
                    trouver = true;
                    dataElement.categoryCombo = angular.copy(collectCategoryCombo[i]);
                    break;
                }
            }
            if(!trouver){
                getCategoryComboName(ID);
            }else{
                dataElementContinu();
            }
        }

        function getCategoryComboName(ID) {
            console.log("entrer dans getCategoryComboName");
            categoryComboResource.query({
                id: ID,
                fields: 'name,id,categoryOptionCombos'
            },function (data) {
                //console.log(data);
                categoryCombo.id = data.id;
                categoryCombo.name = data.name;
                categoryOptionCombos = data.categoryOptionCombos;
                //categoryOptionCombos = [];
                compte1 = 0;
                getCategoryOptionCombo();
            }, function (err) {

            });
        }
        
        function getCategoryOptionCombo() {
            console.log("entrer dans getCategoryOptionCombo");
            categoryOptionCombosResource.query({
                id: categoryOptionCombos[compte1].id,
                fields: 'name,id'
            },function (data) {
                //console.log(data);
                var temp = {};
                temp.name = data.name;
                temp.id = data.id;
                categoryOptionCombos[compte1] = temp;
                compte1++;
                if(compte1<categoryOptionCombos.length){
                    getCategoryOptionCombo();
                }else{
                    gestionCategoryCombo();
                }

            }, function (err) {

            });

        }

        function gestionCategoryCombo(){
            console.log("entrer dans gestionCategoryCombo");
            categoryOptionCombos.sort(compare);
            categoryCombo.categoryOptionCombos = angular.copy(categoryOptionCombos);
            collectCategoryCombo.push(categoryCombo);
            dataElement.categoryCombo = angular.copy(categoryCombo);
            dataElementContinu();
        }
        
        function prepaAffiche() {
            console.log("entrer dans prepaAffiche");
            //console.log("dataElementDataSets");
            //console.log(dataElementDataSets);
            $scope.collectData = [];
            for(var i = 0,j=dataElementDataSets.length;i<j;i++){
                var temp = {};
                temp.id = dataElementDataSets[i].id;
                temp.name = dataElementDataSets[i].name;
                temp.categoryComboName = dataElementDataSets[i].categoryCombo.name;
                temp.categoryComboId = dataElementDataSets[i].categoryCombo.id;
                temp.categoryComboOptionName = dataElementDataSets[i].categoryCombo.categoryOptionCombos[0].name;
                temp.categoryComboOptionId = dataElementDataSets[i].categoryCombo.categoryOptionCombos[0].id;
                temp.eltIDoptionID = "#{"+dataElementDataSets[i].id+"."+dataElementDataSets[i].categoryCombo.categoryOptionCombos[0].id+"}";
                temp.fusion = dataElementDataSets[i].categoryCombo.categoryOptionCombos.length;
                $scope.collectData.push(temp);
                if(temp.fusion > 1){
                    addLineSup(dataElementDataSets[i].id,dataElementDataSets[i].categoryCombo.categoryOptionCombos)
                }

            }
            //console.log("$scope.collectData");
            //console.log($scope.collectData);
            finExecution("ok");
        }
        
        function addLineSup(eltId,option) {
            //console.log("entrer dans addLineSup: eltId: ",eltId," option :",option);
            for(var i=1,j=option.length; i<j; i++){
                var temp={};
                temp.categoryComboOptionName = option[i].name;
                temp.categoryComboOptionId = option[i].id;
                temp.eltIDoptionID = "#{"+eltId+"."+option[i].id+"}";
                $scope.collectData.push(temp);
            }
        }

        function finExecution(info) {
            console.log("entrer dans finExecution");
            console.log("$scope.collectData", $scope.collectData);
            $scope.ExeEnCours = false;
            if(info=="erreur"){
                $scope.resulat = false;
                $scope.InfoResultat = "Une erreur est survenue, reessayez ou contactez l'administrateur"
            }
            if(info=="vide"){
                $scope.resulat = false;
                $scope.InfoResultat = "Aucun element de donnée"
            }
            if(info=="ok"){
                $scope.resulat = true;
            }
        }

        function compareName(a, b) {
            if (a.name > b.name)
                return 1;
            if (a.name < b.name)
                return -1;
            return 0;
        }
        //array.sort();
        function compare(a,b) {
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        }


        $scope.AllDataElements = function () {
            $scope.ExeEnCours = true;
            $scope.elementInfo = true;
            getAllDataElement();
        }

        function getAllDataElement() {
            console.log("entrer dans getAllDataElement");
            dataElementsResource.query({
                paging: false,
                fields: 'id,name,categoryCombo'
            },function (data) {
                console.log("resultat getAllDataElement: ",data);
                collectDataElement = data.dataElements;
                getALLCategoryCombo()
            }, function (err) {
                finExecution("erreur");
            });
        }
        function getALLCategoryCombo() {
            categoryComboResource.query({
                paging: false,
                fields: 'name,id,categoryOptionCombos'
            },function (data) {
                console.log("resultat getALLCategoryCombo ", data);
                collectCategoryCombo = data.categoryCombos;
                getALLcategoryOptionCombos();
            }, function (err) {

            });
        }
        function getALLcategoryOptionCombos(){
            categoryOptionCombosResource.query({
                paging:false,
                fields: 'name,id'
            },function (data) {
                console.log("resultat getALLcategoryOptionCombos ", data);
                collectCategoryOption = data.categoryOptionCombos;
                gestionCategorycombo();
            }, function (err) {

            });
        }

        function gestionCategorycombo() {
            console.log("entrer dans gestionCategorycombo");
            for(var i =0,j=collectCategoryCombo.length;i<j;i++){
                var temp ={};
                temp.id = collectCategoryCombo[i].id;
                temp.name = collectCategoryCombo[i].name;
                temp.categoryOptionCombos =[];
                temp.categoryOptionCombos = gestionCategoryOptionCombos(collectCategoryCombo[i].categoryOptionCombos);
            }
            gestionDataElement();
        }

        function gestionCategoryOptionCombos(option) {
            console.log("entrer dans gestionCategoryOptionCombos");
            var a=0,b=option.length;
            while(a<b){
                for(var i=0,j=collectCategoryOption.length;i<j;i++){
                    if(option[a].id == collectCategoryOption[i].id){
                        option[a] = collectCategoryOption[i];
                        break;
                    }
                }
                a++;
            }
            option.sort(compare);
            return option;
        }

        function gestionDataElement() {
            console.log("entrer dans gestionDataElement");
            var a=0,b=collectDataElement.length;
            while(a<b){
                for(var i=0,j=collectCategoryCombo.length;i<j;i++){
                    if(collectDataElement[a].categoryCombo.id == collectCategoryCombo[i].id){
                        collectDataElement[a].categoryCombo = collectCategoryCombo[i];
                        break;
                    }
                }
                a++;
            }
            
            console.log("terminer ",collectDataElement);
            dataElementDataSets = collectDataElement;
            prepaAffiche();
        }
        
        $scope.allIndicateurs = function () {
            $scope.ExeEnCours = true;
            $scope.elementInfo = false;
            getAllIndicateur();
        }
        
        function getAllIndicateur() {
            console.log("entrer dans getAllIndicateur");
            indicateursResource.query({
                paging:false,
                fields: 'name,id'
            },function (data) {
                console.log("resultat getAllIndicateur ", data);
                collectIndicateur = data.indicators;
                gestionIndicateur();
            }, function (err) {
                finExecution("erreur");
            });
        }

        function gestionIndicateur() {
            $scope.collectIndicators = collectIndicateur;
            finExecution("ok");
        }

    }
]);

