import ardSensor, blueOxiSensor, blueBPSensor, blueSCSensor, errorcodes, pika, threading, json, sys
from time import sleep



def main(argv):
    if len(argv) != 2:
        print "Usage: %s server "%argv[0]
        return 1
    
    # Initializing continous measuring sensors
    #try:
     #   tempSensor = ardSensor.ArdSensor("t")
    #    ecgSensor = ardSensor.ArdSensor("e")
 #  except:
     #   pass
        #TODO implement exception handler for arduino not connected
        #print "Error connecting to arduino interface"
        #publishError(channel, 1)
   # try:
    #    oxiSensor = blueOxiSensor.BlueOxiSensor()
   # except pygatt.exceptions.NotConnectedError:
    #    print "Error connecting to oximeter module"
    #    publishError(channel, 1)
    
    # Connecting and setting up rabbitmq message broker
    connection = pika.BlockingConnection(pika.URLParameters(argv[1]))
    channel = connection.channel()
    queues = ["error", "cmd", "temp", "ecg", "oxi", "hr", "pi", "sysbp", "diabp", "pulse", "weight"]
    for qstr in queues:
        channel.queue_declare(queue=qstr)
    
    try:
        # Starting thread for producer of sensors with continous data
        #contProdWorker = threading.Thread(target=contProducer, args=(channel, tempSensor, ecgSensor, oxiSensor))
        contProdWorker = threading.Thread(target=contProducer, args=(channel,))
        contProdWorker.daemon = True
        contProdWorker.start()
        #while True: sleep(100)
        # Listening for commands
        print "Listening for commands..."
        channel.basic_consume(executeCMD, queue="cmd", no_ack=True)
        channel.start_consuming()
        # Stop with ctrl+c        
    except KeyboardInterrupt:
        print "Stopping Sensor Layer Daemon.."
        channel.stop_consuming()
        connection.close()
        sys.exit()
        
# Decodes command and performs the desired action
def executeCMD(channel, method, header, body):
    print body
    cmd = json.JSONDecoder().decode(body)
    if cmd["action"] == "sm": # Start measurement command
            #Start worker for blood pressure measurement
            singleMeasureWorker = threading.Thread(target=singleMeasureProd, args=(channel, cmd["device"]))
            singleMeasureWorker.daemon = True
            singleMeasureWorker.start()
    elif cmd["action"] == "sc": 
            #Start worker for scale measurement
            singleMeasureWorker = threading.Thread(target=singleMeasureProd, args=(channel, cmd["device"]))
            singleMeasureWorker.daemon = True
            singleMeasureWorker.start()
    else:
        publishError(channel, 2)
        
def singleMeasureProd(channel, sensor):
    if sensor == "bp":
        print "Rcvd command and starting blood pressure measurement procedure.."
        bpSensor = blueBPSensor.BlueBPSensor()
        (sysbp, diabp, pulse) = bpSensor.startMeasure()
        channel.basic_publish(exchange='', routing_key="sysbp", body=str(sysbp))
        #channel.basic_publish(exchange='', routing_key="diabp", body=diabp)
        #channel.basic_publish(exchange='', routing_key="pulse", body=pulse)
        print "Measurement sent"

    elif sensor == "sc":
        print "Rcvd command and starting weight measurement procedure.."
        scSensor = blueSCSensor.BlueSCSensor()
        weight = scSensor.startMeasure()
        channel.basic_publish(exchange='', routing_key="sc", body=str(round(weight*2.20462/10,1)))
    
    else:
        publishError(channel, 3)
    
    
def publishError(channel, errorn):
    print "Error:", errorcodes.error_desc[errorn]
    channel.basic_publish(exchange='', routing_key="error", body=errorcodes.error[errorn])
    
        
# Producing sensor data messages for sensors outputting continuous data 
#def contProducer(channel, tempSensor, ecgSensor, oxiSensor):    
def contProducer(channel):  
    while(True):
        #readings = json.JSONEncoder().encode({"lengths":lengths, "alt":alt})
        #channel.basic_publish(exchange='', routing_key="temp", body=tempSensor.getMeasure())
        #channel.basic_publish(exchange='', routing_key="ecg", body=ecgSensor.getMeasure())
        #channel.basic_publish(exchange='', routing_key="oxi", body=str(oxiSensor.getMeasureOxi()))
        #channel.basic_publish(exchange='', routing_key="hr", body=str(oxiSensor.getMeasureHR()))
        #channel.basic_publish(exchange='', routing_key="pi", body=str(oxiSensor.getMeasurePI()))
	channel.basic_publish(exchange='', routing_key="pi", body="u suck")
        print("Five sensors decoded data sent", channel)
        sleep(1)
        
    
        

if __name__ == '__main__':
    sys.exit(main(sys.argv))
