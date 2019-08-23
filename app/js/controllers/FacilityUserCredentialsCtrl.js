sigcidev.controller('FacilityUserCredentialsCtrl', ['$scope', '$rootScope','meResource','usersResource',
    function ($scope, $rootScope,meResource,usersResource) {
        var accesUser = {}, userID = "";
        
        $scope.addCredentials = function () {
            console.log("entrer dans $scope.addCredentials");
            getMe();
        };
        
        function getMe() {
            meResource.query(null,function (resultat) {
                console.log("resultat = ",angular.copy(resultat));
                getUserCredentials(resultat);
            },function (err) {
                console.error("err = ",err);
            })
        }

        function getUserCredentials(acces) {
            userID = angular.copy(acces.id);
            //acces.userCredentials.code = "admin";
           // delete acces.id;
            accesUser = acces;
        }
        
        function updateUser(id, acces) {
            usersResource.update({id: id}, acces).$promise.then(reussit, echec);
            
            function reussit(resultat) {
                console.log("succes update");
                console.log("resultat = ",resultat);
            }

            function echec(err) {
                console.log("echec update");
                console.log("err = ",err);
            }
        }
        
        $scope.updateCredentials = function () {
            console.log("entrer dans dans $scope.updateCredentials");
            accesUser.userCredentials.code = "admin";
            //accesUser.userCredentials.code = "cyrille";
            console.log("accesUser = ",accesUser);
            updateUser(userID, accesUser);
        }
        
    }
]);