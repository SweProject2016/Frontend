angular
  .module('CBSFrontend', ['ngMaterial'])
  .controller('AppCtrl', function ($scope, $timeout, $mdDialog, $mdSidenav, $log) {
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.infoClicked = displayInfoBox;
    $scope.retrieveData = displayNotImplemented;
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
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
    };
  });
