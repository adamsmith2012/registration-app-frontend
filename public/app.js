var app = angular.module('App', ['ngRoute']);

if(window.location.origin == "http://localhost:8000") {
  URL = 'http://localhost:3000';
} else {
  URL = "https://courseweb-api.herokuapp.com";
}

app.controller('mainController', ['$http', '$location', function($http, $location) {

  this.student = JSON.parse(localStorage.getItem('user'));

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
        $('#usernameInput').addClass('has-error');
        $('#passwordInput').addClass('has-error');
        $('#loginFeedback').text(' Incorrect username or password');
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
  this.selectedTerm = { id: null };

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

  this.getSchedule = function() {
    $http({
      method: 'GET',
      url: URL + '/students/' + this.student.id + '/schedules/',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.schedule = response.data;
        console.log(this.schedule);
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  this.dropCourse = function(scheduleId) {
    $http({
      method: 'DELETE',
      url: URL + '/schedules/' + scheduleId,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 204) {
        console.log("Successfully dropped course");
        this.getSchedule();
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  this.filterSchedule = function(sch) {
    return sch.course.term_id == this.selectedTerm.id;
  }.bind(this)

  // Calls executed on page load
  this.getTerms();
  this.getSchedule();

}]);

app.controller('courseController', ['$http', '$location', '$routeParams', function($http, $location, $routeParams) {
  this.courseId = $routeParams.id;
  this.student = JSON.parse(localStorage.getItem('user'));
  this.course = {};
  this.modalMessage = "";

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

  this.register = function(courseId) {
    $('#registerBtn').attr('disabled', true);
    $http({
      method: 'POST',
      url: URL + '/schedules',
      data: { student_id: this.student.id, course_id: courseId },
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 201) {
        this.modalMessage = "Successfully Registered!";
        $('#feedbackModal').modal('show');
      } else if (response.status == 202) {
        this.modalMessage = "Course is full!";
        $('#feedbackModal').modal('show');
      } else {
        this.modalMessage = "Failed to Register!";
        $('#feedbackModal').modal('show');
        $('#registerBtn').attr('disabled', false);
      }
    }.bind(this));
  }

  // Calls executed on page load
  this.getCourse();

}]);

app.controller('coursesController', ['$http', '$location', function($http, $location) {

  this.terms = {};
  this.departments = {};
  this.courses = {};
  this.selectedDep = {};
  this.selectedTerm = {};

  this.getDepartments = function() {
    $http({
      method: 'GET',
      url: URL + '/departments'
    }).then(function(response) {
      if (response.status == 200) {
        this.departments = response.data;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

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
      url: URL + '/courses',
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.courses = response.data;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  this.filterCourses = function(course) {
    return course.department_id == this.selectedDep.id && course.term_id == this.selectedTerm.id;
  }.bind(this);

  this.changeText = function(elem, text) {
    $('#' + elem).text(text);
  }

  // Calls executed on page load
  this.getDepartments();
  this.getTerms();
  this.getCourses();

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

app.controller('registerController', ['$http', '$location', function($http, $location) {
  this.student = JSON.parse(localStorage.getItem('user'));
  this.crns = [null];

  this.addCRN = function() {
    this.crns.push(null);
    console.log(this.crns);
  }

  this.register = function() {

    this.crns.forEach(function(crn) {
      var course_id = crn;
      $http({
        method: 'POST',
        url: URL + '/schedules',
        data: { student_id: this.student.id, course_id: course_id },
        headers: {
          'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
        }
      }).then(function(response) {
        if (response.status == 201) {
          console.log("Registered!");
        } else {
          console.log("Failed");
        }
      }.bind(this));
    }.bind(this));

  }

}]);

app.controller('buildingController', ['$http', '$location', '$routeParams', function($http, $location, $routeParams) {
  this.buildingId = $routeParams.id;
  this.building = {};

  this.getBuilding = function(term) {
    $http({
      method: 'GET',
      url: URL + '/buildings/' + this.buildingId,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.building = response.data;
        console.log(this.building);
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  // Calls executed on page load
  this.getBuilding();

}]);

app.controller('instructorController', ['$http', '$location', '$routeParams', function($http, $location, $routeParams) {
  this.instructorId = $routeParams.id;

  this.getInstructor = function() {
    $http({
      method: 'GET',
      url: URL + '/instructors/' + this.instructorId,
      headers: {
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      }
    }).then(function(response) {
      if (response.status == 200) {
        this.instructor = response.data;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

  // Calls executed on page load
  this.getInstructor();

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
    .when("/register", {
      templateUrl : "partials/register.htm"
    })
    .when("/building/:id", {
      templateUrl : "partials/building.htm"
    })
    .when("/instructor/:id", {
      templateUrl : "partials/instructor.htm"
    })
    .otherwise({
      redirectTo : "/"
    }) ;
}]);
