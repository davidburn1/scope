var app = angular.module('myApp', ['graphPlotter']);


app.controller('scopeController', function($scope, $location, $http) {
	$scope.url = 'ws://192.168.0.6:81/'
	$scope.lastDataTime = 0;
	
	$scope.connect = function(){
		console.log("connecting to " + $scope.url)
		$scope.ws = new WebSocket($scope.url); 
		console.log("after connection");
		$scope.ws.binaryType = 'arraybuffer';
	}
	$scope.connect();
	
	$scope.ws.onmessage = function(evt){
		if (evt.data.length === undefined){ //then it is the array buffer
			let int16View = new Int16Array(evt.data);
			$scope.lastDataTime = Date.now();
			if ($scope.runMode == 1) {
				$scope.data = int16View;
			}
		} else{
			$scope.settings = JSON.parse(evt.data)
			//console.log($scope.settings);
		}
		$scope.$applyAsync();
	}
	

	
	
	$scope.status = 0;
	
	
	$scope.data = Array();

	$scope.settings = {};
	$scope.settings['sampleRate'] ;
	$scope.settings['memoryDepth'] ;
	$scope.settings['timePerBit'] ;
	$scope.settings['voltsPerBit'] ;
	
	$scope.runMode=1;
	
	$scope.sampleRateOptions = Array();
	$scope.sampleRateOptions.push([0, "1 us/S", 1e-6]);
	$scope.sampleRateOptions.push([1, "2 us/S", 2e-6]);
	$scope.sampleRateOptions.push([2, "10 us/S", 10e-6]);
	$scope.sampleRateOptions.push([3, "20 us/S", 20e-6]);
	$scope.sampleRateOptions.push([4, "100 us/S", 100e-6]);
	$scope.sampleRateOptions.push([5, "200 us/S", 200e-6]);
	
	$scope.memoryDepthOptions = Array();
	$scope.memoryDepthOptions.push([512, 512]);
	$scope.memoryDepthOptions.push([1024, 1024]);
	$scope.memoryDepthOptions.push([2048, 2048]);

			
	
	$scope.$watch("settings", function() {
		console.log("watch settings");
		if ($scope.status == 1) {
			$scope.ws.send(JSON.stringify($scope.settings)); 
		}
	}, true);
	

	
	
	
	
	var tick = function() {
		if ((Date.now() - $scope.lastDataTime) < 1000) {
			$scope.status = 1;
		} else {
			$scope.status = 0;
		}
		$scope.$applyAsync();
	}
	setInterval(tick, 1000);
});







app.filter('formatSeconds', function () {
  return function (seconds) {
	if (seconds > 60) {
		return Math.ceil(seconds/60) + " minutes";
	} else {
		return "1 minute";
	} 
  };
});

			
			