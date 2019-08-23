sigcidev.controller('FacilityCtrl', ['$scope', '$rootScope', '$routeParams', '$location', 'orgUnitResource', 'orgUnitDelete', '$window', '$filter', 'Notification','$timeout',
    function ($scope, $rootScope, $routeParams, $location, orgUnitResource, orgUnitDelete, $window, $filter, Notification,$timeout) {

        $scope.facility = {};
        $scope.facility.parent = {};
        var facilityCopie;
        var enr = "NO";
        //$scope.facility.openingDate = Date.now();
        //$scope.facility.openingDate = new Date();
        //$scope.dateMax = $filter('date')(Date.now(), 'yyyy-MM-dd');
        //$scope.dateMax = $filter('date')(addDay(1), 'yyyy-MM-dd');
        //console.log("$scope.dateMax = " + $scope.dateMax);
        // $scope.facility.openingDate = $filter('date')(Date.now(), 'yyyy-MM-dd').toString();
        var loadingStatus;
        $scope.newCode = true;
        $scope.afficheSupprimerCode = false;
        //$scope.toutDesactive = false;
        $scope.listesCodes = [];
        $scope.SuppCode = true;
        $scope.geneCode = false;
        $scope.confCode = false;
        
        chargerArbre();
        
        /*ajout de l'hierachie des unités d'organisation*/
        function chargerArbre() {
            if ($rootScope.arbre.length != 0) {
                console.log("test dans chargerArbre == ",$rootScope.arbre);
                $scope.labre = $rootScope.arbre;
                
                $scope.listesCodes = $rootScope.leCode;
                parametre();
                $timeout(function () {
                    actionCode();
                    $scope.$apply();
                });
            }else{
                $timeout(function () {
                    chargerArbre();
                    
                }, 500);
            }
        }

        /*click sur une unité d'organisation*/
        $scope.my_tree_handler = function (branch) {
            console.log("entrer dans brancheSelectionner");
            //$scope.facility = branch.data;

            //if(branch.data.level == $rootScope.niveauOrgUnit[$rootScope.niveauOrgUnit.length-2].level){
            if (branch.data.level == 3) {
                $scope.districtName = branch.data.name;
                $scope.facility.parent.id = branch.data.id;
                console.log(branch.data);
                console.log($scope.facility);
                return;
            }
            if (branch.data.level == 4) {
                trouverParent(branch.data);
                return;
            }
            if (branch.data.level != 4 && branch.data.level != 3) {
                $scope.districtName = "";
                $scope.facility.parent.id = "";
                console.log("$scope.facility");
                console.log($scope.facility);
            }
        }

        /*mettre la limite pour empeché de choisir une date supérieur a la date du jour*/
        function addDay(days) {
            var result = new Date();
            result.setDate(result.getDate() + days);
            return result;
        }

        function parametre() {
            console.log("contenu de $routeParams.id est ");
            console.log($routeParams.id);
            if ($routeParams.id) {
                $scope.newCode = false;
                getOrgUnit($routeParams.id);
                trouverParent($scope.facility);
                //actionCode();                
                facilityCopie = angular.copy($scope.facility);
            }else {
                $scope.facility.code = $rootScope.genererCode();
                $scope.facility.openingDate = new Date();
                $scope.newCode = true;
            }   
        }

        $scope.ajouterOrgUnit = function () {
            $scope.toutDesactive = true;
            // var formats = formatageValeurs();
            loadingStatus = Notification.info({message: "Veuillez patientez SVP.......", title: "Enregistrement en cour", delay: null, positionX: 'center'})
            var lapromise = orgUnitDelete.save(formatageValeurs());
            lapromise.$promise.then(function (resultat) {
                console.log("resultat ok");
                console.log(resultat);
                if (resultat.status = "OK") {
                    console.log("resultat.status = " + resultat.status);
                    if (resultat.response.importCount.imported == 1) {
                        enr = "YES";
                        $rootScope.DerniereAjoutOuModifier.unshift(resultat.response.lastImported);
                        tuerNotification();
                        Notification.success({message: "Enregistrement Effectué!", positionX: 'center'});
                    }
                    else {
                        //return "UPDATE ECHEC";
                        console.log("contenu de resultat.response.importConflicts[0].value");
                        console.log(resultat.response.importConflicts[0].value)
                        //return resultat.response.importConflicts[0].value;
                        tuerNotification();
                        Notification.error({message: "Echec d'enregistrement!", positionX: 'center'});
                    }
                }
                else
                    console.log("resultat.status = " + resultat.status);
                sortieDeCreation();
            }, function (err) {
                console.log("resultat noooooon");
                console.log(err);
                tuerNotification();
                Notification.error({message: err.data.message, title: "Echec d'enregistrement!", positionX: 'center'});
                sortieDeCreation();
            });
            console.log("le resultat total affiche");

        }

        $scope.modifierOrgUnit = function () {
            //var formats = formatageValeurs();
           // $scope.toutDesactive = true;
            if (facilityCopie != $scope.facility) {
                loadingStatus = Notification.info({message: "Veuillez patientez SVP.......", title: "Modification en cour", delay: null})
                var lapromise = orgUnitResource.update({id: $routeParams.id}, formatageValeurs());
                lapromise.$promise.then(function (resultat) {
                    console.log("un retour positif");
                    console.log(resultat);
                    if (resultat.status = "OK") {
                        console.log("resultat.status = " + resultat.status);
                        tuerNotification();
                        if (resultat.response.importCount.updated = 1) {
                            $rootScope.DerniereAjoutOuModifier.push(resultat.response.lastImported);
                            Notification.success("Modification Effectué!");
                            //return "UPDATE SUCCES";
                        }
                        else {
                            Notification.error({message: err.data.message, title: "Echec d'enregistrement!"});
                            console.log("resultat.response.importConflicts[0].value");
                            console.log(resultat.response.importConflicts[0].value);
                        }
                    }
                    else {
                        console.log("resultat.status = " + resultat.status);
                    }
                    sortieDeCreation();

                }, function (err) {
                    console.log("un retour negatif");
                    console.log(err);
                    tuerNotification();
                    Notification.error({message: err.data.message, title: "Echec d'enregistrement!"});
                    /*console.log("resultat.status = " + resultat.status);
                     console.log("Generation d'erreur de communication");
                     console.log("contenu de resultat.message");
                     console.log(resultat.message);*/
                    sortieDeCreation();

                });
                console.log("fin modif");
            }
            else
                sortieDeCreation();

        }

        function sortieDeCreation() {
            if(enr == "YES"){$rootScope.initialiser(); enr == "NO"}
            $timeout(function () {
                $location.path('#!/facilities');
            }, 2000);
        }

        function tuerNotification() {
            loadingStatus.then(function (notification) {
                notification.kill();
            });
        }

        $scope.supprimerCode = function () {
            $scope.facility.code = "";
            $scope.SuppCode = false;
        }

        $scope.back = function () {
            //  $scope.ui.direction = 'left';
            $window.history.back();
        }

        $scope.conformerCode = function () {
            var long = $scope.facility.code.length;
            console.log("long = "+long);
            if (long == 1)
                $scope.facility.code = "000" + $scope.facility.code;
            if (long == 2)
                $scope.facility.code = "00" + $scope.facility.code;
            if (long == 3)
                $scope.facility.code = "0" + $scope.facility.code;
        }
        $scope.SuppCode = false;
        $scope.geneCode = false;
        $scope.confCode = false;

        $scope.Code = function () {
            $scope.newCode = true;
            $scope.facility.code = $rootScope.genererCode();
            $scope.SuppCode = false;
            $scope.confCode = false;
        }

        function formatageValeurs() {
            //var data = {};
            var openingDate = $filter('date')($scope.facility.openingDate, 'yyyy-MM-dd');
            $scope.facility.openingDate = openingDate;
            $scope.facility.code = ""+$scope.facility.code;
            console.log("contenu de data");
            console.log($scope.facility);
            return $scope.facility;
        }

        function getOrgUnit(orgUnitID) {
            for (var i = 0, j = $rootScope.allOrgUnit.length; i < j; i++) {
                if ($rootScope.allOrgUnit[i].id == orgUnitID) {
                    $scope.facility = $rootScope.allOrgUnit[i];
                    break;
                }
            }
        }

        function trouverParent(data) {
            var a = 0;
            while (true) {
                if ($rootScope.allOrgUnit[a].id == data.parent.id) {
                    $scope.districtName = $rootScope.allOrgUnit[a].name;
                    $scope.facility.parent.id = $rootScope.allOrgUnit[a].id;
                    console.log("trouvé dans la boucle true");
                    console.log($rootScope.allOrgUnit[a]);
                    console.log($scope.facility);
                    break;
                }
                a++;
            }

        }
        
        function actionCode() {
            console.log("entrer dans actionCode");
            if($scope.facility.code) {
                if (!isNaN(filterInt($scope.facility.code))) {
                    var nbre = parseInt($scope.facility.code);
                    console.log("$scope.facility.code.length = " + $scope.facility.code.length);
                    if (nbre < 1000) {
                        $scope.confCode = true;;
                    }
                    if (nbre > 9999) {
                        $scope.geneCode = true;
                    }
                } else {
                    $scope.geneCode = true;
                }
            }
           
        }

        $scope.datesMax = function (dates) {
            return (dates < new Date());
        }

        function filterInt(value) {
            if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
                return Number(value);
            return NaN;
        };

    }]);
