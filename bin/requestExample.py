import requests

# Request coordinates to google geographic codification API
location = raw_input('Introduce desired location: ')
locationToQuery = location.split()
locationToQuery = '+'.join(locationToQuery)
mapsUrl = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + locationToQuery

r = requests.get(mapsUrl)
geographicalDescription = r.json()

lat = geographicalDescription["results"][0]["geometry"]["location"]["lat"]
lng = geographicalDescription["results"][0]["geometry"]["location"]["lng"]

print 'Latitude from %s: %s ' % (location, lat)
print 'Longditude from %s: %s ' % (location, lng)

coordinates = '%s,%s' % (lat, lng)

# Request weather conditions to Wunderground
key = 'cdf51472da84eb74'
wundergroundUrl = 'http://api.wunderground.com/api/' + key \
+ '/conditions/q/' + coordinates + '.json'

r = requests.get(wundergroundUrl)
conditions = r.json() # Error on book Getting Started 
					  # Raspberry Pi, parenthesis omitted 

temp = conditions["current_observation"]["temp_c"]
irradiance = float(conditions["current_observation"]["solarradiation"])

print 'Temperature(C): %s' % temp
print 'Solar Radiation(W/m^2): %s' % irradiance


# Example code from Wunderground.com documentation
# import urllib2
# import json
# f = urllib2.urlopen('http://api.wunderground.com/api/cdf51472da84eb74/geolookup/conditions/q/IA/Cedar_Rapids.json')
# json_string = f.read()
# parsed_json = json.loads(json_string)
# location = parsed_json['location']['city']
# temp_f = parsed_json['current_observation']['temp_f']
# print "Current temperature in %s is: %s" % (location, temp_f)
# f.close()