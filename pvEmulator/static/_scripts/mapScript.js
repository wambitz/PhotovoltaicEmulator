/*///////////////////////////////////////////////////////////////
    Google Map with Geocoder 
    
    Description: This script uses de Google Maps API and geocode
                 google service 
*////////////////////////////////////////////////////////////////

var geoCoder;
var map;
var latitude;
var longitude;


function initialize() {
    geoCoder = new google.maps.Geocoder();
    var latLng = new google.maps.LatLng(23.6266557, -102.5375006) // Mexico geographic coordinates
    var mapOptions = {
        zoom: 5,
        center: latLng
    }
    map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
}


function loadScript() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=FALSE&callback=initialize";
    //script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyCsMm7ino5sdXKTB2pMLhHaG73uFw398rY&sensor=TFALSE&callback=initialize";
    document.body.appendChild(script);
}

function codeAddress(){
    var address = document.getElementById('location').value;
    geoCoder.geocode({ 'address': address }, function (results, status) {
        latitude = results[0].geometry.location.B;
        longitude = results[0].geometry.location.k;
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(14);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
                
            });
        }
        else {
            alert('Geocode was not succesful for the following reason : ' + status);
        }

    });
}

$("#location").keyup(function (event) {
    if (event.keyCode == 13) {
        $("#geoCode").click();
    }
});

$(document).ready(function () {
    loadScript();
});



    /*///////////////////////////////////////////////////////////////
        First Example - Single Map
        
        Description: Full page Map, with initial position at México
    *////////////////////////////////////////////////////////////////

    //var map;
    //function initialize() {
    //    var mapOptions = {
    //        zoom: 6,
    //        center: new google.maps.LatLng(23.6266557, -102.5375006)
    //    };
    //    map = new google.maps.Map(document.getElementById('map-canvas'),
    //        mapOptions);
    //}

    //google.maps.event.addDomListener(window, 'load', initialize);


    /*///////////////////////////////////////////////////////////////
        Second Example - Sized Map
        
        Description: Reduced size map, with initial position at México
    *////////////////////////////////////////////////////////////////

    //function initialize() {
    //    var mapOptions = {
    //        center: new google.maps.LatLng(23.6266557, -102.5375006),
    //        zoom: 5,
    //        mapTypeId: google.maps.MapTypeId.ROADMAP
    //    };
    //    var map = new google.maps.Map(document.getElementById("map_canvas"),
    //        mapOptions);
    //}


