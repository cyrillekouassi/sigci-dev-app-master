
var baseUrl;

var sigcidev = angular.module('Sigcidev', [ 'ngRoute', 'ngResource','ui-notification','angularBootstrapNavTree','ngAnimate','ngQuickDate','angularTreeview'])
  .config(['$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider ) {
    $routeProvider.when('/facilities', {
      templateUrl: 'partials/facility-list.html',
      controller: 'FacilityListCtrl'
    }).when('/facilities/dataElements', {
        templateUrl: 'partials/facility-dataElements.html',
        controller: 'FacilityDataElementsCtrl'
    }).when('/facilities/facility-formsComplete', {
        templateUrl: 'partials/facility-formsComplete.html',
        controller: 'facilityFormsComplete'
    }).when('/facilities/new', {
        templateUrl: 'partials/facility.html',
        controller: 'FacilityCtrl'
    }).when('/facilities/map', {
        templateUrl: 'partials/facility-map.html',
        controller: 'FacilityMapCtrl'
    }).when('/facilities/edit/:id', {
      templateUrl: 'partials/facility.html',
      controller: 'FacilityCtrl'
    }).when('/facilities/tracker', {
        templateUrl: 'partials/facility-tracker.html',
        controller: 'FacilityTrackerCtrl'
    }).when('/facilities/completude', {
        templateUrl: 'partials/facility-completude.html',
        controller: 'FacilityCompletudeCtrl'
    }).when('/facilities/OrgunitDataset', {
        templateUrl: 'partials/facility-orgUnit-DataSet.html',
        controller: 'FacilityOrgunitDatasetCtrl'
    }).when('/facilities/analytics', {
            templateUrl: 'partials/facility-analytics.html',
            controller: 'FacilityCompletePeriodCtrl'
    }).when('/facilities/dataInformation', {
        templateUrl: 'partials/facility-data-informatique.html',
        controller: 'FacilityDataInformation'
    }).when('/facilities/interoperability', {
        templateUrl: 'partials/facility-interoperability.html',
        controller: 'FacilityInteroperability'
    }).when('/facilities/validationRules', {
        templateUrl: 'partials/facility-validationRules.html',
        controller: 'FacilityCompletudeCtrl'
    }).when('/facilities/UserCredentials', {
        templateUrl: 'partials/facility-userCredentials.html',
        controller: 'FacilityUserCredentialsCtrl'
    }).when('/accueil', {
        templateUrl: 'partials/accueil.html'
    }).otherwise({
      redirectTo: '/accueil'
    });

    $locationProvider.html5Mode(false).hashPrefix('!');

    $.ajax({
      url: 'manifest.webapp',
      async: false,
      cache: false,
      dataType: 'json'
    }).done(function( data ) {
      baseUrl = data.activities.dhis.href;
    });
  }]);

sigcidev.run( ['$rootScope','orgUnitResource','orgUnitLevel','$location','$window', function( $rootScope,orgUnitResource,orgUnitLevel,$location,$window ) {

    var orgUnitCollection = [], arrylong = 0,listeCode = [],page=1,pageCount=0;
    var firstTimestamp;
    $rootScope.DerniereAjoutOuModifier = [];
    $rootScope.sansCode = [];
    $rootScope.leCode = [];
    $rootScope.arbre = [];
    $rootScope.allOrgUnit = [];
    $rootScope.OrgUnitGroup = [];
    $rootScope.niveauOrgUnit;
    $rootScope.lesCodesDoublons = [];
    $rootScope.patientez = false;
    $rootScope.nbreTelecharger = 0;
    $rootScope.nbreTotal = 0;
    $rootScope.loadingOrgUnits = false;

    getOrgUnitLevel();

    $rootScope.initialiser = function() {
        orgUnitCollection = [], arrylong = 0,listeCode = [];
        $rootScope.sansCode = [];
        $rootScope.leCode = [];
        $rootScope.arbre = [];
        $rootScope.allOrgUnit = [];
        $rootScope.OrgUnitGroup = [];
        $rootScope.niveauOrgUnit;
        $rootScope.lesCodesDoublons = [];
        getOrgUnitLevel();
    }

    $rootScope.genererCode =  function (){
        listeCode.sort(compare);
        while($rootScope.leCode.length<5){
            retireDoublon();
            listeCode.sort(compare);
            rechercherCode();
        }
        return $rootScope.leCode[0];
    }
    
    function retireDoublon() {
        for(var i = 0, j = listeCode.length; i < j; i++){
            var nbre={},bn=1;
            var element = listeCode[i];
            var exist = listeCode.indexOf(element, i+1);
            while (exist != -1){
                bn++;
                /*console.log("doublon trouvé à i= "+i+" et exist = "+exist);
                console.log(angular.copy(listeCode));*/
                listeCode.splice(exist, 1);
                exist = listeCode.indexOf(element, exist+1);
            }
            if(bn != 1){
                nbre.nombre = bn;
                nbre.element = element;
                $rootScope.lesCodesDoublons.push(nbre);
            }
        }
    }
    
    function rechercherCode() {
        for(var i = 0, j = listeCode.length; i < j; i++){
            if(listeCode[i] != i+1){
                break;
            }
        }
        listeCode.push(i+1);
        if(i+1 < 10){
            $rootScope.leCode.push("000"+(i+1));
            return;
        }
        if (i+1 < 100){
            $rootScope.leCode.push("00" + (i+1));
            return;
        }
        if(i+1 < 1000){
            $rootScope.leCode.push("0" + (i+1));
            return;
        }
        else{
            $rootScope.leCode.push("" + (i+1));
            return;
        }
    }

    function getOrgUnitLevel() {
        console.log("Entrer dans getOrgUnitLevel");
        firstTimestamp = new Date().getTime();
        $rootScope.loadingOrgUnits = true;
        orgUnitLevel.get({
            paging: false,
            fields: 'id,name,level'
        }, function (data) {
            //console.log("entrer dans getOrgUnitLevel");
            //console.log(data);
            $rootScope.niveauOrgUnit = data.organisationUnitLevels;
            getOrgUnit();
            //getOrgUnitDetail();
        }, function () {
        });
    }

    function getOrgUnit() {
        console.log("Entrer dans getOrgUnit");
        orgUnitResource.query({
            paging: false,
            fields: 'id,name,shortName,openingDate,parent,level,created,code,description,children'
        }, function (data) {
            var secondTimestamp = new Date().getTime();
            console.log("temps d'execution = "+(secondTimestamp-firstTimestamp)+" millisecondes");
            $rootScope.allOrgUnit = data.organisationUnits;
            dataArbre();
        },function (err) {
            console.log("echec de collection de tout en une fois");
            getOrgUnitDetail();
        });
    }
    
    function getOrgUnitDetail() {
        console.log("entrer dans getOrgUnitDetail()");
        firstTimestamp = new Date().getTime();
        $rootScope.patientez = true;
        orgUnitResource.query({
            pageSize: 300,
            fields: 'id,name,shortName,openingDate,parent,level,created,code,description,children'
        }, function (data) {
            //console.log("resultat positif getOrgUnitDetail");
            //console.log(data);
            $rootScope.allOrgUnit = [];
            if(data.pager.pageCount){
                page=1;
                pageCount=data.pager.pageCount;
                //console.log("pageCount = "+pageCount);
                $rootScope.allOrgUnit = data.organisationUnits;
                $rootScope.nbreTelecharger = 1;
                $rootScope.nbreTotal = pageCount;
                if(pageCount>page){
                    page++;
                    getOrgUnitID();
                }
            }
            //getOrgUnitID();
        },function (err) {

        });

    }

    function getOrgUnitID() {
        console.log("entrer dans getOrgUnitID()");
        orgUnitResource.query({
            page: page,
            pageSize: 300,
            fields: 'id,name,shortName,openingDate,parent,level,created,code,description,children'
        }, function (data) {
            var tempo = [];
            tempo = angular.copy($rootScope.allOrgUnit);
            $rootScope.allOrgUnit = tempo.concat(data.organisationUnits);
            if(pageCount>page){
                page++;
                $rootScope.nbreTelecharger++;
                getOrgUnitID();
            }else{
                var secondTimestamp = new Date().getTime();
                console.log("temps d'execution = "+(secondTimestamp-firstTimestamp)+" millisecondes");
                console.log("fin de collect orgUnits dans getOrgUnitID()");
                //console.log($rootScope.allOrgUnit);
                dataArbre();
            }
        },function (err) {
            
        });
    }

    /*Preparation à la construction de l'arborescence. constitution d'un tableau les unité d'organisation  par nivo*/
    function dataArbre() {
        console.log("entrer dans dataArbre");
        $rootScope.niveauOrgUnit.sort(function (a, b) {
            if (a.level > b.level)
                return 1;
            if (a.level < b.level)
                return -1;
            return 0;
        });

        /* constitution des niveaux*/
        //console.log("niveauOrgUnit");
        //console.log($rootScope.niveauOrgUnit);
        for (var i = 0, j = $rootScope.niveauOrgUnit.length; i < j; i++) {
            var tmp = {
                level: $rootScope.niveauOrgUnit[i].level,
                orgUnits: []
            };
            orgUnitCollection[i] = tmp;
        }
        
        /*remplissage par nivo*/
        for (var i = 0, j = $rootScope.allOrgUnit.length; i < j; i++) {
            var tp = $rootScope.allOrgUnit[i].level;
            tp--;
            orgUnitCollection[tp].orgUnits.push($rootScope.allOrgUnit[i]);
            if($rootScope.allOrgUnit[i].code) {
                    if (!isNaN(filterInt($rootScope.allOrgUnit[i].code))){
                        listeCode.push(parseInt($rootScope.allOrgUnit[i].code));
                    }
                if($rootScope.allOrgUnit[i].code == " "){
                    var temp ={};
                    temp = $rootScope.allOrgUnit[i];
                    temp.nomNiveau = $rootScope.niveauOrgUnit[tp].name;
                    $rootScope.sansCode.push(temp);
                }
                
            }else{
                var temp ={};
                temp = $rootScope.allOrgUnit[i];
                temp.nomNiveau = $rootScope.niveauOrgUnit[tp].name;
                $rootScope.sansCode.push(temp);
            }
        }
        /*console.log("contenu de listeCode");
        console.log(listeCode);*/
        /*trie des unités par ordre alphabetique*/
        for (var i = 0, j = orgUnitCollection.length; i < j; i++) {
            orgUnitCollection[i].orgUnits.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                return 0;
            });
        }
        $rootScope.OrgUnitGroup = angular.copy(orgUnitCollection);
        /*console.log("$rootScope.OrgUnitGroup");
        console.log($rootScope.OrgUnitGroup);*/
        var testont = orgUnitCollection.length;
        arrylong = angular.copy(testont);
        arrylong -= 1;
        arbreRecursive(orgUnitCollection.length - 1);
        
    }

    /*contitution de l'hierachie des unités d'organisations*/
    function arbreRecursive(nivo) {
        //console.log("entrer dans arbreRecursive");
        //console.log(orgUnitCollection);
        //console.log("nivo = " + nivo);
        var temptout = [];
        var nivoSup = nivo - 1;
        for (var i = 0, j = orgUnitCollection[nivoSup].orgUnits.length; i < j; i++) {
            var tempS = {};
            tempS.data = {};
            tempS.children = [];
            tempS.label = orgUnitCollection[nivoSup].orgUnits[i].name;
            tempS.id = orgUnitCollection[nivoSup].orgUnits[i].id;
            tempS.data = orgUnitCollection[nivoSup].orgUnits[i];
            var aDelete = [];
            var continu = true;
            var a = 0;
            while (continu) {
                if (arrylong == nivo) {
                    if (orgUnitCollection[nivoSup].orgUnits[i].id == orgUnitCollection[nivo].orgUnits[a].parent.id) {
                        var temp = {};
                        temp.data = {};
                        temp.children = [];
                        temp.label = orgUnitCollection[nivo].orgUnits[a].name;
                        temp.id = orgUnitCollection[nivo].orgUnits[a].id;
                        temp.data = orgUnitCollection[nivo].orgUnits[a];
                        tempS.children.push(temp);
                        orgUnitCollection[nivo].orgUnits.splice(a, 1);
                        a--;
                    }
                } else {
                    if (orgUnitCollection[nivo].orgUnits.length == 0) {
                        break;
                    }
                    if (orgUnitCollection[nivoSup].orgUnits[i].id == orgUnitCollection[nivo].orgUnits[a].data.parent.id) {
                        var temp = {};
                        temp.data = {};
                        temp.children = [];
                        temp.label = orgUnitCollection[nivo].orgUnits[a].label;
                        temp.id = orgUnitCollection[nivo].orgUnits[a].id;
                        temp.data = orgUnitCollection[nivo].orgUnits[a].data;
                        temp.children = orgUnitCollection[nivo].orgUnits[a].children;
                        tempS.children.push(temp);
                        orgUnitCollection[nivo].orgUnits.splice(a, 1);
                        a--;
                    }

                }
                a++;
                if (a == orgUnitCollection[nivo].orgUnits.length) {
                    continu = false;
                }
            }
            temptout.push(tempS);
        }
        orgUnitCollection[nivoSup].orgUnits = temptout;
        if (nivo != 1) {
            //console.log("on passe au nivo = " + nivoSup);
            arbreRecursive(nivoSup);
        } else {
            $rootScope.arbre = orgUnitCollection[0].orgUnits;
            for(var i=0,j=$rootScope.arbre.length;i<j;i++){
                $rootScope.arbre[i].expanded = true;
            }
            $rootScope.patientez = false;
            $rootScope.loadingOrgUnits = false;
            console.log("fin de chargement")
        }
    }
    
    function filterInt(value) {
        if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
            return Number(value);
        return NaN;
    };

    function compare(x, y) {
        return x - y;
    };

    $rootScope.goAccueil = function () {
        //console.log("entrer dans goAccueil");
        //console.log(baseUrl);
        //$location.go(baseUrl);
        $window.location.href = baseUrl;
    }

}]);
