sigcidev.controller('facilityFormsComplete', ['$scope', '$rootScope', 'DataSetResource', 'completeDataSetRegistrations', '$timeout', 'orgUnitResource', '$filter',
    function ($scope, $rootScope, DataSetResource, completeDataSetRegistrations, $timeout, orgUnitResource, $filter) {

        var compte = 1, dataSetSelect = [], dateDebut, dateFin, compteOrg = 0, nivoBar=0, lePas = 0;
        var allOrgUnit = [], childrenDataSet = [], leOrgUnit, allDataSet = [],allOrgUnitCopy = [],childrens = [],childrenSelectDataSet =[];
        $scope.loadingDataSet = false;
        $scope.loadingAllDataSet = true;
        $scope.chargement = false;
        $scope.AttenteChargement = false;
        $scope.facility;
        $scope.collecteDataSet = [];
        $scope.collecteComplete = [];
        $scope.collecteDate = [];
        $scope.dataSet = "selection";
        $scope.collecteDataSet.unshift({id: 'selection', name: "  Selectionnez l' ensemble de donnée"});
        $scope.period = {};
        $scope.period.debut = "2016-01-01";
        var manDate = new Date();
        manDate.setDate(0);
        $scope.period.fin = manDate;
        $scope.etatDistrict = true;
        $scope.affichePeriod = false;
        $scope.module = "children";
        $scope.typePeriode = "";
        $scope.dataSetChildrens = [];
        $scope.lesOrgUnit = [];
        $scope.bars = 0;
        $scope.cacheNav = false;
        getAllDataSets();
        PeriodeType();
        chargerArbre();
        
        
        function chargerArbre() {
            if ($rootScope.arbre.length != 0) {
                console.log("test dans chargerArbre");
                return;
            }
            $timeout(function () {
                chargerArbre();
            }, 500);
        }

        function PeriodeType() {
            $scope.collectePeriodeType = ['Monthly', 'BiMonthly', 'Quarterly', 'SixMonthly', 'Yearly'];
        }

        function getAllDataSets() {
            console.log("entrer dans getAllDataSets");
            DataSetResource.query({
                paging: false,
                fields: 'name,id,periodType'
            }, function (resultat) {
                allDataSet = resultat.dataSets;
                $scope.loadingAllDataSet = false;
            }, function (err) {
                compte = 1;
                getDataSetDetail();
            });
        }

        function getDataSetDetail() {
            console.log("entrer dans getDataSetDetail");
            DataSetResource.query({
                fields: 'id,name,periodType'
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
            console.log("entrer dans getDataSetDetailAll");
            DataSetResource.query({
                paging: compte,
                fields: 'id,name,timelyDays,periodType'
            }, function (resultat) {
                var tempo1 = [], tempo2 = [];
                tempo1 = angular.copy(allDataSet);
                tempo2 = resultat.dataSets;
                allDataSet = tempo1.concat(tempo2);
                if (compte < comptePageCount) {
                    compte++;
                    getDataSetDetailAll();
                } else {
                    $scope.loadingAllDataSet = false;
                }
            }, function (err) {

            });
        }

        $scope.my_tree_handler = function (branch) {
            console.log("entrer dans brancheSelectionner");
            console.log(branch);
            $scope.dataSet = "selection";
            $scope.facility = branch.data;
            compte = 1;
            $scope.chargement = false;
            $scope.loadingDataSet = true;
            childrens = branch.children;
            console.log("$scope.module = "+$scope.module);
            if($scope.module=="selected"){
                $scope.affichePeriod = false;
                $scope.etatDistrict = false;
            }else{
                $scope.affichePeriod = false;
                $scope.etatDistrict = true;
            }
            if($scope.etatDistrict && branch.children.length != 0){
                $scope.affichePeriod = false;
                childrenDataSet = [];
                getAllOrgUnit(childrens);
            }else{
                $scope.etatDistrict = false;
                $scope.affichePeriod = true;
                getOrgUnit();
            }
        }

        function getOrgUnit() {
            console.log("entrer dans getOrgUnit");
            orgUnitResource.query({
                id: $scope.facility.id,
                fields: 'dataSets'
            }, function (data) {
                $scope.collecteDataSet = data.dataSets;
                if ($scope.collecteDataSet.length != 0) {
                    getDataSet();
                } else {
                    $scope.collecteDataSet.unshift({id: 'selection', name: "  Selectionnez l' ensemble de donnée",periodType : 'period'});
                    $scope.loadingDataSet = false;
                }
            });
        }

        function getDataSet() {
            console.log("entrer dans getDataSet");
            for (var i = 0, j = $scope.collecteDataSet.length; i < j; i++) {
                for (var a = 0, b = allDataSet.length; a < b; a++) {
                    if ($scope.collecteDataSet[i].id == allDataSet[a].id) {
                        $scope.collecteDataSet[i] = allDataSet[a];
                        break;
                    }
                }
            }
            $scope.collecteDataSet.unshift({id: 'tout', name: "  Selectionnez l' ensemble de donnée / TOUT AFFICHER",periodType : 'period'});
            $scope.dataSet = "tout";
            $scope.loadingDataSet = false;
            console.log("$scope.collecteDataSet +++++++");
            console.log($scope.collecteDataSet);
        }
        
        $scope.go = function () {
            console.log("entrer dans go");
            console.log("$scope.typePeriode = " + $scope.typePeriode);
            dataSetSelect = [];
            nivoBar=0, lePas = 0;
            $scope.bars = 0;
            $scope.chargement = false;
            if ($scope.etatDistrict) {
                $scope.AttenteChargement = true;
                formaterPeriode();
            } else {
                dateDebut = $filter('date')($scope.period.debut, 'yyyyMM'), dateFin = $filter('date')($scope.period.fin, 'yyyyMM');
                if ($scope.dataSet != "selection" && $scope.facility.id && $scope.period.debut && $scope.period.fin && dateDebut <= dateFin) {
                    getBar(5);
                    $scope.AttenteChargement = true;
                    if ($scope.dataSet == "tout") {
                        dataSetSelect = angular.copy($scope.collecteDataSet);
                        dataSetSelect.splice(0, 1);

                    } else {
                        for (var i = 0, j = $scope.collecteDataSet.length; i < j; i++) {
                            if ($scope.collecteDataSet[i].id == $scope.dataSet) {
                                dataSetSelect.push($scope.collecteDataSet[i]);
                            }
                        }

                    }
                    compte = 0;
                    leOrgUnit = $scope.facility.id;
                    $scope.collecteComplete = [];
                    $scope.collecteDate = [];
                    dateDebut = new Date($scope.period.debut);
                    dateDebut.setDate(1);
                    dateDebut = $filter('date')(dateDebut, 'yyyy-MM-dd');
                    dateFin = new Date($scope.period.fin);
                    dateFin.setDate(32);
                    dateFin.setDate(0);
                    var tempfin = $filter('date')(dateFin, 'yyyyMM');
                    dateFin = $filter('date')(dateFin, 'yyyy-MM-dd');
                    console.log("dateDebut = " + dateDebut + " et dateFin = " + dateFin + " et tempfin = " + tempfin);
                    var dateName = $filter('date')(dateDebut, 'MMMM yyyy');
                    var dateId = $filter('date')(dateDebut, 'yyyyMM');
                    $scope.collecteDate.push({id: dateId, name: dateName});
                    getBar(10);
                    if (tempfin == dateId) {
                        dataSetPeriod();
                        // formsComplete();
                    } else {
                        dateformat(dateDebut, tempfin);
                    }
                } else {
                    console.log("critère non respecté");
                }
            }

        }

        function dateformat(laDate, lafin) {
            //console.log("entrer dans dateformat");
            var temp = {};
            var dateSuivante = new Date(laDate);
            dateSuivante.setDate(32);
            dateSuivante.setDate(1);
            temp.name = $filter('date')(dateSuivante, 'MMMM yyyy');
            temp.id = $filter('date')(dateSuivante, 'yyyyMM');
            $scope.collecteDate.push(temp);
            if (temp.id != lafin) {
                dateformat(dateSuivante, lafin);
            } else {
                dataSetPeriod();
            }

        }

        function dataSetPeriod() {
            console.log("entrer dans dataSetPeriod");
            gestPercent(dataSetSelect.length,20);
            for (var i = 0, j = dataSetSelect.length; i < j; i++) {
                dataSetSelect[i].fusion = traitementPeriode(dataSetSelect[i].periodType);
                dataSetSelect[i].periode = nbreFusion(dataSetSelect[i].fusion);
                getBar(lePas);
            }
            /*console.log("dataSetSelect");
            console.log(dataSetSelect);*/
            gestPercent(dataSetSelect.length,65);
            formsComplete();
        }

        function traitementPeriode(period) {
            if (period == "Monthly") {
                return 1;
            }
            if (period == "BiMonthly") {
                return 2;
            }
            if (period == "Quarterly") {
                return 3;
            }
            if (period == "SixMonthly") {
                return 6;
            }
            if (period == "Yearly") {
                return 12;
            }
        }

        function nbreFusion(nbre) {

            var compter = 0, lesmois = [], temp = {};
            for (var i = 0, j = $scope.collecteDate.length; i < j; i++) {
                temp = {};
                var mois = $scope.collecteDate[i].id.substring(4);
                mois = parseInt(mois);
                var rest = mois % nbre;
                compter++;
                if (rest == 1) {
                    var preMois = $scope.collecteDate[i].id;
                }
                if (rest == 0) {
                    temp.mois = preMois;
                    if (!preMois) {
                        temp.mois = $scope.collecteDate[i].id;
                    }
                    temp.fusion = compter;
                    if (compter == nbre) {
                        temp.affiche = true;
                    } else {
                        temp.affiche = false;
                    }
                    compter = 0;
                    lesmois.push(temp);
                }
            }
            if (compter != 0) {
                temp = {};
                temp.mois = $scope.collecteDate[i - 1].id;
                temp.fusion = compter;
                temp.affiche = false;
                lesmois.push(temp);
                compter = 0;
            }
            return lesmois;
        }


        function formsComplete() {
            console.log("entrer dans formsComplete");
            completeDataSetRegistrations.query({
                dataSet: dataSetSelect[compte].id,
                startDate: dateDebut,
                endDate: dateFin,
                orgUnit: leOrgUnit,
                children: false
            }, function (data) {
                console.log("resultat de formsComplete");
                console.log(data);
                var etat = true;
                if (data.completeDataSetRegistrations) {
                    $scope.collecteComplete[compte] = data.completeDataSetRegistrations;
                    console.log("completeDataSetRegistrations existe");
                    console.log("completeDataSetRegistrations longueur = " + $scope.collecteComplete[compte].length);
                    if (data.completeDataSetRegistrations.length == 0) {
                        etat = false;
                    }
                } else {
                    $scope.collecteComplete[compte] = {};
                    etat = false;
                }
                dataSetSelect[compte].etat = etat;
                compte++;
                if (compte < dataSetSelect.length) {
                    if (!$scope.etatDistrict) {
                        getBar(lePas);
                    }
                    formsComplete();
                } else {
                    compte = 0;
                    if ($scope.etatDistrict) {
                        appelComplete(dataSetSelect);
                    } else {
                        console.log("$scope.collecteComplete fin formsComplete");
                        console.log(angular.copy($scope.collecteComplete));
                        gestPercent($scope.collecteComplete.length,15);
                        traiteComplete();
                    }
                }
            }, function (err) {

            });

        }

        function traiteComplete() {
            console.log("entrer dans traiteComplete");
            console.log("$scope.collecteComplete[compte]");
            console.log($scope.collecteComplete[compte]);
            var temp = {};
            if ($scope.collecteComplete[compte]) {
                for (var i = 0, j = $scope.collecteComplete[compte].length; i < j; i++) {
                    var peri = $scope.collecteComplete[compte][i].period;
                    var tp;
                    if(typeof peri === 'string'){
                        tp = gestionPeriode($scope.collecteComplete[compte][i].period);
                    }else {
                        tp = gestionPeriode($scope.collecteComplete[compte][i].period.id);
                    }
                    temp[tp] = tp;
                    $scope.collecteComplete[compte][i] = temp;
                }
            } else {
                console.log("++++$scope.collecteComplete[" + compte + "] = est incoplet++++");
                console.log($scope.collecteComplete[compte]);
            }
            temp.dataSet = dataSetSelect[compte].name;
            temp.id = dataSetSelect[compte].id;
            //temp.fusion = dataSetSelect[compte].fusion;
            temp.periode = dataSetSelect[compte].periode;
            temp.periodType = dataSetSelect[compte].periodType;
            $scope.collecteComplete[compte] = temp;
            compte++;
            getBar(lePas);
            if (compte < $scope.collecteComplete.length) {
                traiteComplete();
            } else {
                console.log("$scope.collecteComplete à fin traiteComplete********");
                console.log(angular.copy($scope.collecteComplete));
                $scope.chargement = true;
                $scope.AttenteChargement = false;
            }
        }

        function gestionPeriode(periode) {
            console.log("entrer dans gestionPeriode");
            console.log("periode = "+periode);
            console.log(periode);
            if (periode.indexOf('Q') != -1) {
                var posi = periode.indexOf('Q');
                //var ann = periode.id.substring(0,posi);
                var annee = periode.substring(0, 4);
                if (periode.substring(posi + 1) == "1") {
                    return (annee + "01");
                }
                if (periode.substring(posi + 1) == "2") {
                    return (annee + "04");
                }
                if (periode.substring(posi + 1) == "3") {
                    return (annee + "07");
                }
                if (periode.substring(posi + 1) == "4") {
                    return (annee + "10");
                }
            }

            if (periode.indexOf('B') != -1) {
                var annee = periode.id.substring(0, 4);
                if (periode.substring(4, 6) == "01") {
                    return (annee + "01");
                }
                if (periode.substring(4, 6) == "02") {
                    return (annee + "03");
                }
                if (periode.substring(4, 6) == "03") {
                    return (annee + "05");
                }
                if (periode.substring(4, 6) == "04") {
                    return (annee + "07");
                }
                if (periode.substring(4, 6) == "05") {
                    return (annee + "09");
                }
                if (periode.substring(4, 6) == "06") {
                    return (annee + "11");
                }
            }

            if (periode.indexOf('S') != -1) {
                var posi = periode.indexOf('S');
                var annee = periode.substring(0, 4);
                if (periode.substring(posi + 1) == "1") {
                    return (annee + "01");
                }
                if (periode.substring(posi + 1) == "2") {
                    return (annee + "07");
                }
            }
            if (periode.length == 4) {
                return (periode + "01");
            }
            else {
                /*var annee = periode.id.substring(0,4);
                 console.log("periode.id = "+periode.id);
                 console.log("annee = "+annee);
                 console.log("mois = "+periode.id.substring(4,6));
                 console.log("mois = "+periode.id.substring(4));*/
                return periode;
            }

        }

        $scope.datesMaxfin = function (dates) {
            return (dates < manDate);
        }

        function getAllOrgUnit(children) {
            console.log("entrer dans getAllOrgUnit");
            allOrgUnit = [];
            for (var i = 0, j = children.length; i < j; i++) {
                var temp = {};
                temp.id = children[i].id;
                temp.name = children[i].label;
                allOrgUnit.push(temp);
            }
            console.log("allOrgUnit");
            console.log(allOrgUnit);
            compte = 0;
            getOrgUnitDataSets();
        }

        function getOrgUnitDataSets() {
            console.log("entrer dans getOrgUnitDataSets");
            orgUnitResource.query({
                id: allOrgUnit[compte].id,
                fields: 'dataSets'
            }, function (data) {
                allOrgUnit[compte].dataSets = data.dataSets;
                collecteChildrenDataSet(data.dataSets);
                compte++;
                if (compte < allOrgUnit.length) {
                    getOrgUnitDataSets();
                } else {
                    allOrgUnitCopy = angular.copy(allOrgUnit);
                   getDataSetName();
                }
            });
        }

        function appelComplete(dataSet) {
            console.log("entrer dans appelComplete");
            if (dataSet) {
                allOrgUnit[compteOrg].dataSets = dataSet;
                testDataSet();
            } else {

            }
        }

        function testDataSet() {
            console.log("entrer dans testDataSet");
            getBar(lePas);
            compteOrg++;
            console.log("compteOrg = "+compteOrg);
            if (compteOrg < allOrgUnit.length) {
                if (allOrgUnit[compteOrg].dataSets.length != 0) {
                    dataSetSelect = allOrgUnit[compteOrg].dataSets;
                    leOrgUnit = allOrgUnit[compteOrg].id;
                    formsComplete();
                } else {
                    //getBar(lePas);
                    testDataSet();
                }
            } else {
                ajouteDataSet();
            }
        }

        function collecteChildrenDataSet(collecte) {
            console.log("entrer dans collecteChildrenDataSet");
            var j = collecte.length;
            if (j != 0) {
                for (var i = 0; i < j; i++) {
                    var trouver = false;
                    for (var a = 0, b = childrenDataSet.length; a < b; a++) {
                        if (collecte[i].id == childrenDataSet[a].id) {
                            trouver = true;
                            break;
                        }
                    }
                    if (!trouver) {
                        childrenDataSet.push(collecte[i]);
                    }
                }
            }
        }

        function ajouteDataSet() {
            console.log("entrer dans ajouteDataSet");
            gestPercent(allOrgUnit.length,5);
            for (var k = 0, l = allOrgUnit.length; k < l; k++) {
                var dataSet = [];
                for (var i = 0, j = childrenDataSet.length; i < j; i++) {
                    var trouver = false;
                    for (var a = 0, b = allOrgUnit[k].dataSets.length; a < b; a++) {
                        if (childrenDataSet[i].id == allOrgUnit[k].dataSets[a].id) {
                            trouver = true;
                            break;
                        }
                    }
                    
                    if (trouver) {
                        allOrgUnit[k].dataSets[a].existe = true;
                        dataSet.push(allOrgUnit[k].dataSets[a]);
                    } else {
                        childrenDataSet[i].existe = false;
                        dataSet.push(childrenDataSet[i]);
                    }
                }
                getBar(lePas);
                allOrgUnit[k].dataSets = dataSet;
            }
            //$scope.dataSetChildrens = childrenDataSet;
            $scope.lesOrgUnit = allOrgUnit;
            $scope.AttenteChargement = false;
            $scope.chargement = true;
            console.log("allOrgUnit +++++*****");
            console.log(allOrgUnit);
        }
        
        function getDataSetName(){
            console.log("entrer dans getDataSetName");
            $scope.collecteDataSet = [];
            for(var i=0,j=childrenDataSet.length;i<j;i++){
                for(var a=0,b=allDataSet.length;a<b;a++){
                    if(childrenDataSet[i].id == allDataSet[a].id){
                        childrenDataSet[i] = allDataSet[a];
                        break;
                    }
                }
            }
            /*console.log("allDataSet");
            console.log(allDataSet);
            console.log("childrenDataSet");
            console.log(childrenDataSet);*/
            childrenSelectDataSet = angular.copy(childrenDataSet);
            if($scope.typePeriode != ""){
                periodeSeclect($scope.typePeriode);
            }else{
                finPeriod();
            }
            
        }

        function formaterPeriode() {
            console.log("entrer dans formaterPeriode");
            if($scope.affichePeriod){
                dateDebut = angular.copy($scope.period.debut);
                dateDebut = new Date(dateDebut);
                dateDebut.setDate(1);
                dateDebut = $filter('date')(dateDebut, 'yyyy-MM-dd');
                dateFin = angular.copy($scope.period.fin);
                dateFin.setDate(32);
                dateFin.setDate(0);
                dateFin = $filter('date')(dateFin, 'yyyy-MM-dd');
            }else{
                var temp = angular.copy($scope.period.fin);
                dateDebut = angular.copy(temp.setDate(1));
                dateDebut = $filter('date')(dateDebut, 'yyyy-MM-dd');
                temp.setDate(32);
                dateFin = temp.setDate(0);
                dateFin = $filter('date')(dateFin, 'yyyy-MM-dd');
            }
            console.log("dateDebut = "+dateDebut+" dateFin = "+dateFin);
            getBar(5);
            ledataSetSelect();
        }
        
        function ledataSetSelect() {
            console.log("entrer dans ledataSetSelect");
            allOrgUnit = angular.copy(allOrgUnitCopy);
            compteOrg = -1;
            childrenDataSet = [];
            compte =0;
            if($scope.dataSet == "all"){
                var temp = angular.copy($scope.collecteDataSet);
                temp.splice(0,1);
                //temp.splice(temp.length - 1,1);
                childrenDataSet = temp;
                getBar(10);
                gestPercent(allOrgUnit.length,80);
                testDataSet();
            }else{
                for(var i=0,j=$scope.collecteDataSet.length;i<j;i++){
                    if($scope.dataSet == $scope.collecteDataSet[i].id){
                        childrenDataSet.push($scope.collecteDataSet[i]);
                        getBar(10);
                        selectOrgUnitDataSet($scope.dataSet);
                        break;
                    }
                }
            }

            $scope.dataSetChildrens = childrenDataSet;
            console.log("$scope.dataSetChildrens");
            console.log($scope.dataSetChildrens);
            
        }

        function selectOrgUnitDataSet(leSet) {
            console.log("entrer dans selectOrgUnitDataSet");
            gestPercent(allOrgUnit.length,20);
            for(var i=0,j=allOrgUnit.length;i<j;i++){
                var a = 0;
                while(a < allOrgUnit[i].dataSets.length){
                    if(leSet != allOrgUnit[i].dataSets[a].id){
                        allOrgUnit[i].dataSets.splice(a,1);
                        a--;
                    }
                    a++;
                }
                getBar(lePas);
            }
            gestPercent(allOrgUnit.length,40);
            testDataSet();
        }
        
        $scope.Select = function (id) {
            $scope.orgSelect = id;
        }
        
        $scope.radioSelect = function (etat) {
            $scope.chargement = false;
            if(etat=="selected"){
                $scope.etatDistrict = false;
                $scope.affichePeriod = true;
                $scope.typePeriode = "";
                if($scope.facility){
                    $scope.loadingDataSet = true;
                    getOrgUnit();
                }
            }else{
                $scope.etatDistrict = true;
                $scope.affichePeriod = false;
                if($scope.facility){
                    $scope.loadingDataSet = true;
                    childrenDataSet = [];
                    if(childrens.length != 0){
                        getAllOrgUnit(childrens);
                    }else{
                        $scope.etatDistrict = false;
                        $scope.affichePeriod = true;
                        getOrgUnit();
                    }
                }
                
            }
        }

        function periodeSeclect(periode) {
            console.log("entrer dans periodeSeclect");
            $scope.collecteDataSet = angular.copy(childrenSelectDataSet);
            var a = 0,continu = true;
            while(continu){
                if($scope.collecteDataSet[a].periodType != periode){
                    $scope.collecteDataSet.splice(a,1);
                    a--;
                }
                a++;
                if(a == $scope.collecteDataSet.length){
                    continu = false;
                }
            }
            finPeriod();
        }
        
        function finPeriod() {
            if($scope.collecteDataSet.length == 0){
                $scope.dataSet = "selection";
                $scope.collecteDataSet.push({id: 'selection', name: "  Selectionnez l' ensemble de donnée",periodType : 'period'});
            }else{
                $scope.dataSet = "all";
                $scope.collecteDataSet.unshift({id: 'all', name: "  Selectionnez l' ensemble de donnée / TOUT AFFICHER",periodType : 'period'});
            }
            console.log("$scope.collecteDataSet");
            console.log($scope.collecteDataSet);
            $scope.loadingDataSet = false;
        }
        
        $scope.choisirPeriode = function (periode) {
            console.log("entrer dans choisirPeriode");
            if(childrenSelectDataSet.length != 0){
                $scope.loadingDataSet = true;
                if(periode != "Monthly"){
                    $scope.affichePeriod = true;
                }else{
                    $scope.affichePeriod = false;
                }
                periodeSeclect(periode);
            }
        }

        function getBar(nbre) {
            nivoBar += nbre;
            if(nivoBar > 100){
                console.log("nivo depasse 100");
                nivoBar = 100
            }else{
                console.log("nivoBar = "+nivoBar);
            }
            $scope.bars = nivoBar | 0;
        }
        
        function gestPercent(long,percent) {
            lePas = percent/long;
        }

        $scope.cacher = function (test) {
             console.log("entrer dans $scope.cacher");
            console.log("test = "+test);
            if(test == true){
                console.log("entrer test true");
                $scope.cacheNav = true;
            }else{
                $scope.cacheNav = false;
            }
        }
    }
]);
