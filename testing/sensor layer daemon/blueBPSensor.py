import pygatt, collections, errorcodes
from binascii import hexlify
from time import sleep


class BlueBPSensor:
    
    def __init__(self):
        self.macaddr = "78:A5:04:12:6B:0C"
        self.datacharuuid = "0000fff4-0000-1000-8000-00805f9b34fb"
        self.sysbp = 0
        self.diabp = 0
        self.pulse = 0 
        self.done = False
        
    def notificationHandler(self, handle, value):
        # Format of value in hex string 20 ff , first byte is header, second bp
        data = hexlify(str(value))
        if data[:2] == "0c":
            self.sysbp = int(data[4:6], 16)
            self.diabp = int(data[8:10], 16)
            self.pulse = int(data[16:18], 16)
            self.done = True
            
    def startMeasure(self):
        adapter = pygatt.GATTToolBackend()
        adapter.start()
        try:
            device = adapter.connect(self.macaddr)
        except pygatt.exceptions.NotConnectedError:
            print "Error:", errorcodes.error_desc[1]
            return (errorcodes.error[1], -1, -1)
        try:
            device.subscribe(self.datacharuuid, callback = self.notificationHandler, indication = True)
            device.char_write_handle(0x2f, [01,00], True)
            # Waiting for measurement to complete, if sensor disconnects without completing measurement, exception will be thrown and the wait will end
            while not self.done:
                # Monitoring for device by reading dummy characteristic
                device.char_read("00002902-0000-1000-8000-00805f9b34fb")
                sleep(1)
                
        except pygatt.exceptions.NotificationTimeout:
            device.disconnect()
            adapter.stop()
            print "Error:", errorcodes.error_desc[2]
            return (errorcodes.error[2], -1, -1)
        device.disconnect()
        adapter.stop()
        return (self.sysbp, self.diabp, self.pulse)
    
  
