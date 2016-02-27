//Constants for REST-API URIs
REST_API_DOMAIN = "http://localhost:8080";
REST_API_BASEPATH = "/swe/api/";

//Constants for the structure of the search results
RESULT_STRUCUTURE = ["userInput", "similarity", "judgement"];
JUDGEMENT_STRUCUTRE = ["fileReference", "sentence", "offence", "pdfLink",
  "pdfFileName", "keywords", "comittee", "sector", "date", "pageRank",
  "timestamp", "keywordsAsList"];

function generateSearchURI(numberOfResults, searchTerm){
  var httpRequest = REST_API_DOMAIN + REST_API_BASEPATH;
  httpRequest += "sample/get?type=result"; //Set type of response
  httpRequest += "&size=" + numberOfResults; //Set the number of results
  httpRequest += "&input=" + searchTerm; //Set the searchterm
  return httpRequest;
}

function generateStatusURI(){
  return REST_API_DOMAIN + REST_API_BASEPATH + "status/server";
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

      $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#appContainer')))
        .clickOutsideToClose(true)
        .title('Help for the CBS-Frontend')
        .textContent('Enter your legal question into the main text-input in the center of the page. Once sent, our system will provide you with related cases.')
        .ariaLabel('Help-Dialog for this Webapp')
        .ok('Got it!')
        .targetEvent(ev)
      );
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
  .controller('SearchControl', function($scope, $rootScope, restAPI){
    var inputUpdateTimeout;
    function callUpdateService(){
      $rootScope.$broadcast("queryStatus", true);
      restAPI.updateResults($scope.searchTerm);
    }
    $scope.retrieveData = callUpdateService;
    $scope.inputChanged = function(){
      if(inputUpdateTimeout){
        clearTimeout(inputUpdateTimeout);
      }
      inputUpdateTimeout = setTimeout(callUpdateService, 1500);
      $rootScope.$broadcast("queryStatus", true);
    };
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
  .controller('AppCtrl', function ($scope, $rootScope ,restAPI, $http, $timeout, $log) {
    restAPI.updateResults("test");
    checkHeartBeat();
    function checkHeartBeat(){
      console.log("Checking Server Status!");
      $http.get(generateStatusURI()).then(function successCallback(response){
        if(response.data.server == "running"){
          console.log("server is running");
          $scope.serverConnectionLost = false;
        } else {
          console.log("Either one of the servers is down or they replied something unrecognized");
          console.log(response.data);
          $scope.serverConnectionLost = true;
          $rootScope.$broadcast("queryStatus", false)
        }
      }, function errorCallback(response) {
        $scope.serverConnectionLost = true;
        $rootScope.$broadcast("queryStatus", false);
      });
      $timeout(checkHeartBeat, 5000);
    }
  })
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
    };
  })
  .service("restAPI", function($http, $timeout, $rootScope){
    var results = [];
    setResults = function(data){
      if(data == undefined){
        data = [];
      }
      $rootScope.$broadcast("queryStatus", false);
      $rootScope.$broadcast("newResultData", []);
      $timeout(function(){
        $rootScope.$broadcast("newResultData", data);
      }, 750);

    }
    this.getResults = function(){
      return results;
    }
    this.updateResults = function(searchTerm){
      // Currently query is designed like this:
      // type: should be always result (since we want judgement results)
      // size: is the number of results that we want in the response
      // input: is the users' search query
      searchTerm = searchTerm.trim();
      if(searchTerm === ""){
        console.log("Requested term is empty!");
        setResults();
        return;
      }
      console.log("Search this term: " + searchTerm);
      $rootScope.$broadcast("queryStatus", true);
      var request = {
        method: 'GET',
        url: generateSearchURI(5,searchTerm),
        headers: {
        }
      };
      $http(request).then(function (response) {
            function compare(a,b) {
            if (a.similarity > b.similarity)
              return -1;
            else if (a.similarity < b.similarity)
              return 1;
            else
              return 0;
            }
            //data.sort(compare);

            response = response.data;
            if(!assertIsArray(response)){
              console.log("Result response is not an array!");
              setResults();
              return;
            }
            if(!assertArrayNotEmpty(response)){
              console.log("Result array is empty")
              setResults();
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
                  tempElement.userInput = responseItem.userInput
                  processedResponse.push(tempElement);
                }
            }
            console.log(processedResponse);
            setResults(processedResponse);
          });
    };
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
