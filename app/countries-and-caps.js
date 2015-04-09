angular.module('thinkfulCountriesAndCaps', ['ngRoute', 'ngAnimate'])
	
	.run(function($rootScope, $location, $timeout){
		$rootScope.$on('$routeChangeStart', function(){
			$rootScope.isLoading = true;
		});
		$rootScope.$on('$routeChangeSuccess', function(){
			$timeout(function() {
				$rootScope.isLoading = false;
			}, 1000);
		});
	})

	.factory('GeneralCountryDataService', function($http, $q){
		var countryData = [];

		function LoadCountriesData(){
			var defer = $q.defer();
			$http({
				url: "http://api.geonames.org/countryInfoJSON?username=mcfink",
				method: 'JSONP',
				params: {callback: 'JSON_CALLBACK'}
			}).success(function(result){
				countryData = result.geonames;
				defer.resolve();
			});
		return defer.promise;
		}

		
		return{
			load: LoadCountriesData,
			list: function(){
				return countryData;
			},
			findCountryCode: 
				function(countryName){
				for (var i = 0; i < countryData.length; i++){
					if(countryData[i].countryName == countryName){
						return countryData[i].countryCode;
					};
				};
			}
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
		
		$scope.countryData = GeneralCountryDataService.list();
		console.log($scope.countryData);
			

		$scope.goHome = function(){
			$location.path( '/' );
		}

		$scope.showCountry = function(country){
			$location.path( '/countries/' + country + "/capital");
		}
	}])

	.controller('detailController', ['$q', '$scope', '$route', '$location', 'DetailCountryService', 'ActiveCodeService', 'CapitalInfoService', 'NeighborsService', 'AllCountryCodeService', 'GeneralCountryDataService', function($q, $scope, $route, $location, DetailCountryService, ActiveCodeService, CapitalInfoService, NeighborsService, AllCountryCodeService, GeneralCountryDataService) {


		$scope.detailCountry = $route.current.params.country;
		console.log($scope.detailCountry);
		$scope.countryCode = GeneralCountryDataService.findCountryCode($scope.detailCountry);
		console.log($scope.countryCode);
		

		
		DetailCountryService($scope.countryCode).success(function(result){
			$scope.detailData = result;
			$scope.countryName = $scope.detailData.geonames[0].countryName;
			$scope.population = $scope.detailData.geonames[0].population;
			$scope.area = $scope.detailData.geonames[0].areaInSqKm;
			$scope.capital = $scope.detailData.geonames[0].capital;
			$scope.uppercaseCode = angular.uppercase($scope.countryCode);
			$scope.lowercaseCode = angular.lowercase($scope.countryCode);

			CapitalInfoService($scope.capital, $scope.countryCode).success(function(result){
				$scope.capitalPopulation = result.geonames[0].population;
			})

			NeighborsService($scope.countryCode).success(function(result){
				$scope.neighbours = result.geonames;
			})
		

		})	
		.error(function(){
			console.log("capital request failed");
		})
		
		$scope.goHome = function(){
			$location.path( '/' );
		}

		$scope.allCountries = function(){
			$location.path( '/countries');
		}

		
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
			controller : 'countriesController',
			resolve: {
					load:function(GeneralCountryDataService){
						if(GeneralCountryDataService.list().length < 1){
							console.log('reload on country data required');
							return GeneralCountryDataService.load();
					}
				}
			}
		})
		.when('/countries/:country/capital', {
			templateUrl : 'countries/detail.html',
			controller : 'detailController',
			resolve: {
					load:function(GeneralCountryDataService){
						if(GeneralCountryDataService.list().length < 1){
							console.log('reload on country data required');
							return GeneralCountryDataService.load();
					}
				}
			}
		})
	}]);