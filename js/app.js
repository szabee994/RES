var app = angular.module('ResApp', ['ngCookies']);
app.controller('ResController', function($scope,$http,$interval,$rootScope,$cookies) {
    $scope.addView = false;
    $scope.mapView = true;
    $scope.token = $cookies.get('token');
    $scope.loggedin = false;
    $scope.userdata = [];
    $scope.markers = [];
    $scope.categories = [];
    $scope.types = [];
    $scope.report = {"login": "", "register": ""};
    $scope.login = {email: "", pass: ""};
    $scope.register = {email: "", pass: "", pass2: "", lname: "", fname: ""};
    $scope.ad_holder = {};
    $scope.filter = {
        user: "",
        search: "",
        price_low: "",
        price_high: "",
        area_house_low: "",
        area_house_high: "",
        area_lot_low: "",
        area_lot_high: "",
        location_coords_lat: "",
        location_coords_lng: "",
        location_radius: "",
        type: "",
        category_id: "",
        date_low: "",
        date_high: "",
        order: ""
    };
    $scope.getNumber = function (num) {
        return new Array(num);
    };

    $scope.getFilters = function () {
        $http({
            method: 'POST',
            url: 'http://192.168.29.55/index.php?get=filters',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: ''
        }).then(function successCallback(response) {
            $scope.categories = response.data.categories;
            $scope.types = response.data.types;
        }, function errorCallback(response) {
        });
    };

    $scope.getUserData = function(id){
        $http({
            method: 'POST',
            url: 'http://192.168.29.55/index.php?get=user&id='+id+'&token='+$scope.token,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: ''
        }).then(function successCallback(response) {
            if(response.data.toString() != "ERROR"){
                $scope.userdata = response.data;
                console.log(response.data);
                $scope.loggedin = true;
            }
        }, function errorCallback(response) {
        });
    };

    $scope.getLogin = function () {
        $http({
            method: 'POST',
            url: 'http://192.168.29.55/secure.php?getlogin='+$scope.token,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: ''
        }).then(function successCallback(response) {
            if(response.data.toString() != "ERROR"){
                $scope.getUserData(response.data.toString());
            }
        }, function errorCallback(response) {
        });
    };

    $scope.login = function () {
        var jsondata = $.param({email: $scope.login['email'], pass: $scope.login['pass']});
        $http({
            method: 'POST',
            url: 'http://192.168.29.55/secure.php?login',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: jsondata
        }).then(function successCallback(response) {
            $scope.report["login"] = response.data;
            if(response.data.toString() != "ERROR"){
                console.log(response.data);
                $('#login-modal').modal('hide');
                $cookies.put('token',response.data.toString());
                $scope.token = response.data;
                $scope.getLogin()
            }
        }, function errorCallback(response) {
        });
    };
    $scope.register = function () {
        var jsondata = $.param({
            email: $scope.register['email'],
            pass: $scope.register['pass'],
            pass2: $scope.register['pass2'],
            lname: $scope.register['lname'],
            fname: $scope.register['fname'],
            phone: $scope.register['phone']
        });
        $http({
            method: 'POST',
            url: 'http://192.168.29.55/secure.php?register',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: jsondata
        }).then(function successCallback(response) {
            $scope.report["register"] = response.data;
        }, function errorCallback(response) {
        });
    };

  $scope.add = function() {
    console.log("add triggered");
    $scope.addView = true;
  };

    $scope.addMarker = function (location, title, image) {

        var myOptions = {
            content: title
            , disableAutoPan: false
            , maxWidth: 0
            , pixelOffset: new google.maps.Size(-140, 0)
            , zIndex: null
            , boxStyle: {
                background: "#FFF no-repeat"
                , opacity: 1
                , width: "400px"
                , height: "300px"
            }
            , closeBoxMargin: "2px 2px 2px 2px"
            , closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
            , infoBoxClearance: new google.maps.Size(1, 1)
            , isHidden: false
            , pane: "floatPane"
            , boxClass: "infoBox"
            , enableEventPropagation: false
        };

        var ib = new InfoBox(myOptions);

        var pinIcon = new google.maps.MarkerImage(
            image,
            null, /* size is determined at runtime */
            null, /* origin is 0,0 */
            null, /* anchor is bottom center of the scaled image */
            new google.maps.Size(32, 32)
        );

        var marker = new google.maps.Marker({
            position: location,
            map: $scope.map,
            icon: pinIcon
        });

        marker.addListener('click', function () {
            ib.open($scope.map, marker);
        });
        $scope.markers.push(marker);
    };

    $scope.clearOutOfBounds = function () {

        for (var i = 0; i < $scope.markers.length; i++) {
            var latlng = $scope.markers[i].getPosition();
            if (!($scope.map.getBounds().contains(latlng))) {
                $scope.markers[i].setMap(null);
            }
        }
        for (var i = 0; i < $scope.markers.length; i++) {
            if ($scope.markers[i].getMap() == null) {
                $scope.markers.splice(i, 1);
            }
        }
    };

    $scope.fillView = function () {
        $scope.dataurl = 'http://192.168.29.55/index.php?get=ads&boundsnelat=' + $scope.map.getBounds().getNorthEast().lat() + '&boundsnelng=' + $scope.map.getBounds().getNorthEast().lng() + '&boundsswlat=' + $scope.map.getBounds().getSouthWest().lat() + '&boundsswlng=' + $scope.map.getBounds().getSouthWest().lng();
        $scope.loadAds();
    };

    $scope.initMap = function () {
        $scope.myLatLng = {lat: 46.1005, lng: 19.6651};
        $scope.map = new google.maps.Map(document.getElementById('mapView'), {
            zoom: 16,
            center: $scope.myLatLng
        });
        //$scope.map.addListener('bounds_changed', $.debounce(750, $scope.fillView));
    };


    $scope.dataurl = 'http://192.168.29.55/index.php?get=ads';
    if ($scope.mapView) {
        $scope.initMap();
    }

    $scope.loadAds = function () {
        if ($scope.mapView) {
            for (var i = 0; i < $scope.markers.length; i++) {
                $scope.markers[i].setMap(null);
            }
            $scope.markers = [];
        }
        var temp_datas = $scope.filter;
        var jsondata = 'filters=' + JSON.stringify(temp_datas);

        $http({
            method: 'POST',
            url: $scope.dataurl,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: jsondata
        }).then(function successCallback(response) {
            $scope.ad_holder = response.data;
            if ($scope.mapView) {
                $.each(response.data, function (i, item) {
                    var latlng = {lat: parseFloat(item.location_coords_lat), lng: parseFloat(item.location_coords_lng)};
                    prefix = "";
                    $.each($scope.types, function (i, typeel) {
                        if (typeel.id == item.type) {
                            prefix = typeel.color;
                        }
                    });
                    var content = '<div class="row" >' +
                        '<div class="col-lg-12">' +
                        '<div class="panel panel-default ad">' +
                        '<div class="panel-body nomap">' +
                        '<div class="thumbnail">' +
                        '<div class="caption">' +
                        '<h3 class="a-header">' + item.name + '</h3>' +
                        '</div>' +
                        '<div class="image-product" style="background-image: url(img/thumbnails/' + item.picture + ')">' +
                        '</div>' +
                        '</div>' +
                        '<div class="a-body">' +
                        '<div class="row">' +
                        '<div class="col-lg-8">' +
                        '<h3><strong>'+item.price+'&euro;</strong></h3>' +
                        '<h4>'+item.location_address+'</h4>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<h5 class="panel-footer">' + item.category +
                        '<a class="pull-right" role="button" onClick="forwardSelectProduct(\''+item.id+'\')">Details<span class="glyphicon glyphicon-chevron-right"></span></a>' +
                        '</h5>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    $scope.addMarker(latlng, content, 'http://192.168.29.55/RES/img/icons/' + prefix + '-' + item.category_icon);
                });
            }
        }, function errorCallback(response) {
        });
    };
    $scope.getFilters();
    $scope.loadAds();
    $scope.getLogin();
    $interval(function () {
        $scope.loadAds();
    }, 300000);

    $scope.selectProduct = function (id) {
        $rootScope.$broadcast('selectProduct', id);
        $scope.mapView = false;
    };

});

app.controller("AdController", function($scope,$http,$interval,$rootScope){
  $scope.shown = false;
  $scope.productData = [];
  $scope.$on("selectProduct",function(event,id) {
        if(id == 0) {
          $scope.shown = true;
          $scope.addView = true;
        } else {
          $scope.addView = false;
          $scope.id = id;
          $http({
            method: 'POST',
            url: 'http://192.168.29.55/index.php?get=ad&id=' + $scope.id,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: ''
          }).then(function successCallback(response) {
            $scope.productData = response.data;
            $scope.shown = true;
            $scope.initMap();
          }, function errorCallback(response) {

          });
        }
  });

  $scope.addMarker = function(location) {
    $scope.infowindow = new google.maps.InfoWindow({
      content: 'Ad title, price, address, picture'
    });

    $scope.marker = new google.maps.Marker({
      position: location,
      map: $scope.map
    });

    $scope.marker.addListener('click', function () {
      $scope.infowindow.open($scope.map, $scope.marker);
    });
  };

  $scope.initMap = function(){
    $scope.myLatLng = {lat: parseFloat($scope.productData.location_coords_lat), lng: parseFloat($scope.productData.location_coords_lng)};
    $scope.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: $scope.myLatLng
    });
    $scope.addMarker($scope.myLatLng);
  };

  // -------------- CHAT---------------------
  $scope.openChat = function(userId, userId2, adId) {
    $scope.getMessages = function () {
      $rootScope.$broadcast('getMessages', userId, userId2, adId);
    };

    $scope.getMessages();
  };
  // ----------------------------------------
});

app.controller("ChatController", function($scope, $http, $interval, $rootScope){
  $scope.chatData = {};
  $scope.dataurl = 'http://192.168.29.55/index.php?';
  var chatPull = null;

  $scope.$on("getMessages", function(event, userId, userId2, adId) {
    $scope.pull(userId, userId2, adId);
    chatPull = $interval(function () {
       $scope.pull(userId, userId2, adId);
    }, 5500);
  });

  $scope.pull = function(userId, userId2, adId) {
    $scope.chatOpened = true;
    var to = null;

    $scope.filter={between: userId + "," + userId2};
    var temp_datas = $scope.filter;
    var jsondata = 'filters='+JSON.stringify(temp_datas);

    $http({
      method: 'POST',
      url: $scope.dataurl + "get=message",
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: jsondata
    }).then(function successCallback(response) {
      $scope.chatData = response.data;
      console.log($scope.chatData);
    }, function errorCallback(response) {
    });
  };

  $scope.send = function(userId, adId, message) {
    $scope.filter={recipient: userId, subject: adId, message: message};
    var temp_datas = $scope.filter;
    var jsondata = 'filters='+JSON.stringify(temp_datas);
    console.log(message);

    $http({
      method: 'POST',
      url: $scope.dataurl + "post=message",
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: jsondata
    }).then(function successCallback(response) {

    }, function errorCallback(response) {
    });
  };

  $scope.closeChat = function() {
    console.log("closing");
    $scope.chatOpened = false;
    $interval.cancel(chatPull);
  };

  $scope.chatSend = function($event){
    var keyCode = $event.which || $event.keyCode;
    if (keyCode === 13) {
      $scope.send("7dc095870be6f3aaa854e0e46de26a61", "Subotica_valahol_valami_09321dfsis4783fjdsnkf", $scope.chatMessage);
      console.log("entar, messzidzs: " + $scope.chatMessage);
      $scope.chatMessage = null;
    }
  };
});