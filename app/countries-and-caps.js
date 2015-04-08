angular.module('thinkfulCountriesAndCaps', ['ngRoute', 'ngAnimate'])
	
	.factory('GeneralCountryDataService', function($http){
		return function() {
			return $http({
				url: "http://api.geonames.org/countryInfoJSON?username=mcfink",
				method: 'JSONP',
				params: {callback: 'JSON_CALLBACK'}
			});
		}
	})

	.factory('ActiveCodeService', function(){
		return{
			data: {
				countryCode: ""
			}
		}
	})

	.factory('AllCountryCodeService', function(){
		return{
			data: {

			}
		}
	})

	.factory('DetailCountryService', function($http, $q){
		
		return function(countryCode) {
			return $http({
				url: "http://api.geonames.org/countryInfoJSON?username=mcfink",
				method: 'JSONP',
				params: {
					callback: 'JSON_CALLBACK',
					country: countryCode
				}
			});
		}
	})

	.factory('CapitalInfoService', function($http){

		return function(capitalName, countryCode){
			code = angular.lowercase(countryCode);
			capital = angular.lowercase(capitalName);
			return $http({
				url: "http://api.geonames.org/searchJSON?q=" + capital + "&country=" + code + "&maxRows=10&username=mcfink",
				method: 'JSONP',
				params: {
					callback: 'JSON_CALLBACK'
				}
			})
		}
	})

	.factory('NeighborsService', function($http){
		return function(countryCode){
			return $http({
				url: "http://api.geonames.org/neighboursJSON?country=" + countryCode + "&username=mcfink",
				method: 'JSONP',
				params: {
					callback: 'JSON_CALLBACK'
				}
			})
		}
	})

	.controller('countriesController', ['$location', '$scope', 'GeneralCountryDataService', 'ActiveCodeService', 'AllCountryCodeService', function($location, $scope, GeneralCountryDataService, ActiveCodeService, AllCountryCodeService){
		var countryData = [];
		GeneralCountryDataService().success(function(result){
			$scope.countryData = result.geonames;
			AllCountryCodeService.data = result.geonames;
			
		});

		$scope.goHome = function(){
			$location.path( '/' );
		}

		$scope.showCountry = function(country, countryCode){
			ActiveCodeService.data.countryCode = countryCode;
			$location.path( '/countries/' + country + "/capital");
		}
	}])

	.controller('detailController', ['$q', '$scope', '$route', 'DetailCountryService', 'ActiveCodeService', 'CapitalInfoService', 'NeighborsService', 'AllCountryCodeService', 'GeneralCountryDataService', function($q, $scope, $route, DetailCountryService, ActiveCodeService, CapitalInfoService, NeighborsService, AllCountryCodeService, GeneralCountryDataService) {

		if(ActiveCodeService.data.countryCode == ""){
				GeneralCountryDataService().success(function(result){
				$scope.countryData = result.geonames;
				AllCountryCodeService.data = result.geonames;
				console.log("GeneralCountryDataService was run successfully");
				
				findCode();
			}) 		
		} else {
			findCode();
		}

		$scope.detailCountry = $route.current.params.country;
		console.log($scope.detailCountry);

		
		function findCode(){
			for (var i=0; i<AllCountryCodeService.data.length; i++){
				if (AllCountryCodeService.data[i].countryName == $scope.detailCountry){
					ActiveCodeService.data.countryCode = AllCountryCodeService.data[i].countryCode;
				}
			};
			console.log('country code found: ' + ActiveCodeService.data.countryCode);	
		}

		
		DetailCountryService(ActiveCodeService.data.countryCode).success(function(result){
			$scope.detailData = result;
			$scope.countryName = $scope.detailData.geonames[0].countryName;
			$scope.population = $scope.detailData.geonames[0].population;
			$scope.area = $scope.detailData.geonames[0].areaInSqKm;
			$scope.capital = $scope.detailData.geonames[0].capital;
			$scope.uppercaseCode = angular.uppercase(ActiveCodeService.data.countryCode);
			$scope.lowercaseCode = angular.lowercase(ActiveCodeService.data.countryCode);

			CapitalInfoService($scope.capital, ActiveCodeService.data.countryCode).success(function(result){
				$scope.capitalPopulation = result.geonames[0].population;
			})

			NeighborsService(ActiveCodeService.data.countryCode).success(function(result){
				$scope.neighbours = result.geonames;
				console.log(result);
			})
		

		})	
		.error(function(){
			console.log("capital request failed");
		})
		
		

		
	}])

	.filter('continent', function(){
		return function(continentCode){
			switch(continentCode){
				case "NA":
					return "North America";
					break;
				case "EU":
					return "Europe";
					break;
				case "AS":
					return "Asia";
					break;
				case "AF":
					return "Africa";
					break;
				case "AN":
					return "Antarctica";
					break;
				case "SA":
					return "South America";
					break;
				case "OC":
					return "Oceania";
					break;
				default:
					return continentCode;
			};
		};
	})

	.config(['$routeProvider', function($routeProvider){
		$routeProvider.when('/', {
			templateUrl : 'home/home.html'
		})
		.when('/countries', {
			templateUrl : 'countries/countries.html',
			controller : 'countriesController'
		})
		.when('/countries/:country/capital', {
			templateUrl : 'countries/detail.html',
			controller : 'detailController'
		})
	}]);