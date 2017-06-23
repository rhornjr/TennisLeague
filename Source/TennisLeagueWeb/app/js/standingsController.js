(function () {

    'use strict';

    angular.module('myApp.controllers').controller('standingsController', standingsController);

    // ------------------------------- Standings Controller -------------------------------

    function standingsController($rootScope, $scope, $http, $location, standingsRepository, uiGridConstants, showInfoModal) {
        $scope.state = standingsRepository;

        // ---------------------------------------------------------------------------------------------------

        function loadStandings(divisionName) {
            var config = {
                url: rootWebApiUrl + '/api/standings/getStandings/'
                    + '?divisionName=' + divisionName
                    + '&seasonName=2016 Summer Fall'
                    + '&leagueName=Ohio Tennis League',
                method: 'GET'
            };

            $scope.loading = 1;
            $http(config)
                .then(function (response) {
                    $scope.loading = 0;
                    $scope.state.standings1 = angular.fromJson(response.data);
                    if (divisionName == 'East') {
                        $scope.state.standingsEast = angular.fromJson(response.data);
                        $scope.state.selectedStandings = $scope.state.standingsEast;  // default
                    }
                    else {
                        $scope.state.standingsWest = angular.fromJson(response.data);
                    }
                }, function (response) {
                    console.log('err: ', response);
                    showInfoModal.show(response.statusText, response.data);
                    $scope.loading = 0;
                });
        }

        if ($scope.state.selectedStandings.length == 0) {
            loadStandings('East');
            loadStandings('West');
        }

        // ---------------------------------------------------------------------------------------------------

        $scope.goToDivision = function (division) {
            $scope.state.selectedDivision = division;

            if (division == 1) {
                $scope.state.selectedStandings = $scope.state.standingsEast;
            }
            else {
                $scope.state.selectedStandings = $scope.state.standingsWest;
            }
        }

        $scope.goToPlayer = function (standing) {
            $rootScope.playerId = standing.PlayerId;
            $rootScope.tabs.push(standing);
            $location.path('/player/' + standing.PlayerId);
        }
    }
})();