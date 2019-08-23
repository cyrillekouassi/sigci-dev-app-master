sigcidev.controller('FacilityCompletudeCtrl', ['$scope', '$rootScope', 'orgUnitResource', 'DataSetResource', 'completeDataSetRegistrations', '$window', '$filter','$timeout',
    function ($scope, $rootScope, orgUnitResource, DataSetResource, completeDataSetRegistrations, $window, $filter,$timeout) {

        var dateDebut, dateFin, todayDate, collecteAllCompletude = [], monthlyName, compte = 0, compte2 = 0, comptePageCount = 0, allDataSet = [], descendance = [], collecteOrgUnit;
        var lepas = 1,longueur=0,barProgression = 0;
        $scope.loadingDataSet = false;
        $scope.AttenteChargement = false;
        $scope.chargement = false;
        $scope.period = {};
        $scope.collectesCompletudes = [];
        $scope.completudeTotal = {};
        $scope.titre;
        $scope.bars = 0;
        getPeride();
        getDataSet();


        function getPeride() {
            todayDate = new Date();
            todayDate.setDate(1);
            $scope.period.debut = angular.copy(todayDate);
            $scope.period.debut.setDate(0)
        }

        $scope.my_tree_handler = function (branch) {
            console.log("entrer dans brancheSelectionner");
            $scope.facility = branch.data;
            descendance = branch;
        }

        function getDataSet() {
            $scope.loadingDataSet = true;
            DataSetResource.query({
                paging: false,
                fields: 'id,name,timelyDays,periodType'
            }, function (resultat) {
                allDataSet = resultat.dataSets;
                /*console.log("allDataSet ==");
                console.log(allDataSet);*/
                $scope.loadingDataSet = false;
            }, function (err) {
                compte = 1;
                getDataSetDetail();
            });
        }

        function getDataSetDetail() {
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
                    $scope.loadingDataSet = false;
                    /*console.log("allDataSet ==");
                    console.log(allDataSet);*/
                }
            }, function (err) {

            });
        }

        $scope.executer = function () {
            console.log("entrer dans executer");
            $scope.AttenteChargement = true;
            $scope.chargement = false;
            initialiser();
            if ($scope.facility && $scope.period.debut) {
                determinerPeride();
                determineOrgUnit();
                deterninerNomNiveau($scope.facility.name, $scope.facility.level);
                comptePageCount = collecteOrgUnit.length;
                compte = 0;
                longueur=0;
                getOrgUnitDataSets();
            } else {
                //finAnormal()
                $scope.AttenteChargement = false;
            }

        }

        function initialiser() {
            barProgression = 0;
            longueur = 0;
            $scope.bars = 0;
            $scope.collectesCompletudes = [];
            collecteAllCompletude = [];
            $scope.completudeTotal = {};
        }

        function determinerPeride() {
            console.log("entrer dans determinerPeride");
            dateDebut = angular.copy($scope.period.debut);
            dateDebut.setDate(1);
            monthlyName = $filter('date')(dateDebut, "MMMM yyyy");
            dateDebut = $filter('date')(dateDebut, "yyyy-MM-dd");
            if ($scope.period.fin) {
                dateFin = angular.copy($scope.period.fin);
            } else {
                dateFin = angular.copy($scope.period.debut);
            }
            dateFin.setDate(32);
            dateFin.setDate(0);
            dateFin = $filter('date')(dateFin, "yyyy-MM-dd");
            //console.log("dateDebut = " + dateDebut + " *** dateFin = " + dateFin);
            progressBar(1);
        }

        function determineOrgUnit() {
            console.log("entrer dans determineOrgUnit");
            collecteOrgUnit = [];
            var temp = {}
            temp.id = descendance.id;
            temp.name = descendance.label;
            collecteOrgUnit.push(temp);
            if (descendance.children.length != 0) {
                voirOrgDescend(descendance.children);
                progressBar(2);
            }
            determinerLePas(collecteOrgUnit.length,25);
            /*console.log("collecteOrgUnit fin Executer ---------");
            console.log(angular.copy(collecteOrgUnit));*/
            progressBar(1);
        }

        function deterninerNomNiveau(nom, nivo) {
            $scope.titre = $rootScope.niveauOrgUnit[nivo - 1].name + ": " + nom + "  - " + monthlyName;
            progressBar(0.5);
        }

        function voirOrgDescend(descend) {
            console.log("entrer dans voirOrgDescend");
            //console.log(descend);
            for (var i = 0, j = descend.length; i < j; i++) {
                var temp = {};
                temp.id = descend[i].id;
                temp.name = descend[i].label;
                collecteOrgUnit.push(temp);
                if (descend[i].children.length != 0) {
                    voirOrgDescend(descend[i].children);
                }
            }
        }

        function getOrgUnitDataSets() {
            console.log("entrer dans getOrgUnitDataSets");
            orgUnitResource.query({
                id: collecteOrgUnit[compte].id,
                fields: 'dataSets'
            }, function (data) {
                progressBar(lepas);
                collecteOrgUnit[compte].dataSets = data.dataSets;
                longueur += data.dataSets.length;
                compte++;
                if (compte < comptePageCount) {
                    getOrgUnitDataSets();
                } else {
                    /*console.log("+++++++++ collecteOrgUnit +++++");
                    console.log(angular.copy(collecteOrgUnit));
                    console.log("fin getOrgUnitDataSets");*/
                    compte = 0;
                    determinerLePas(longueur,60);
                    garderMonthly();
                    //getComplete();
                }
            });
        }

        function garderMonthly() {
            for (var i = 0, j = collecteOrgUnit.length; i < j; i++) {
                if (collecteOrgUnit[i].dataSets.length != 0) {
                    var conti = true, compt = 0;
                    while (conti) {
                        for (var a = 0, b = allDataSet.length; a < b; a++) {
                            if (allDataSet[a].id == collecteOrgUnit[i].dataSets[compt].id) {
                                if (allDataSet[a].periodType != "Monthly") {
                                    collecteOrgUnit[i].dataSets.splice(compt, 1);
                                    compt--;
                                    break;
                                }

                            }
                        }
                        compt++;
                        if (compt == collecteOrgUnit[i].dataSets.length) {
                            conti = false;
                        }

                    }

                }
            }
            progressBar(1);
            /*console.log("+++++++++ collecteOrgUnit +++++ fin garderMonthly");
            console.log(angular.copy(collecteOrgUnit));
            //console.log("fin getOrgUnitDataSets");*/
            getComplete();

        }

        function getComplete() {

            if (compte < collecteOrgUnit.length) {
                compte2 = 0;
                if (collecteOrgUnit[compte].dataSets.length != 0) {
                    formsComplete();
                } else {
                    compte++;
                    getComplete();
                }
            } else {
                /*console.log("collecteOrgUnit fin getComplete ****");
                console.log(collecteOrgUnit);*/
                determinerLePas(collecteOrgUnit.length,10);
                if (descendance.children.length == 0) {
                    constituerOneOrgUnit(descendance.label);
                } else {
                    collecteAllCompletude.push(descendance);
                    var total = orgRecursive(collecteAllCompletude);
                    /*console.log("collecteAllCompletude = /**----");
                    console.log(collecteAllCompletude);
                    console.log("+++++total = ");
                    console.log(total);*/
                    constituerResultat(total);
                }

                finChargement();
            }

        }

        function formsComplete() {
            console.log("entrer dans formsComplete");
            console.log(collecteOrgUnit);
            /*completeDataSetRegistrations.query({
                dataSet: collecteOrgUnit[compte].dataSets[compte2].id,
                startDate: dateDebut,
                endDate: dateFin,
                orgUnit: collecteOrgUnit[compte].id,
                children: false
            }, function (data) {
                progressBar(lepas);
                if (data.completeDataSetRegistrations) {
                    collecteOrgUnit[compte].dataSets[compte2].completeDataSet = data.completeDataSetRegistrations;
                } else {
                    collecteOrgUnit[compte].dataSets[compte2].completeDataSet = [];
                }
                compte2++;
                if (compte2 < collecteOrgUnit[compte].dataSets.length) {
                    formsComplete();
                } else {
                    compte++;
                    getComplete();

                }
            }, function (err) {

            });*/

        }

        function orgRecursive(collecte) {
            console.log("entrer dans orgRecursive");
            var compile = {name: "", AttenduDataSets: 0, obtenuDataSets: 0, prompt: 0, completude: 0, promptitude: 0};
            for (var i = 0, j = collecte.length; i < j; i++) {
                if (collecte[i].children.length != 0) {
                    collecte[i].compilation = orgRecursive(collecte[i].children);
                }
                collecte[i].rapport = comptabiliserFormulaire(collecte[i].id);
                //compile.name = collecte[i].rapport.name;
                compile.AttenduDataSets = compile.AttenduDataSets + collecte[i].rapport.AttenduDataSets;
                compile.obtenuDataSets = compile.obtenuDataSets + collecte[i].rapport.obtenuDataSets;
                compile.prompt = compile.prompt + collecte[i].rapport.prompt;
                if (collecte[i].compilation) {
                    compile.AttenduDataSets = compile.AttenduDataSets + collecte[i].compilation.AttenduDataSets;
                    compile.obtenuDataSets = compile.obtenuDataSets + collecte[i].compilation.obtenuDataSets;
                    compile.prompt = compile.prompt + collecte[i].compilation.prompt;
                }
                progressBar(lepas);
            }
            if (compile.AttenduDataSets != 0) {
                compile.completude = compile.obtenuDataSets / compile.AttenduDataSets;
                compile.promptitude = compile.prompt / compile.AttenduDataSets;
            }

            compile.completude *= 100;
            compile.promptitude *= 100;
            compile.promptitude = compile.promptitude | 0;
            compile.completude = compile.completude | 0;
            compile.promptitude = compile.promptitude + "%";
            compile.completude = compile.completude + "%";
            collecte.compile = compile;
            return compile;
        }

        function comptabiliserFormulaire(orgUnitID) {
            console.log("entrer dans comptabiliserFormulaire");
            for (var i = 0, j = collecteOrgUnit.length; i < j; i++) {
                if (orgUnitID == collecteOrgUnit[i].id) {
                    var temp = {
                        name: "",
                        AttenduDataSets: 0,
                        obtenuDataSets: 0,
                        prompt: 0,
                        completude: 0,
                        promptitude: 0
                    };
                    temp.name = collecteOrgUnit[i].name;
                    temp.AttenduDataSets = collecteOrgUnit[i].dataSets.length;
                    for (var a = 0, b = collecteOrgUnit[i].dataSets.length; a < b; a++) {
                        if (collecteOrgUnit[i].dataSets[a].completeDataSet) {
                            if (collecteOrgUnit[i].dataSets[a].completeDataSet.length != 0) {
                                temp.obtenuDataSets++;
                                var leJourSaisi = collecteOrgUnit[i].dataSets[a].completeDataSet[0].date;
                                var resultat = getDateLine(leJourSaisi, collecteOrgUnit[i].dataSets[a].id);
                                if (resultat == "BON") {
                                    temp.prompt++;
                                }
                            }
                        } else {

                        }


                    }
                    if (temp.AttenduDataSets != 0) {
                        temp.completude = temp.obtenuDataSets / temp.AttenduDataSets;
                        temp.promptitude = temp.prompt / temp.AttenduDataSets;
                    }
                    temp.completude *= 100;
                    temp.completude = temp.completude | 0;
                    temp.completude = temp.completude + "%";
                    temp.promptitude *= 100;
                    temp.promptitude = temp.promptitude | 0;
                    temp.promptitude = temp.promptitude + "%";
                    return temp;
                }
            }
        }

        function getDateLine(leJourSaisi, dataSet, oneOrgUnit) {
            console.log("entrer dans getDateLine");
            var nameEtat = {};
            for (var i = 0, j = allDataSet.length; i < j; i++) {
                if (dataSet == allDataSet[i].id) {
                    nameEtat.name = allDataSet[i].name
                    var laDateLimite = allDataSet[i].timelyDays;
                    if (laDateLimite != 0) {
                        var dateLimite = angular.copy(dateDebut);
                        dateLimite = new Date(dateLimite);
                        dateLimite.setDate(32);
                        dateLimite.setDate(laDateLimite);
                        leJourSaisi = $filter('date')(leJourSaisi, "yyyy-MM-dd");
                        leJourSaisi = new Date(leJourSaisi);
                        if (dateLimite >= leJourSaisi) {
                            nameEtat.etat = "BON";
                        } else {
                            nameEtat.etat = "MAUVAIS";
                        }
                    } else {
                        nameEtat.etat = "BON";
                    }
                    if (oneOrgUnit) {
                        console.log("trouver oneOrgUnit");
                        return nameEtat;
                    }
                    return nameEtat.etat;
                }
            }
        }

        function constituerResultat(total) {
            console.log("entrer dans constituerResultat");
            for (var i = 0, j = collecteAllCompletude[0].children.length; i < j; i++) {
                var temp = {name: "", AttenduDataSets: 0, obtenuDataSets: 0, prompt: 0, completude: 0, promptitude: 0};
                temp.name = collecteAllCompletude[0].children[i].label;
                temp.AttenduDataSets = collecteAllCompletude[0].children[i].rapport.AttenduDataSets;
                temp.obtenuDataSets = collecteAllCompletude[0].children[i].rapport.obtenuDataSets;
                temp.prompt = collecteAllCompletude[0].children[i].rapport.prompt;
                if (collecteAllCompletude[0].children[i].compilation) {
                    temp.AttenduDataSets += collecteAllCompletude[0].children[i].compilation.AttenduDataSets;
                    temp.obtenuDataSets += collecteAllCompletude[0].children[i].compilation.obtenuDataSets;
                    temp.prompt += collecteAllCompletude[0].children[i].compilation.prompt;
                }
                if (temp.AttenduDataSets != 0) {
                    temp.completude = temp.obtenuDataSets / temp.AttenduDataSets;
                    temp.promptitude = temp.prompt / temp.AttenduDataSets;
                }
                temp.completude *= 100;
                temp.completude = temp.completude | 0;
                temp.completude = temp.completude + "%";
                temp.promptitude *= 100;
                temp.promptitude = temp.promptitude | 0;
                temp.promptitude = temp.promptitude + "%";
                $scope.collectesCompletudes.push(temp);
            }

            $scope.collectesCompletudes.push(collecteAllCompletude[0].rapport);
            total.name = collecteAllCompletude[0].label;
            $scope.completudeTotal = total;
            progressBar(1);
            /*console.log("$scope.collectesCompletudes =");
            console.log($scope.collectesCompletudes);
            console.log("$scope.completudeTotal =");
            console.log($scope.completudeTotal);*/

        }

        function constituerOneOrgUnit(orgUnitsName) {
            console.log("entrer dans constituerOneOrgUnit");
            var compile = {name: "-", AttenduDataSets: 0, obtenuDataSets: 0, prompt: 0, completude: 0, promptitude: 0};
            compile.name = orgUnitsName;
            compile.AttenduDataSets = collecteOrgUnit[0].dataSets.length;
            for (var i = 0, j = collecteOrgUnit[0].dataSets.length; i < j; i++) {
                var temp = {name: "-", AttenduDataSets: 0, obtenuDataSets: 0, prompt: 0, completude: 0, promptitude: 0};
                temp.AttenduDataSets = 1;
                if (collecteOrgUnit[0].dataSets[i].completeDataSet && collecteOrgUnit[0].dataSets[i].completeDataSet.length != 0) {
                    temp.obtenuDataSets = 1;
                    compile.obtenuDataSets++;
                    var leJourSaisi = collecteOrgUnit[0].dataSets[i].completeDataSet[0].date;
                    var resultat = getDateLine(leJourSaisi, collecteOrgUnit[0].dataSets[i].id, "ok");
                    temp.name = resultat.name;
                    if (resultat.etat == "BON") {
                        temp.prompt = 1;
                        compile.prompt++;
                    }
                }
                temp.completude = temp.obtenuDataSets / temp.AttenduDataSets;
                temp.completude *= 100;
                temp.completude = temp.completude + "%";
                temp.promptitude = temp.prompt / temp.AttenduDataSets;
                temp.promptitude *= 100;
                temp.promptitude = temp.promptitude + "%";
                if (temp.name = "-") {
                    temp.name = getDataSetName(collecteOrgUnit[0].dataSets[i].id);
                }
                $scope.collectesCompletudes.push(temp);
                progressBar(lepas);
            }
            if (compile.AttenduDataSets != 0) {
                compile.completude = compile.obtenuDataSets / compile.AttenduDataSets;
                compile.promptitude = compile.prompt / compile.AttenduDataSets;
            }

            compile.completude *= 100;
            compile.completude = compile.completude | 0;
            compile.completude = compile.completude + "%";
            compile.promptitude *= 100;
            compile.promptitude = compile.promptitude | 0;
            compile.promptitude = compile.promptitude + "%";
            $scope.completudeTotal = compile;
        }

        function getDataSetName(dataSetID) {
            console.log("entrer dans getDataSetName");
            for (var i = 0, j = allDataSet.length; i < j; i++) {
                if (dataSetID == allDataSet[i].id) {
                    return allDataSet[i].name;
                }
            }
        }

        function finChargement() {
            console.log("entrer dans finChargement");
            progressBar(100);
            $timeout(function () {
                $scope.AttenteChargement = false;
                $scope.chargement = true;
            }, 1000);
        }

        function progressBar(nbre) {
            barProgression += nbre;
            if(barProgression > 100){
                barProgression = 100;
            }
            $scope.bars = barProgression | 0;
        }

        function determinerLePas(longueurTotal,valeurPercent) {
            lepas = valeurPercent/longueurTotal;
        }

        $scope.datesMaxfin = function (dates) {
            return (dates < todayDate);
        }

    }
]);
