//Konstanten für die REST-API
REST_API_DOMAIN = "http://it14.tech:8271";
REST_API_BASEPATH = "/swe/api/";
REST_API_VOTEPATH = "result/rate?"
REST_API_RESULTPATH = "result/get?";
REST_API_RESULTPATHSAMPLE = "sample/get?type=result&";
REST_API_REQUESTSIZE = 5;
REST_API_STATUS_RUNNING = "RUNNING";

//Konstanten für das Frontend-Verhalten
SEARCH_INPUT_TIMEOUT = 1500; //Zeit in Millisekunden, nach keiner weiteren Eingabe im Input Feld, nachdem der Request ausgeführt wird
SCROLL_UPDATE_HEIGHT = 200; //Abstand zum unteren Ende der Website ab dem neue Elemente geladen werden

//Konstanten für die Cookies
COOKIE_APITYPE = "FRONTENDSETTINGS_api"
COOKIE_LASTSEARCHES = "FRONTENDSETTINGS_lastSearch"

//Konstanten für die Struktur der Ergebnisse für die Assertions weiter unten im Code
RESULT_STRUCUTURE = ["userInput", "similarity", "judgement", "id", "userRating"];
JUDGEMENT_STRUCUTRE = ["fileReference", "sentence", "offence", "pdfLink",
  "pdfFileName", "keywords", "comittee", "lawSector", "date", "pageRank",
  "timestamp", "keywordsAsList"];

/*
  Erstellt die URL für den HTTP-Request der Ergebnissuche
  @param numerOfResults Anzahl der Ergebnisse, die die Suche zurückliefern soll
  @param searchTerm Die Eingabe des Benutzers
  @param startIndex Die Anzahl von Ergebnissen die übersprungen werden sollen (also weitere Ergebnisse)
  @return httpRequest Die generierte URL zu den angebenen Parametern
*/
function generateSearchURI(numberOfResults, searchTerm, startIndex, useSampleAPI){
  var httpRequest = REST_API_DOMAIN + REST_API_BASEPATH;
  if(useSampleAPI){
    httpRequest += REST_API_RESULTPATHSAMPLE; //Set type of response
  } else {
    httpRequest += REST_API_RESULTPATH; //Set type of response
  }
  httpRequest += "size=" + numberOfResults; //Set the number of results
  httpRequest += "&input=" + searchTerm; //Set the searchterm
  httpRequest += "&startindex=" + startIndex;
  return httpRequest;
}

/*
  Erstellt die URL für den HTTP-Request für eine Statusabfrage
  @return Die URL für die Statusabfrage der REST-API
*/
function generateStatusURI(){
  return REST_API_DOMAIN + REST_API_BASEPATH + "status";
}

/*
  Erstellt die URL für den HTTP-Request für das Bewerten von Fällen
  @param caseID Die eindeutige ID des zu bewertenden Falles
  @param Die Bewertung des Falles als float
  @return Die fertige Bewertungs-URL mit den angebenen Parametern
*/
function generateVoteURI(caseID, value){
  var httpRequest = REST_API_DOMAIN + REST_API_BASEPATH + REST_API_VOTEPATH + "/rate?";
  httpRequest += "id=" + caseID;
  httpRequest += "&rating=" + value;
  return httpRequest;
}


angular
  .module('CBSFrontend', ['ngMaterial','ngCookies'])
  .run(function($rootScope, $cookies) {
    /*
      Wird direkt am Anfang, nach dem Laden des Website ausführt
    */
    //LOAD COOKIES INTO JS VARS
    var apitype = $cookies.get(COOKIE_APITYPE);

    //Momentan hardgecoded sollte dynamisch implementiert werden
    $rootScope.lastSearches = [];
    for(var i = 0;i<5;i++){
      if($cookies.get(COOKIE_LASTSEARCHES + i)){
        $rootScope.lastSearches.push({'searchquery' : $cookies.get(COOKIE_LASTSEARCHES + i)})
      }
    }
    $rootScope.useTestData = false;
    $rootScope.useSampleAPI = false;
    $rootScope.accessToken = "";
    $rootScope.apiKey = "";
    if(apitype == 1){
      //SAMPLE API
      $rootScope.useSampleAPI = true;
    } else if(apitype == 2){
      $rootScope.useTestData = true;
    }

  })
  .controller('SideNavCtrl', function($scope, $rootScope, restAPI, $cookies){
    /*
      Der Controller für alle Aktionen innerhalb der SideNav
    */
    $scope.toggleSettings = function(){
      $scope.settingsOpen = !$scope.settingsOpen;
    }
    $scope.testMode = function(useTestData){

      if($scope.settings.test){
        $scope.settings.sample = false;
      }
      $rootScope.useTestData = useTestData;
      if(testJSONData && useTestData){
        $cookies.put(COOKIE_APITYPE, 2);
        //adjustTestDataSimilarity(testJSONData,restAPI.getCurrentResults().length);
        console.log(testJSONData);
        restAPI.cleanUpdate(testJSONData);
      } else {
        console.log("No Test data was found");
        $scope.settings.test = false;
        $cookies.put(COOKIE_APITYPE, 0);
        restAPI.cleanUpdate();
      }
    }
    $scope.apiVersionChanged = function(useSampleAPI){
      if($scope.settings.sample){
        $scope.settings.test = false;
        $cookies.put(COOKIE_APITYPE, 1);
      } else {
        $cookies.put(COOKIE_APITYPE, 0);
      }
      $rootScope.useSampleAPI = useSampleAPI;
      restAPI.cleanUpdate();
    }

    $scope.settings = {};
    console.log($rootScope.lastSearches);
    $scope.lastSearches = $rootScope.lastSearches;
    $scope.settingsOpen = false;

    //INIT COOKIE data
    if($rootScope.useTestData){
      $scope.testMode(true);
      $scope.settings.test = true;
    } else if ($rootScope.useSampleAPI){
      $scope.apiVersionChanged(true);
      $scope.settings.sample = true;
    }
    $scope.$on('lastsearchupdate', function(){
      $scope.lastSearches = $rootScope.lastSearches;
    })
    /*
      Berechnet eine passende similarity für die Testdaten
      Die Funktion arbeitet direkt mit der Referenz und benötigt kein return
    */
    function adjustTestDataSimilarity(testData, currentLength){
      for(var result of testData){
      }
    }
  })
  .controller('MainInputCtrl', function($scope, $log, restAPI, $http, $timeout, $mdDialog, $mdSidenav ){
    /*
      Der Controller für die erste Zeile mit den beiden Buttons
    */
    $scope.toggleLeft = $mdSidenav('left').toggle;
    $scope.infoClicked = displayInfoBox;
    /*
      Zeigt die Infobox, einen Dialog mit verschiedenen Informationen, an.
    */
    function displayInfoBox (ev) {
      $log.debug("Info button has been clicked");

      //Das Template für die Infobox (sollte ausgelagert werden)
      var infoBoxTemplate =
      '<md-dialog aria-label="List dialog" ng-cloak>' +
      ' <md-toolbar>' +
      '   <div class="md-toolbar-tools">' +
      '     <h2>CBR-System Infobox</h2>' +
      '   </div>' +
      ' </md-toolbar>' +
      ' <md-dialog-content class="md-padding">' +
      '   Gebe deine Rechtsfrage in das große Textfeld in der Mitte der Seite ein. Ein Ergebnis mit ähnlichen Rechtsfällen wird dir dann geliefert.' +
      '   <br><br>' +
      '   REST-API: {{rest}} <br>' +
      '   Datenbank: {{db}} <br>' +
      '   Durchschnittliche Anfragen-Dauer: {{requestLength}} Millisekunden' +
      '   <div id="infoBoxSpinner" class="querySpinner" ng-if="queryInProgress" layout layout-align="center center">' +
      '     <md-progress-circular md-diameter="42" md-mode="indeterminate"></md-progress-circular>' +
      '   </div>' +
      ' </md-dialog-content>' +
      ' <md-dialog-actions>' +
      '  <md-button ng-click="closeDialog()" class="md-primary">' +
      '   Verstanden' +
      '  </md-button>' +
      ' </md-dialog-actions>' +
      '</md-dialog>';

      //Der Controller für die Infobox
      infoBoxController = function($scope, restAPI){
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
        $scope.$on("queryStatus", function (evt, inProgress) {
          $scope.queryInProgress = inProgress;
        });
        //Errechnet nach dem Öffnen der Infobox die Antwortzeit und zeigt sie und den Server Status an
        restAPI.getStatus().then(function(status){
          var startTime = new Date();
          restAPI.getResults('tes omg').then(function(){
            $scope.db = status.db;
            $scope.rest = status.rest;
            $scope.requestLength = ((new Date) - startTime);
          });
        });
      };
     $mdDialog.show({
       parent: angular.element(document.querySelector('#appContainer')),
       targetEvent: ev,
       template: infoBoxTemplate,
       controller: infoBoxController
     });
    }
    /*
      Zeigt einen Dialog, dass die angeklickte Funktion noch nicht implementiert ist
    */
    function displayNotImplemented(ev) {
      $log.debug("Submit button has been clicked");
      $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#appContainer')))
        .clickOutsideToClose(true)
        .title('Noch nicht implementiert!')
        .textContent('Sorry, diese Funktion ist leider noch nicht implementiert.')
        .ariaLabel('Funktion nicht implementiert')
        .ok('Verstanden!')
        .targetEvent(ev)
      );
    }
  })
  .controller('SearchControl', function($scope, $timeout, $cookies, $rootScope, $document, $window, restAPI){
    /*
      Der Controller für das Suchfeld
    */
    var inputUpdateTimeout; //Das Timeout Object für das automatische Senden
    var scrollLock = false; //Blockt das Anfragen von weiteren Ergebnissen beim Scrollen während bereist neue geladen werden.

    /*
      Funktion zum Laden einer neuen Suchanfrage.
      Leert zunächst die geladenen Daten um die Animation auszulösen und füllt sie dann mit den neuen Daten.
    */
    function callUpdateService(){
      $rootScope.$broadcast("queryStatus", true);
      if(inputUpdateTimeout){
        //Stoppe den Input Timeout
        clearTimeout(inputUpdateTimeout);
      }
      restAPI.getResults($scope.searchTerm).then(function(resultData){
        restAPI.cleanUpdate(resultData);

        //Zu den last Searches in den cookies hinzufügen
        //erst in rootscope
        if(!$rootScope.lastSearches){
          return;
        }
        if($rootScope.lastSearches.length == 5){
          $rootScope.lastSearches.pop();
        }
        $rootScope.lastSearches.unshift({'searchquery' : $scope.searchTerm});
        console.log($rootScope.lastSearches);

        //jetzt das gesamte array in die cookies speichern
        for(var i=0;i<$rootScope.lastSearches.length;i++){
          $cookies.put(COOKIE_LASTSEARCHES + i, $rootScope.lastSearches[i].searchquery);
        }

        //nun das update event boradcasten für die SideNav
        $rootScope.$broadcast("lastsearchupdate");
      });
    }
    $scope.retrieveData = callUpdateService;
    $scope.inputChanged = function(){
      if(inputUpdateTimeout){
        //Starte den Timer für das automatische Senden bei Eingabe neu
        clearTimeout(inputUpdateTimeout);
      }
      inputUpdateTimeout = setTimeout(callUpdateService, SEARCH_INPUT_TIMEOUT);
      $rootScope.$broadcast("queryStatus", true);
    };
    $document.on('scroll', function() {
      //getDocHeight wurde für Browserkompatibilität von hier kopiert: http://james.padolsey.com/javascript/get-document-height-cross-browser/
      function getDocHeight(documentElement) {
        return Math.max(
            documentElement.body.scrollHeight, documentElement.documentElement.scrollHeight,
            documentElement.body.offsetHeight, documentElement.documentElement.offsetHeight,
            documentElement.body.clientHeight, documentElement.documentElement.clientHeight
        );
      }
      //Zunächst werden einige Hilfsvariablen definiert um die Übersicht zu verbessern
      var doc = $document[0] || $document;
      var scrollPosition;
      // Nun wird jeweils für Firefox und Chrome das Scrollende Element gefunden
      // (Firefox benutzt doc.documentELement während Chrome scrollingElement verwendet)
      if(doc.scrollingElement === undefined){
        scrollPosition = doc.documentElement.scrollTop;
      } else {
        scrollPosition = doc.scrollingElement.scrollTop;
      }
      var windowHeight = $window.innerHeight;

      if(scrollLock){
        // Falls ein Scrolllock gesetzt wurde, breche die Anfrage sofort ab
        return;
      }
      if(scrollPosition + windowHeight >= getDocHeight($document[0]) - SCROLL_UPDATE_HEIGHT){
        var currRes = restAPI.getCurrentResults();
        if(currRes.length > 0){
          scrollLock = true;
          // Um den searchterm herauszufinden könnte auch $scope.searchTerm verwendet werden. Allerdings besteht die Möglichkeit
          // dass der Benutzer die Anfrage in irgendeiner Form geändert hat und dann falsche weitere Ergebnisse kommen könnten.
          // Deshalb wird die Bentuzereingabe aus dem ersten Result Element herausgenommen und wiederverwendet

          //Normales Laden von der REST-API
          if(!$rootScope.useTestData){
            restAPI.getResults(currRes[0].userInput, currRes.length).then(function(resultData){
              restAPI.addToCurrentResults(resultData);
              restAPI.notifyResults(restAPI.getCurrentResults());
              scrollLock = false;
            }, function(){
              // Deaktiviere den scrollLock in jedem Fall wieder
              scrollLock = false
            })
          } else {
            //Laden aus den Testdaten
            restAPI.addToCurrentResults(testJSONData);
            restAPI.notifyResults(restAPI.getCurrentResults());
          }
      };
    }
  });
  })
  .controller('ResultCtrl', function($scope, restAPI, $mdToast, $mdDialog, $interval){
    /*
      Controller für die Ergebnisliste
    */
    $scope.$on("newResultData", function (evt, newData) {
      $scope.results = newData;
    });
    $scope.pdfClicked = function(fileLink) {
      $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#appContainer')))
        .clickOutsideToClose(true)
        .title('Opening PDF...')
        .textContent('You clicked on the link to: ' + fileLink)
        .ariaLabel('PDF Link')
        .ok('Got it!')
      );
    }
    $scope.voteClicked = function(itemid, rating, localResultIndex){
      restAPI.setVote(itemid, rating).then(function(){
        $mdToast.show(
          $mdToast.simple()
                  .textContent('Der Fall wurde erfolgreich bewertet! Danke für deine Mithilfe')
                  .action('Kein Problem!')
                  .highlightAction(false)
                  .position('top right')
                  .hideDelay(3000)
        );
        if(rating == 0){
          var tempResults = restAPI.getCurrentResults();
          tempResults[localResultIndex].collapsed = 2;
          restAPI.setCurrentResults(tempResults);
          restAPI.notifyResults(restAPI.getCurrentResults());
          return;
        } else {
          var tempResults = restAPI.getCurrentResults();
          tempResults[localResultIndex].collapsed = 1;
          restAPI.setCurrentResults(tempResults);
        }
      });
    }
  })
  .controller('BottomCtrl', function($scope, $http){
    /*
      Controller für die untere Reihe an Buttons und Inhalten
    */
  })
  .controller('AppCtrl', function ($scope, $rootScope, restAPI, $http, $timeout, $log, $mdToast) {
    /*
      Controller für globale Website Funktionalitäten
    */
    /*
    $scope.searchTerm = "test";
    restAPI.getResults("test").then(function(resultData){
      restAPI.setCurrentResults(resultData);
      restAPI.notifyResults(resultData);
    });
    */
    $scope.$on("queryStatus", function (evt, inProgress) {
      $scope.queryInProgress = inProgress;
    });
    $scope.serverConnection = true;
    checkHeartBeat();
    function checkHeartBeat(){
      console.log("Checking Server Status!");
      restAPI.getStatus().then(function(currentStatus){
        console.log("wtf", currentStatus);
        $scope.serverConnection = currentStatus.rest && currentStatus.db;
      });
      //Führe den Heartbeat-Check im Interval aus
      $timeout(checkHeartBeat, 5000);
    }
    $mdToast.show(
      $mdToast.simple()
              .textContent('Scrolle runter um mehr Ergebnisse zu laden!')
              .action('Verstanden!')
              .highlightAction(false)
              .position('top right')
              .hideDelay(3000)
    );
  })
  .service("restAPI", function($http, $timeout, $rootScope, $q){
    /*
      Der REST-API Service, welcher einen einfachen Zugriff auf die Daten bietet

    */

    //Lokale Service Variablen initialisieren
    var currentResults = [];
    var currentStatus = {
      'rest' : true,
      'db' : true
    };
    var currentSize = 0;
    //Mit thisService ist die Referenz auf den Service selber auch innerhalb
    //der Service-Methoden verwendbar
    var thisService = this;
    this.getResults = function(searchTerm, startIndex){
      return $q(function(resolve, reject){
        searchTerm = searchTerm.trim();
        if(searchTerm === ""){
          console.log("Requested term is empty!");
          $rootScope.$broadcast("queryStatus", false);
          reject();
          return;
        }
        if(startIndex === undefined){
          startIndex = 0;
        }
        startIndex += REST_API_REQUESTSIZE;
        console.log("Search this term: " + searchTerm);
        $rootScope.$broadcast("queryStatus", true);
        var request = {
          method: 'GET',
          url: generateSearchURI(REST_API_REQUESTSIZE ,searchTerm, startIndex, $rootScope.useSampleAPI),
          headers: {
            'X-Api-Key': "$A$9af4d8381781baccb0f915e554f8798d",
            'X-Access-Token': "$T$de61425667e2e4ac0884808b769cd042",
          }
        };
        $http(request).then(function (response) {

          response = response.data.entity;
          if(!assertCompilation(response)){
            console.log("Result response is not an array!");
            $rootScope.$broadcast("queryStatus", false);
            reject();
            return;
          }
          /*
            Hier wird jedes Element auf die richtige Datenstruktur überprüft und in ein gleichmäßiges Format
            für die Verwendung im Frontend verarbeitet
            Result Eintrag Struktur:
              judgement: object
              collapsed: bool
              similarity: float
              userInput: string
          */
          var processedResponse = [];
          for(var responseItem of response){
              if(!assertResultHasProperStructure(responseItem)){
                console.log("The following item doesn't have the proper structure", responseItem);
              } else {
                var tempElement = {};
                tempElement.judgement = responseItem.judgement;
                tempElement.collapsed = 0;
                tempElement.similarity = responseItem.similarity;
                tempElement.userInput = responseItem.userInput;
                tempElement.id= responseItem.id;
                tempElement.userRating = responseItem.userRating;
                processedResponse.push(tempElement);
              }
          }
          //Stell sicher, dass alle ankommenden Teilergebnisse korrekt sortiert sind
          processedResponse.sort(compare);
          console.log(processedResponse);
          $rootScope.$broadcast('queryStatus', false);
          resolve(processedResponse);
        }); //END HTTP GET
      }); //END PROMISE
    }; //END SERVICE FUNCTION
    this.setVote = function(id, value){
      var request = {
        method: 'POST',
        url: generateVoteURI(id,value),
        headers: {
          'X-Api-Key': "$A$9af4d8381781baccb0f915e554f8798d",
          'X-Access-Token': "$T$de61425667e2e4ac0884808b769cd042",
        }
      };
      return $http(request);
    };
    this.getStatus = function(){
      return $q(function(resolve,reject){
        $http.get(generateStatusURI()).then(function successCallback(response){
          console.log(response);
          response = response.data.entity;
          currentStatus.rest = false;
          currentStatus.db = false;
          if(response.server == REST_API_STATUS_RUNNING){
            currentStatus.rest = true;
          }
          if(response.databaseStatus == REST_API_STATUS_RUNNING){
            currentStatus.db = true;
          }
          if(currentStatus.rest && currentStatus.db){
            console.log("Server is online");
            resolve(currentStatus);
            return;
          } else {
            console.log("Either one of the servers is down or they replied something unrecognized");
            $rootScope.$broadcast("queryStatus", false);
            resolve(currentStatus);
            return;
          }
        }, function errorCallback(response) {
          currentStatus.rest = false;
          currentStatus.db = false;
          $rootScope.$broadcast("queryStatus", false);
          console.log("Connection failed");
          resolve(currentStatus);
        });
      });
    }

    //Hilfsfunktionen um den Zugang und Benutzung zu verleichtern
    this.notifyResults = function(newResults){
      if(newResults === undefined){
        newResults = [];
      }
      $rootScope.$broadcast("newResultData", newResults);
      $rootScope.$broadcast("queryStatus", false);
    }
    this.setCurrentResults = function(newResults) {
      if(newResults === undefined){
        newResults = [];
      }
      currentResults = newResults;
    }
    this.getCurrentResults = function(){
      return currentResults;
    }
    this.addToCurrentResults = function(newResults){
      currentResults = currentResults.concat(newResults);
    }
    this.removeFromCurrentResults = function(indexToRemove){
      if (indexToRemove > -1) {
        //currentResults[indexToRemove] = {};
        //currentResults.splice(indexToRemove, 1);
      }
    }
    this.cleanUpdate = function(newResults){
      if(!newResults){
        newResults = [];
      }
      thisService.setCurrentResults();
      thisService.notifyResults();
      return $timeout(750).then(function(){
        thisService.notifyResults(newResults);
        thisService.setCurrentResults(newResults);
      })
    }
  });

/*
  Überprüft ob eine Variable ein Array ist
  @param varToCheck Variable die überprüft werden soll
  @result Ergebnis der Überprüfung
*/
function assertIsArray(varToCheck) {
  // Es ist nicht möglich Array.isArray(obj) einfach zurückzugeben, weil die
  // Variable auch undefined sein könnte
  if(!varToCheck){
    return false;
  }
  if(Array.isArray(varToCheck)){
    return true;
  }
  return false;
}

/*
  Überprüft ob ein übergebenes Array keine Einträge besitzt
  @param arrayToCheck Array welches überprüft werden soll
  @result Ergebnis der Überprüfung
*/
function assertArrayNotEmpty(arrayToCheck){
  if(arrayToCheck.length > 0){
    return true;
  }
  return false;
}

/*
  Führt eine sehr simple, 1-Ebenen-tiefe Überprüfung des responseItems auf die
  angebene Struktur durch
  @param responseItem Das Objekt, dass überprüft werden soll
  @result Ergebnis der Überprüfung
*/
function assertResultHasProperStructure(responseItem){
  if(responseItem === undefined){
    return false;
  }
  for(var topLevelProperty of RESULT_STRUCUTURE){
    if(responseItem[topLevelProperty] === undefined){
      return false;
    }
  }
  for(var judgementProperty of JUDGEMENT_STRUCUTRE){
    if(responseItem['judgement'][judgementProperty] === undefined){
      return false;
    }
  }
  return true;
}

/*
  Eine Zusammenfassung aller allgemeinen assertions zur einfachen Verwendung
  @param varToCheck
  @result Ergebnis der Überprüfungen, wenn eine fehlschlägt, dann ist alles ungültig
*/
function assertCompilation(varToCheck){
  if(!assertIsArray(varToCheck)){
    console.log("Result response is not an array!");
    return false;
  }
  if(!assertArrayNotEmpty(varToCheck)){
    console.log("Result array is empty");
    return false;
  }
  return true;
}

//Einfache similarity Sortier-Funktion
function compare(a,b) {
if (a.similarity > b.similarity)
  return -1;
else if (a.similarity < b.similarity)
  return 1;
else
  return 0;
}
