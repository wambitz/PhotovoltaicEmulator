model = {
    ###### Information from the Multi-crystaline MSX60 PV module
    ###### datasheet######
	#  You may change these parameters to fit the I-V model
	#  to other types of PV module.
	'MSX60': {
        'Iscn': 3.8,    #STC short-circuit current (A)
		'Vocn': 21.1,   #STC array open-circuit voltage (V)
		'Imp' : 3.5,    #PV Module current @ maximum power point (A)
		'Vmp' : 17.1,   #PV Module voltage @ maximum power point (V)
		'Kv'  : -80e-3,  #Voltage/temperature coefficient (V/K)
		'Ki'  : .003,   #Current/temperature coefficient (A/K)
		'Ns'  : 36,     #Number of series cells in a PV Module
		'Rs'  : 0.35,
		'Rp'  : 176.4,
		'maxVoltageVal' : 35.0,     # Parameter for Voltage Vector
		'minVoltageVal' : 0
	},
	###### Information from the Multi-crystaline Kyocera KG200GT PV module
	###### datasheet
    #  You may change these parameters to fit the I-V model
    #  to other types of PV module.
	'KG200GT': {
        'Iscn': 8.21,   #STC short-circuit current (A)
		'Vocn': 32.9,   #STC array open-circuit voltage (V)
		'Imp' : 7.61,   #PV Module current @ maximum power point (A)
		'Vmp' : 26.3,   #PV Module voltage @ maximum power point (V)
		'Kv'  : -123e-3, #Voltage/temperature coefficient (V/K)
		'Ki'  : 3.18e-3,#Current/temperature coefficient (A/K)
		'Ns'  : 54,     #Number of series cells in a PV Module
		'Rs'  : 0.32,
		'Rp'  : 160.5,
		'maxVoltageVal' : 45.0,      # Parameter for Voltage Vector
		'minVoltageVal' : 0
	}
}
