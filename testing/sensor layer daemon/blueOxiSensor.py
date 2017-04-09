import pygatt, collections
from binascii import hexlify
from time import sleep

class BlueOxiSensor:
    
    def __init__(self):
        self.macaddr = "CC:79:CF:F9:2F:B4"
        self.datacharuuid = "cdeacb81-5235-4c07-8846-93a37ee6b86d"
        self.oxibuff = collections.deque(maxlen=10)
        self.hrbuff = collections.deque(maxlen=10)
        self.pibuff = collections.deque(maxlen=10)
        self.connected = False
        adapter = pygatt.GATTToolBackend()
        adapter.start()
        device = adapter.connect(self.macaddr)
        device.subscribe(self.datacharuuid, callback = self.notificationHandler, indication = True)
        self.connected = True
        
    def notificationHandler(self, handle, value):
        # Format of value in string 81 ff 7f 00 , first byte is header, second, hr, oximeter, pi
        data = hexlify(str(value))
        if data[:2] == "81":
            self.hrbuff.append(int(data[2:4], 16))
            self.oxibuff.append(int(data[4:6], 16))
            self.pibuff.append(int(data[6:8], 16))
            
    def getMeasureOxi(self):
        if len(self.oxibuff) != 0 and self.connected:
            return self.oxibuff.pop()
        return int(0)
    
    def getMeasureHR(self):
        if len(self.hrbuff) != 0 and self.connected:
            return self.hrbuff.pop()
        return int(0)
    
    def getMeasurePI(self):
        if len(self.pibuff) != 0 and self.connected:
            return self.pibuff.pop()
        return int(0)
    
    def getMeasureOxiArr(self,n):
        if len(self.oxibuff) != 0 and self.connected:
            arr = [self.oxibuff[i] for i in range(n)]
            return arr
        return int(0)
    
    def getMeasureHRArr(self,n):
        if len(self.hrbuff) != 0 and self.connected:
            arr = [self.hrbuff[i] for i in range(n)]
            return arr
        return int(0)
        
    def getMeasurePIArr(self,n):
        if len(self.pibuff) != 0 and self.connected:
            arr = [self.pibuff[i] for i in range(n)]
            return arr
        return int(0)
        
    
    def __del__(self):
        device.unsubscribe(self.datacharuuid)
        device.disconnect()
        adapter.stop()
