/*///////////////////////////////////////////////////////////////
    User interface script
    
    Description: This script uses de Google Maps API and geocode
                 google service 
*////////////////////////////////////////////////////////////////

// Global variables
var geoCoder;
var map;

//$(document).ready(function () {
//    //loadScript();
//});

// Define user mode
function userMode(radioButton) {
    //alert(radioButton.value);
    if (radioButton) {
        if (radioButton.value == "manual") {
            $("#userConditions").removeClass("hide");
            $("#plotButton").removeClass("hide")
            $("#userInputLocation").addClass("hide");
            $("#geocodeButton").addClass("hide")
            $("#mapCanvas").addClass("hide");
            document.getElementById("temperature").setAttribute("required", "required");
            document.getElementById("irradiance").setAttribute("required", "required");
            document.getElementById("location").removeAttribute("required");
        }
        else if (radioButton.value = "geocode") {
            $("#userInputLocation").removeClass("hide");
            $("#mapCanvas").removeClass("hide");
            $("#geocodeButton").removeClass("hide")
            $("#plotButton").addClass("hide")
            $("#userConditions").addClass("hide");
            document.getElementById("temperature").removeAttribute("required");
            document.getElementById("irradiance").removeAttribute("required");
            document.getElementById("location").setAttribute("required", "required");
            initialize();
        }
    }
}

$(function () {
    $("#temperatureHelp").tooltip({
        content: "Enter temperature on Celsius scale.<br>\
                  Recommended scale: 0.0 - 100.0",
        position: {
            my: "left+15 center",
            at: "right center-10",
            collision: "none"
        }
    });
    $("#irradianceHelp").tooltip({
        content: "In order for the application to work properly<br>\
                  Solar Radiation values must be greater than zero.\
                  Recommended scale: 1.0 - 10,000.0",
        position: {
            my: "left+15 center",
            at: "right center-10",
            collision: "none"
        }
    });
    $("#geocodeHelp").tooltip({
        content: "This function will try find irradiance <br>\
                  from near weather stations for a given  <br>\
                  address. If no result is found, it will <br>\
                  ask for a new entry.",
        position: {
            my: "left+15 center",
            at: "right center-10",
            collision: "none"
        }
    });
});

$(function () {
    $("#geocodeButton").click(function () {
        var btn = $(this);
        btn.button("loading");
    });
    $("#plotButton").click(function () {
        var btn = $(this);
        btn.button("loading");
    });
});

/*///////////////////////////////////////////////////////////////
    Wunderground Request
    
    Description: This script section is intended to collect data
                from Wunderground data bases
*////////////////////////////////////////////////////////////////

//Merida, Yuc, 
//var latitud = 21.018661;
//var longitud = -89.635201;

function wundergroundRequest(latitude, longitude) {

    var key = "cdf51472da84eb74"
    var geoCoordinates = String(latitude) + ',' + String(longitude);

    $.ajax({
        url: "http://api.wunderground.com/api/" + key + "/geolookup/conditions/q/" + geoCoordinates + ".json",
        dataType: "jsonp",
        success: function (parsed_json) {
            var error;
            if (parsed_json && parsed_json['response']['error'] != undefined && parsed_json['response']['error']['type'] != "") {
                error = parsed_json['response']['error']['type'];
            }
            if (error && error != "") {
                //handle error, leave function.
                alert("No result found");
                return false;
            }

            var stationLatitude = parsed_json['current_observation']['observation_location']['latitude'];
            var stationLongitude = parsed_json['current_observation']['observation_location']['longitude'];
            var observationLocation = parsed_json['current_observation']['observation_location']['full'];
            var weatherStationId = parsed_json['current_observation']['station_id'];
            var observationTime = parsed_json['current_observation']['observation_time'];
            var locationCity = parsed_json['location']['city'];
            var temperatureCelsius = parsed_json['current_observation']['temp_c'];
            var irradiance = parsed_json['current_observation']['solarradiation'];
            var stationListLength = parsed_json['location']['nearby_weather_stations']['pws']['station'].length

            if (stationListLength > 0) {
                var maxStationsAttempt = 3
                var stationLimit = Math.min(maxStationsAttempt, stationListLength);
                var nearStationsId = [];
                for (var i = 0; i < stationLimit; i++) {
                    // create array with near weather stations
                    nearStationsId.push(parsed_json['location']['nearby_weather_stations']['pws']['station'][i]['id']);
                }
                if (irradiance == "--" || irradiance == 0) {
                    requestToNearStations(nearStationsId);
                }

                else {
                    relocateToNearStation(stationLatitude, stationLongitude);
                    sendStationFeatures(stationLatitude, stationLongitude, observationLocation, weatherStationId,
                                    observationTime, locationCity, temperatureCelsius, irradiance);
                }
            }

            else {
                relocateToNearStation(stationLatitude, stationLongitude);
                sendStationFeatures(stationLatitude, stationLongitude, observationLocation, weatherStationId,
                                observationTime, locationCity, temperatureCelsius, irradiance);
            }
        }
    });
}

function requestToNearStations(nearStationsId) {
    // var stations = JSON.stringify(nearStationsId);
    var solarPanelId = $('input[name="model"]:checked').val();
    $.ajax({
        type: "POST",
        url: "/nearWeatherStations",
        data: { nearStationsId: nearStationsId.toString(), solarPanelId: solarPanelId },
        success: function (response) {
            $("#curves").removeClass("hide");
            $("#graphics").html(response)
            var stationLatitude = $("#latitude").text();
            var stationLongitude = $("#longitude").text();
            if (stationLatitude && stationLongitude) {
                relocateToNearStation(stationLatitude, stationLongitude);
            }
        }
    });
}

// Send data to server for plotting
function sendStationFeatures(stationLatitude, stationLongitude, observationLocation, weatherStationId,
                                observationTime, locationCity, temperatureCelsius, irradiance) {
    var solarPanelId = $('input[name="model"]:checked').val();

    $.ajax({
        type: "POST",
        url: "/getStationFeatures",
        data: {
            solarPanelId: solarPanelId,
            stationLatitude: stationLatitude,
            stationLongitude: stationLongitude,
            observationLocation: observationLocation,
            weatherStationId: weatherStationId,
            observationTime: observationTime,
            locationCity: locationCity,
            temperatureCelsius: temperatureCelsius,
            irradiance: irradiance
        },
        success: function (response) {
            $("#curves").removeClass("hide");
            $("#graphics").html(response);
        }
    });

}

/*///////////////////////////////////////////////////////////////
    Graphics Call
    
    Description: This section is intended to call plotting
                functions and display curves
*////////////////////////////////////////////////////////////////

// Select input mode
function showGraphics() {
    if ($('input[name="user"]:checked').val() == "manual") {
        var temperature = $('#temperature').val();
        var irradiance = $('#irradiance').val();
        plotUserInputs(temperature, irradiance);
    }

    else if ($('input[name="user"]:checked').val() == "geocode") {
        var address = document.getElementById('location').value;
        codeAddress(address);
    }
}

// Plot for not found conditions 
function inputNotFoundIrradiance() {
    var lastStationTemperature = $("#lastStationTemperature").text();
    var lastStationIrradiance = $("#lastStationIrradiance").val();
    plotUserInputs(lastStationTemperature, lastStationIrradiance);
}

// Plotting function
function plotUserInputs(temperature, irradiance) {
    var solarPanelId = $('input[name="model"]:checked').val();

    $.ajax({
        url: "/graphics/" + solarPanelId + "/" + temperature + "/" + irradiance,
        type: 'get',
        success: function (response) {
            $("#curves").removeClass("hide");
            $("#graphics").html(response);

        }
    });

}

/*///////////////////////////////////////////////////////////////
    Google Map with Geographic coder
    
    Description: This script uses de Google Maps API and geocode
                 google service 
*////////////////////////////////////////////////////////////////

function initialize() {
    geoCoder = new google.maps.Geocoder();
    var latLng = new google.maps.LatLng(23.6266557, -102.5375006) // Mexico geographic coordinates
    var mapOptions = {
        zoom: 5,
        center: latLng
    }
    map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
    google.maps.event.trigger(map, 'resize');
}

function codeAddress(address) {
    geoCoder.geocode({ 'address': address }, function (results, status) {
		// modified for the updated version of the Google Maps API
        var latitude = results[0].geometry.location.lat();	// k
        var longitude = results[0].geometry.location.lng();	// B
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(14);
            wundergroundRequest(latitude, longitude);
        }
        else {
            alert('Geocode was not succesful for the following reason : ' + status);
        }
    });
}

function relocateToNearStation(stationLatitude, stationLongitude) {
    var latLng = new google.maps.LatLng(stationLatitude, stationLongitude);
    map.setCenter(latLng);
    var marker = new google.maps.Marker({
        map: map,
        position: latLng
    });
    alert("Redirecting to closest weather station");

}