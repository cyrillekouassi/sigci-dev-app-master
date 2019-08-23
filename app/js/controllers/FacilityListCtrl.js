sigcidev.controller('FacilityListCtrl', ['$scope', '$rootScope', '$location', 'orgUnitResource', 'orgUnitDelete', '$filter', 'Notification','$timeout',
    function ($scope, $rootScope, $location, orgUnitResource, orgUnitDelete, $filter, Notification,$timeout) {
        // TODO refactor into service
        $scope.loading = true;
        $scope.chekAll = false;
        $scope.chekTilte = false;
        $scope.value = true;
        var laNotification;
        var sansCode = [],codeL1 = [],codeL2 = [],codeL3 = [],codeL4 = [],autreCode = [],codeDouble = [],collectOrgUnit = [],leNivo,index=-1,comp = -1,obj={},nbreExecuter = 0,faire="rien";
        var mesIndex = [];
        $scope.orgunitsList=[];
        $scope.lesChecked = {roles: []};
        $scope.typeOrgUnit = [];
        $scope.affiche = "dernier";
        $scope.disabled = false;
        $scope.typeOrgUnit = [];
        console.log("$scope.typeOrgUnit");
        console.log($scope.typeOrgUnit);

        
        chargement();
        function chargement() {
            if ($rootScope.arbre.length != 0) {
                $scope.typeOrgUnit = angular.copy($rootScope.niveauOrgUnit);
                dernierEdit();
                $rootScope.genererCode();
            }else{
                $timeout(function () {
                    chargement();
                }, 500);
            }
        }
        
        function getOrgunits(level,longcode) {

            for(var i =0,j=$rootScope.OrgUnitGroup[level].orgUnits.length;i<j;i++){
                if($rootScope.OrgUnitGroup[level].orgUnits[i].code.length == longcode){
                    if (!isNaN(filterInt(lecode))) {
                        collectOrgUnit.push();
                    }
                }
            }
        }

        // recherche des codes doubles
        function doublon() {
            codeDouble = [];
            console.log("entrer dans doublon = "+$rootScope.lesCodesDoublons.length);
            console.log($rootScope.lesCodesDoublons);
            if($rootScope.lesCodesDoublons.length != 0){
               for(var i = 0,j=$rootScope.lesCodesDoublons.length;i<j;i++){
                   var compte = 0;
                   for(var k =0,l=$rootScope.allOrgUnit.length;k<l;k++){
                       if($rootScope.allOrgUnit[k].code){
                           if(parseInt($rootScope.allOrgUnit[k].code) == $rootScope.lesCodesDoublons[i].element){
                               codeDouble.push($rootScope.allOrgUnit[k]);
                               compte++;
                               if(compte == $rootScope.lesCodesDoublons[i].nombre){break;}
                           }
                       }
                   }
                   var sep = {};
                   sep.id = "doublon"+i;
                   if((i+1) != j){codeDouble.push(sep);}
               }
            }
        }

        $scope.envoieFacility = function (facility) {
           /* console.log("envoie de donnéé");
            if(!facility.code){
            $rootScope.geneCode = true;
            }else{
                console.log("filterInt($scope.facility.code)"+filterInt(facility.code));
                if(!isNaN(filterInt(facility.code))){
                    var nbre = parseInt(facility.code);
                    console.log("$scope.facility.code.length = "+facility.code.length);
                    if(nbre < 1000){
                        $scope.confCode = true;
                    }
                    if(nbre > 9999){
                        $rootScope.geneCode = true;
                        $rootScope.SuppCode = true;
                    }
                }else{
                    $rootScope.geneCode = true;
                    $rootScope.SuppCode = true;
                }
            }*/
        };
        $scope.removeFacility = function (id,indexe) {
            if (confirm("Attention voulez-vous Supprimer?")) {
                lanceNotif();
                index = indexe;
                orgUnitDelete.delete({id: id}, function (data) {
                    console.log("resultat de suppession");
                    console.log(data);
                    tuerNotif();
                    Notification.success({message:"Suppression Effectué!", positionX: 'center'});
                    $rootScope.initialiser();
                    impactChangement(index);
                }, function (data) {
                    Notification.error({title:"Echec suppression!", message: ''+data.data.message});
                });
            }

        };
        $scope.gestionCode = function () {
            laNotification = Notification.info({message: "Veuillez patientez SVP.......", title: "traitement en cour", delay: null, positionX: 'center'});
            faire = "MODIF";
            nbreExecuter = 0;
            lancer();
        };

        function lancer() {
            console.log("entrer dans lancer");
            if($scope.lesChecked.roles.length > (comp+1)){
                console.log("condition valide loong : "+$scope.lesChecked.roles.length +" > "+comp);
                comp++;
                obj = angular.copy($scope.lesChecked.roles[comp]);
                if(faire == "MODIF"){
                    if(obj.code){
                        if(!isNaN(filterInt(obj.code))){
                            var bon =  maNiv();
                            if(bon){
                                console.log("bon code");
                                lancer();
                            }else{
                                miseAjout();
                            }
                        }else{
                            obj.code = $rootScope.genererCode();
                            miseAjout();
                        }
                        
                    }else{
                        obj.code = $rootScope.genererCode();
                        miseAjout();
                    }
                        
                }else{
                        //obj.code ="";
                    if(obj.code){
                        console.log("sup code");
                        obj.code =" ";
                        miseAjout();
                    }
                        
                }
                
            }else{
                $scope.chekAll = false;
                comp = -1;
                tuerNotif();
                laNotification = Notification.success({message: nbreExecuter+" Modification effectué.......", positionX: 'center'});
            }
        }
        function lanceNotif() {
            laNotification = Notification.info({message: "Veuillez patientez SVP.......", title: "traitement en cour", delay: null, positionX: 'center'});
        }
        function tuerNotif() {
            laNotification.then(function(notification) {
                notification.kill();
            });
        }
        
        $scope.SupprimerCode = function () {
            laNotification = Notification.info({message: "Veuillez patientez SVP.......", title: "traitement en cour", delay: null, positionX: 'center'});
            faire = "SUP";
            nbreExecuter = 0;
            lancer();
        };
        
        function impactChangement(index) {
            console.log("entrer dans impactChangement avec idex = "+index)
            $scope.collectionAffiche.splice(index,1);
        }
        
        function miseAjout() {
            var lapromise = orgUnitDelete.update({id: obj.id}, obj);
            lapromise.$promise.then(function (resultats) {
                console.log("resultat reussi");
                console.log(resultats);
                if (resultats.response.importCount) {
                    if(resultats.response.importCount.updated == 1){
                        console.log("entree dans updated REUSSI");
                        nbreExecuter++;
                        $rootScope.DerniereAjoutOuModifier.push(resultats.response.lastImported);
                        $scope.lesChecked.roles[comp] = obj;
                        $scope.collectionAffiche[mesIndex[comp]]=obj;
                    }
                }
                else {
                    console.log("connexion ok mais echec = " +resultats.importConflicts);

                }
                lancer();
            }, function (err) {
                console.log(err);
                console.log("echec dans resultat");
                console.log("resultat.status = " + err.status);
                lancer();
            });
        }
        
        function formatageValeurs(orgUnit) {
            var data = {};
            var openingDate = $filter('date')(orgUnit.openingDate, 'yyyy-MM-dd');
            data.openingDate = openingDate;
            data.name = orgUnit.name;
            data.shortName = orgUnit.shortName;
            data.code = orgUnit.code;
            console.log("contenu de data");
            console.log(data);
            return data;
        }
        
        $scope.sanCode = function (nivo) {
            var liste = [];
            if(nivo){
                if($rootScope.sansCode.length != 0){
                    for(var i = 0,j=$rootScope.sansCode.length;i<j;i++){
                        if($rootScope.sansCode[i].level == nivo){
                            liste.push($rootScope.sansCode[i]);
                        }
                    }
                }
                afficheur(liste);
            }else{
                afficheur($rootScope.sansCode);
            }
            
        }

        $scope.menuSanCode =function () {
            $scope.affiche = "code";
            $scope.sanCode();
        }

        $scope.menuCodeDoublon = function () {
            $scope.affiche = "double";
            doublon();
            afficheur(codeDouble);
        }

        $scope.menuEtablissement = function () {
            console.log("$scope.typeOrgUnit");
            console.log($scope.typeOrgUnit);
            console.log($rootScope.niveauOrgUnit);
            leNivo = 3;
            $scope.affiche = "orgunit";
            $scope.entete = $scope.typeOrgUnit[3].name;
        }
        
        $scope.menuDistict = function () {
            console.log("$scope.typeOrgUnit");
            console.log($scope.typeOrgUnit);
            console.log($rootScope.niveauOrgUnit);
            leNivo = 2;
            $scope.affiche = "orgunit";
            $scope.entete = $scope.typeOrgUnit[2].name;
            
        }

        $scope.menuRegion = function () {
            console.log("$scope.typeOrgUnit");
            console.log($scope.typeOrgUnit);
            console.log($rootScope.niveauOrgUnit);
            leNivo = 1;
            $scope.affiche = "orgunit";
            $scope.entete = $scope.typeOrgUnit[1].name;
        }

        $scope.unitOrg = function (long) {
            if(long){
                if(long=="all"){
                    afficheur($rootScope.OrgUnitGroup[leNivo].orgUnits);
                }else{
                    var liste = [];
                    for(var i =0,j=$rootScope.OrgUnitGroup[leNivo].orgUnits.length;i<j;i++){
                        console.log("le nivo ="+leNivo);
                        console.log($rootScope.OrgUnitGroup[leNivo].orgUnits);
                        if($rootScope.OrgUnitGroup[leNivo].orgUnits[i].code){
                            console.log("le nivo ="+$rootScope.OrgUnitGroup[leNivo].orgUnits[i].code);
                            if($rootScope.OrgUnitGroup[leNivo].orgUnits[i].code.length == long){
                                console.log("le nivo ="+$rootScope.OrgUnitGroup[leNivo].orgUnits[i].code);
                                liste.push($rootScope.OrgUnitGroup[leNivo].orgUnits[i]);
                            }
                        }
                        
                    }
                    //console.log("le nivo ="+leNivo);
                    //console.log($rootScope.OrgUnitGroup);
                    afficheur(liste);
                }
            }else{
                $scope.sanCode(leNivo+1);
            }
        }
        
        $scope.monAction = function (facility,indxx) {
            console.log("entrer dans nonActions");
            for(var i=0,j=$scope.lesChecked.roles.length;i<j;i++){
                if($scope.lesChecked.roles[i].id==facility.id)
                    break;
            }
            console.log("for exzcut");
            if(i==$scope.lesChecked.roles.length){
                $scope.lesChecked.roles.push(facility);
                mesIndex.push(indxx);
            }else{
                $scope.lesChecked.roles.splice(i,1);
                mesIndex.splice(i,1);
            }
            console.log("1er if ter");
            console.log($scope.lesChecked);
            if(facility.code){
                $scope.action1 = "Harmoniser code des";
            }else{
                if($scope.action1 != "Harmoniser code des"){
                    $scope.action1 = "Ajout code valide aux";
                }
            }
            console.log("2er if ter");
            if($scope.lesChecked.roles.length == $scope.collectionAffiche.length){
                $scope.chekTilte = true;
            }else{
                $scope.chekTilte = false;
            }
            console.log("3er if ter");
        }
        
        $scope.checking = function () {
            console.log("entrer dans checking");
            console.log("entre $scope.chekTilte = "+angular.copy($scope.chekTilte));
            console.log("entre $scope.chekAll = "+angular.copy($scope.chekAll));
            if($scope.chekTilte){
                $scope.chekTilte = false;
                if($scope.lesChecked.roles.length == $scope.collectionAffiche.length){
                    $scope.chekAll = false;
                    $scope.lesChecked.roles = [];
                    
                }else{
                    //$scope.chekAll = true;
                }
            }
            else{
                if($scope.lesChecked.roles.length != 0){
                    $scope.chekTilte = false;
                    $scope.chekAll = false;
                    $scope.value = true;
                    $scope.lesChecked.roles = [];
                }else{
                    $scope.chekTilte = true;
                    $scope.chekAll = true;
                    $scope.lesChecked.roles = angular.copy($scope.collectionAffiche);
                }
            }
            console.log("sortie $scope.chekTilte = "+angular.copy($scope.chekTilte));
            console.log("sorti $scope.chekAll = "+angular.copy($scope.chekAll));
            
        }

        function dernierEdit() {
            var liste = [], index = $rootScope.DerniereAjoutOuModifier.length;
            if(index != 0){
                for(var i=0,j=index;i<j;i++){
                    for(var a=0,b=$rootScope.allOrgUnit.length;a<b;a++){
                        if($rootScope.DerniereAjoutOuModifier[i] == $rootScope.allOrgUnit[a].id){
                            var temp = $rootScope.allOrgUnit[a];
                            temp.nomNiveau = $scope.typeOrgUnit[temp.level - 1].name;
                            liste.push(temp);
                        }
                    }
                }
            }
            afficheur(liste);
        }
        
        function maNiv() {
            if(obj.code.length == 1 ) {
                obj.code = "000" + obj.code;
                return;
            }
            if(obj.code.length == 2 ) {
                obj.code = "00" + obj.code;
                return;
            }
            if(obj.code.length == 3 ){
                obj.code = "0"+obj.code;
                return;
            }
            return "deja bon";
        }
        
        function afficheur(liste) {
            console.log("entrer dans afficheur")
            $scope.collectionAffiche = liste;
            console.log($scope.collectionAffiche);
        }
        
        function actionCode() {
            if(!$scope.facility.code){
                $scope.geneCode = true;
            }else{
                console.log("filterInt($scope.facility.code)"+filterInt($scope.facility.code));
                if(!isNaN(filterInt($scope.facility.code))){
                    var nbre = parseInt($scope.facility.code);
                    console.log("$scope.facility.code.length = "+$scope.facility.code.length);
                    if(nbre < 1000){
                        $scope.confCode = true;
                    }
                    if(nbre > 9999){
                        $scope.geneCode = true;
                        $scope.SuppCode = true;
                    }
                }else{
                    $scope.geneCode = true;
                    $scope.SuppCode = true;
                }
            }

        }

        filterInt = function (value) {
            if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
                return Number(value);
            return NaN;
        };
        
        $scope.hierarchie = function () {
            $scope.affiche = "orghierachie";
            $scope.orgunitsList = [];
            console.log("$rootScope.arbre = ",$rootScope.arbre);
            var element = {},entete={};
            element[$rootScope.arbre[0].data.level] = {};
            console.log("element = ",element);
            if($rootScope.arbre[0].data.name)
                element[$rootScope.arbre[0].data.level].name = $rootScope.arbre[0].data.name;
            if($rootScope.arbre[0].data.code)
                element[$rootScope.arbre[0].data.level].code = $rootScope.arbre[0].data.code;
            if($rootScope.arbre[0].children && $rootScope.arbre[0].children.length != 0){
                addChildren(element, $rootScope.arbre[0].children);
            }else{
                $scope.orgunitsList.push(angular.copy(element));
            }
            console.log("$scope.orgunitsList = ",$scope.orgunitsList);
            console.log("$rootScope.niveauOrgUnit = ",$rootScope.niveauOrgUnit);
        };

        function addChildren(elements, children) {
            console.log("entrer dans addChildren");
            for(var i=0,j=children.length;i<j;i++){
                elements[children[i].data.level] = {};
                if(children[i].data.name)
                    elements[children[i].data.level].name = children[i].data.name;
                if(children[i].data.code)
                    elements[children[i].data.level].code = children[i].data.code;
                if(children[i].children && children[i].children.length != 0){
                    addChildren(elements, children[i].children);
                }else{
                    $scope.orgunitsList.push(angular.copy(elements));
                }
            }
        }

    }]);
