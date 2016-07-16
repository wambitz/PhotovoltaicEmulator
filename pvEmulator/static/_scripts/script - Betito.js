// Global variables
var observationLocation;
var weatherStationID;
var observationTime;
var locationCity;
var temperatureCelsius;
var irradiance;

function saveGraphParamethers(graphParameters) {
    observationLocation = graphParameters['observationLocation']; 
    weatherStationID = graphParameters['weatherStationID'];
    observationTime = graphParameters['observationTime'];
    locationCity = graphParameters['locationCity'];
    temperatureCelsius = graphParameters['temperatureCelsius'];
    irradiance = graphParameters['irradiance'];

}

// Define user mode
function userMode(radioButton) {
    //alert(radioButton.value);
    if (radioButton) {
        if (radioButton.value == "manual") {
            $("#userConditions").removeClass("hide");
            $("#userInputLocation").addClass("hide");
            document.getElementById("temperature").setAttribute("required", "required");
            document.getElementById("irradiance").setAttribute("required", "required");
            document.getElementById("location").removeAttribute("required");

        }
        else if (radioButton.value = "geocode") {
            $("#userInputLocation").removeClass("hide");
            $("#userConditions").addClass("hide");
            document.getElementById("temperature").removeAttribute("required");
            document.getElementById("irradiance").removeAttribute("required");
            document.getElementById("location").setAttribute("required", "required");

        }
    }
}

// Plotting function
function plot() {
    //alert(submitButton.value);
    var solarPanelId = $('input[name="model"]:checked').val();
    var temperature = $('#temperature').val();
    var irradiance = $('#irradiance').val();

    $.ajax({
        url: "/graphics/" + solarPanelId + "/" + temperature + "/" + irradiance,
        type: 'get',
        success: function (response) {
            $("#curves").removeClass("hide");
            $("#graphics").html(response)
        }
    });

}
//Google Maps API Request
function googleMapsRequest() {
}


// Wunderground Request
function wundergroundRequest() {

    var key = "cdf51472da84eb74";

    // Monterrey, NL
    var latitud = 25.6488126;
    var longitud = -100.3030788;

    //Merida, Yuc, 
    //var latitud = 21.018661;
    //var longitud = -89.635201;
    var geoCoordinates = String(latitud) + ',' + String(longitud);
   

    $.ajax({
        url: "http://api.wunderground.com/api/" + key + "/geolookup/conditions/q/" + geoCoordinates + ".json",
        dataType: "jsonp",
        success: function (parsed_json) {
            ManageWeatherStations(parsed_json, key);
        }
    });
}

function wundergroundRequestToNearStation(key, nearWeatherStations, i) {
    //function wundergroundRequestToNearStation() {

    //var key = "cdf51472da84eb74";
    var graphParamters;
    //var nearWeatherStations = ['INUEVOLE20', 'INLMONTE7', 'INLMONTE2', 'INLMONTE8', 'INLMONTE3'];
    $.ajaxSetup({
        async: false
    });
    
    $.post({
        url: "http://api.wunderground.com/api/" + key + "/geolookup/conditions/q/pws:" + nearWeatherStations[i] + ".json",
        dataType: "jsonp",
        success: function (parsed_json) {
            observationLocation = parsed_json['current_observation']['observation_location']['full'];
            weatherStationID = parsed_json['current_observation']['station_id'];
            observationTime = parsed_json['current_observation']['observation_time'];
            locationCity = parsed_json['location']['city'];
            temperatureCelsius = parsed_json['current_observation']['temp_c'];
            irradiance = parsed_json['current_observation']['solarradiation'];

            alert("Weather conditions in " + locationCity + " at " + observationTime);
            alert("Weather Station: " + observationLocation + ". Weather Station ID: " + weatherStationID);
            alert("Current temperature in " + locationCity + " is: " + temperatureCelsius + "(°C)");
            alert("Current solar radiation in " + locationCity + " is: " + irradiance + "(W/m^2)");

            graphParamters = {
                'observationLocation': observationLocation, 
                'weatherStationID': weatherStationID,
                'observationTime': observationTime,
                'locationCity': locationCity,
                'temperatureCelsius' : temperatureCelsius,
                'irradiance' : irradiance};
           
            saveGraphParamethers(graphParamters);
        }
    });
        
}


function ManageWeatherStations(parsed_json, key) {

    var maxStationsAttempt = 5;
    var currentIrradiance = parsed_json['current_observation']['solarradiation'];

    if (currentIrradiance){
        if (currentIrradiance != "--") {
            observationLocation = parsed_json['current_observation']['observation_location']['full'];
            weatherStationID = parsed_json['current_observation']['station_id'];
            observationTime = parsed_json['current_observation']['observation_time'];
            locationCity = parsed_json['location']['city'];
            temperatureCelsius = parsed_json['current_observation']['temp_c'];
            irradiance = parsed_json['current_observation']['solarradiation'];
        }
        else {
            conditionsForAllNearWeatherStations = [];
            var nearWeatherStations = [];
            for (var i = 0; i < maxStationsAttempt; i++) {
                // create array with near weather stations
                nearWeatherStations[i] = parsed_json['location']['nearby_weather_stations']['pws']['station'][i]['id'];
                //alert(nearWeatherStations[i]);
            }
            TryNextWeatherStation(nearWeatherStations, key);
        }
    }
}

var conditionsForAllNearWeatherStations;
var weatherStationLimit;
function TryNextWeatherStation(nearWeatherStations, key) {

    weatherStationLimit = Math.min(5,nearWeatherStations.length);
    for (var i = 0 ; i < weatherStationLimit; i++) {
        RequestAllInformationFromWeatherStations(nearWeatherStations[i], key);
    }

    return conditionsForAllNearWeatherStations;
}

function RequestAllInformationFromWeatherStations(nearWeatherStations, key) {
    $.ajax({
        url: "http://api.wunderground.com/api/" + key + "/geolookup/conditions/q/pws:" + nearWeatherStations + ".json",
        dataType: "jsonp",
        success: function (parsed_json) {
            var observationLocation = parsed_json['current_observation']['observation_location']['full'];
            var weatherStationID = parsed_json['current_observation']['station_id'];
            var observationTime = parsed_json['current_observation']['observation_time'];
            var locationCity = parsed_json['location']['city'];
            var temperatureCelsius = parsed_json['current_observation']['temp_c'];
            var irradiance = parsed_json['current_observation']['solarradiation'];

            var currConditions = [observationLocation, weatherStationID, observationTime, locationCity, temperatureCelsius, irradiance];
            conditionsForAllNearWeatherStations.push(currConditions);
            //alert("ajax");
        },
        complete: function () {
            if (conditionsForAllNearWeatherStations.length == weatherStationLimit) {
                PseudoPlot();
            }
        }
    });
}

function PseudoPlot() {
    alert("Pseud Plot");
    alert(conditionsForAllNearWeatherStations);
}