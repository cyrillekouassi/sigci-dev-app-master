sigcidev.controller('FacilityCompletudeCtrl', ['$scope', 'DataSetResource','dataElementsResource','categoryOptionCombosResource','validationRules','Notification',
    function ($scope, DataSetResource,dataElementsResource,categoryOptionCombosResource,validationRules,Notification) {
        var allDataSet = [], allDataElement = [], allCatOptCombo = [], allRules = [], compile=[], lesDoublons=[],deletecollection =[];
        var nbre = 0, nbreRules= 0, compte=-1; var laNotification;
        getDataSet();
        $scope.info = "";
        $scope.attente = true;
        $scope.load = true;
        $scope.afficheResultat = [];
        $scope.collecteDataSets = [];
        $scope.datasetSelected = "";
        $scope.showAll = false;
        
        function getDataSet() {
            console.log("entrer dans getDataSet");
            $scope.info = "Chargement des dataSets";
            DataSetResource.query({
                paging: false,
                fields: 'id,name'
            }, function (resultat) {
                console.log(resultat);
                allDataSet = resultat.dataSets;
                $scope.collecteDataSets = allDataSet;
                getDataElements()
            }, function (err) {
                console.err("Erreur de chargement de tous les DataSets");
            });
        }

        function getDataElements() {
            console.log("entrer dans getDataElements");
            $scope.info = "Chargement des dataElements";
            dataElementsResource.query({
                paging: false,
                fields: 'id,name,dataSetElements[dataSet]'
            }, function (resultat) {
                console.log(resultat);
                allDataElement = resultat.dataElements
                getCatOptCombo();
            }, function (err) {
                console.err("Erreur de chargement de tous les DataElements");
            });
        }

        function getCatOptCombo() {
            console.log("entrer dans getCatOptCombo");
            $scope.info = "Chargement des categorie  options combo";
            categoryOptionCombosResource.query({
                paging: false,
                fields: 'id,name'
            }, function (resultat) {
                console.log(resultat);
                allCatOptCombo = resultat.categoryOptionCombos
                getValidatioRules();
            }, function (err) {
                console.err("Erreur de chargement de tous les categoryOptionCombos");
            });
        }

        function getValidatioRules() {
            console.log("entrer dans getValidatioRules");
            $scope.info = "Chargement des règles de validations";
            validationRules.query({
                paging: false,
                fields: 'id,name,description,operator,leftSide,rightSide'
            }, function (resultat) {
                console.log(resultat);
                allRules = resultat.validationRules;
                recupRules();
            }, function (err) {
                console.err("Erreur de chargement de tous les validationRules");
            });
        }

        function recupRules() {
            console.log("entrer dans recupRules");
            $scope.info = "Traitement en cours...";
            for(var i = 0, j = allRules.length; i < j; i++){
                console.log("allRules[",i,"] = ",allRules[i]);
                var tmp = {}, resultat= {};
                var dataset = [];
                tmp.id = allRules[i].id;
                tmp.name = allRules[i].name;
                tmp.operator = getOperator(allRules[i].operator);

                console.log("gauche.expression");
                tmp.gauche = {};
                tmp.gauche.expression = allRules[i].leftSide.expression;
                resultat = getExpresValue(allRules[i].leftSide.expression);
                tmp.gauche.value = resultat.expression;
                dataset = setUnique(resultat.tbSet, dataset);

                console.log("droit.expression");
                tmp.droit = {};
                tmp.droit.expression = allRules[i].rightSide.expression;
                resultat = getExpresValue(allRules[i].rightSide.expression);
                tmp.droit.value = resultat.expression;
                dataset = setUnique(resultat.tbSet, dataset);
                compilation(tmp,dataset);
            }
            
            console.log("fin compilation/// compile = ",compile);
            $scope.info = "Chargement terminée";
            //sortie();
            loadout(true);
            //afficheAllRules();
        }

        function getOperator(op) {
            console.log("enter dans getOperator");
            if(op == "equal_to"){
                return "="
            }
            if(op == "not_equal_to"){
                return "!="
            }
            if(op == "greater_than"){
                return ">"
            }
            if(op == "greater_than_or_equal_to"){
                return ">="
            }
            if(op == "less_than"){
                return "<"
            }
            if(op == "less_than_or_equal_to"){
                return "<="
            }
            if(op == "compulsory_pair"){
                return "paire obligatoire"
            }
            if(op == "exclusive_pair"){
                return "paire exclu"
            }
        }
        
        function getExpresValue(val) {
            console.log("enter dans getExpresValue");
            console.log("val = ",val);
            var tbExp = [], expres = {},valeur;
            var expLong = 0, debut=0; expres.expression = ""; expres.tbSet = [];
            //console.log("expression = " + val);
            if(!val){ return expres}
            valeur = val;
            expLong = val.length;
            //console.log("expLong = "+expLong);
            
            //if(typeof val == 'undefined'){ return expres}
            while (debut < expLong){
                if(val[debut] != "#"){
                    var tr = "";
                    tr = " "+val[debut]+" ";
                    tbExp.push(tr);
                }else{
                    var tmp = "", point = 0,fpoint=0, element = "", resultat = {};
                    point = val.indexOf(".",debut+2);
                    fpoint = val.indexOf("}",debut+2);
                    //console.log("point = "+point+" ; fpoint = "+fpoint);
                    if(fpoint < point || point == -1){
                        element = val.substring(debut+2,fpoint);
                        console.log("element = ",element);
                        resultat = leDataElement(element);
                        console.log("resultat = ",resultat);
                        //console.log("fpoint < point ==> dataElement = ",element," resultat = ",resultat);
                        tmp = resultat.name;
                    }else{
                        element = val.substring(debut+2,point);
                        resultat = leDataElement(element);
                        //console.log("else (fpoint < point) dataElement = ",element," resultat = ",resultat);
                        tmp = resultat.name;
                        expres.tbSet = setUnique(resultat.tb, expres.tbSet);
                        fpoint = val.indexOf("}",point);
                        element = val.substring(point+1,fpoint);
                        //console.log("catOptCombo = ",element);
                        tmp = tmp +", "+ leCatOptCombo(element);
                    }
                    debut = fpoint;
                    tbExp.push(tmp);
                }
                debut ++;
            }

            for(var i =0, j= tbExp.length;i<j;i++){
                expres.expression = expres.expression + tbExp[i];
            }

            return expres;
        }

        function leDataElement(id) {
            //console.log("enter dans leDataElement");
            for(var i = 0,j=allDataElement.length;i<j;i++){
                if(id == allDataElement[i].id){
                    //console.log("id = ",id,"allDataElement[",i,"] ;",allDataElement[i]);
                    var temp = {};
                    temp.tb = [];
                    temp.name = allDataElement[i].name;
                    for(var l=0,k= allDataElement[i].dataSetElements.length;l<k;l++){
                        temp.tb.push(allDataElement[i].dataSetElements[l].dataSet.id);
                    }
                    if(temp.tb.length>1){
                        var nb = temp.tb.length;
                        nb--;
                        nbreRules = nbreRules+nb;
                    }
                    return temp;
                }
            }
        }

        function setUnique(tb, tbSet) {
            //console.log("enter dans setUnique");
            for(var i=0,j=tb.length;i<j;i++){
                if(tbSet.indexOf(tb[i]) == -1){
                    tbSet.push(tb[i]);
                }
            }
            return tbSet;
        }

        function leCatOptCombo(id) {
            //console.log("enter dans leCatOptCombo");
            for(var i = 0,j=allCatOptCombo.length;i<j;i++){
                if(id == allCatOptCombo[i].id){
                    return allCatOptCombo[i].name;
                }
            }
        }

        function compilation(rules,dataset) {
            console.log("enter dans compilation");
            var double=[];
            for(var k=0,l=dataset.length;k<l;k++){
                var trouv = false;
                for(var i = 0, j= compile.length; i<j; i++){
                    if(dataset[k] == compile[i].id){
                        trouv = true;
                        var rule = angular.copy(rules);
                        if(dataset.length > 1){
                            rule.doublon = deleteDataSetCourant(dataset[k],dataset);
                            /*var tm = {};
                            tm.id = compile[i].id;
                            tm.no = i;
                            tm.name = compile[i].name;
                            double.push(tm);*/
                        }

                        compile[i].rules.push(rule);
                        break;
                    }
                }

                if(!trouv){
                    var rule = angular.copy(rules);
                    var tmp = {};
                    tmp = leDataSet(dataset[k]);
                    tmp.rules = [];
                    var rule = angular.copy(rules);
                    if(dataset.length > 1) {
                        rule.doublon = deleteDataSetCourant(dataset[k],dataset);
                        /*var tm = {};
                        tm.id = tmp.id;
                        tm.no = compile.length - 1;
                        tm.name = tmp.name;
                        double.push(tm);*/
                    }
                    tmp.rules.push(rule);
                    compile.push(tmp);
                }

            }

            /*for(var a=0,b=double.length; a<b;a++){

                var tb=[];
                for(var k=0,l=double.length;k<l;k++){
                    if(compile[double[a].no].id != double[k].id){
                        var ts={};
                        ts.name = double[k].name;
                        tb.push(ts);
                    }
                }
                compile[double[a].no].doublon = [];
                compile[double[a].no].doublon = tb;
            }
            console.log("double",double);*/
        }

        function deleteDataSetCourant(id,dataset) {
            var tb=[];
            for(var a=0,b=dataset.length; a<b;a++){
                if(id != dataset[a]){
                    var ts={};
                    ts = leDataSet(dataset[a]);
                    tb.push(ts);
                }
            }
            return tb;
                /*var tb=[];
                for(var k=0,l=double.length;k<l;k++){
                    if(compile[double[a].no].id != double[k].id){
                        var ts={};
                        ts.name = double[k].name;
                        tb.push(ts);
                    }
                }
                compile[double[a].no].doublon = [];
                compile[double[a].no].doublon = tb;*/

        }
        
        function leDataSet(id) {
            //console.log("enter dans leDataSet");
            for(var i=0,j=allDataSet.length;i<j;i++){
                if(id == allDataSet[i].id){
                    return allDataSet[i];
                }
            }
        }
        
        $scope.afficheAllRules = function () {
            console.log("entrer dans afficheAllRules");
            $scope.dataSet ="";
            for(var i=0,j=compile.length;i<j;i++){
                var tmp = {};
                nbre = nbre + compile[i].rules.length;
                tmp.fusion = compile[i].rules.length*3;
                tmp.setId = compile[i].id;
                tmp.setName = compile[i].name;
                //console.log("compile[i] = ",compile[i]);
                //console.log("compile[i].rules[0] = ",compile[i].rules[0]);
                tmp.rulesName = compile[i].rules[0].name;
                tmp.rulesId = compile[i].rules[0].id;
                tmp.rulesGauche = {};
                tmp.rulesGauche = compile[i].rules[0].gauche;
                $scope.afficheResultat.push(tmp);
                var tmp = {};
                tmp.operator = compile[i].rules[0].operator;
                $scope.afficheResultat.push(tmp);
                var tmp = {};
                tmp.rulesDroit = {};
                tmp.rulesDroit = compile[i].rules[0].droit;
                $scope.afficheResultat.push(tmp);
                addLine(compile[i].rules);
            }
            showAllOut(true);
        }
        
        function addLine(rules) {
            
            for(var i=1,j=rules.length;i<j;i++){
                console.log("rules = ",rules[i]);
                var tmp = {};
                tmp.rulesName = rules[i].name;
                tmp.rulesId = rules[i].id;
                tmp.rulesGauche = {};
                tmp.rulesGauche = rules[i].gauche;
                $scope.afficheResultat.push(tmp);
                var tmp = {};
                tmp.operator = rules[i].operator;
                $scope.afficheResultat.push(tmp);
                var tmp = {};
                tmp.rulesDroit = {};
                tmp.rulesDroit = rules[i].droit;
                $scope.afficheResultat.push(tmp);
            }
        }
        
        $scope.chargeDataSet = function (dset) {
            console.log("entrer dans $scope.chargeDataSet");
            console.log("dset = "+dset);
            var ledatset = leDataSet(dset);
            $scope.datasetSelected = ledatset.name;
            eachDatasetRules(dset);
        };
        
        function eachDatasetRules(dataset) {
            console.log("entrer dans eachDatasetRules");
            var trouv = false;
            var lesRules = [];
            for(var i=0,j=compile.length;i<j;i++){
                if(compile[i].id == dataset && compile[i].rules && compile[i].rules.length != 0){
                    trouv = true;
                    
                    lesRules = compile[i].rules;
                    console.log("lesRules ",lesRules);
                }
            }
            if(trouv){
                afficheRule(lesRules);
            }else{
                noRules();
            }
        }
        
        function afficheRule(lesRules) {
            console.log("entrer dans afficheRule");
            $scope.rulesAffiche = [];
            for(var i=0,j=lesRules.length;i<j;i++){
                var tmp = {};
                tmp.ruleName = lesRules[i].name;
                tmp.ruleId = lesRules[i].id;
                tmp.rulesGauche = {};
                tmp.rulesGauche = lesRules[i].gauche;
                if(lesRules[i].doublon){
                    tmp.doublon = lesRules[i].doublon;
                }
                $scope.rulesAffiche.push(tmp);
                var tmp = {};
                tmp.operator = lesRules[i].operator;
                $scope.rulesAffiche.push(tmp);
                var tmp = {};
                tmp.rulesDroit = {};
                tmp.rulesDroit = lesRules[i].droit;
                $scope.rulesAffiche.push(tmp);
            }
            console.log("$scope.rulesAffiche ",$scope.rulesAffiche);
            showAllOut(false);
        }
        
        $scope.deleteRule = function (ruleId) {
            console.log("entrer dans deleteRule");
            console.log("ruleId = "+ruleId);
            preparedeleting("ONE",ruleId);
        };
        
        
        function deleting() {
            console.log("entrer dans deleting");
                validationRules.delete({id: deletecollection[compte]}, function (data) {
                    console.log("resultat de suppession");
                    console.log(data);
                    deletelocal(deletecollection[compte]);
                    gestionDelete();
                }, function (err) {
                    console.error("echec de suppresion");
                    console.log(err);
                    if(err.status == 404){
                        deletelocal(deletecollection[compte]);
                    }
                    gestionDelete();
                    //Notification.error({title:"Echec suppression!", message: ''+data.data.message});
                });

        }

        $scope.deleteAllRules = function (dataset) {
            console.log("entrer dans deleteAllRules");
            console.log("dataset = ",dataset);
            preparedeleting("ALL");
        };

        function gestionDelete() {
            console.log("Entrer dans gestionDelete");
            $scope.info = "Suppression de "+(compte+1)+" / "+deletecollection.length;
            compte++;
            if(compte<deletecollection.length){
                deleting();
            }else{
                tuerNotif();
                Notification.success({message:"Suppression Effectué!", positionX: 'center'});
                findeleting();
            }
        }

        function preparedeleting(quantite,id) {
            if (confirm("Attention voulez-vous Supprimer?")) {
                console.log("Entrer dans preparedeleting");
                lanceNotif();
                $scope.attente = true;
                loadout(false);
                deletecollection =[];
                compte=-1;
                if(quantite == "ALL"){
                    console.log("deleting ALL");
                    var lesRules = [];
                    for(var i=0,j=compile.length;i<j;i++){
                        if(compile[i].id == $scope.dataSet){
                            lesRules = compile[i].rules;
                            console.log("lesRules ",lesRules);
                        }
                    }
                    for(var i=0,j=lesRules.length;i<j;i++){
                        deletecollection.push(lesRules[i].id);
                    }
                }
                if(quantite == "ONE"){
                    console.log("deleting ONE");
                    deletecollection.push(id);
                }
                gestionDelete();
            }
        }

        function deletelocal(id) {
            console.log("entrer dans deletelocal");
            console.log("id = ",id);
            for(var i=0,j=compile.length;i<j;i++){
                if(compile[i].id == $scope.dataSet){
                    /*console.log("compile[i].id == $scope.dataSet");
                    console.log("compile[",i,"]", compile[i]);
                    console.log("compile[",i,"].rules", compile[i].rules);
                    console.log("compile[",i,"].rules.length", compile[i].rules.length);*/
                    
                    for(var a=0,b=compile[i].rules.length;a<b;a++){
                        console.log("i = ",i," ; a = ",a," ; compile[i].rules[a]",compile[i].rules[a]);
                        if(id == compile[i].rules[a].id ){
                            console.log("id == compile[i].rules[a].id ");
                            compile[i].rules.splice(a, 1);
                            /*var temps=[];
                            temps = angular.copy(compile[i].rules);
                            compile[i].rules = [];
                            compile[i].rules = temps.splice(a, 1);*/

                            //delete compile[i].rules[a];
                            break;
                        }
                    }
                    /*console.log("compile[",i,"].rules.length", compile[i].rules.length);
                    console.log("compile[",i,"].rules", compile[i].rules);
                    console.log("compile[",i,"]", compile[i]);*/
                    //if (typeof compile[i].rules[0] == 'undefined' && compile[i].rules[0] == null) {
                    if(compile[i].rules.length == 0){
                        console.error("supprimer le tableau");
                        console.log("compile[i].rules = ",angular.copy(compile[i].rules));
                        //delete compile[i].rules;
                    }
                    return;
                }
            }
        }
        function findeleting() {
            console.log("Entrer dans findeleting");
            loadout(true);
            eachDatasetRules($scope.dataSet);
        }

        
        function lanceNotif() {
            laNotification = Notification.info({message: "Veuillez patientez SVP.......", title: "traitement en cour", delay: null, positionX: 'center'});
        }
        function tuerNotif() {
            laNotification.then(function(notification) {
                notification.kill();
            });
        }
        
        function noRules() {
            $scope.attente = true;
            $scope.info = "Pas de règles de validations associées à ce formulaire";
        }
        
        function loadout(etat) {
            if(etat){
                $scope.load = false;
            }else{
                $scope.load = true;
            }

        }
        function sortie() {
            /*console.log("$scope.afficheResultat ",$scope.afficheResultat);
             console.log("nbre = ", nbre ," // allRules = ",allRules.length," nbreRules = ",nbreRules);*/
            $scope.attente = false;
        }

        function showAllOut(etat) {
            sortie();
            if(etat){
                $scope.showAll = true;
            }else{
                $scope.showAll = false;
            }
        }
    }
]);