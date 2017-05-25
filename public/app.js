var app = angular.module('App', ['ngRoute']);

if(window.location.origin == "http://localhost:8000") {
  URL = 'http://localhost:3000';
} else {
  URL = "https://courseweb-api.herokuapp.com";
}

app.controller('loginController', ['$http', '$location', function($http, $location) {
  this.userPass = {};
  this.student = {};
  this.students = {};

  this.login = function(userPass) {
    $http({
      method: 'POST',
      url: URL + '/students/login',
      data: { student: { username: userPass.username, password: userPass.password }}
    }).then(function(response) {
      if (response.data.status == 200) {
        this.student = response.data.student;
        localStorage.setItem('token', JSON.stringify(response.data.token));
        localStorage.setItem('user', JSON.stringify(response.data.student));
        $location.path('/home');
      } else {
        console.log("Incorrect username or password");
      }
    }.bind(this));
  }

  this.logout = function() {
    localStorage.clear('token');
    localStorage.clear('user');
    $location.path('/');
    // location.reload();
  }

  this.getUsers = function() {
    $http({
      method: 'GET',
      url: URL + '/students',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.data.status == 401) {
        this.error = "Unauthorized";
      } else {
        this.error = null;
        this.students = response.data;
      }
    }.bind(this));
  }

}]);

app.controller('homeController', ['$http', '$location', function($http, $location) {

}]);

app.controller('scheduleController', ['$http', '$location', function($http, $location) {
  this.student = JSON.parse(localStorage.getItem('user'));
  this.schedule = {};
  this.terms = {};

  this.getTerms = function() {
    $http({
      method: 'GET',
      url: URL + '/terms'
    }).then(function(response) {
      if (response.status == 200) {
        this.terms = response.data;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  this.getSchedule = function(term) {
    $http({
      method: 'GET',
      url: URL + '/students/' + this.student.id + '/terms/' + term + '/courses',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.schedule = response.data;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  // Calls done on page load
  this.getTerms();

}]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) { //.config just runs once on load
    $locationProvider.html5Mode({ enabled: true }); // tell angular to use push state
    $routeProvider
    .when("/", {
        templateUrl : "partials/login.htm"
    })
    .when("/home", {
      templateUrl : "partials/home.htm"
    })
    .when("/schedule", {
      templateUrl : "partials/schedule.htm"
    });
}]);
