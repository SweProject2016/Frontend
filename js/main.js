//Constants for REST-API URIs
REST_API_DOMAIN = "http://it14.tech:8271";
REST_API_BASEPATH = "/swe/api/";
//
REST_API_REQUESTSIZE = 5;
REST_API_STATUS_RUNNING = "RUNNING";
SEARCH_INPUT_TIMEOUT = 1500;
SCROLL_UPDATE_HEIGHT = 200; //Distance from the bottom of the page to trigger the loading of more results
//Constants for the structure of the search results
RESULT_STRUCUTURE = ["userInput", "similarity", "judgement"];
JUDGEMENT_STRUCUTRE = ["fileReference", "sentence", "offence", "pdfLink",
  "pdfFileName", "keywords", "comittee", "sector", "date", "pageRank",
  "timestamp", "keywordsAsList"];

function generateSearchURI(numberOfResults, searchTerm, startIndex){
  var httpRequest = REST_API_DOMAIN + REST_API_BASEPATH;
  httpRequest += "sample/get?type=result"; //Set type of response
  httpRequest += "&size=" + numberOfResults; //Set the number of results
  httpRequest += "&input=" + searchTerm; //Set the searchterm
  httpRequest += "&start=" + startIndex;
  return httpRequest;
}

function generateStatusURI(){
  return REST_API_DOMAIN + REST_API_BASEPATH + "status";
}

function generateVoteURI(caseID, value){
  var httpRequest = REST_API_PROTOCOL + REST_API_BASEPATH + "/sample/vote?";
  httpRequest += "caseid=" + caseID;
  httpRequest += "&value=" + value;
  return httpRequest;
}

angular
  .module('CBSFrontend', ['ngMaterial'])
  .run(function($http) {
    //LOAD COOKIES INTO JS VARS
  })
  .controller('SideNavCtrl', function($scope){

  })
  .controller('MainInputCtrl', function($scope, $log, restAPI, $http, $timeout, $mdDialog, $mdSidenav ){
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.infoClicked = displayInfoBox;
    /**
    * Supplies a function that will continue to operate until the
    * time is up.
    */
    function debounce(func, wait, context) {
      var timer;
      return function debounced() {
      var context = $scope,
          args = Array.prototype.slice.call(arguments);
      $timeout.cancel(timer);
      timer = $timeout(function() {
        timer = undefined;
        func.apply(context, args);
      }, wait || 10);
      };
    }
    /**
    * Build handler to open/close a SideNav; when animation finishes
    * report completion in console
    */
    function buildDelayedToggler(navID) {
      return debounce(function() {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug("toggle " + navID + " is done");
        });
      }, 200);
    }
    function buildToggler(navID) {
      return function() {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          $log.debug("toggle " + navID + " is done");
        });
      }
    }
    function displayInfoBox (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      // Modal dialogs should fully cover application
      // to prevent interaction outside of dialog
      $log.debug("Info button has been clicked");
          infoBoxTemplate =
          '<md-dialog aria-label="List dialog" ng-cloak>' +
          '<md-toolbar>' +
          '<div class="md-toolbar-tools">' +
          '<h2>CBR-System Infobox</h2>' +
          '</div>' +
          '</md-toolbar>' +
          '  <md-dialog-content class="md-padding">' +
          'Gebe deine Rechtsfrage in das große Textfeld in der Mitte der Seite ein. Ein Ergebnis mit ähnlichen Rechtsfällen wird dir dann geliefert.' +
          '<br><br>' +
          'REST-API: {{rest}} <br>' +
          'Datenbank: {{db}} <br>' +
          'Durchschnittliche Anfragen-Dauer: {{requestLength}} Millisekunden' +
          '  </md-dialog-content>' +
          '  <md-dialog-actions>' +
          '    <md-button ng-click="closeDialog()" class="md-primary">' +
          '      Verstanden' +
          '    </md-button>' +
          '  </md-dialog-actions>' +
          '</md-dialog>',

          infoBoxController = function($scope, restAPI){
            $scope.closeDialog = function() {
              $mdDialog.hide();
            }
            restAPI.getStatus().then(function(status){
              var startTime = new Date();
              restAPI.getResults('test').then(function(){
                $scope.db = status.db;
                $scope.rest = status.rest;
                $scope.requestLength = ((new Date) - startTime);
              });
            });
          }
       $mdDialog.show({
         parent: angular.element(document.querySelector('#appContainer')),
         targetEvent: ev,
         template: infoBoxTemplate,
         controller: infoBoxController
      });
    }
    function displayNotImplemented(ev) {
      $log.debug("Submit button has been clicked");

      $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#appContainer')))
        .clickOutsideToClose(true)
        .title('Not implemented function used!')
        .textContent('Sorry, this functionality is currently not implemented')
        .ariaLabel('Function not yet implemented')
        .ok('Got it!')
        .targetEvent(ev)
      );
    }
  })
  .controller('SearchControl', function($scope, $timeout, $rootScope, $document, $window, restAPI){
    var inputUpdateTimeout; //Timeout for the auto-send
    var scrollLock = false; //This is set to true, when there is already a scroll-update on the way. Avoids several updates at the same time
    function callUpdateService(){
      $rootScope.$broadcast("queryStatus", true);
      restAPI.getResults($scope.searchTerm).then(function(resultData){
        restAPI.setCurrentResults();
        restAPI.notifyResults();
        $timeout(750).then(function(){
          restAPI.notifyResults(resultData);
          restAPI.setCurrentResults(resultData);
        })
      });
    }
    $scope.retrieveData = callUpdateService;
    $scope.inputChanged = function(){
      if(inputUpdateTimeout){
        clearTimeout(inputUpdateTimeout);
      }
      inputUpdateTimeout = setTimeout(callUpdateService, SEARCH_INPUT_TIMEOUT);
      $rootScope.$broadcast("queryStatus", true);
    };
    $document.on('scroll', function() {
      //getDocHeight copied from http://james.padolsey.com/javascript/get-document-height-cross-browser/
      function getDocHeight(documentElement) {
        return Math.max(
            documentElement.body.scrollHeight, documentElement.documentElement.scrollHeight,
            documentElement.body.offsetHeight, documentElement.documentElement.offsetHeight,
            documentElement.body.clientHeight, documentElement.documentElement.clientHeight
        );
      }
      //First some variables to improve readability
      var doc = $document[0] || $document;
      var scrollPosition;
      // Firefox uses doc.documentElement, while Chrome uses scrollingElement
      if(doc.scrollingElement === undefined){
        scrollPosition = doc.documentElement.scrollTop;
      } else {
        scrollPosition = doc.scrollingElement.scrollTop;
      }
      var windowHeight = $window.innerHeight;

      if(scrollLock){
        //When the scroll request lock is active, disregard this event
        return;
      }
      if(scrollPosition + windowHeight >= getDocHeight($document[0]) - SCROLL_UPDATE_HEIGHT){
        var currRes = restAPI.getCurrentResults();
        if(currRes.length > 0){
          scrollLock = true;
          //You could use $scope.searchTerm to get the seachterm, but the user could have altered it or removed it entirely
          //so its safer to hijack the first result item and get the searchterm from there
          restAPI.getResults(currRes[0].userInput, currRes.length).then(function(resultData){
            restAPI.addToCurrentResults(resultData);
            restAPI.notifyResults(restAPI.getCurrentResults());
            scrollLock = false;
          }, function(){
            //Disable scrollLock regardless of getResults success
            scrollLock = false
          });
      };
    }
  });
  })
  .controller('ResultCtrl', function($scope, $mdDialog, $interval){
    $scope.$on("newResultData", function (evt, newData) {
      $scope.results = newData;
    });
    $scope.$on("queryStatus", function (evt, inProgress) {
      $scope.queryInProgress = inProgress;
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
  })
  .controller('BottomCtrl', function($scope, $http){

  })
  .controller('AppCtrl', function ($scope, $rootScope, restAPI, $http, $timeout, $log, $mdToast) {
    $scope.searchTerm = "test";
    restAPI.getResults("test").then(function(resultData){
      restAPI.setCurrentResults(resultData);
      restAPI.notifyResults(resultData);
    });
    checkHeartBeat();
    function checkHeartBeat(){
      console.log("Checking Server Status!");
      restAPI.getStatus().then(function(currentStatus){
        console.log("wtf", currentStatus);
        $scope.serverConnection = currentStatus.rest && currentStatus.db;
      });
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
  .controller('LeftCtrl', function ($scope) {

  })
  .service("restAPI", function($http, $timeout, $rootScope, $q){
    var currentResults = [];
    var currentStatus = {
      'rest' : false,
      'db' : false
    };
    var currentRESTStatus = false;
    var currentDBStatus = false;
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
          url: generateSearchURI(REST_API_REQUESTSIZE ,searchTerm, startIndex),
          headers: {
            'X-Api-Key': "$A$9af4d8381781baccb0f915e554f8798d",
            'X-Access-Token': "$T$de61425667e2e4ac0884808b769cd042",
          }
        };
        $http(request).then(function (response) {
          //Simple similarity sorting function
          function compare(a,b) {
          if (a.similarity > b.similarity)
            return -1;
          else if (a.similarity < b.similarity)
            return 1;
          else
            return 0;
          }

          response = response.data.entity;
          if(!assertCompilation(response)){
            console.log("Result response is not an array!");
            $rootScope.$broadcast("queryStatus", false);
            reject();
            return;
          }

          //Check each element for proper structure and add every fitting one to the processedResponse
          //ResultContainer structure:
          // judgement: data
          // collapsed: bool
          // similarity: float
          // userInput: string
          var processedResponse = [];
          for(var responseItem of response){
              if(!assertResultHasProperStructure(responseItem)){
                console.log("The following item doesn't have the proper structure", responseItem);
              } else {
                var tempElement = {};
                tempElement.judgement = responseItem.judgement;
                tempElement.collapsed = false;
                tempElement.similarity = responseItem.similarity;
                tempElement.userInput = responseItem.userInput;
                processedResponse.push(tempElement);
              }
          }
          //Ensure correct sorting
          processedResponse.sort(compare);
          console.log(processedResponse);
          $rootScope.$broadcast('queryStatus', false);
          resolve(processedResponse);
        }); //END HTTP GET
      }); //END PROMISE
    }; //END FATORY FUNCTION
    this.setVote = function(id, value){

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

    //Helper functions to make result access easier
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
  });

/*
  Returns true if the specified variable is an array
*/
function assertIsArray(varToCheck) {
  //You cannot just return Array.isAray(obj) since it could be
  if(!varToCheck){
    return false;
  }
  if(Array.isArray(varToCheck)){
    return true;
  }
  return false;
}

/*
  Checks whether the inserted array is empty
*/
function assertArrayNotEmpty(arrayToCheck){
  if(arrayToCheck.length > 0){
    return true;
  }
  return false;
}

/*
  Performs a very simple, one layer deep check of the result structure as specified
  in the constants.
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
  A compilation of all the asserts to remove some complexity from the request function
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
