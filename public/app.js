var app = angular.module('App', ['ngRoute']);

URL = 'http://localhost:3000';

app.controller('loginController', ['$http', '$location', function($http, $location) {
  this.userPass = {};
  this.student = {};
  this.students = {};

  this.login = function(userPass) {
    $http({
      method: 'POST',
      url: URL + '/students/login',
      data: { student: { username: userPass.username, password: userPass.password }}
    }).then(function(response, error) {
      if (response.data.status == 200) {
        this.student = response.data.student;
        localStorage.setItem('token', JSON.stringify(response.data.token));
        $location.path('/home');
      } else {
        console.log("Incorrect username or password");
      }
    }.bind(this));
  }

  this.logout = function() {
    localStorage.clear('token');
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

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) { //.config just runs once on load
    $locationProvider.html5Mode({ enabled: true }); // tell angular to use push state
    $routeProvider
    .when("/", {
        templateUrl : "partials/login.htm"
    })
    .when("/home", {
      templateUrl : "partials/home.htm"
    });
}]);
