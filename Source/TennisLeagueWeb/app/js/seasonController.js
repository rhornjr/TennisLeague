(function () {

    'use strict';

    angular.module('myApp.controllers').controller('seasonController', seasonController);

    // ------------------------------- Season Controller -------------------------------

    function seasonController($rootScope, $scope, $http, $uibModalInstance) {
        loadSeasons();

        $scope.ok = function () {
            var defaultSeason = '2016 Summer Fall';
            localStorage.setItem('seasonName', defaultSeason);
            $rootScope.seasonName = defaultSeason; // testing
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.close();
        };

        $scope.setSeason = function (season) {
            // ToDo: Save the season, then set it (rootScope?), then use that wherever it's currently hard-coded.
            localStorage.setItem('seasonName', season.Name);
            $rootScope.seasonName = season.Name; // testing
            alert('Need to save season: ' + season.Id);
        }

        function loadSeasons() {
            var config = {
                url: rootWebApiUrl + '/api/seasons/getSeasons/',
                method: 'GET'
            };

            $scope.loading = 1;
            $http(config)
                .then(function (response) {
                    $scope.loading = 0;
                    $scope.seasons = response.data;
                }, function (response) {
                    console.log('err: ', response);
                    //showInfoModal.show(response.statusText, response.data);
                    $scope.loading = 0;
                });
        }
    }
})();