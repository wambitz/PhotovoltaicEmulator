from flask import Flask, render_template, url_for, send_file, request, jsonify, redirect
from pvPlottingCurves import calculateCurves
from uuid import uuid4 as uuid
from filesUtility import FilesUtility
import requests 

app = Flask(__name__)

@app.route("/")
def index():
	return render_template('index.html')

@app.route("/graphics/<solarPanelId>/<temperature>/<irradiance>", methods=['GET'])
def plotUserInputs(solarPanelId,temperature,irradiance):
    graphPath = "static/_images/_graphics/"
    graphics = FilesUtility(graphPath)
    graphics.deleteFiles()
    curves = calculateCurves(solarPanelId,temperature,irradiance)
    if curves == None:
        plotError = "Irradiance values must be greater than 0"
        return render_template('userModeTemplate.html', plotError=plotError, graphUrl=None, temperature=temperature, irradiance=irradiance) 
    curvesId = str(uuid())
    curves.savefig(graphPath + curvesId + ".png")
    graphUrl = url_for('static', filename='_images/_graphics/' + curvesId + '.png')
    return render_template('userModeTemplate.html', plotError=None, graphUrl=graphUrl, temperature=temperature, irradiance=irradiance)

def renderStationFeatures(**stationFeatures):
    graphPath = "static/_images/_graphics/"
    graphics = FilesUtility(graphPath)
    graphics.deleteFiles()
    curves = calculateCurves(stationFeatures["solarPanelId"], stationFeatures["temperatureCelsius"], stationFeatures["irradiance"])
    curvesId = str(uuid())
    curves.savefig(graphPath + curvesId + ".png")
    graphUrl = url_for('static', filename='_images/_graphics/' + curvesId + '.png')
    return render_template('geoCodeTemplate.html', graphUrl=graphUrl, **stationFeatures )

@app.route("/getStationFeatures", methods=['POST'])
def getStationFeatures():
    irradiance = request.form.get('irradiance')
    stationFeatures = {
        "solarPanelId" : request.form.get('solarPanelId'),
        "stationLatitude" : request.form.get('stationLatitude'),
        "stationLongitude" : request.form.get('stationLongitude'),
        "observationLocation" : request.form.get('observationLocation'),
        "weatherStationId" : request.form.get('weatherStationId'),
        "observationTime" : request.form.get('observationTime'),
        "locationCity" : request.form.get('locationCity'),
        "temperatureCelsius" : request.form.get('temperatureCelsius'),
        "irradiance" : irradiance
        }
    if irradiance == "0" or irradiance == "--":
        return render_template('noIrradianceFound.html', **stationFeatures)
    return renderStationFeatures(**stationFeatures)
    
@app.route("/nearWeatherStations", methods=['POST'])    
def findIrradianceNearStations():
    solarPanelId = request.form.get("solarPanelId")
    stationsId = request.form.get("nearStationsId")
    stationsList = stationsId.split(',')
    for station in stationsList:
        wundergroundUrl = 'http://api.wunderground.com/api/cdf51472da84eb74'  \
        + '/geolookup/conditions/q/pws:' + station + '.json'
        print wundergroundUrl
        r = requests.get(wundergroundUrl)
        parsed_json = r.json()
        irradiance = parsed_json["current_observation"]["solarradiation"]
        if irradiance != "--" and irradiance != "0":
            break
        else:
            print "No irradiance, input value manually" 
    stationFeatures = {
        "stationLatitude" : parsed_json['current_observation']['observation_location']['latitude'],
        "stationLongitude" : parsed_json['current_observation']['observation_location']['longitude'],
        "observationLocation" : parsed_json['current_observation']['observation_location']['full'],
        "weatherStationId" : parsed_json['current_observation']['station_id'],
        "observationTime" : parsed_json['current_observation']['observation_time'],
        "locationCity" : parsed_json['location']['city'],
        "temperatureCelsius" : parsed_json["current_observation"]["temp_c"],
        "irradiance" : irradiance,
        "solarPanelId" : solarPanelId
    }
    if irradiance == '--' or irradiance == '0':
        return render_template('noIrradianceFound.html', **stationFeatures)
    return renderStationFeatures(**stationFeatures)
    # return redirect(url_for('plotUserInputs', solarPanelId=solarPanelId, temperature=temperatureCelsius, irradiance=irradiance))

if (__name__) == ('__main__'):
	app.run(host='0.0.0.0', debug=True, port=81)