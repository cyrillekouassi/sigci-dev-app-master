sigcidev.controller('FacilityTrackerCtrl', ['$scope', '$rootScope', 'programs', 'programTrackedEntityAttributes', 'trackedEntityAttributes', 'options', 'enrollments', 'optionSets', 'trackedEntityInstances', 'deleteTrackedEntityInstances', '$timeout',
    function ($scope, $rootScope, programs, programTrackedEntityAttributes, trackedEntityAttributes, options, enrollments, optionSets, trackedEntityInstances, deleteTrackedEntityInstances, $timeout) {
        var OrgUnitN1TEST = [], OrgUnitN2TEST = [], OrgUnitN3TEST = [], OrgUnitN4TEST = [], programSet = [], leProgram = 0, nbreProgram, leProgramAttribut = 0, nbreOption, leOption = 0, trackerInstanceSet = [], leInstance = 0, programChoisi = {}, instanceID, index, laPage = 1, collecteInstance = [], collecteDoublon = [], indiceDoublon = [], normalDoublonIncomplet = "normal", collecteIncomplet = [], indiceIncomplet = [], collecteAttributValue = [];
        var collecteInstanceProgram1 = [], collecteInstanceProgram2 = [], colect1 = "NO", collecteConcordant4 = [],collecteConcordant3=[],collecteOptions=[];
        var test2,nbreInstance = 0;
        $scope.lesPrograms = [];
        $scope.afficheInstance = [];
        $scope.lesAttributs = [];
        $scope.lesPrograms.push({id: "selectionner", name: "Selectionnez le Programme"});
        $scope.leChoix = "selectionner";
        $scope.afficheNbreNotif = false;
        $scope.afficheTableNotif = false;
        $scope.loadingTable = false;
        $scope.afficheRecaputulatif = false;
        $scope.acces = "SELECTED";
        $scope.typeCas = "Cas alerte devenu suspect";
        $scope.nbrePage = [];
        $scope.pageAffiche = 0;
        $scope.indiceIndex = 0;
        $scope.nbreTotalCas = 0;
        $scope.textInformation = "";
        $scope.doublon = false;
        $scope.incomplet = false;
        $scope.alerSusp = "NO";
        $scope.lesPrograms1 = [];
        $scope.lesPrograms2 = [];
        $scope.collectSimilutude4 = [];
        $scope.lesPrograms1.push({id: "selectionner", name: "Selectionnez le Programme 1"});
        $scope.lesPrograms2.push({id: "selectionner", name: "Selectionnez le Programme 2"});
        $scope.leChoixPremier = "selectionner";
        $scope.leChoixSecond = "selectionner";
        $scope.info = "";
        $scope.afficheSimilitude = false;
        $scope.optionSetsName = [];
        $scope.options = [];
        $scope.optionsNbre =[];

        console.log("$rootScope.arbre dans tracker");
        console.log($rootScope.arbre);

        getProgram();
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

        $scope.my_tree_handler = function (branch) {
            console.log("entrer dans brancheSelectionner");
            $scope.facility = branch.data;
            if ($scope.alerSusp == "YES") {
                paramYes();
            }else{
                paramNo();
            }

        }
        
        function paramYes() {
            nosProgram();
            $scope.lesPrograms1 = angular.copy($scope.lesPrograms);
            $scope.lesPrograms2 = angular.copy($scope.lesPrograms);
            $scope.lesPrograms1.unshift({id: "selectionner", name: "Selectionnez le Programme 1"});
            $scope.lesPrograms2.unshift({id: "selectionner", name: "Selectionnez le Programme 2"});
        }
        
        function paramNo() {
            $scope.loadingTable = true;
            $scope.afficheNbreNotif = false;
            $scope.afficheTableNotif = false;
            $scope.afficheRecaputulatif = false;
            $scope.indiceIndex = 0;
            $scope.doublon = false;
            $scope.incomplet = false;
            normalDoublonIncomplet = "normal";
            nosProgram();
            $scope.lesPrograms.unshift({id: "selectionner", name: "Selectionnez le Programme"});
            collecteInstance = [];
            collecteAttributValue = [];
            trackerInstanceSet = [];
            if ($scope.lesAttributs.length != 0 && $scope.leChoix != "selectionner") {
                leInstance = 0;
                getTrackerInstance();
            } else {
                $scope.loadingTable = false;
                //$scope.afficheNbreNotif = true;
            }
        }

        $scope.my_tree = {};

        function getProgram() {
            console.log("entrer dans getProgram");
            programs.query({
                paging: false,
                fields: 'id,name'
            }, function (data) {
                programSet = data.programs;
                nbreProgram = programSet.length;
                programOrgUnit();
            }, function () {

            });
        }

        function programOrgUnit() {
            console.log("entrer dans programOrgUnit");
            programs.query({
                id: programSet[leProgram].id,
                fields: 'id,name,organisationUnits,programTrackedEntityAttributes'
            }, function (data) {
                console.log("resultat get programs orgUnit");
                console.log(data);
                programSet[leProgram].programTrackedEntityAttributes = [];
                programSet[leProgram].organisationUnits = [];
                programSet[leProgram].programTrackedEntityAttributes = data.programTrackedEntityAttributes;
                programSet[leProgram].organisationUnits = data.organisationUnits;
                leProgram++;
                if (leProgram < nbreProgram) {
                    programOrgUnit();
                } else {
                    leProgram = 0;
                    /*console.log("programSet");
                     console.log(programSet);*/
                }
            }, function () {
            });
        }


        function nosProgram() {
            console.log("entrer dans nosProgram");
            $scope.lesPrograms = [];
            var tp = "NO";
            var temp = {};
            for (var i = 0; i < nbreProgram; i++) {
                for (var a = 0, b = programSet[i].organisationUnits.length; a < b; a++) {
                    if (programSet[i].organisationUnits[a]) {
                        if ($scope.facility.id == programSet[i].organisationUnits[a].id) {
                            temp = {};
                            temp.id = programSet[i].id;
                            temp.name = programSet[i].name;
                            temp.programTrackedEntityAttributes = [];
                            temp.programTrackedEntityAttributes = programSet[i].programTrackedEntityAttributes;
                            if ($scope.leChoix == temp.id) {
                                tp = "YES";
                            }
                            $scope.lesPrograms.push(temp);
                            break;
                        }
                    }
                }
            }
            if (tp == "NO") {
                $scope.leChoix = "selectionner";
            }
            /*console.log("$scope.lesPrograms");
             console.log($scope.lesPrograms);*/
        }

        $scope.executerProgram = function () {
            console.log("entrer dans executerProgram");
            collecteInstance = [];
            trackerInstanceSet = [];
            collecteAttributValue = [];
            $scope.indiceIndex = 0;
            $scope.loadingTable = true;
            $scope.afficheNbreNotif = false;
            $scope.afficheTableNotif = false;
            $scope.doublon = false;
            $scope.incomplet = false;
            $scope.afficheRecaputulatif = false;
            normalDoublonIncomplet = "normal";
            console.log("$scope.leChoix = "+$scope.leChoix);
            if ($scope.leChoix && $scope.leChoix != "selectionner") {
                for (var i = 0, j = $scope.lesPrograms.length; i < j; i++) {
                    if ($scope.leChoix == $scope.lesPrograms[i].id) {
                        programChoisi = $scope.lesPrograms[i];
                        break;
                    }
                }
                $scope.lesAttributs = [];
                collecteOptions = [];
                getProgramEntityAttribut();

            } else {
                $scope.loadingTable = false;
                // $scope.afficheNbreNotif = true;
            }

        }

        function getProgramEntityAttribut() {
            console.log("entrer dans getProgramEntityAttribut");
            if (programChoisi.programTrackedEntityAttributes.length != 0 && programChoisi.programTrackedEntityAttributes.length != leProgramAttribut) {
                programTrackedEntityAttributes.query({
                    id: programChoisi.programTrackedEntityAttributes[leProgramAttribut].id,
                    fields: 'trackedEntityAttribute'
                }, function (data) {
                    leProgramAttribut++;
                    getAttribut(data.trackedEntityAttribute.id);
                }, function () {

                });
            } else if (programChoisi.programTrackedEntityAttributes.length == leProgramAttribut) {
                leProgramAttribut = 0;
                /*console.log("$scope.lesAttributs");
                 console.log($scope.lesAttributs);*/
                getTrackerInstance();
            }
        }

        function getAttribut(attributID) {
            console.log("entrer dans getAttribut");
            trackedEntityAttributes.query({
                id: attributID,
                fields: 'id,name,optionSet'
            }, function (data) {
                var tp = {};
                tp = data;
                tp.enrollmentDate = "Date de notification de l'évènement";
                tp.incidentDate = "Date d'incidence";
                /*console.log("tp");
                 console.log(tp);*/
                $scope.lesAttributs.push(tp);
                if (data.optionSet) {
                    getOptionSet(data.optionSet.id);
                } else {
                    getProgramEntityAttribut();
                }
            }, function () {

            });
        }

        function getOptionSet(optionSetID) {
            console.log("entrer dans getOptionSet");
            optionSets.query({
                id: optionSetID,
                fields: 'id,name,options'
            }, function (data) {
                $scope.lesAttributs[$scope.lesAttributs.length - 1].optionSet = data;
                nbreOption = data.options.length;
                getOptions();

            }, function () {

            });
        }

        function getOptions() {
            console.log("entrer dans getOptions");
            /*console.log("$scope.lesAttributs");
             console.log($scope.lesAttributs);
             console.log($scope.lesAttributs[$scope.lesAttributs.length-1].optionSet.options[leOption].id);*/
            options.query({
                id: $scope.lesAttributs[$scope.lesAttributs.length - 1].optionSet.options[leOption].id,
                fields: 'id,name,code'
            }, function (data) {
                console.log("RETOUR dans getOptions");
                $scope.lesAttributs[$scope.lesAttributs.length - 1].optionSet.options[leOption] = data;
                leOption++;
                if (leOption < nbreOption) {
                    getOptions();
                } else {
                    leOption = 0;
                    getProgramEntityAttribut();
                }
            }, function () {

            });
        }

        function getTrackerInstance() {
            console.log("entrer dans getTrackerInstance");
            trackedEntityInstances.query({
                ou: $scope.facility.id,
                program: programChoisi.id,
                ouMode: $scope.acces,
                page: laPage
            }, function (data) {
                //console.log(data);
                var tempo1 = [], tempo2 = [];
                tempo2 = data.trackedEntityInstances;
                //console.log("tempo2.length = " + tempo2.length);
                if (tempo2.length != 0) {
                    //console.log("trackerInstanceSet");
                    tempo1 = angular.copy(trackerInstanceSet);
                    trackerInstanceSet = tempo1.concat(tempo2);
                    //console.log(trackerInstanceSet);
                    laPage++;
                    getTrackerInstance();
                } else {
                    if ($scope.alerSusp == "NO") {
                        laPage = 1;
                        nbreInstance = trackerInstanceSet.length;
                        $scope.textInformation = "Nombre de notification: " + nbreInstance;
                        if (trackerInstanceSet.length != 0) {
                            getOrgUnitName();
                        } else {
                            $scope.loadingTable = false;
                            $scope.afficheNbreNotif = true;
                        }
                    } else {
                        //console.log("sortie getTracker");
                        if (colect1 == "NO") {
                            //console.log(angular.copy(trackerInstanceSet));
                            getProgram2();
                        } else {
                           // console.log(angular.copy(trackerInstanceSet));
                            conformeProgram();
                        }
                    }

                }

            }, function () {

            });
        }

        function getOrgUnitName() {
            console.log("entrer dans getOrgUnitName");
            var allOrgUnit = $rootScope.allOrgUnit;
            //console.log(angular.copy(trackerInstanceSet));
            for (var i = 0, j = trackerInstanceSet.length; i < j; i++) {
                for (var a = 0, b = allOrgUnit.length; a < b; a++) {
                    if (trackerInstanceSet[i].orgUnit == allOrgUnit[a].id) {
                        trackerInstanceSet[i].orgUnitName = allOrgUnit[a].name;
                        break;
                    }
                }
            }
            //console.log(angular.copy(trackerInstanceSet));
            instanceEnrollementDate();
        }

        function instanceEnrollementDate() {
            console.log("entrer dans instanceEnrollementDate");
            enrollments.query({
                ou: trackerInstanceSet[leInstance].orgUnit,
                trackedEntityInstance: trackerInstanceSet[leInstance].trackedEntityInstance
            }, function (data) {
                trackerInstanceSet[leInstance].enrollmentDate = data.enrollments[0].enrollmentDate;
                trackerInstanceSet[leInstance].incidentDate = data.enrollments[0].incidentDate;
                //console.log(trackerInstanceSet);
                leInstance++;
                if (leInstance != nbreInstance) {
                    instanceEnrollementDate();
                } else {
                    leInstance = 0;
                    constitutionInstance();
                }
            }, function () {

            });
        }

        function constitutionInstance() {
            console.log("entrer dans constitutionInstance");
            for (var i = 0, j = trackerInstanceSet.length; i < j; i++) {
                var temp = {};
                for (var a = 0, b = trackerInstanceSet[i].attributes.length; a < b; a++) {
                    for (var n = 0, m = $scope.lesAttributs.length; n < m; n++) {
                        if (trackerInstanceSet[i].attributes[a].attribute == $scope.lesAttributs[n].id) {
                            if ($scope.lesAttributs[n].optionSet) {
                                for (var k = 0, l = $scope.lesAttributs[n].optionSet.options.length; k < l; k++) {
                                    if (trackerInstanceSet[i].attributes[a].value == $scope.lesAttributs[n].optionSet.options[k].code) {
                                        temp[$scope.lesAttributs[n].id] = $scope.lesAttributs[n].optionSet.options[k].name;
                                        collecteOptions.push($scope.lesAttributs[n].optionSet.options[k]);
                                        break;
                                    }
                                }
                            } else {
                                temp[$scope.lesAttributs[n].id] = trackerInstanceSet[i].attributes[a].value;
                            }
                            break;
                        }
                    }
                }
                temp.orgUnitName = trackerInstanceSet[i].orgUnitName;
                collecteAttributValue.push(angular.copy(temp));
                temp.trackedEntityInstance = trackerInstanceSet[i].trackedEntityInstance;
                temp.enrollmentDate = trackerInstanceSet[i].enrollmentDate;
                temp.incidentDate = trackerInstanceSet[i].incidentDate;
                collecteInstance.push(temp);
                if (collecteInstance.length == 50) {
                    getPagination(angular.copy(collecteInstance.length));
                    $scope.changerPage(1, angular.copy(collecteInstance.length));
                    $scope.loadingTable = false;
                    $scope.afficheNbreNotif = true;
                    $scope.afficheTableNotif = true;
                }
            }
            if (collecteInstance.length < 50) {
                getPagination(collecteInstance.length);
                $scope.changerPage(1, collecteInstance.length);

                $scope.loadingTable = false;
                $scope.afficheNbreNotif = true;
                $scope.afficheTableNotif = true;
            }
            $scope.textInformation = "Nombre de notification: " + collecteInstance.length;
            getPagination(collecteInstance.length);
            $scope.pageAffiche = $scope.nbrePage.length - 1;
            getOptionsNumber();
        }

        function getOptionsNumber() {
            console.log("entrer dans getOptionsNumber");
            $scope.optionSetsName = [];
            $scope.options = [];
            $scope.optionsNbre =[];
            for(var i=0,j=$scope.lesAttributs.length;i<j;i++){
                if($scope.lesAttributs[i].optionSet){
                    $scope.optionSetsName.push({id: $scope.lesAttributs[i].id, name: $scope.lesAttributs[i].name});
                    for(var a=0,b=$scope.lesAttributs[i].optionSet.options.length;a<b;a++){
                        var temp ={};
                        temp.id = $scope.lesAttributs[i].optionSet.options[a].id;
                        temp.name = $scope.lesAttributs[i].optionSet.options[a].name;
                        temp.pid= $scope.lesAttributs[i].id;
                        $scope.options.push(temp);
                    }
                }
            }
           // console.log("fin chargement option");
            console.log("collecteOptions = ")
            //if(collecteOptions.length != 0){

                for(var m=0,n=$scope.options.length;m<n;m++){
                    var nbre = 0;
                    for(var k=0,l=collecteOptions.length;k<l;k++){
                        if($scope.options[m].id == collecteOptions[k].id){
                            nbre++;
                        }
                    }
                    var temp={};
                    temp[$scope.options[m].id] = nbre;
                    $scope.optionsNbre.push(temp);
                }
            //}
            suppOptions();
        }

        function suppOptions() {
            console.log("entrer dans suppOptions++");
            var temp = ""; var i = 0;
            while(i<$scope.optionSetsName.length){
                if($scope.optionSetsName[i].name == "Sexe"){
                    temp = $scope.optionSetsName[i].id;
                    $scope.optionSetsName.splice(i,1);
                    i--;
                }
                i++;
            }
            var i = 0;
            console.log("$scope.options avant delete");
            console.log(angular.copy($scope.options));
            while(i<$scope.options.length){
                if($scope.options[i].pid == temp){
                    //temp = $scope.options[i].id;
                    var a=0;
                    while(a<$scope.optionsNbre.length){
                        if($scope.options[i].id in $scope.optionsNbre[a]) {
                            $scope.optionsNbre.splice(a,1);
                            a--;
                        }
                        a++;
                    }
                    $scope.options.splice(i,1);
                    i--;
                }
                i++;
            }
            $scope.nbreTotalCas = 0;
            for(var ba=0,aa=$scope.options.length;ba<aa;ba++){
                var iden = $scope.options[ba].id;
                for(var ab=0,bb=$scope.optionsNbre.length;ab<bb;ab++){
                    var idenT = $scope.optionsNbre[ab];
                    if(idenT[iden]){
                        $scope.nbreTotalCas = $scope.nbreTotalCas+idenT[iden];
                        break;
                    }
                }
            }

            console.log("$scope.optionSetsName");
            console.log(angular.copy($scope.optionSetsName));
            console.log("$scope.options");
            console.log(angular.copy($scope.options));
            console.log("$scope.optionsNbre");
            console.log(angular.copy($scope.optionsNbre));
        }
        
        $scope.removeInstance = function (instanceId, indexId) {
            if (confirm("Attention!!! voulez-vous Supprimer?")) {
                instanceID = instanceId;
                index = indexId;
                console.log("instanceID = " + instanceID + "index = " + index);
                //deleteLine(index,instanceID);
                deleteTrackedEntityInstances.delete({id: instanceID}, function (data) {
                    console.log("resultat de suppression instance reussit");
                    console.log(data);
                    deleteLine(index, instanceID);
                }, function (err) {
                    console.log("resultat de suppression instance echec");
                    console.log(err);
                    $scope.executerProgram();

                });
            }

        }

        $scope.changerPage = function (pageActu, ind) {
            console.log("entrer dans changerPage");
            $scope.pageAffiche = ind;

            for (var i = 0, j = $scope.nbrePage.length; i < j; i++) {
                if ($scope.nbrePage[i].page == pageActu) {
                    //console.log("$scope.nbrePage pour i = " + i);
                    //console.log($scope.nbrePage);

                    $scope.indiceIndex = $scope.nbrePage[i].NPpage;
                    break;
                }
            }
            //console.log("$scope.nbrePage pour i = " + i);
            //console.log($scope.nbrePage);
            getPageInstance($scope.nbrePage[i].NPpage, $scope.nbrePage[i].Npage);
        }

        function getPageInstance(debut, fin) {
            console.log("entrer dans getPageInstance");
            /*console.log("entrer dans getPageInstance: debut = " + debut + " fin = " + fin);
            console.log("collecteAttributValue");
            console.log(collecteAttributValue)
            console.log("collecteInstance");
            console.log(collecteInstance);*/
            $scope.afficheInstance = [];
            if (normalDoublonIncomplet == "doublon") {
                //if($scope.nbrePage.length != 0){
                $scope.afficheInstance = collecteDoublon.slice(debut, fin);
                // }
                /*console.log("afficheInstance de collecteDoublon");
                console.log(collecteDoublon.slice(debut, fin));
                console.log($scope.afficheInstance);*/
            }
            if (normalDoublonIncomplet == "normal") {
                // if($scope.nbrePage.length != 0){
                $scope.afficheInstance = collecteInstance.slice(debut, fin);
                // }
                $scope.textInformation = "Nombre de notification: " + collecteInstance.length;
                /*console.log("afficheInstance de collecteInstance");
                console.log(collecteInstance.slice(debut, fin));
                console.log($scope.afficheInstance);*/
            }
            if (normalDoublonIncomplet == "incomplet") {
                //if($scope.nbrePage.length != 0){
                $scope.afficheInstance = collecteIncomplet.slice(debut, fin);
                // }
                /*console.log("collecteIncomplet de collecteInstance");
                console.log(collecteIncomplet.slice(debut, fin));
                console.log($scope.afficheInstance);*/
            }
        }

        $scope.rechercheDoublon = function () {
            normalDoublonIncomplet = "doublon";
            console.log("Entrer dans rechercheDoublon");
            $scope.doublon = true;
            $scope.loadingTable = true;
            $scope.afficheNbreNotif = false;
            $scope.afficheTableNotif = false;
            $scope.afficheRecaputulatif = false;
            indiceDoublon = []
            collecteDoublon = [];
            collecteDoublon = angular.copy(collecteAttributValue);
            for (var i = 0, j = collecteDoublon.length; i < j; i++) {
                for (var a = i + 1, b = j; a < b; a++) {
                    if (angular.equals(collecteDoublon[i], collecteDoublon[a])) {
                        if (indiceDoublon.indexOf(i) == -1) {
                            indiceDoublon.push(i);
                        }
                        if (indiceDoublon.indexOf(a) == -1) {
                            indiceDoublon.push(a);
                        }
                    }
                }
            }
            collecteDoublon = [];
            if (indiceDoublon.length != 0) {
                for (var i = 0, j = indiceDoublon.length; i < j; i++) {
                    collecteDoublon.push(collecteInstance[indiceDoublon[i]]);
                }
                getPagination(collecteDoublon.length);
                $scope.changerPage(1, $scope.nbrePage.length - 1);
            } else {
                $scope.afficheInstance = [];
            }
            $scope.loadingTable = false;
            $scope.afficheNbreNotif = true;
            $scope.afficheTableNotif = true;
            $scope.textInformation = collecteDoublon.length + " notification(s) repétée(s)";
            $scope.pageAffiche = $scope.nbrePage.length - 1;
            console.log("collecteDoublon");
            console.log(collecteDoublon);
            console.log("collecteAttributValue");
            console.log(collecteAttributValue);
        }

        function getPagination(long) {
            console.log("entrer dans getPagination");
            //console.log("long = " + angular.copy(long));
            $scope.nbrePage = [];
            var leReste = long % 50;
            long -= leReste;
            //console.log("long = " + angular.copy(long));
            //console.log("leReste = " + leReste);
            var pageDoublon = long / 50;
           // console.log("pageDoublon = " + pageDoublon);
            for (var i = 1, j = pageDoublon + 1; i < j; i++) {
                var temp = {};
                temp.page = i;
                temp.Npage = i * 50;
                temp.NPpage = (i - 1) * 50;
                $scope.nbrePage.unshift(temp);
            }
            //console.log("$scope.nbrePage apres constitution dans getPagination");
            //console.log(angular.copy($scope.nbrePage));
            if (leReste != 0 && pageDoublon != 0) {
                var temp = {};
                temp.page = i;
                temp.Npage = i * 50;
                temp.NPpage = (i - 1) * 50;
                $scope.nbrePage.unshift(temp);
            }
            if (leReste != 0 && pageDoublon == 0) {
                var temp = {};
                temp.page = i;
                temp.Npage = leReste;
                temp.NPpage = 0;
                $scope.nbrePage.unshift(temp);
            }
        }

        $scope.voirTout = function () {
            console.log("entrer dans voirTout");
            normalDoublonIncomplet = "normal";
            $scope.afficheRecaputulatif = false;
            $scope.doublon = false;
            $scope.incomplet = false;
            getPagination(collecteInstance.length);
            $scope.textInformation = "Nombre de notification: " + nbreInstance;
            $scope.changerPage(1, $scope.nbrePage.length - 1);
            $scope.pageAffiche = $scope.nbrePage.length - 1;
            $scope.loadingTable = false;
            $scope.afficheNbreNotif = true;
            $scope.afficheTableNotif = true;
        }

        $scope.rechercheIncomplet = function () {
            console.log("Entrer dans rechercheIncomplet");
            normalDoublonIncomplet = "incomplet";
            $scope.doublon = true;
            $scope.incomplet = true;
            $scope.loadingTable = true;
            $scope.afficheNbreNotif = false;
            $scope.afficheTableNotif = false;
            $scope.afficheRecaputulatif = false;
            indiceIncomplet = [];
            collecteIncomplet = [];
            collecteIncomplet = angular.copy(collecteAttributValue);
            console.log(angular.copy(collecteIncomplet));
            for (var i = 0, j = collecteIncomplet.length; i < j; i++) {
                var long = 0;
                for (var id in collecteIncomplet[i]) {
                    long++;
                }
                long--;
                //console.log(long+" != "+$scope.lesAttributs.length);
                if (long != $scope.lesAttributs.length) {
                    indiceIncomplet.push(i);
                }

            }
            collecteIncomplet = [];
            if (indiceIncomplet.length != 0) {
                for (var i = 0, j = indiceIncomplet.length; i < j; i++) {
                    collecteIncomplet.push(collecteInstance[indiceIncomplet[i]]);
                }
                getPagination(collecteIncomplet.length);
                $scope.changerPage(1, $scope.nbrePage.length - 1);
            } else {
                $scope.afficheInstance = [];
            }
            $scope.loadingTable = false;
            $scope.afficheNbreNotif = true;
            $scope.afficheTableNotif = true;
            $scope.textInformation = collecteIncomplet.length + " notification(s) Incomplète(s)";
            $scope.pageAffiche = $scope.nbrePage.length - 1;
            /*console.log("collecteIncomplet");
             console.log(collecteIncomplet);*/
        }

        function deleteLine(index, instanceID) {
            console.log("entrer dans deleteLine")
            var i = 0;
            while (true) {
                if (collecteInstance[i].trackedEntityInstance == instanceID) {
                    collecteInstance.splice(i, 1);
                    collecteAttributValue.splice(i, 1);
                    break;
                }
                i++
            }
            console.log("sortir de true")

            if (normalDoublonIncomplet == "doublon") {
                $scope.rechercheDoublon();
            }
            if (normalDoublonIncomplet == "normal") {
                if (collecteInstance.length != 0) {
                    getPagination(collecteInstance.length);
                    $scope.pageAffiche = $scope.nbrePage.length - 1;
                    $scope.changerPage(1, $scope.nbrePage.length - 1);
                } else {
                    $scope.afficheInstance = collecteInstance;
                    $scope.textInformation = "Nombre de notification: " + collecteInstance.length;
                }

            }
            if (normalDoublonIncomplet == "incomplet") {
                $scope.rechercheIncomplet();
            }
        }
        
        $scope.alerteSuspect = function () {
            if($scope.typeCas == "Cas alerte devenu suspect"){
                $scope.typeCas = "Notification Tracker";
                $scope.alerSusp = "YES";
                $scope.afficheNbreNotif = false;
                if($scope.facility){
                    paramYes();
                }
            }else{
                $scope.typeCas = "Cas alerte devenu suspect";
                $scope.alerSusp = "NO";
                $scope.leChoix = "selectionner";
                $scope.afficheSimilitude = false;
                
                
            }
            // getProgram();
        }

        $scope.chargeProgram2 = function () {
            console.log("$scope.leChoixPremier = " + angular.copy($scope.leChoixPremier) + " $scope.leChoixSecond= " + angular.copy($scope.leChoixSecond));
            $scope.lesPrograms2 = [];
            //$scope.lesPrograms2 = angular.copy($scope.lesPrograms);
            for (var i = 0, j = $scope.lesPrograms.length; i < j; i++) {
                if ($scope.leChoixPremier != $scope.lesPrograms[i].id) {
                    $scope.lesPrograms2.push(angular.copy($scope.lesPrograms[i]));
                }
            }
            //$scope.lesPrograms1.unshift({id: "selectionner", name: "Selectionnez le Programme 1"});
            $scope.lesPrograms2.unshift({id: "selectionner", name: "Selectionnez le Programme 2"});


        }
        
        $scope.chargeProgram1 = function () {
            console.log("$scope.leChoixPremier = " + angular.copy($scope.leChoixPremier) + " $scope.leChoixSecond= " + angular.copy(+$scope.leChoixSecond));
            $scope.lesPrograms1 = [];
            //$scope.lesPrograms1 = angular.copy($scope.lesPrograms);
            for (var i = 0, j = $scope.lesPrograms.length; i < j; i++) {
                if ($scope.leChoixSecond != $scope.lesPrograms[i].id) {
                    $scope.lesPrograms1.push(angular.copy($scope.lesPrograms[i]));
                }
            }
            $scope.lesPrograms1.unshift({id: "selectionner", name: "Selectionnez le Programme 1"});
            //$scope.lesPrograms2.unshift({id: "selectionner", name: "Selectionnez le Programme 2"});

        }

        $scope.go = function () {
            console.log("entrer dans go");
            /*console.log("$scope.leChoixPremier = " + angular.copy($scope.leChoixPremier) + " $scope.leChoixSecond= " + angular.copy($scope.leChoixSecond + " orgUnit = " + $scope.facility.id));
            console.log("$scope.facility");
            console.log($scope.facility);*/
            $scope.afficheSimilitude = false;
            $scope.loadingTable = true;
            collecteConcordant4 = [];
            collecteConcordant3=[];
            collecteInstanceProgram1 = [];
            collecteInstanceProgram2 = [];
            getProgram1();
        }

        function getProgram1() {
            colect1 = "NO";
            programChoisi.id = $scope.leChoixPremier;
            trackerInstanceSet = [];
           // collecteInstanceProgram1 = [];
            laPage = 1;
            getTrackerInstance();
        }

        function getProgram2() {
            colect1 = "YES";
            collecteInstanceProgram1 = angular.copy(trackerInstanceSet);
            programChoisi.id = $scope.leChoixSecond;
            trackerInstanceSet = [];
           // collecteInstanceProgram2 = [];
            laPage = 1;
            getTrackerInstance();
        }

        function conformeProgram() {
            collecteInstanceProgram2 = angular.copy(trackerInstanceSet);
            console.log("Fin de collecte");
            //test2 = collecteInstanceProgram1[collecteInstanceProgram1.length - 1].trackedEntityInstance;
            console.log(angular.copy(collecteInstanceProgram1));
            console.log(angular.copy(collecteInstanceProgram2));
            similitude();
        }

        function similitude() {
            console.log("entrée dans similitude");
            var continu1 = true, a = 0, i = 0, compte = 0;
            while (continu1) {
                //console.log("i =" + i + ", a= " + a);
                compte++;
                if (collecteInstanceProgram1[i].orgUnit == collecteInstanceProgram2[a].orgUnit) {
                    if (collecteInstanceProgram1[i].attributes.length == collecteInstanceProgram2[a].attributes.length) {
                        var continu2 = true, long = collecteInstanceProgram1[i].attributes.length, b = 0, m = 0, liste = [];
                        while (continu2) {
                            var temp1 = {}, temp2 = {};
                            temp1 = collecteInstanceProgram1[i].attributes[b];
                            temp2 = collecteInstanceProgram2[a].attributes[m];
                            /*if (test2 == collecteInstanceProgram1[i].trackedEntityInstance) {
                                if (test2 == collecteInstanceProgram2[a].trackedEntityInstance) {
                                    console.log("trouvée+++++++++++++++++++++++++++++++++++++++++");
                                }
                            }*/
                            if (temp1.code != "vq" && temp1.code != "ddc") {
                                if (temp1.code == "np" && temp2.code == "np") {
                                    if (temp1.value.indexOf(temp2.value) != -1 || temp2.value.indexOf(temp1.value) != -1) {
                                        //console.log("np ok i=" + i + " a= " + a);
                                        //console.log("np ok: value1= " + temp1.value + " **** value2 = " + temp2.value + "/");
                                        liste.push(temp1);
                                    }
                                }
                                if (temp1.code == "s" && temp2.code == "s") {
                                    if (temp1.value == temp2.value) {
                                        //console.log("s ok: value1= " + temp1.value + " **** value2 = " + temp2.value + "/");
                                        liste.push(temp1);
                                    }
                                }
                                if (temp1.code == "ag" && temp2.code == "ag") {
                                    if (temp1.value == temp2.value) {
                                        //console.log("ag ok: value1= " + temp1.value + " **** value2 = " + temp2.value + "/");
                                        liste.push(temp1);
                                    }
                                }
                                if (temp1.code == "cs" && temp2.code == "ca") {
                                    if (temp1.value == temp2.value) {
                                        //console.log("cs-ca ok: value1= " + temp1.value + " **** value2 = " + temp2.value + "/");
                                        liste.push(temp1);
                                    }
                                }
                                if (temp1.code == "ca" && temp2.code == "cs") {
                                    if (temp1.value == temp2.value) {
                                       // console.log("ca-cs ok: value1= " + temp1.value + " **** value2 = " + temp2.value + "/");
                                        liste.push(temp1);
                                    }
                                }
                                if (temp1.code == "ca" && temp2.code == "ca") {
                                    if (temp1.value == temp2.value) {
                                        console.log("ca-ca ok: value1= " + temp1.value + " **** value2 = " + temp2.value + "/");
                                        liste.push(temp1);
                                    }
                                }
                                if (temp1.code == "cs" && temp2.code == "cs") {
                                    if (temp1.value == temp2.value) {
                                       // console.log("cs-ca ok: value1= " + temp1.value + " **** value2 = " + temp2.value + "/");
                                        liste.push(temp1);
                                    }
                                }
                                

                                /* else {
                                 /*if(test2 == collecteInstanceProgram1[i].trackedEntityInstance){
                                 if(test2 == collecteInstanceProgram2[a].trackedEntityInstance){
                                 console.log("trouvée+++++++++++++++++++++++++++++++++++++++++");
                                 }
                                 }*
                                 console.log("value1= " + temp1.value + " **** value2 = " + temp2.value+"///");
                                 if (temp1.value == temp2.value) {
                                 console.log("valeur ok: value1= " + temp1.value + " **** value2 = " + temp2.value+"/");
                                 liste.push(temp1);
                                 }
                                 }*/
                            } else {
                                //console.log("temp1.code = " + temp1.code + "; temp2.code = " + temp2.code + "; nbre= " + nbre);
                                //nbre++;
                            }
                            m++;
                            if (m == long) {
                                m = 0;
                                b++;
                            }
                            if (b == long) {
                                continu2 = false;
                            }
                        }
                        //console.log("liste");
                       // console.log(liste);
                       // console.log("liste.length = " + liste.length + ", collecteInstanceProgram1[" + i + "].attributes.length = " + collecteInstanceProgram1[i].attributes.length);
                        //if (liste.length == collecteInstanceProgram1[i].attributes.length - 2) {
                        if (liste.length == 4 || liste.length == 3) {
                           // console.log("est retenu+++++++++");
                           // console.log("i = " + i + ", a= " + a);
                           // console.log(angular.copy(collecteInstanceProgram1));
                           // console.log(angular.copy(collecteInstanceProgram2));
                            var unbon = {};
                            unbon.program1 = collecteInstanceProgram1[i];
                            unbon.program2 = collecteInstanceProgram2[a];
                            if (liste.length == 4){
                                collecteConcordant4.push(unbon);
                            }else{
                                collecteConcordant3.push(unbon);
                            }
                            
                            //console.log(angular.copy(collecteConcordant4));
                            //console.log(angular.copy(collecteConcordant3));
                            collecteInstanceProgram2.splice(a, 1);
                            collecteInstanceProgram1.splice(i, 1);
                            i--;
                            a = (collecteInstanceProgram2.length - 1);
                        } else {
                        }
                    }
                }
                a++;
                if (a == collecteInstanceProgram2.length) {
                    a = 0;
                    i++;
                }
                if (i == collecteInstanceProgram1.length) {
                    continu1 = false;
                }
            }

            console.log("collecteConcordant4");
            console.log(collecteConcordant4);
            console.log("collecteConcordant3");
            console.log(collecteConcordant3);
            $scope.info = collecteConcordant4.length+" cas alerte devenu suspect";
            console.log(angular.copy(collecteInstanceProgram1));
            console.log(angular.copy(collecteInstanceProgram2));
            console.log("test2 = " + test2);
            constituerSimilitude();
        }

        function constituerSimilitude() {
            console.log("entrer dans constituerSimilitude");
            var nbre=0;
            for(var i=0,j=collecteConcordant4.length;i<j;i++){
                var temps = {};nbre++
                temps.orgUnit = collecteConcordant4[i].orgUnit;
                console.log("collecteConcordant4[i].attributes.length; i = "+i);
                console.log(collecteConcordant4[i]);
                for(var a=0,b=collecteConcordant4[i].attributes.length;a<b;a++){
                    //temps[collecteConcordant4[i].attributes[a].attribute] = collecteConcordant4[i].attributes[a].value;
                    if(collecteConcordant4[i].attributes[a].code == "ag"){
                        temps.ag = collecteConcordant4[i].attributes[a].value;
                    }
                    if(collecteConcordant4[i].attributes[a].code == "np"){
                        temps.np = collecteConcordant4[i].attributes[a].value;
                    }
                    if(collecteConcordant4[i].attributes[a].code == "vq"){
                        temps.vq = collecteConcordant4[i].attributes[a].value;
                    }
                    if(collecteConcordant4[i].attributes[a].code == "ddc"){
                        temps.ddc = collecteConcordant4[i].attributes[a].value;
                    }
                    if(collecteConcordant4[i].attributes[a].code == "s"){
                        if(collecteConcordant4[i].attributes[a].value = "f"){
                            temps.s = "Feminin";
                        }
                        if(collecteConcordant4[i].attributes[a].value = "m"){
                            temps.s = "Masculin";
                        }
                    }
                    if(collecteConcordant4[i].attributes[a].code == "ca"){
                        temps.cas = "CAS ALERTE";
                        if(collecteConcordant4[i].attributes[a].value == "ch"){
                            temps.mal = "DIARRHEE";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "men"){
                            temps.mal = "FIEVRE ET RAIDEUR";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "pfa"){
                            temps.mal = "PARALYSIE";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "rg"){
                            temps.mal = "FIEVRE ET BOUTONS";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "fj"){
                            temps.mal = "FIEVRE ET YEUX JAUNES";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "mve"){
                            temps.mal = "FIEVRE ET SAIGNEMENT";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "tnn"){
                            temps.mal = "REFUS DE TETER ET RAIDEUR";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "ver"){
                            temps.mal = "VERS BLANC ET PLAIE";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "gri"){
                            temps.mal = "VERS BLANC ET PLAIE";
                        }
                    }
                    if(collecteConcordant4[i].attributes[a].code == "cs"){
                        temps.cas = "CAS SUSPECT";
                        if(collecteConcordant4[i].attributes[a].value == "ch"){
                            temps.mal = "CHOLERA";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "men"){
                            temps.mal = "MENINGITE";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "pfa"){
                            temps.mal = "PARALYSIE FLASQUE AIGÜE";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "rg"){
                            temps.mal = "ROUGEOLE";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "fj"){
                            temps.mal = "FIEVRE JAUNE";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "mve"){
                            temps.mal = "MALADIE A VIRUS EBOLA";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "tnn"){
                            temps.mal = "TETANOS NEONATAL";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "ver"){
                            temps.mal = "VER DE GUINEE";
                        }
                        if(collecteConcordant4[i].attributes[a].value == "gri"){
                            temps.mal = "GRIPPE";
                        }
                    }
                }
                $scope.collectSimilutude4.push(temps);
                if(nbre==2){
                    nbre = 0;
                    temps={};
                    temps.id = "cache";
                    $scope.collectSimilutude4.push(temps);
                }
            }
            getOrgName();
        }
        
        function lesAttributs() {
            for (var i = 0, j = $scope.lesPrograms.length; i < j; i++) {
                if ($scope.leChoixPremier == $scope.lesPrograms[i].id) {
                    programChoisi = $scope.lesPrograms[i];
                }
            }
            $scope.lesAttributs = [];
            collecteOptions =[];
            getProgramEntityAttribut();
        }
        
        function getOrgName() {
            for(var i=0,j=$scope.collectSimilutude4.length;i<j;i++){
                if($scope.collectSimilutude4[i].orgUnit){
                    for(var a=0,b=$rootScope.allOrgUnit.length;a<b;a++){
                        if($scope.collectSimilutude4[i].orgUnit==$rootScope.allOrgUnit[a].id){
                            $scope.collectSimilutude4[i].orgUnit = $rootScope.allOrgUnit[a].name;
                            break;
                        }
                    }
                }
            }
            $scope.afficheSimilitude = true;
        }
        
        $scope.voirRecaputulatif = function () {
            $scope.afficheRecaputulatif = true;
            $scope.doublon = true;
            $scope.textInformation = "Nombre de notification: " + nbreInstance;
        }
        
    }]);