sigcidev.controller('FacilityCompletePeriodCtrl', ['$scope', '$rootScope', 'orgUnitResource', 'DataSetResource', 'completeDataSetRegistrations', '$window', '$filter', '$timeout', 'analyticsResource','$http',
    function ($scope, $rootScope, orgUnitResource, DataSetResource, completeDataSetRegistrations, $window, $filter, $timeout, analyticsResource,$http) {

        var compte = 0, allDataSet = [], collecteNivo = [], allOrgUnit = [], orgUnitNivo = [],dataSet = {};
        var dataMonthly = [{code: '01', name: 'Janvier'}, {code: '02', name: 'Fevrier'}, {
            code: '03',
            name: 'Mars'
        }, {code: '04', name: 'Avril'}, {code: '05', name: 'Mai'}, {code: '06', name: 'Juin'}, {
            code: '07',
            name: 'Juillet'
        }, {code: '08', name: 'Aout'}, {code: '09', name: 'Septembre'}, {code: '10', name: 'Octobre'}, {
            code: '11',
            name: 'Novembre'
        }, {code: '12', name: 'Decembre'}];
        var dataBiMonthly = ['Janvier - Fevrier', 'Mars - Avril', 'Mai - Juin', 'Juillet - Aout', 'Septembre - Octobre', 'Novembre - Decembre'];
        var dataQuarterly = [{code: 'Q1', name: 'Janvier - Mars'}, {code: 'Q2', name: 'Avril - Juin'}, {
            code: 'Q3',
            name: 'Juillet - Septembre'
        }, {code: 'Q4', name: 'Octobre - Decembre'}];
        var dataSixMonthly = [{code: 'S1', name: 'Janvier - Juin'}, {code: 'S2', name: 'Juillet - Decembre'}];
        var dataYearly = [{code: '', name: 'Janvier - Decembre'}];
        var DataPeriode = [], lesPeriodes = [], periodDetaillers = [], periodGlobal =[], compte = 0;
        var lannee = {},nivo=0,unite=0,comptePeriod=0,notreUrl="";
        var tempsAttente={}; tempsAttente.id = "";tempsAttente.nbre = 0;tempsAttente.temps = [5,10,15];
        var endDateGlobal = "", startDateGlobal = "", orgUnitGlobal = "", indexColor = 0;
        var backgrounColor = ["analytic-table-green","analytic-table-yellow","analytic-table-bleu"];
        var firstTimestamp;
        var notreAnnee = new Date();
        notreAnnee = $filter('date')(notreAnnee, 'yyyy');
        notreAnnee = parseInt(notreAnnee);
        lannee.debut = notreAnnee, lannee.fin = notreAnnee;
        $scope.lesDataSets = [];
        $scope.typePeriode = "";
        $scope.level = "";
        $scope.collectePeriodeDebut = [];
        $scope.collectePeriodefin = [];
        $scope.AttenteChargement = false;
        $scope.charger = false;
        $scope.barsRapport = 0;
        $scope.barsAnalyse = 0;
        $scope.nbreNivo = 0;
        getDataSet();
        chargerArbre();
        PeriodeType();


        function chargerArbre() {
            if ($rootScope.arbre.length != 0) {
                console.log("test dans chargerArbre");
                console.log($rootScope.niveauOrgUnit);
                console.log(allOrgUnit);
                allOrgUnit = angular.copy($rootScope.allOrgUnit);
                return;
            } else {
                $timeout(function () {
                    chargerArbre();
                }, 500);
            }

        }

        function PeriodeType() {
            $scope.collectePeriodeType = ['Monthly', 'BiMonthly', 'Quarterly', 'SixMonthly', 'Yearly'];
        }

        function getDataSet() {
            console.log("entrer dans getDataSet")
            //$scope.loadingDataSet = true;
            DataSetResource.query({
                paging: false,
                fields: 'id,name,timelyDays,periodType'
            }, function (resultat) {
                allDataSet = resultat.dataSets;
                $scope.lesDataSets = allDataSet;

                console.log("$scope.lesDataSets ==");
                console.log($scope.lesDataSets);
                //$scope.loadingDataSet = false;
            }, function (err) {
                compte = 1;
                getDataSetDetail();
            });
        }

        function getDataSetDetail() {
            console.log("entrer dans getDataSetDetail");
            DataSetResource.query({
                fields: 'id,name,timelyDays,periodType'
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
                    $scope.lesDataSets = allDataSet;
                    console.log("$scope.lesDataSets ==");
                    console.log($scope.lesDataSets);
                }
            }, function (err) {

            });
        }

        $scope.choisirPeriode = function (typePeriode) {
            //$scope.typePeriode = "";
            console.log("typePeriode =  " + typePeriode);
            if (typePeriode == 'Monthly') {
                DataPeriode = angular.copy(dataMonthly);
            }
            if (typePeriode == 'Quarterly') {
                DataPeriode = angular.copy(dataQuarterly);
            }
            if (typePeriode == 'SixMonthly') {
                DataPeriode = angular.copy(dataSixMonthly);
            }
            if (typePeriode == 'Yearly') {
                DataPeriode = angular.copy(dataYearly);
            }

            formaterPeriodeDebut();
            formaterPeriodeFin();
        }

        function formaterPeriodeDebut() {
            console.log("entrer dans formaterPeriodeDebut");
            $scope.collectePeriodeDebut = [];
            for (var i = 0, j = DataPeriode.length; i < j; i++) {
                var temp = {};
                temp.code = lannee.debut + DataPeriode[i].code;
                temp.name = DataPeriode[i].name + " " + lannee.debut;
                $scope.collectePeriodeDebut.push(temp);
               // console.log($scope.collectePeriodeDebut);
            }
        }

        function formaterPeriodeFin() {
            console.log("entrer dans formaterPeriodeFin");
            $scope.collectePeriodefin = [];
            for (var i = 0, j = DataPeriode.length; i < j; i++) {
                var temp = {};
                temp.code = lannee.fin + DataPeriode[i].code;
                temp.name = DataPeriode[i].name + " " + lannee.fin;
                $scope.collectePeriodefin.push(temp);
                //console.log($scope.collectePeriodefin);
            }
        }

        $scope.anneePrecedenteDebut = function () {
            console.log("entrer dans anneePrecedenteDebut");
            lannee.debut -= 1;
            formaterPeriodeDebut();
        }

        $scope.anneeSuivanteDebut = function () {
            console.log("entrer dans anneeSuivanteDebut");
            lannee.debut += 1;
            formaterPeriodeDebut();
        }
        $scope.anneePrecedentefin = function () {
            console.log("entrer dans anneePrecedentefin");
            lannee.fin -= 1;
            formaterPeriodeFin();
        }
        $scope.anneeSuivantefin = function () {
            console.log("entrer dans anneeSuivantefin");
            lannee.fin += 1;
            formaterPeriodeFin();
        }

        function organiserParGroupeOrgUnits() {
            orgUnitNivo = [];
            var i=0, continu =true;
            //while (continu) {
            for(var i= 0, j = allOrgUnit.length;i<j;i++ ){
                if (allOrgUnit[i].level == $scope.level) {
                    collecteNivo=[];
                    orgUnitNivo.push(angular.copy(allOrgUnit[i]));
                    if (orgUnitNivo[orgUnitNivo.length - 1].children.length != 0) {
                        for (var a = 0, b = orgUnitNivo[orgUnitNivo.length - 1].children.length; a < b; a++) {
                            collecteNivo.push(orgUnitNivo[orgUnitNivo.length - 1].children[a].id)
                            collectChildren(orgUnitNivo[orgUnitNivo.length - 1].children[a].id);
                        }
                    }
                    orgUnitNivo[orgUnitNivo.length - 1].collecteNivo = angular.copy(collecteNivo);
                }

            }
            console.log("les orgUnit du nivo");
            console.log(orgUnitNivo);
            $scope.nbreNivo = orgUnitNivo.length;
            addNivo();
        }

        function addNivo() {
            for(var i=0,j=orgUnitNivo.length;i<j;i++){
                orgUnitNivo[i].collecteNivo.push(orgUnitNivo[i].id);
                var pe = "";
                for(var a=0,b=orgUnitNivo[i].collecteNivo.length;a<b;a++){
                    pe= pe+";"+orgUnitNivo[i].collecteNivo[a];
                }
                pe = pe.slice(1);
                orgUnitNivo[i].collecteListe = pe;
            }

        }

        function collectChildren(idx) {
           // console.log("entrer dans collectChildren");
            for (var i = 0, j = allOrgUnit.length; i < j; i++) {
                if (allOrgUnit[i].id == idx) {
                    if (allOrgUnit[i].children.length != 0) {
                        var temp = [];
                        temp = angular.copy(allOrgUnit[i].children)
                        for (var a = 0, b = temp.length; a < b; a++) {
                            collecteNivo.push(temp[a].id);
                            collectChildren(temp[a].id);
                        }
                    }
                    //allOrgUnit.splice(i,1);
                    break;
                }
            }

        }

        $scope.executer = function () {
            console.log("enstrer dans execute");
            /*console.log("level = "+$scope.level);
            console.log($scope.dataSetID);
            console.log("$scope.periodDebut");
            console.log($scope.periodDebut);
            console.log("$scope.periodFin");
            console.log($scope.periodFin);*/
            firstTimestamp = new Date().getTime();
            tempsAttente.id = "";tempsAttente.nbre = 0;
            nivo=0,unite=0,comptePeriod=0;indexColor = 0; $scope.barsAnalyse = 0;
            $scope.charger = false;
            organiserParGroupeOrgUnits();
            //constOrgUnit();
            trouverDataSet($scope.dataSetID);

            
        }
        
        function determinerInterval(nbreMois) {
            console.log("entrer dans determinerInterval");
            //if($scope.typePeriode == "Quarterly" && dataSet.periodType == "Monthly"){//
                if(lannee.debut <= lannee.fin && dataSet.periodType == "Monthly"){
                    var tempDate = 0, cont=true;
                    lesPeriodes = [];
                    tempDate = angular.copy(lannee.debut);
                    while(
                        cont){
                        //console.log("tempDate = "+tempDate);
                        for (var i = 0, j = DataPeriode.length; i < j; i++) {
                            var temp = {};
                            temp.code = tempDate + DataPeriode[i].code;
                            temp.name = DataPeriode[i].name + " " + tempDate;
                            if(temp.code >= $scope.periodDebut && temp.code <= $scope.periodFin){
                                    lesPeriodes.push(temp);
                            }
                        }
                        tempDate++;
                        if(tempDate > lannee.fin){
                            cont=false;
                        }
                    }
                    /*console.log("lesPeriodes");
                    console.log(lesPeriodes);*/
                    
               }else{
                    alert("la periode de rapportage n'est pas mensuel");
                }
                
                
            //}
            //console.log("DataPeriode.length = "+DataPeriode.length);
            constituerPeriode(nbreMois);
        }
        
        function largePeriode(debut,fin,nbreMois) {
            console.log("entrer dans largePeriode");
            var cont=true;
            periodDetaillers = [];
            var mois = [{mois:"01",dernierJour:"31"},{mois:"02",dernierJour:"28"},{mois:"03",dernierJour:"31"},{mois:"04",dernierJour:"30"},{mois:"05",dernierJour:"31"},{mois:"06",dernierJour:"30"},{mois:"07",dernierJour:"31"},{mois:"08",dernierJour:"31"},{mois:"09",dernierJour:"30"},{mois:"10",dernierJour:"31"},{mois:"11",dernierJour:"30"},{mois:"12",dernierJour:"31"}];
            var anneeDebut = angular.copy(lannee.debut);
            while(cont){
                //console.log("entrer dans while");
                for(var i=0,j=12;i<j;i++){
                    var temp = {};
                    temp.MM = mois[i].mois;
                    temp.yyyyMM = anneeDebut+temp.MM;
                    temp.yyyyMMd = anneeDebut+"-"+temp.MM+"-01";
                    temp.yyyyMMddd = anneeDebut+"-"+temp.MM+"-"+mois[i].dernierJour;
                    if(temp.yyyyMM>=debut && temp.yyyyMM<=fin){
                        delete temp.MM;
                        periodDetaillers.push(temp);
                    }
                }
                anneeDebut++;
                if(anneeDebut>lannee.fin){
                    cont = false;
                }
            }
            console.log("periodDetaillers = ");
            console.log(angular.copy(periodDetaillers));
            determinerInterval(nbreMois);
        }
        
        function constituerPeriode(nbre) {
            console.log("entrer dans constituerPeriode");
            periodGlobal =[];
            $scope.lesIntervals = {};
            $scope.lesIntervals.name = [];
            $scope.lesIntervals.contenuInterval = [];
            $scope.lesIntervals.color = [];
            var a = 0;
            for(var i=0,j=lesPeriodes.length;i<j;i++){
                //console.log("entrer dans for1 i= "+i);
                var temp = {};
                /*temp[lesPeriodes[i].code] = lesPeriodes[i];
                temp[lesPeriodes[i].code].periodDetaillers = [];*/
                temp = angular.copy(lesPeriodes[i]);
                $scope.lesIntervals.name.push(lesPeriodes[i].name);
                $scope.lesIntervals.contenuInterval.push("Formulaire Obtenu");
                $scope.lesIntervals.contenuInterval.push("Formulaire attendu");
                $scope.lesIntervals.contenuInterval.push("Completude");
                $scope.lesIntervals.contenuInterval.push("Formulaire à temps");
                $scope.lesIntervals.contenuInterval.push("Promptitude");
                if(indexColor == backgrounColor.length){
                    indexColor = 0;
                }
                $scope.lesIntervals.color.push(backgrounColor[indexColor]);
                indexColor++;
                temp.periodDetaillers = [];
                for(var l=0;l<nbre;l++){
                    console.log("entrer dans for2 l= "+l+" a= "+a);
                    //temp[lesPeriodes[i].code].periodDetaillers.push(periodDetaillers[a].yyyyMM);

                    temp.periodDetaillers.push(periodDetaillers[a].yyyyMM);
                    if(l==0){
                        //temp[lesPeriodes[i].code].premierJour= periodDetaillers[a].yyyyMMd
                        temp.premierJour= periodDetaillers[a].yyyyMMd
                    }
                    if(l==(nbre-1)){
                        //temp[lesPeriodes[i].code].dernierJour= periodDetaillers[a].yyyyMMd
                        temp.dernierJour= periodDetaillers[a].yyyyMMddd
                    }
                    a++;
                }
                periodGlobal.push(temp);
            }
            $scope.longTitre = $scope.lesIntervals.name.length * 5;
            $scope.longTitre +=2
            console.log("$scope.lesIntervals");
            console.log($scope.lesIntervals);
            console.log("periodGlobal");
            console.log(periodGlobal);
            voirAssigne();
        }
        
        function trouverDataSet(idx) {
            console.log("entrer dans trouverDataSet")
            /*for(var i=0,j=allDataSet.length;i<j;i++){
                if(idx==$scope.lesDataSets[i].id){
                    dataSet = $scope.lesDataSets[i];
                    console.log(dataSet);
                    $scope.leDataSet = dataSet;
                    break;
                }
            }*/
            DataSetResource.query({
                id: idx,
                fields: 'id,name,timelyDays,periodType,organisationUnits'
            }, function (resultat) {
                console.log(resultat);
                dataSet = resultat;
                $scope.leDataSet = dataSet;
                continuExecution();
            }, function (err) {
                alert("Une erreur s'est produite");
            });
        }

        function deternierDebutFin() {
            var nbreMois = 0;
            if($scope.typePeriode == "Quarterly"){
                nbreMois = 3;
                var debut = $scope.periodDebut.slice(-1);
                if(debut=="1"){debut = lannee.debut+"01"}
                if(debut=="2"){debut = lannee.debut+"04"}
                if(debut=="3"){debut = lannee.debut+"07"}
                if(debut=="4"){debut = lannee.debut+"10"}
                var fin = $scope.periodFin.slice(-1);
                if(fin = "1"){fin = lannee.fin+"03"}
                if(fin = "2"){fin = lannee.fin+"06"}
                if(fin = "3"){fin = lannee.fin+"09"}
                if(fin = "4"){fin = lannee.fin+"12"}
            }

            if($scope.typePeriode == "SixMonthly"){
                nbreMois = 6;
                var debut = $scope.periodDebut.slice(-1);
                if(debut=="1"){debut = lannee.debut+"01"}
                if(debut=="2"){debut = lannee.debut+"07"}
                var fin = $scope.periodFin.slice(-1);
                if(fin = "1"){fin = lannee.fin+"06"}
                if(fin = "2"){fin = lannee.fin+"12"}

            }

            if($scope.typePeriode == "Yearly"){
                nbreMois = 12;
                var debut = $scope.periodDebut+"01";
                var fin = $scope.periodFin+"12";
            }

            if($scope.typePeriode == "Monthly"){
                nbreMois = 1;
                var debut = $scope.periodDebut;
                var fin = $scope.periodFin;
            }

            largePeriode(debut,fin,nbreMois);
        }

        function voirAssigne() {

            for(var a=0,b=periodGlobal.length;a<b;a++){
                var pep = "";
                for(var i=0,j=periodGlobal[a].periodDetaillers.length;i<j;i++){
                    pep= pep+";"+periodGlobal[a].periodDetaillers[i];
                }
                delete periodGlobal[a].periodDetaillers;
                pep = pep.slice(1);
                periodGlobal[a].periode = pep;
                periodGlobal[a].resultat={};
                periodGlobal[a].resultat.formulaireAttendu = 0;
                periodGlobal[a].resultat.formulaireObtenu = 0;
                periodGlobal[a].resultat.formulaireDansLeTemps = 0;
                periodGlobal[a].resultat.completudeFormulaire = 0;
                periodGlobal[a].resultat.promptitudeFormulaire = 0;
            }
            gestOrgUnitPeriode();
        }

        function gestOrgUnitPeriode() {
            for(var i = 0,j=orgUnitNivo.length;i<j;i++){
                orgUnitNivo[i].periode =  angular.copy(periodGlobal);
                delete orgUnitNivo[i].children;
                delete orgUnitNivo[i].code;
                delete orgUnitNivo[i].created;
                delete orgUnitNivo[i].openingDate;
                delete orgUnitNivo[i].nomNiveau;
                delete orgUnitNivo[i].parent;
                delete orgUnitNivo[i].shortName;

            }
            console.log("orgUnitNivo");
            console.log(orgUnitNivo);
        }
        

        function analyseData(){
            if(nivo<orgUnitNivo.length){
                    if(comptePeriod<orgUnitNivo[nivo].periode.length){
                        notreUrl = "dimension=dx:"+dataSet.id+"&dimension=pe:"+orgUnitNivo[nivo].periode[comptePeriod].periode+"&dimension=ou:"+orgUnitNivo[nivo].collecteListe;
                        getAnalytic();
                    }else{
                        comptePeriod=0;nivo++;$scope.barsAnalyse++;
                        $scope.progAnalyse = $scope.barsAnalyse/$scope.nbreNivo;
                        $scope.progAnalyse *=100;
                        analyseData();
                    }
            }else{
                console.log("fin de analyseData");
                console.log(orgUnitNivo);
                var secondTimestamp = new Date().getTime();
                console.log("temps d'execution = "+(secondTimestamp-firstTimestamp)+" millisecondes");
                nivo = 0;comptePeriod = 0;unite = 0;
                tempsAttente.id = "";tempsAttente.nbre = 0;
                $scope.barsRapport++;
                $scope.progRapport =0;
                gestFormComplete();
            }
        }

        function getAnalytic() {
            /*analyticsResource.get({
                dimension: notreUrl
            }, function (data) {
                console.log("resutltat dans data");
                console.log(data);
                
            }, function (err) {
                console.log("resutltat dans err");
                console.log(err);
            });*/
            $http({
                method: 'GET',
                url: baseUrl + '/api/analytics?'+notreUrl
            }).then(function successCallback(reponse) {
                console.log("resutltat dans data");
                console.log(reponse.data);
                console.log(reponse.data.rows.length);
                var temp=reponse.data.rows.length;
                addAssigne(temp);
            }, function errorCallback(err) {
                console.log("resutltat dans err");
                console.log(err);
                getErreurAnalytic(notreUrl);
            });
        }

        function addAssigne(nbre) {
            orgUnitNivo[nivo].periode[comptePeriod].resultat.formulaireAttendu = nbre;
            comptePeriod++;
            analyseData();
        }

        function gestFormComplete() {
            console.log("entrer dans gestFormComplete");
            //console.log("nivo = "+nivo);
            if(nivo<orgUnitNivo.length){
                    if(comptePeriod<orgUnitNivo[nivo].periode.length && orgUnitNivo[nivo].collecteNivo.length !=0){
                        var startDate,endDate,orgUnit;
                        startDate = orgUnitNivo[nivo].periode[comptePeriod].premierJour;
                        endDate = orgUnitNivo[nivo].periode[comptePeriod].dernierJour;
                        orgUnit = orgUnitNivo[nivo].collecteNivo[unite];
                        endDateGlobal = endDate; startDateGlobal = startDate; orgUnitGlobal = orgUnit;
                        formsComplete(startDate,endDate,orgUnit);
                    }else{
                        comptePeriod=0;unite++;
                        if(unite == orgUnitNivo[nivo].collecteNivo.length || orgUnitNivo[nivo].collecteNivo.length ==0){
                            unite=0;nivo++;$scope.barsRapport=nivo;
                            $scope.progRapport = $scope.barsRapport/$scope.nbreNivo;
                            $scope.progRapport *=100;
                        }
                        gestFormComplete();
                    }
                
            }else{
                console.log("fin de gestFormComplete");
                console.log(orgUnitNivo);
                var secondTimestamp = new Date().getTime();
                console.log("temps d'execution = "+(secondTimestamp-firstTimestamp)+" millisecondes");
                calculePromt();
            }
        }

        function formsComplete(startDate,endDate,orgUnit) {
            console.log("entrer dans formsComplete ====>");
            console.log("nivo = "+nivo+" ;unite = "+unite+" ;comptePeriod = "+comptePeriod);
            completeDataSetRegistrations.query({
                dataSet: dataSet.id,
                startDate: startDate,
                endDate: endDate,
                orgUnit: orgUnit,
                children: false
            }, function (data) {
                var temp=[];
                if (data.completeDataSetRegistrations) {
                    temp=data.completeDataSetRegistrations;
                } else {
                    console.log("******************************************");
                    console.log(data);
                    console.log("*******************************************");
                }
                resultatFormComplete(temp);
            }, function (err) {
                var temp = ""+nivo+""+unite+""+comptePeriod;
                console.log("erreur au : "+temp);
                console.log("orgUnitNivo");
                console.log(orgUnitNivo);
                getErreurFormsComplete(temp);

            });

        }

        function resultatFormComplete(regist) {
            console.log("entrer dans resultatFormComplete");
            var nbre = 0;
            nbre = parseInt(regist.length);
            //orgUnitNivo[nivo].periode[comptePeriod].resultat.formulaireObtenu = nbre+orgUnitNivo[nivo].periode[comptePeriod].resultat.formulaireObtenu;
            console.log("orgUnitNivo["+nivo+"].periode["+comptePeriod+"].resultat.formulaireObtenu = "+angular.copy(orgUnitNivo[nivo].periode[comptePeriod].resultat.formulaireDansLeTemps));
            orgUnitNivo[nivo].periode[comptePeriod].resultat.formulaireObtenu += nbre;
            console.log("nbre = "+nbre);
            console.log("orgUnitNivo["+nivo+"].periode["+comptePeriod+"].resultat.formulaireObtenu = "+angular.copy(orgUnitNivo[nivo].periode[comptePeriod].resultat.formulaireDansLeTemps));
            if(nbre == 0){
                orgUnitNivo[nivo].periode[comptePeriod].resultat.formulaireDansLeTemps += nbre;
                gestCompteur();
            }else{
                determinePrompt(regist);
            }
        }
        
        function determinePrompt(regist) {
            console.log("entrer dans determinePrompt");
            console.log("regist====");
            console.log(regist);
            var aTemps=0;
            for(var i=0,j=regist.length;i<j;i++){
                var dateTeminer = new Date(regist[i].date);
                var datePeride = "";
                console.log("+regist[i].period.name = "+regist[i].period.name);
                if(regist[i].period.name){
                    console.log("period.name = "+regist[i].period.name);
                    var mois = ""+regist[i].period.name;
                    mois = mois.slice(-2);
                    var annee = ""+regist[i].period.name;
                    annee = annee.slice(0,4);
                    datePeride = annee+"-"+mois+"-01";
                }else{
                    console.log("period = "+regist[i].period);
                    var mois = ""+regist[i].period;
                    mois = mois.slice(-2);
                    var annee = ""+regist[i].period;
                    annee = annee.slice(0,4);
                    datePeride = annee+"-"+mois+"-01";
                }

                console.log("datePeride = "+datePeride);
                var ladateLimite = new Date(datePeride);
                ladateLimite.setDate(32);
                var limite = parseInt(dataSet.timelyDays);
                ladateLimite.setDate(limite);
                if(dateTeminer<ladateLimite){
                    console.log(dateTeminer+" < "+ladateLimite);
                    aTemps +=1;
                }
            }
            orgUnitNivo[nivo].periode[comptePeriod].resultat.formulaireDansLeTemps += aTemps;
            gestCompteur();
        }

        function gestCompteur() {
            console.log("entrer dans gestCompteur");
            //console.log("nivo = "+nivo+" ;unite = "+unite+" ;comptePeriod = "+comptePeriod);
            if(unite < orgUnitNivo[nivo].collecteNivo.length){
                comptePeriod++;
            }else{
                nivo++;$scope.barsRapport=nivo;$scope.progRapport = $scope.barsRapport/$scope.nbreNivo;
                $scope.progRapport *=100;
                comptePeriod = 0;
                unite = 0;
            }
            gestFormComplete();
        }
        
        function calculePromt(){
            console.log("entrer dans calculePromt");
           for(var i=0,j=orgUnitNivo.length;i<j;i++){
               for(var a=0,b=orgUnitNivo[i].periode.length;a<b;a++){
                   var complet = 0, promt = 0;
                   // pour la gestion des formulaire désassigné mais dont le rapportage(formulaire terminer) et formulaire Attendu < formulaire Obtenu
                   /*if(orgUnitNivo[i].periode[a].resultat.formulaireAttendu < orgUnitNivo[i].periode[a].resultat.formulaireObtenu){
                       orgUnitNivo[i].periode[a].resultat.formulaireAttendu = angular.copy(orgUnitNivo[i].periode[a].resultat.formulaireObtenu);
                   }*/
                   if(orgUnitNivo[i].periode[a].resultat.formulaireAttendu != 0){
                       complet = orgUnitNivo[i].periode[a].resultat.formulaireObtenu / orgUnitNivo[i].periode[a].resultat.formulaireAttendu;
                       promt = orgUnitNivo[i].periode[a].resultat.formulaireDansLeTemps / orgUnitNivo[i].periode[a].resultat.formulaireAttendu;
                   }
                   
                   
                   complet *= 10000;
                   complet = complet | 0;
                   complet = complet / 100;
                   promt *= 10000;
                   promt = promt | 0;
                   promt = promt / 100;

                   orgUnitNivo[i].periode[a].resultat.completudeFormulaire = complet;
                   orgUnitNivo[i].periode[a].resultat.promptitudeFormulaire = promt

               }
           }
            /*console.log("fin prog calculePromt ====>> orgUnitNivo =");
            console.log(orgUnitNivo);*/
            finExecution();
        }

        function getErreurFormsComplete(id) {
            console.log("entrer dans getErreur");
            if(tempsAttente.id == id ){
                if(tempsAttente.nbre < 3){
                    var temp = tempsAttente.temps[tempsAttente.nbre];
                    console.log("attente de "+temp+"s");
                    tempsAttente.nbre++;
                    temp *= 1000;
                    $timeout(function () {
                        formsComplete(startDateGlobal,endDateGlobal,orgUnitGlobal);
                    }, temp);
                }else{
                    if (confirm("Une erreur s'est produite,n\verifier votre connexion et cliquez sur OK pour continuer ou Annuler pour arreter")) {
                        tempsAttente.nbre = 0;
                        formsComplete(startDateGlobal,endDateGlobal,orgUnitGlobal);
                    }
                    else{
                        alert("Une erreur s'est produite,n\Vous avez arreter le processus");
                    }
                    
                }
            }else{
                tempsAttente.nbre = 0;
                tempsAttente.id = id;
                getErreurFormsComplete(id);
            }
        }

        function getErreurAnalytic(id) {
            console.log("entrer dans getErreur");
            if(tempsAttente.id == id ){
                if(tempsAttente.nbre < 3){
                    var temp = tempsAttente.temps[tempsAttente.nbre];
                    console.log("attente de "+temp+"s");
                    tempsAttente.nbre++;
                    temp *= 1000;
                    $timeout(function () {
                        getAnalytic();
                    }, temp);
                }else{
                    $scope.AttenteChargement = false;
                    alert("Une erreur s'est produite, veuillez reessayer plutart SVP");
                }
            }else{
                tempsAttente.nbre = 0;
                tempsAttente.id = id;
                getErreurAnalytic(id);
            }
        }

        function gestTitre() {
            console.log("entrer dans gestTitre");
            /*orgUnitNivo[0].periode[0].name;
            orgUnitNivo[0].periode[orgUnitNivo[0].periode.length].name;*/
            if($scope.lesIntervals.name.length == 1){
                $scope.titres = $scope.lesIntervals.name[0];
            }else{
                $scope.titres = "De "+$scope.lesIntervals.name[0]+" à "+$scope.lesIntervals.name[$scope.lesIntervals.name.length - 1];
            }

        }

        function ordonnerResultat() {
            console.log("entrer dans ordonnerResultat");
            $scope.collecteResultat = [];
            $scope.collecteResultat = angular.copy(orgUnitNivo);
            for(var i=0,j=$scope.collecteResultat.length;i<j;i++){
                var suiteResultat = [];
                for(var a=0,b=$scope.collecteResultat[i].periode.length;a<b;a++){
                    suiteResultat.push($scope.collecteResultat[i].periode[a].resultat.formulaireObtenu);
                    suiteResultat.push($scope.collecteResultat[i].periode[a].resultat.formulaireAttendu);
                    suiteResultat.push($scope.collecteResultat[i].periode[a].resultat.completudeFormulaire);
                    suiteResultat.push($scope.collecteResultat[i].periode[a].resultat.formulaireDansLeTemps);
                    suiteResultat.push($scope.collecteResultat[i].periode[a].resultat.promptitudeFormulaire);
                }
                $scope.collecteResultat[i].suiteResultat = [];
                $scope.collecteResultat[i].suiteResultat = suiteResultat;
            }
        }

        function finExecution() {
            console.log("entrer dans finExecution");
            gestTitre();
            ordonnerResultat();
            console.log("finExecution ====>> ");
            console.log(orgUnitNivo);
            $scope.AttenteChargement = false;
            $scope.charger = true;
        }

        /*$scope.my_tree_handler = function (branch) {
            console.log("entrer dans brancheSelectionner");
            $scope.facility = branch.data;
            console.log($scope.facility);
        }*/
        
        function constOrgUnit() {
            console.log("entrer dans constOrgUnit");
            console.log(allOrgUnit);
            orgUnitNivo = [];
            for(var i=0,j= $scope.facility.children.length;i<j;i++){
                for(var a=0,b=allOrgUnit.length;a<b;a++){
                    if($scope.facility.children[i].id == allOrgUnit[a].id){
                        console.log("egal : "+$scope.facility.children[i].id +" = "+allOrgUnit[a].id);
                        console.log(allOrgUnit[a]);
                        collecteNivo=[];
                        orgUnitNivo.push(angular.copy(allOrgUnit[a]));
                        orgUnitNivo[orgUnitNivo.length - 1].collecteNivo = angular.copy(collecteNivo);
                        break;
                    }
                }
            }
            console.log("les orgUnit du nivo");
            console.log(orgUnitNivo);
            addNivo();
        }

        function continuExecution() {
            deternierDebutFin();
            $scope.AttenteChargement = true;
            $scope.barsRapport=0;
            orgUnitAssign();
            /*$scope.barsAnalyse++;$scope.progAnalyse;
             analyseData();*/
        }

        function orgUnitAssign() {
            console.log("entrer dans orgUnitAssign");
            for(var i = 0,j=orgUnitNivo.length;i<j;i++){
                var a=0,conti=true;
                while(conti){
                    //console.log("entrer dans while a = "+a);
                    for(var l=0,k=dataSet.organisationUnits.length;l<k;l++){
                        if(orgUnitNivo[i].collecteNivo[a] == dataSet.organisationUnits[l].id){
                            break;
                        }
                    }
                    if(l<dataSet.organisationUnits.length){
                        dataSet.organisationUnits.splice(l,1);
                    }
                    if(l == dataSet.organisationUnits.length ){
                        orgUnitNivo[i].collecteNivo.splice(a,1);
                        a--;
                    }
                    a++;
                    if(a == orgUnitNivo[i].collecteNivo.length){
                        conti = false;
                    }
                }
                for(var ab=0,bb=orgUnitNivo[i].periode.length;ab<bb;ab++){
                    orgUnitNivo[i].periode[ab].resultat.formulaireAttendu = angular.copy(orgUnitNivo[i].collecteNivo.length);
                }
            }
            console.log("orgUnitNivo >>>>>>>>>");
            console.log(orgUnitNivo);
            console.log("dataSet >>>>>>>>>");
            console.log(dataSet);
            nivo = 0;comptePeriod = 0;unite = 0;
            tempsAttente.id = "";tempsAttente.nbre = 0;
            $scope.barsRapport++;
            $scope.progRapport =0;
            gestFormComplete();
        }


        var toCopy  = document.getElementById( 'to-copy' ),
            btnCopy = document.getElementById( 'copy' ),
            paste   = document.getElementById( 'cleared' );

        if(btnCopy){
            btnCopy.addEventListener( 'click', function(){
                toCopy.select();
                paste.value = '';

                if ( document.execCommand( 'copy' ) ) {
                    btnCopy.classList.add( 'copied' );
                    paste.focus();

                    var temp = setInterval( function(){
                        btnCopy.classList.remove( 'copier' );
                        clearInterval(temp);
                    }, 600 );

                } else {
                    console.info( 'document.execCommand went wrong…' )
                }

                return false;
            } );
        }
        
    }
]);
