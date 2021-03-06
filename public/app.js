var app = angular.module('App', ['ngRoute']);

if(window.location.origin == "http://localhost:8000") {
  URL = 'http://localhost:3000';
} else {
  URL = "https://courseweb-api.herokuapp.com";
}

/***** SERVICES *****/

app.service('registrationService', function() {
  var courses = JSON.parse(localStorage.getItem('courses'));
  if (!courses) {
    courses = {};
  }
  var addCourse = function(newCourse) {
    courses[newCourse.id] = newCourse;
    localStorage.setItem('courses', JSON.stringify(courses));
  };

  var getCourses = function() {
    return JSON.parse(localStorage.getItem('courses'));
  };

  var removeCourse = function(courseId) {
    delete courses[courseId];
    localStorage.setItem('courses', JSON.stringify(courses));
  }

  return {
    addCourse: addCourse,
    getCourses: getCourses,
    removeCourse: removeCourse
  };

});

/***** CONTROLLERS *****/

app.controller('mainController', ['$http', '$location', '$rootScope', function($http, $location, $rootScope) {

  $rootScope.$on("$routeChangeSuccess", function(args){
    var $navs = $('#nav-links').find($('li'));
    for (var i=0; i < $navs.length; i++) {
      var $li = $($navs[i]);
      var $a = $($li.find('a')[0]);
      $li.show();
      if ($location.path() == '/') {
        $li.hide();
      } else if ($a.attr('href') == $location.path()) {
        $li.addClass('active');
      } else {
        $li.removeClass('active');
      }
    }
  });

  this.student = JSON.parse(localStorage.getItem('user'));

  this.login = function(userPass) {
    $('#loginSpinner').show();
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
        $('#loginSpinner').hide();
        $('#usernameInput').addClass('has-error');
        $('#passwordInput').addClass('has-error');
        $('#loginFeedback').text(' Incorrect username or password');
      }
    }.bind(this));
  }

  this.logout = function() {
    localStorage.clear('token');
    localStorage.clear('user');
    localStorage.clear('courses');
    this.student = {};
    $location.path('/');
  }

}]);

app.controller('loginController', ['$http', '$location', function($http, $location) {
  if (JSON.parse(localStorage.getItem('user'))) {
    // no logged user, redirect to index
    $location.path("/home");
  }
}]);

app.controller('homeController', ['$http', '$location', function($http, $location) {

}]);

app.controller('scheduleController', ['$http', '$location', function($http, $location) {
  this.student = JSON.parse(localStorage.getItem('user'));
  this.selectedTerm = null; // integer
  this.schedule = {};
  this.terms = {};
  this.selectedTerm = { id: null };
  this.schToDrop = {};
  this.modalMessage = "";

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
        this.modalMessage = "Successfully dropped course!";
        $('#dropCourseModal').modal('hide');
        $('#feedbackModal').modal('show');
        this.getSchedule();
      } else {
        this.modalMessage = "Failed to drop course!";
        $('#dropCourseModal').modal('hide');
        $('#feedbackModal').modal('show');
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

app.controller('courseController', ['$http', '$location', '$routeParams', 'registrationService', function($http, $location, $routeParams, registrationService) {
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

  this.register = function(course) {
    $('#registerBtn').attr('disabled', true);
    registrationService.addCourse(course);
    this.modalMessage = "Course added to registration list.";
    $('#feedbackModal').modal('show');
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
        localStorage.setItem('user', JSON.stringify(this.student));
        this.editMode = false;
      } else {
        console.log("Failed");
      }
    }.bind(this));
  }

}]);

app.controller('registerController', ['$http', '$location', 'registrationService', function($http, $location, registrationService) {
  this.student = JSON.parse(localStorage.getItem('user'));
  this.courses = registrationService.getCourses();
  if (Object.keys(this.courses).length == 0) {
    this.courses = null;
  }
  this.register = function() {

    for (var key in this.courses) {
      var course_id = this.courses[key].id;
      let $responseText = $('#response' + course_id.toString());
      let $input = $('#input' + course_id.toString()); // set spinner
      $($input.find($('i'))[0]).addClass("fa fa-refresh fa-spin");
      $http({
        method: 'POST',
        url: URL + '/schedules',
        data: { student_id: this.student.id, course_id: course_id },
        headers: {
          'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token'))
        }
      }).then(function($input, $responseText, response) {
        $($input.find($('i'))[0]).removeClass(); // Remove all classes
        if (response.status == 201) {
          $input.addClass('has-success'); // set text green
          $($input.find($('i'))[0]).addClass("fa fa-check-square-o"); // Set check mark
        } else {
          $input.addClass('has-error'); // set text red
          $($input.find($('i'))[0]).addClass("fa fa-times"); // Set 'X' mark
        }
      }.bind(this, $input, $responseText));
    };

  }

  this.removeCourse = function(courseId) {
    registrationService.removeCourse(courseId);
    this.courses = registrationService.getCourses();
    if (Object.keys(this.courses).length == 0) {
      this.courses = null;
    }
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

/***** ROUTES *****/

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
}])
.run( function($rootScope, $location) {
    // from https://stackoverflow.com/questions/11541695/redirecting-to-a-certain-route-based-on-condition
    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      if (!JSON.parse(localStorage.getItem('user'))) {
        // no logged user, redirect to index
        $location.path("/");
      }
    });
 });
