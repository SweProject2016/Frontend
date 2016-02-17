REST_API_PROTOCOL = "http://"
REST_API_DOMAIN = "localhost:8080";
REST_API_BASEPATH = "/swe/api/";

function generateSearchURI(numberOfResults, searchTerm){
  return REST_API_PROTOCOL + REST_API_DOMAIN + REST_API_BASEPATH + "sample/get?type=result&size=" + numberOfResults + "&input=" + searchTerm;
}

function generateStatusURI(){
  return REST_API_PROTOCOL + REST_API_DOMAIN + REST_API_BASEPATH + "status/server";
}

angular
  .module('CBSFrontend', ['ngMaterial'])
  .controller('SideNavCtrl', function($scope){

  })
  .controller('MainInputCtrl', function($scope, $log, restAPI, $http, $timeout, $mdDialog, $mdSidenav ){
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.infoClicked = displayInfoBox;
    $scope.retrieveData = function(){
      restAPI.updateResults($scope.searchTerm);
    };


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
  .controller('ResultCtrl', function($scope, restAPI, $interval){
    $scope.results = restAPI.getResults();
    function testfunc(){
      console.log("nice results", restAPI.getResults());
    };
    $interval(testfunc, 1000);
  })
  .controller('BottomCtrl', function($scope, $http){

  })
  .controller('AppCtrl', function ($scope,restAPI, $http, $timeout, $log) {
    restAPI.updateResults("test");
    checkHeartBeat();
    function checkHeartBeat(){
      $http.get(generateStatusURI()).then(function successCallback(data){
        if(data.server == "running"){
          console.log("server is running");
          $scope.serverConnectionLost = false;
        }
      }, function errorCallback(response) {
        $scope.serverConnectionLost = true;
      });
      setTimeout(checkHeartBeat, 5000);
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
  .service("restAPI", function($http){
    var results = [];
    this.getResults = function(){
      return results;
    }
    this.updateResults = function(searchTerm){
      // Currently query is designed like this:
      // type: should be always result (since we want judgement results)
      // size: is the number of results that we want in the response
      // input: is the users' search query
        console.log("Search this term: " + searchTerm);
        $http.get(generateSearchURI(5,searchTerm)).
            success(function(data) {
                function compare(a,b) {
                if (a.similarity > b.similarity)
                  return -1;
                else if (a.similarity < b.similarity)
                  return 1;
                else
                  return 0;
            }
              //data.sort(compare);
              console.log(data);
              results = data;
            });
    }
  });
