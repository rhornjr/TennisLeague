(function () {

    'use strict';

    angular.module('myApp.controllers').controller('playerController', playerController);

    // ------------------------------- Schedule Controller -------------------------------

    function playerController($rootScope, $scope, $http, $location, $routeParams, playerRepository, uiGridConstants, showInfoModal) {
        $scope.state = playerRepository;
        $scope.playerId = $routeParams.playerId
        $scope.removeTab = $routeParams.remove;
        $scope.schedule = [];

        function setSchedule() {
            // Pass each schedule in for processing.
            setSchedule2($rootScope.eastSchedule);
            setSchedule2($rootScope.westSchedule);
        }

        function setSchedule2(schedule) {
            // Loop through the schedule on root scope and set the player schedule
            // ToDo: We need to put the player *object* on the schedule and not do name parsing.
            for (var i = 0; i < schedule.Matches.length; i++) {
                var weekResult = {
                    weekNumber: 0,
                    winLoss: '',
                    opponent: '',
                    score: ''
                }

                if (schedule.Matches[i].HomePlayer.substring(2) != $scope.state.player.LastName &&
                    schedule.Matches[i].AwayPlayer.substring(2) != $scope.state.player.LastName) {
                    continue;
                }

                weekResult.weekNumber = schedule.Matches[i].WeekNumber;
                weekResult.score = schedule.Matches[i].Score;
                if (schedule.Matches[i].Winner.substring(2) == $scope.state.player.LastName) {
                    weekResult.winLoss = 'W';
                }
                else if (schedule.Matches[i].Winner) {
                    // If there is a winner, but it wasn't this player (first part of *if*), then it's a loss.
                    weekResult.winLoss = 'L';
                }

                if (schedule.Matches[i].AwayPlayer.substring(2) == $scope.state.player.LastName) {
                    weekResult.opponent = schedule.Matches[i].HomePlayer;                                                            
                }
                else {
                    weekResult.opponent = schedule.Matches[i].AwayPlayer;
                }
                $scope.schedule.push(weekResult);
             }
        }

        // ---------------------------------------------------------------------------------------------------

        if ($scope.removeTab == 'true') {
            $location.path('/standings/1');
            $rootScope.tabs = $rootScope.tabs.filter(function (element) {
                return element.PlayerId != $scope.playerId;
            });
            return;
        }

        // ---------------------------------------------------------------------------------------------------

        function loadPlayer() {
            var config = {
                url: rootWebApiUrl + '/api/player/?playerId=' + $scope.playerId,
                method: 'GET'
            };

            $scope.loading = 1;
            $http(config)
                .then(function (response) {
                    $scope.loading = 0;
                    $scope.state.player = response.data;
                    setSchedule();
                }, function (response) {
                    console.log('err: ', response);
                    showInfoModal.show(response.statusText, response.data);
                    $scope.loading = 0;
                });
        }

        // ---------------------------------------------------------------------------------------------------

        loadPlayer();
    }
})();