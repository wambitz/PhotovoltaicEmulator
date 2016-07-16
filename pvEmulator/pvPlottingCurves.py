###### Mathematical computing ######
# Numpy is a library for handling array (like data points)
import numpy as np

# Pyplot is a module within matplotlib library for plotting
import matplotlib.pyplot as plt

# This module is always available.  It provides access to the
# mathematical functions defined by the C standard.
from math import exp
#import Image

# PV models data dictionary
from pvModules import model as mdl


def calculateCurves(solarPanelId, temperature, irradiance):
    ###### Information from the Multi-crystaline MSX60 PV module datasheet######
	#  You may change these parameters to fit the I-V model
	#  to other types of PV module.
    
	tmp = float(temperature)
	irr = float(irradiance)
	
	if irr == 0:
		return None

	Iscn = mdl[solarPanelId]['Iscn']    #STC short-circuit current (A)
	Vocn = mdl[solarPanelId]['Vocn']    #STC array open-circuit voltage (V)
	Imp = mdl[solarPanelId]['Imp']      #PV Module current @ maximum power point (A)
	Vmp = mdl[solarPanelId]['Vmp']      #PV Module voltage @ maximum power point (V)
	Kv = mdl[solarPanelId]['Kv']        #Voltage/temperature coefficient (V/K)
	Ki = mdl[solarPanelId]['Ki']        #Current/temperature coefficient (A/K)
	Ns = mdl[solarPanelId]['Ns']        #Number of series cells in a PV Module
	Rs = mdl[solarPanelId]['Rs']
	Rp = mdl[solarPanelId]['Rp'] 
	maxVoltageVal = mdl[solarPanelId]['maxVoltageVal'] # Parameter for Voltage Vector
	Pmax_e = Vmp * Imp  		  #PV Module maximum output peak power (W) maxVoltageVal = 45 # Parameter for Voltage Vector                           					
	###### Constants to be send in PV modelling ######
			
	k = 1.3806503e-23 		#Boltzmann (J/K)
	q = 1.60217646e-19     #Electron charge (C)
	a1 = 1                 #Ideality factor for Diode 1
	a2 = 1.2               #Ideality factor for Diode 1
	p = a1 + a2
			
	######## STC values ######
			
	Gn = 1000 # STC irradiance (W/m^2) @ 25oC
	Tn = 25 + 273.15 # STC operating temperature (K)
	
	###### User parameter input ######
	
	T_in = float(tmp)
	G_in = float(irr)
					
	T = T_in + 273.15
	G = G_in
	Vtn = k * Tn / q  #Thermal junction voltage (STC)
	Vt = k * T / q                       #Thermal junction voltage (current temperature)
	Ion = Iscn / (exp(Vocn / ((a1 + a2) / p) / Ns / Vtn) - 1)  #STC diode saturation current
		
	###### Temperature and irradiation effect on the current ######
		
	dT = T - Tn
	Ipvn = Iscn                      # STC light-generated current
	Ipv = (Ipvn + Ki * dT) * G / Gn        # Actual light-generated current
	Isc_ = (Iscn + Ki * dT) * G / Gn      # Actual short-circuit current
	Voc_ = (Vocn + Kv * dT)
	Io1 = Isc_ / (exp(Voc_ / ((a1 + a2) / p) / Ns / Vt) - 1)
	Io2 = Isc_ / (exp(Voc_ / ((a1 + a2) / p) / Ns / Vt) - 1)
			
	V = None
	I = None
			
	###### Array declaration ######
		
	V = np.arange(0,maxVoltageVal,1)  # V = linspace(0,val_max,L);
	N = len(V)						  # Voltage lenght
	I = np.zeros(N)
	I_ = np.zeros(N)
	g = np.zeros(N)
	glin = np.zeros(N)
	ID1 = np.zeros(N)
	ID2 = np.zeros(N)
	P = np.zeros(N)
		
	for j, val in enumerate(V): 
		g[j] = Ipv - Io1 * (exp((V[j] + I[j] * Rs) / Vt / Ns / a1) - 1) - Io2 * (exp((V[j] + I[j] * Rs) / Vt / Ns / a2) - 1) - (V[j] + I[j] * Rs) / Rp - I[j]
		while (abs(g[j]) > 0.001):
			g[j] = Ipv - Io1 * (exp((V[j] + I[j] * Rs) / Vt / Ns / a1) - 1) - Io2 * (exp((V[j] + I[j] * Rs) / Vt / Ns / a2) - 1) - (V[j] + I[j] * Rs) / Rp - I[j]
			glin[j] = -Io1 * Rs / Vt / Ns / a1 * exp((V[j] + I[j] * Rs) / Vt / Ns / a1) - Io2 * Rs / Vt / Ns / a2 * exp((V[j] + I[j] * Rs) / Vt / Ns / a2) - Rs / Rp - 1
			I_[j] = I[j] - g[j] / glin[j]
			I[j] = I_[j]
		#end while (abs(g[j]) > 0.001)
	# end for j, val in enumerate(V)
	
	###### Calculate power using the I-V equation ######
		
	for j, val in enumerate(V): 
		ID1[j] = Io1 * (exp((V[j] + I[j] * Rs) / Vt / Ns / a1) - 1)
		ID2[j] = Io2 * (exp((V[j] + I[j] * Rs) / Vt / Ns / a2) - 1)
		P[j] = (Ipv - ID1[j] - ID2[j] - (V[j] + I[j] * Rs) / Rp) * V[j]
	# end for j, val in enumerate(V)
	Pmax_m = max(P)
	error = (Pmax_m - Pmax_e)
		
	###### Calculate the Important Points in I-V Curve of PV Module ######
	
	index = []
	for i, val in enumerate(I):
		if I[i] > 0:
			index.append(i)
			
	Voc = V[index[-1]]  # Voltage on Open-Circuit
						# it happens when I is near to 0
	index = []	
	for i, val in enumerate(V):
		if V[i] > 0:
			index.append(i)
				
	Isc = I[index[0]]  # Voltage on Short-Circuit
					   # it happens when V is near to 0
		
	Pmpp = max(V * I)    # Power maximum point
	#index = np.nonzero(P == max(P))[0][0]
	p_index = np.where(P == max(P))[0][0] # Use this only if it is one values,
											# it returns the index of row[0], column[0]
												
	Vmp = V[p_index]  # Voltage at maximum point
	Imp = I[p_index]  # Voltage at maximum point
		
	# Matplotlib object-oriented API
	fig, axes = plt.subplots(nrows=2, ncols=1)
	axes[0].set_title('I-V Curve')
	axes[0].grid(True)
	axes[0].xaxis.set_ticks(index)
	axes[0].set_xlabel('V (V)')
	axes[0].set_ylabel('I (A)')
	axes[0].set_xlim([0, Voc + 1])
	axes[0].set_ylim([0, Isc + 1])
	#axes[0].plot(V,I, linewidth=2, color='black', linestyle='*', marker='*')
	axes[0].plot(V,I, lw=2, color='black')
	axes[0].plot(0, Isc, Vmp, Imp, Voc, 0, lw=2, marker='o', 
				color='white', markersize=8)
	
	axes[1].set_title('P-V Curve')
	axes[1].grid(True)
	axes[1].xaxis.set_ticks(index)
	axes[1].set_xlabel('V (V)')
	axes[1].set_ylabel('P (W)')
	axes[1].set_xlim([0, Voc + 1])
	axes[1].set_ylim([0, Pmpp + 1])
	#axes[1].plot(V,I, linewidth=2, color='black', linestyle='*', marker='*')
	axes[1].plot(V,P, lw=2, color='black')
	axes[1].plot(0, 0, Vmp, Pmax_m, Voc, 0, lw=2, marker='o', 
           color='white', markersize=8)
		
	fig.tight_layout()	# render layout to avoid overlapping
	return fig

if (__name__) == ('__main__'):
    a = calculateCurves('MSX60', 25, 1000)
    a.savefig("")
    print a