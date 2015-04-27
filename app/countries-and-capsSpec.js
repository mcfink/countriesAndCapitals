describe("detail controller", function(){
	//Arrange
	var mockScope = {};
	var controller;

	beforeEach(angular.mock.module('thinkfulCountriesAndCaps'));

	beforeEach(angular.mock.inject(function ($controller, $rootScope){
		mockScope = $rootScope.$new();
		controller = $controller("countriesController", {
			$scope: mockScope
		});

	}));

	//Act & Assess
	it("Creates variable", function(){
		expect(mockScope.countryData).toEqual([]);
	});

	it("should load a country name", function(){
		module(function($provide){
			$provide.value('GeneralCountryDataService', function(value){
				return "monkey";
			});
		});
		inject(function())
	});




	
});

describe("continent filter", function(){
	beforeEach(module('thinkfulCountriesAndCaps'));

	var a;

	it("can complete a test successfully", function(){
		a = true;
		expect(a).toBe(true);
	});


	it('should return full continent names rather than abbreiviations', inject(function($filter){
		var contFilter = $filter("continent");
		expect(contFilter("SA")).toEqual("South America");
		expect(contFilter("EU")).toEqual("Europe");
		expect(contFilter("XX")).toEqual("XX");
	}));


});
