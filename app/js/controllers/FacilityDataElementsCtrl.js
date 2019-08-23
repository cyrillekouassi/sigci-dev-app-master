sigcidev.controller('FacilityDataElementsCtrl', ['$scope', '$rootScope','dataElementsResource','usersResource','dataElementsResourceJson','sharingResource','Notification', function ($scope,$rootScope,dataElementsResource,usersResource,dataElementsResourceJson,sharingResource,Notification) {

    var partage = {};
    $scope.lesId = [];
    var i = 0,j;
    var quantite;
    var letype;
    var laNotification;
    var OnNotification;
    $scope.AfficheTbDataElement=true;
    $scope.AffichetElementChercher=false;
    $scope.tbDataElement = [];
    $scope.elementChercher = {};
    $scope.AllCheckDataElements = {roles: []};
    $scope.toutDesactive = false;
    $scope.toutDesactiveAllCheck = false;
    refreshDataElement();
    //refreshSharing();
    
    function refreshDataElement() {
        i = 0;
        $scope.toutDesactive = true;
        $scope.toutDesactiveAllCheck = true;
        laNotification = Notification.info({message: "Veuillez patientez SVP.......",title:"Chargement en cour", delay: null , positionX: 'center'});
        dataElementsResource.query({
            paging: false,
            fields: 'id'
            //fields: 'id,name,shortName,publicAccess,user,aggregationType,domainType,valueType'
        },function (data) {
            console.log(data);
            $scope.lesId = data.dataElements;
            console.log($scope.lesId);
            j = $scope.lesId.length;
            refreshSharing();
            //nomUser();
        });
    }

    function refreshSharing() {
        console.log("entre dans refreshSharing");
        executer()
        function executer() {
            console.log("la valeur de i = "+i+". la valeur de j = "+j);
            var lapromise = sharingResource.query({type: 'dataElement', id: $scope.lesId[i].id /*id: 'fbfJHSPpUQD'*/});
            lapromise.$promise.then(function (data) {
                console.log(data);
                /*console.log(lapromise);
                 console.log(lapromise.meta);
                 console.log(lapromise.object);*/
                partage = data;
                $scope.tbDataElement.push(partage);
                console.log($scope.tbDataElement);
                i++;
                if(i<j){
                    executer();
                }else{
                    $scope.toutDesactive = false;
                    $scope.toutDesactiveAllCheck = false;
                    laNotification.then(function(notification) {
                        notification.kill();
                    });
                    Notification.success({message:"Chargement terminé!!!!....", delay: 3000 , positionX: 'center'});
                }
                //console.log(partage);
                /*partage.meta = {};
                 partage.object = {};
                 partage.object.user = {};
                 partage.object = lapromise.object;
                 partage.meta = lapromise.meta;*
                 /*partage.meta.allowExternalAccess = lapromise.meta.allowExternalAccess;
                 partage.meta.allowPublicAccess = lapromise.meta.allowPublicAccess;*/
                /*partage.object = lapromise.object;
                 console.log(partage);
                 console.log(partage.object);
                 console.log(partage.object.name);
                 partage.object.name = "test1";
                 console.log(partage.object.name);
                 console.log(partage);*
                 /*partage.object.name = lapromise.object.name;
                 partage.object.externalAccess = lapromise.object.externalAccess;
                 partage.object.id = lapromise.object.id;
                 //partage.object.publicAccess = lapromise.object.publicAccess;
                 partage.object.publicAccess = "r-------";
                 partage.object.user.id = lapromise.object.user.id;
                 partage.object.user.name = lapromise.object.user.name;*
                 /*tpm.object = {};
                 tmp.object.name = partage.object.name;
                 console.log(tpm);*
                 /*var tempsH,tempsB,tp = {};
                 tp = data;
                 console.log("tp");
                 console.log(tp);
                 tempsH.meta = data.meta;
                 tempsB.object = data.object;
                 console.log("tempsH.meta");*
                 /*console.log(tempsH.meta);
                 console.log("tempsB.object");
                 console.log(tempsB.object);partage.meta.allowExternalAccess = tempsH.meta.allowExternalAccess;
                 partage.meta.allowPublicAccess = tempsH.meta.allowPublicAccess;*
                 /*partage.object.name = data.name;
                 partage.object.externalAccess = data.externalAccess;
                 //partage.object.publicAccess = "r-------";
                 partage.object.id = data.id;
                 partage.object.publicAccess = data.publicAccess;
                 partage.object.user = data.user;
                 console.log("contenu de partage");
                 console.log(partage);
                 nomUser();*/
            },function (err) {
                console.log(err);
                i++;
                if(i<j){
                    executer();
                }else{
                    $scope.toutDesactive = false;
                    $scope.toutDesactiveAllCheck = false;
                    laNotification.then(function(notification) {
                        notification.kill();
                    });
                    Notification.success({message:"Chargement terminé!!!!....", delay: 3000 , positionX: 'center'});
                }
            });
        }

    }
    
/*
    function nomUser() {
        console.log("la valeur de i = "+i+". la valeur de j = "+j);

        if(i<j){
            if($scope.tbDataElement[i].user.id) {
                /*var lapromise = usersResource.query({
                 id: $scope.tbDataElement[i].user.id,
                 fields: 'name'
                 });
                 lapromise.$promise.then(function (resultat) {
                 console.log(resultat);
                 },function (err) {
                 console.log(err);
                 });*
                if (verifierNom($scope.tbDataElement[i].user.id) == "NO") {
                    usersResource.query({
                        id: $scope.tbDataElement[i].user.id,
                        fields: 'name'
                    }, function (data) {
                        console.log("nom de user");
                        console.log(data);
                        $scope.tbDataElement[i].user.name = data.name;
                        lesUser.push($scope.tbDataElement[i].user);
                        console.log($scope.tbDataElement);
                        i++;
                        nomUser();
                    }, function (err) {
                        console.log("erreur nom");
                        console.log(err);
                        i++;
                        nomUser();
                    });
                }else{
                    i++;
                    nomUser();
                }
            }
            
        }        
    }

    function verifierNom(idUser) {
        for(var l = 0, k = lesUser.length; l<k;l++){
            if(lesUser[l].id = idUser){
                $scope.tbDataElement[i].user.name = lesUser[l].name;
                return "OK";
            }
        }
        return "NO";
    }
 */
    
    $scope.accesRW = function (facility) {
        /*
        console.log("entrer dans accesRW");
        /*console.log(facility);
        facility.publicAccess = "rw------";
        var lacces = {};
        lacces.aggregationType = facility.aggregationType;
        lacces.domainType = facility.domainType;
        lacces.valueType = facility.valueType;
        lacces.name = facility.name;
        lacces.shortName = facility.shortName;
        //lacces.publicAccess = 'rw------';
        lacces.publicAccess = 'r-------';
        console.log(lacces);
        var lapromise = dataElementsResourceJson.update({id: facility.id}, lacces);
        lapromise.$promise.then(function (data) {
            console.log(data);
            refreshDataElement();
        },function (err) {
            console.log(err);
        });*/
       /* var tes = {
            "meta": {
                "allowPublicAccess": true,
                "allowExternalAccess": false
            },
            "object": {
                "id": "fClA2Erf6IO",
                "name": "ANC 1st visit",
                "publicAccess": "r-------",
                "externalAccess": false,
                "user": {
                    "id": "GOLswS44mh8",
                    "name": "Tom Wakiki"
                }
            }
        };*/
        quantite = "UN";
        $scope.toutDesactive = true;
        $scope.toutDesactiveAllCheck = true;
        var entete = {
            "meta": {
                "allowPublicAccess": true,
                "allowExternalAccess": false
            }
        };
        facility.meta = entete.meta;
        facility.object.publicAccess = 'rw------';
        console.log("facility.object.id = "+facility.object.id)
        miseAjours(facility);
    }

    $scope.removeAccess = function (facility) {
        console.log("entrer dans removeAcces");
        $scope.toutDesactive = true;
        $scope.toutDesactiveAllCheck = true;
        quantite = "UN";
        var entete = {
            "meta": {
                "allowPublicAccess": true,
                "allowExternalAccess": false
            }
        };
        facility.meta = entete.meta;
        facility.object.publicAccess = '--------';
        console.log("facility.object.id = "+facility.object.id)
        miseAjours(facility);
    }

    $scope.allAccess = function () {
        console.log("entré dans allAccess");
        console.log("$scope.AllCheckDataElements.roles.length= "+$scope.AllCheckDataElements.roles.length+" $scope.tbDataElement.length= "+$scope.tbDataElement.length);
        if($scope.AllCheckDataElements.roles.length >0) {
            letype = 'rw------';
            laNotification = Notification.info({
                message: "Veuillez patientez SVP.......",
                title: "Modifcation en cour",
                delay: null,
                positionX: 'center'
            });
            gestionDesMAJ();
        }
    }

    $scope.noAccess = function () {
        console.log("entré dans noAccess");
        console.log("$scope.AllCheckDataElements.roles.length= "+$scope.AllCheckDataElements.roles.length+" $scope.tbDataElement.length= "+$scope.tbDataElement.length);
        if($scope.AllCheckDataElements.roles.length >0) {
            letype = '--------';
            laNotification = Notification.info({
                message: "Veuillez patientez SVP.......",
                title: "Modifcation en cour",
                delay: null,
                positionX: 'center'
            });
            gestionDesMAJ();
        }
    }
    
    function gestionDesMAJ() {
        if($scope.AllCheckDataElements.roles.length >0){
            $scope.toutDesactive = true;
            $scope.toutDesactiveAllCheck = true;
            if($scope.AllCheckDataElements.roles.length >1) {
                quantite = "PLUS";
            }
            else
                quantite = "FIN";
            var entete = {
                "meta": {
                    "allowPublicAccess": true,
                    "allowExternalAccess": false
                }
            };
            $scope.AllCheckDataElements.roles[0].meta = entete.meta;
            $scope.AllCheckDataElements.roles[0].object.publicAccess = letype;
            console.log("$scope.AllCheckDataElements.roles[0]");
            console.log($scope.AllCheckDataElements.roles[0]);
            miseAjours($scope.AllCheckDataElements.roles[0]);
        }
    }

    function miseAjours(element) {
        var lapromise = sharingResource.update({
            type: 'dataElement',
            id: element.object.id
        },element);
        lapromise.$promise.then(function (data) {
            console.log("resultat de sharing bon");
            console.log(data);
            if(quantite == "PLUS") {
                $scope.AllCheckDataElements.roles.shift();
                gestionDesMAJ();
            }else if(quantite == "FIN") {
                $scope.AllCheckDataElements.roles.shift();
                notif();
            }else if(quantite == "UN"){
                notif();
            }
        },function (err) {
            console.log("resultat de sharing mauvais");
            console.log(err);
            if(quantite == "PLUS") {
                $scope.AllCheckDataElements.roles.shift();
                gestionDesMAJ();
            }else if(quantite == "FIN") {
                $scope.AllCheckDataElements.roles.shift();
                notif();
            }else if(quantite == "UN"){
                notif();
            }
        });
    }
    $scope.checkAllDataElements = function () {tousCheckbox
        if(document.getElementById("checkboxDataElement").checked == true) {
            //$scope.AllCheckDataElements.roles = angular.copy($scope.tbDataElement);
            checkboxes = document.getElementsByName('tousCheckbox');
            for(var i=0, n=checkboxes.length;i<n;i++) {
                checkboxes[i].checked = source.checked;
            }
        }else
            $scope.AllCheckDataElements.roles = [];
    }
    function toggle(source) {
        checkboxes = document.getElementsByName('foo');
        for(var i=0, n=checkboxes.length;i<n;i++) {
            checkboxes[i].checked = source.checked;
        }
    }

    function notif() {
        $scope.toutDesactive = false;
        $scope.toutDesactiveAllCheck = false;
        laNotification.then(function(notification) {
            notification.kill();
        });
        Notification.success({message:"Mise à jour terminé!!!!....", delay: 3000 , positionX: 'center'});
        refreshDataElement();
    }

    $scope.desactiveCocheOrder = function () {
        console.log("changement dans desactiveCocheOrder");
        if($scope.ordre == ""){
            $scope.toutDesactiveAllCheck = false;
            
        }else{
            $scope.toutDesactiveAllCheck = true;
        }
            
    }
    $scope.desactiveCocheAccess = function () {
        console.log("changement dans desactiveCocheAccess");
        if($scope.typesAccess == ""){
            
            $scope.toutDesactiveAllCheck = false;
        }
        else{
            $scope.toutDesactiveAllCheck = true;
        }
            
    }
    $scope.searching = function () {
        if($scope.Search){
            $scope.AfficheTbDataElement=false;
            $scope.AffichetElementChercher=true;
            laNotification.then(function(notification) {
                notification.kill();
            });
            OnNotification = Notification.info({message: "Veuillez patientez SVP.......",title:"Chargement en cour", delay: null , positionX: 'center'});
            var lapromise = sharingResource.query({type: 'dataElement', id: $scope.lesId[i].id /*id: 'fbfJHSPpUQD'*/});
            lapromise.$promise.then(function (data) {
                console.log(data);
                partage = data;
                $scope.elementChercher = partage;
                console.log($scope.elementChercher);
                $scope.toutDesactive = false;
                $scope.toutDesactiveAllCheck = false;
                laNotification.then(function(notification) {
                    notification.kill();
                });
                Notification.success({message:"Chargement terminé!!!!....", delay: 3000 , positionX: 'center'});

            },function (err) {
                console.log(err);
                $scope.toutDesactive = false;
                $scope.toutDesactiveAllCheck = false;
                OnNotification.then(function(notification) {
                    notification.kill();
                });
                Notification.success({message:"Chargement terminé!!!!....", delay: 3000 , positionX: 'center'});

            });
        }
    }

    $scope.voirListe = function () {
        $scope.AfficheTbDataElement=true;
        $scope.AffichetElementChercher=false;
        OnNotification.then(function(notification) {
            notification.kill();
        });
        if(i<j){
            laNotification = Notification.info({message: "Veuillez patientez SVP.......",title:"Chargement en cour", delay: null , positionX: 'center'});
        }
    }
}]);