(function () {

    'use strict';

    angular.module('myApp.controllers').controller('scheduleController', scheduleController);

    // ------------------------------- Schedule Controller -------------------------------

    function scheduleController($rootScope, $scope, $http, $location, $routeParams, scheduleRepository, uiGridConstants, showInfoModal, $window) {
        $scope.state = scheduleRepository;
                
        if ($scope.state.selectedSchedule.length == 0) {
            $scope.state.selectedSchedule = $rootScope.eastSchedule;  // default
        }

        // ---------------------------------------------------------------------------------------------------

        $scope.goToDivision = function (division) {
            $scope.state.selectedDivision = division;

            if (division == 1) {
                $scope.state.selectedSchedule = $rootScope.eastSchedule;
            }
            else {
                $scope.state.selectedSchedule = $rootScope.westSchedule;
            }

            trimPlayerNames($scope.state.selectedSchedule);
        }
    }
})();