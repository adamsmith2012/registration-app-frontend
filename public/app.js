var app = angular.module('App', ['ngRoute']);

if(window.location.origin == "http://localhost:8000") {
  URL = 'http://localhost:3000';
} else {
  URL = "https://courseweb-api.herokuapp.com";
}

app.controller('mainController', ['$http', '$location', function($http, $location) {

  this.student = {};

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
        console.log(this.student);
      } else {
        console.log("Incorrect username or password");
      }
    }.bind(this));
  }

  this.logout = function() {
    localStorage.clear('token');
    localStorage.clear('user');
    this.student = {};
    $location.path('/');
  }

}]);

app.controller('loginController', ['$http', '$location', function($http, $location) {

}]);

app.controller('homeController', ['$http', '$location', function($http, $location) {

}]);

app.controller('scheduleController', ['$http', '$location', function($http, $location) {
  this.student = JSON.parse(localStorage.getItem('user'));
  this.selectedTerm = null; // integer
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
      url: URL + '/students/' + this.student.id + '/terms/' + term.id + '/courses',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.selectedTerm = term;
        this.schedule = response.data;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  // Calls executed on page load
  this.getTerms();

}]);

app.controller('courseController', ['$http', '$location', '$routeParams', function($http, $location, $routeParams) {
  this.courseId = $routeParams.id;
  this.student = JSON.parse(localStorage.getItem('user'));
  this.course = {};

  this.getCourse = function() {
    $http({
      method: 'GET',
      url: URL + '/courses/' + this.courseId,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.course = response.data;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  // Calls executed on page load
  this.getCourse();

}]);

app.controller('coursesController', ['$http', '$location', function($http, $location) {

  this.terms = {};
  this.courses = {};

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

  this.getCourses = function(term) {
    $http({
      method: 'GET',
      url: URL + '/terms/' + term.id + '/courses',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.selectedTerm = term;
        this.courses = response.data;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  // Calls executed on page load
  this.getTerms();

}]);

app.controller('studentInfoController', ['$http', '$location', function($http, $location) {

  this.student = JSON.parse(localStorage.getItem('user'));
  this.editMode = false;

  this.editInfo = function() {
    $http({
      method: 'PUT',
      url: URL + '/students/' + this.student.id,
      data: this.student,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.student = response.data;
        console.log(this.student);
        localStorage.setItem('user', JSON.stringify(this.student));
        this.editMode = false;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

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
    })
    .when("/course/:id", {
      templateUrl : "partials/course.htm"
    })
    .when("/courses", {
      templateUrl : "partials/courses.htm"
    })
    .when("/student-info", {
      templateUrl : "partials/student-info.htm"
    })
    .otherwise({
      redirectTo : "/"
    }) ;
}]);
