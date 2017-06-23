'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', [
  'ngAnimate',
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap',
  'ui.grid',  // http://ui-grid.info/
  'ui.grid.selection',
  'ui.grid.resizeColumns'
]);

angular.module('myApp.controllers', []);

// ------------------------------- Info Modal Controller -------------------------------

angular.module('myApp.controllers').controller('infoController', function ($scope, $uibModalInstance, title, message) {
    $scope.title = title;
    $scope.message = message
    $scope.ok = function () {
        $uibModalInstance.close();
    };
});

// --------------------------------------------------------------------------------------------------------------

app.run(function ($rootScope, $http, $location, showInfoModal, showSeasonModal) {
    
    $rootScope.lastElementWasInner = false; // default

    $rootScope.setUserMessage = function (userMessage) {
        $rootScope.userMessage = userMessage + " - " + moment().format('DD-MMM HH:mm:ss');
    }

    $rootScope.setUserMessage('App started');

    $rootScope.go = function (path, calledFromInnerElement) {
        // This method can get called twice in a row if the user clicks an inner element and outer element at the
        // same time (like the x/close on the tabs).
        // I originally tried using e.stopPropagation() here but it was causing issues where app.run (this function)
        // would run twice. So while this is a hack, it works, plus I don't have any other ideas for how to work
        // around this issue.
        
        // THIS ISSUE ISN'T HAPPENING ANYMORE. I DON'T KNOW WHY. WHEN THE INNER ELEMENT IS CLICKED, THIS IS NO
        // LONGER FIRING AGAIN FOR THE OUTER ELEMENT.
        // Leaving the code for now in case the issue resurfaces. For now, ignore everything but going to the new URL.

        // If the last time this was called was from an inner element, and now we're processing the outer element,
        // don't run.
        //if ($rootScope.lastElementWasInner && !calledFromInnerElement) {
        //    // Basically, if an inner element just fired, don't run the outer element as well.
        //    $rootScope.lastElementWasInner = calledFromInnerElement;
        //    return;
        //}
        //$rootScope.lastElementWasInner = calledFromInnerElement;

        $location.path(path);

        // stopPropagation was here.
    };

    $rootScope.$on('$routeChangeSuccess', function (ev, data) {
        // When the route changes, set activeController variable to the actual active controller.
        // This allows the NavBar stylings to be correct on index.html.
        if (data.$$route && data.$$route.controller) {
            $rootScope.activeController = data.$$route.controller;
        }
    });

    $rootScope.tabs = [];

    loadSeason($http, $rootScope, 'Ohio Tennis League');
    // ToDo: Really need to figure out a better way. Divisions won't always be called East and West and
    //       we won't always have two divisions.
    // Note: Loading this in app.run because multiple pages need it (schedule and player).
    loadSchedule($http, $rootScope, 'East');
    loadSchedule($http, $rootScope, 'West');

    $rootScope.changeSeason = function () {
        showSeasonModal.show();
    }
});

// ---------------------------------------------------------------------------------------------------

function loadSeason(http, rootScope, leagueName) {
    // Get the season the user last viewed. If none, get the default season.
    rootScope.seasonName = '2016 Summer Fall'; // default
    if (localStorage.getItem('seasonName')) {
        rootScope.seasonName = localStorage.getItem('seasonName');
    }
}

// ---------------------------------------------------------------------------------------------------

function loadSchedule(http, rootScope, divisionName) {
    // ToDo: Get URL params from somewhere. Maybe only need division.
    var config = {
        url: rootWebApiUrl + '/api/schedule/getSchedule/'
            + '?divisionName=' + divisionName
            + '&seasonName=2016 Summer Fall'
            + '&leagueName=Ohio Tennis League',
        method: 'GET'
    };

    http(config)
        .then(function (response) {
            // ToDo: Pass the actual schedule object into this method. Then we can set it and also use
            //       its name in the query above.
            var schedule = angular.fromJson(response.data);
            trimPlayerNames(schedule);
            if (divisionName == 'East') {
                rootScope.eastSchedule = schedule;                
            }
            else {
                rootScope.westSchedule = schedule;
            }
        }, function (response) {
            console.log('err: ', response);
            showInfoModal.show(response.statusText, response.data);
        });
}

function trimPlayerNames(schedule) {
    for (var i = 0; i < schedule.Matches.length; i++) {
        schedule.Matches[i].HomePlayer = convertToFirstInitialAndLastName(schedule.Matches[i].HomePlayer);
        schedule.Matches[i].AwayPlayer = convertToFirstInitialAndLastName(schedule.Matches[i].AwayPlayer);
        schedule.Matches[i].Winner = convertToFirstInitialAndLastName(schedule.Matches[i].Winner);
    }
}

function convertToFirstInitialAndLastName(firstAndLastName) {
    if (!firstAndLastName) {
        return '';
    }
    var firstInitial = firstAndLastName.substring(0, 1);
    var spaceIndex = firstAndLastName.indexOf(' ');
    var lastName = firstAndLastName.substring(spaceIndex + 1, firstAndLastName.length);

    return firstInitial + ' ' + lastName;
}

// --------------------------------------------------------------------------------------------------------------

app.factory('standingsRepository', ['$http', '$rootScope', function ($http, $rootScope) {
    var state = {
        standingsEast: [],
        standingsWest: [],
        selectedStandings: [],
        selectedDivision: 1
    }

    return state;
}]);

// --------------------------------------------------------------------------------------------------------------

app.factory('scheduleRepository', ['$http', '$rootScope', function ($http, $rootScope) {
    var state = {
        eastSchedule: [],
        westSchedule: [],
        selectedSchedule: [],
        selectedDivision: 1
    }

    return state;
}]);

// --------------------------------------------------------------------------------------------------------------

app.factory('playerRepository', ['$http', '$rootScope', function ($http, $rootScope) {
    var state = {
        player: null
    }

    return state;
}]);

// --------------------------------------------------------------------------------------------------------------

app.factory('showTextEntryModal', ['$http', '$rootScope', '$uibModal', function ($http, $rootScope, $uibModal) {
    return {
        show: function (modalTitle, callback) {
            $rootScope.disableScanBecauseModal = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/textEntryModal.html',
                controller: 'textEntryController',
                size: 'sm',
                windowClass: 'app-modal-window',
                resolve: {
                    modalTitle: function () {
                        return modalTitle;
                    }
                }
            });

            modalInstance.result.then(function (text) {
                try {
                    callback(text);
                }
                finally {
                    var millisecondsToWait = 500;
                    setTimeout(function () {
                        $rootScope.disableScanBecauseModal = false;
                    }, millisecondsToWait);  // Wait briefly to allow the callback to happen and not the scan.
                }
            }, function () {
                $rootScope.disableScanBecauseModal = false;
                // modal dismissed
            });
        }
    }
}]);

// --------------------------------------------------------------------------------------------------------------

app.factory('showInfoModal', ['$http', '$rootScope', '$uibModal', function ($http, $rootScope, $uibModal) {
    return {
        show: function (title, message) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/infoModal.html',
                controller: 'infoController',
                size: 'sm',
                windowClass: 'app-modal-window',
                resolve: {
                    title: function () {
                        return title;
                    },
                    message: function () {
                        return message;
                    }
                }
            });
        }
    }
}]);

// --------------------------------------------------------------------------------------------------------------

app.factory('showSeasonModal', ['$http', '$rootScope', '$uibModal', function ($http, $rootScope, $uibModal) {
    return {
        show: function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/seasonModal.html',
                controller: 'seasonController',
                size: 'sm',
                windowClass: 'app-modal-window'
            });
        }
    }
}]);

// --------------------------------------------------------------------------------------------------------------

app.factory('showConfirmationModal', ['$http', '$rootScope', '$uibModal', function ($http, $rootScope, $uibModal) {
    return {
        show: function (question, callback) {
            $rootScope.disableScanBecauseModal = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/confirmationModal.html',
                controller: 'confirmationController',
                size: 'sm',
                windowClass: 'app-modal-window',
                resolve: {
                    question: function () {
                        return question;
                    }
                }
            });

            modalInstance.result.then(function (confirmed) {
                try {
                    callback(confirmed);
                }
                finally {
                    $rootScope.disableScanBecauseModal = false;
                }
            }, function () {
                $rootScope.disableScanBecauseModal = false;
                callback();
            });
        }
    }
}]);

// --------------------------------------------------------------------------------------------------------------

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/standings/:division', { templateUrl: 'partials/standings.html', controller: 'standingsController' });
    $routeProvider.when('/schedule', { templateUrl: 'partials/schedule.html', controller: 'scheduleController' });
    $routeProvider.when('/rules', { templateUrl: 'partials/rules.html', controller: 'rulesController' });
    $routeProvider.when('/player/:playerId/:remove?', { templateUrl: 'partials/player.html', controller: 'playerController' });
    $routeProvider.otherwise({ redirectTo: '/standings/1' });
}]);
