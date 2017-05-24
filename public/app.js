var app = angular.module('App', []);

app.controller('mainController', ['$http', function($http) {
  this.url = 'http://localhost:3000';
  this.userPass = {};
  this.student = {};
  this.students = {};

  this.login = function(userPass) {
    $http({
      method: 'POST',
      url: this.url + '/students/login',
      data: { student: { username: userPass.username, password: userPass.password }}
    }).then(function(response) {
      this.student = response.data.student;
      localStorage.setItem('token', JSON.stringify(response.data.token));
    }.bind(this));
  }

  this.logout = function() {
    localStorage.clear('token');
    location.reload();
  }

  this.getUsers = function() {
    $http({
      method: 'GET',
      url: this.url + '/students',
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
