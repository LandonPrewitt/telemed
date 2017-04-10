import pygatt, collections, errorcodes
from binascii import hexlify
from time import sleep


class BlueSCSensor:
    
    def __init__(self):
        self.macaddr = "7C:EC:79:DE:80:4A"
        self.datacharuuid = "0000fff4-0000-1000-8000-00805f9b34fb"
        self.weight = 0
        self.done = False
        
    def notificationHandler(self, handle, value):
        data = hexlify(str(value))
        if data[:2] == "ce":
            self.weight = int(data[8:12], 16)
            self.done = True
            
    def startMeasure(self):
        adapter = pygatt.GATTToolBackend()
        adapter.start()
        sleep(5)
        try:
            device = adapter.connect(self.macaddr)
        except pygatt.exceptions.NotConnectedError:
            print "Error:", errorcodes.error_desc[1]
            return errorcodes.error[1]
        try:
            device.subscribe(self.datacharuuid, callback = self.notificationHandler, indication = True)
            device.char_write_handle(0x27, [01,00], True)
            # Waiting for measurement to complete, if sensor disconnects without completing measurement, exception will be thrown and the wait will end
            while not self.done:
                # Monitoring for device by reading dummy characteristic
                device.char_read("00002902-0000-1000-8000-00805f9b34fb")
                sleep(1)
                
        except pygatt.exceptions.NotificationTimeout:
            device.disconnect()
            adapter.stop()
            print "Error:", errorcodes.error_desc[2]
            return errorcodes.error[2]
        device.disconnect()
        adapter.stop()
        return self.weight
    
  
