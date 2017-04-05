import serial
from time import sleep

class ArdSensor:
    # e for gathering ECG data, t for gathering temperature data
    def __init__(self, sensorid):
        self.ser = serial.Serial('/dev/ttyACM1', 9600)
        if sensorid != "e" and sensorid != "t":
            raise ValueError("Not valid sensorid")
        self.sensorid = sensorid
            
    def getMeasure(self):
        self.ser.flush()
        buff = self.ser.readline()
        while buff[0] != self.sensorid:
            buff = self.ser.readline()
        return buff[1:-2] 

    def getMeasureArr(self,n):
        arr = [self.getMeasure() for i in range(n)]
        return arr
        
    
