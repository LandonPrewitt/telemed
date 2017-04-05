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
        adapter = pygatt.GATTToolBackend()
        adapter.start()
        device = adapter.connect(self.macaddr)
        device.subscribe(self.datacharuuid, callback = self.notificationHandler, indication = True)
        
    def notificationHandler(self, handle, value):
        # Format of value in string 81 ff 7f 00 , first byte is header, second, hr, oximeter, pi
        data = hexlify(str(value))
        if data[:2] == "81":
            self.oxibuff.append(int(data[2:4], 16))
            self.hrbuff.append(int(data[4:6], 16))
            self.pibuff.append(int(data[6:8], 16))
            
    def getMeasureOxi(self):
        return self.oxibuff.pop()
    def getMeasureHR(self):
        return self.hrbuff.pop()
    def getMeasurePI(self):
        return self.pibuff.pop()

    def getMeasureOxiArr(self,n):
        arr = [self.oxibuff[i] for i in range(n)]
        return arr
    
    def getMeasureHRArr(self,n):
        arr = [self.hrbuff[i] for i in range(n)]
        return arr
    
    def getMeasurePIArr(self,n):
        arr = [self.pibuff[i] for i in range(n)]
        return arr
    
    def __del__(self):
        device.unsubscribe(self.datacharuuid)
        device.disconnect()
        adapter.stop()
