var app = angular.module('ResApp', []);
app.controller('ResController', function($scope,$http,$interval,$rootScope) {
  $scope.addView = false;
  $scope.mapView = false;
  $scope.markers=[];
  $scope.report={"login":"","register":""};
  $scope.login={email:"",pass:""};
  $scope.register={email:"",pass:"",pass2:"",lname:"",fname:""};
  $scope.ad_holder={};
  $scope.filter_datas={category:["Lakas","Haz","Lakokocsi"],type:["Elado","Kiado"]};
  $scope.filter={user:"",search:"",price_low:"",price_high:"",area_house_low:"",area_house_high:"",area_lot_low:"",area_lot_high:"",
  location_coords_lat:"",location_coords_lng:"",location_radius:"",type:"",category_id:"",
  date_low:"",date_high:"",order:""};
  $scope.getNumber = function(num) {
    return new Array(num);
  };
  $scope.login=function(){
    var jsondata=$.param({email:$scope.login['email'],pass:$scope.login['pass']});
    $http({
      method: 'POST',
      url: 'http://192.168.29.55/secure.php?login',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data:jsondata
    }).then(function successCallback(response) {
      $scope.report["login"]=response.data;
      }, function errorCallback(response) {
      });
  };
  $scope.register=function(){
    var jsondata=$.param({email:$scope.register['email'],pass:$scope.register['pass'],pass2:$scope.register['pass2'],lname:$scope.register['lname'],fname:$scope.register['fname'],phone:$scope.register['phone']});
    $http({
      method: 'POST',
      url: 'http://192.168.29.55/secure.php?register',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data:jsondata
    }).then(function successCallback(response) {
      $scope.report["register"]=response.data;
      }, function errorCallback(response) {
      });
  };

  $scope.add = function() {
    console.log("add triggered");
    $scope.addView = true;
  };

  $scope.addMarker = function(location,title,image) {
    var infowindow = new google.maps.InfoWindow({
      content: title
    });

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
      infowindow.open($scope.map,marker);
    });
    $scope.markers.push(marker);
  };

  $scope.clearOutOfBounds = function(){

	for(var i = 0; i < $scope.markers.length; i++){
		var latlng = $scope.markers[i].getPosition();
		if(!($scope.map.getBounds().contains(latlng))){
			$scope.markers[i].setMap(null);
		}
	}
	for(var i = 0; i < $scope.markers.length; i++){
		if($scope.markers[i].getMap() == null){
			$scope.markers.splice(i,1);
		}
	}
  };

  $scope.fillView = function(){
        for (var i = 0; i < $scope.markers.length; i++) {
          $scope.markers[i].setMap(null);
        }
        $scope.markers = [];
        $scope.dataurl = 'http://192.168.29.55/index.php?get=ads&boundsnelat='+$scope.map.getBounds().getNorthEast().lat()+'&boundsnelng='+$scope.map.getBounds().getNorthEast().lng()+'&boundsswlat='+$scope.map.getBounds().getSouthWest().lat()+'&boundsswlng='+$scope.map.getBounds().getSouthWest().lng();
        $scope.loadAds();
    };

  $scope.initMap = function(){
    $scope.myLatLng = {lat: 46.1005, lng: 19.6651};
    $scope.map = new google.maps.Map(document.getElementById('mapView'), {
      zoom: 16,
      center: $scope.myLatLng
    });
    $scope.map.addListener('bounds_changed',$.debounce(750,$scope.fillView));
  };


  $scope.dataurl = 'http://192.168.29.55/index.php?get=ads';
  if($scope.mapView){
    $scope.initMap();
  }

  $scope.loadAds=function(){
    var temp_datas=$scope.filter;
    var jsondata = 'filters='+JSON.stringify(temp_datas);

     $http({
       method: 'POST',
       url: $scope.dataurl,
       headers: {'Content-Type': 'application/x-www-form-urlencoded'},
       data:jsondata
     }).then(function successCallback(response) {
       $scope.ad_holder=response.data;
       if($scope.mapView){
         $.each(response.data, function(i,item){
          var latlng = {lat: parseFloat(item.location_coords_lat), lng: parseFloat(item.location_coords_lng)};
           prefix = "";
           switch (item.type){
             case '1': prefix = "sale-"; break;
             case '2': prefix = "rent-"; break;
             default: prefix = "";
           }
           $scope.addMarker(latlng,item.name,'http://192.168.29.55/RES/img/icons/'+prefix+item.category_icon);
         });
       }
       }, function errorCallback(response) {
       });
  };
  $scope.loadAds();
  $interval(function() {$scope.loadAds();
  }, 300000);

  $scope.selectProduct=function(id){
      $rootScope.$broadcast('selectProduct', id);
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
  $scope.openChat = function() {
    console.log("openchat");
    // -------------- CHAT---------------------
    $interval(function () {
      $scope.getMessages();
    }, 1500);

    $scope.getMessages = function (userId, adId) {
      $rootScope.$broadcast('getMessages', userId, adId);
    };
    // ----------------------------------------
  };

});

app.controller("ChatController", function($scope,$http,$interval,$rootScope){
  $scope.chatData = [];
  $scope.dataurl = 'http://192.168.29.55/index.php?get=message';

  $scope.$on("getMessages", function(event, userId, adId) {
    $scope.filter={sender:"7dc095870be6f3aaa854e0e46de26a61"};
    var temp_datas = $scope.filter;
    var jsondata = 'filters='+JSON.stringify(temp_datas);

    $http({
      method: 'POST',
      url: $scope.dataurl,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: jsondata
    }).then(function successCallback(response) {
      console.log(response.data);
      console.log(userId);
      console.log(adId);
    }, function errorCallback(response) {
    });
  });
});