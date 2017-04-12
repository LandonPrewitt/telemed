import ardSensor, blueOxiSensor, blueBPSensor, blueSCSensor, errorcodes, pika, threading, json, sys, serial, pygatt
from time import sleep


def main(argv):
    
    if len(argv) != 2:
        print "Usage: %s AMQPURL "%argv[0]
        return 1
    
    # Connecting and setting up rabbitmq message broker
    connection = pika.BlockingConnection(pika.URLParameters(argv[1]))
    channel = connection.channel()
    channel.queue_declare(queue='error')
    
    # Initializing continous measuring sensors
    connected_sensors = {'temp': False , 'ecg': False, 'oxi': False}
    try:
       tempSensor = ardSensor.ArdSensor("t")
       ecgSensor = ardSensor.ArdSensor("e")
       connected_sensors['temp'] = True
       connected_sensors['ecg'] = True
    except serial.serialutil.SerialException:
        print "Error connecting to arduino interface"
        tempSensor = None
        ecgSensor = None
        publishError(channel, 1)
    try:
       oxiSensor = blueOxiSensor.BlueOxiSensor()
       connected_sensors['oxi'] = True
    except pygatt.exceptions.NotConnectedError:
       print "Error connecting to oximeter module"
       oxiSensor = None
       publishError(channel, 1)
    
    # Declaring rest of queues
    queues = ["cmd", "temp", "ecg", "oxi", "hr", "pi", "bp", "diabp", "pulse", "weight"]
    for qstr in queues:
        channel.queue_declare(queue=qstr)
        
    try:
        # Starting thread for producer of sensors with continous data
        contProdWorker = threading.Thread(target=contProducer, args=(channel, connected_sensors, tempSensor, ecgSensor, oxiSensor))
        contProdWorker.daemon = True
        contProdWorker.start()
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

# Worker definition for single measurements        
def singleMeasureProd(channel, sensor):
    
    if sensor == "bp":
        print "Rcvd command and starting blood pressure measurement procedure.."
        bpSensor = blueBPSensor.BlueBPSensor()
        print "Measuring..."
        (sysbp, diabp, pulse) = bpSensor.startMeasure()
        channel.basic_publish(exchange='', routing_key="bp", body=json.JSONEncoder().encode([sysbp, diabp, pulse]))
        print "Received data from blood pressure sensor: sysbp: %s diabp: %s pulse: %s and sucessfully sent to queue" % (str(sysbp), str(diabp), str(pulse))

    elif sensor == "sc":
        print "Rcvd command and starting weight measurement procedure.."
        scSensor = blueSCSensor.BlueSCSensor()
        print "Measuring..."
        weight = round(scSensor.startMeasure()*2.20462/10,1)
        channel.basic_publish(exchange='', routing_key="weight", body=str(weight))
        print "Received data from scale: weight: %i and sucessfully sent to queue" % (weight)
    
    else:
        publishError(channel, 3)
    

# Helper for sending defined error codes to the server    
def publishError(channel, errorn):
    print "Error:", errorcodes.error_desc[errorn]
    channel.basic_publish(exchange='', routing_key="error", body=errorcodes.error[errorn])
    channel.basic_publish(exchange='', routing_key="error", body=errorcodes.error_desc[errorn])
    
        
# Producing sensor data messages for sensors outputting continuous data 
def contProducer(channel, connected_sensors, tempSensor, ecgSensor, oxiSensor):    
    while(True):
        if connected_sensors['temp'] and connected_sensors['ecg']:
            channel.basic_publish(exchange='', routing_key="temp", body=tempSensor.getMeasure())
            channel.basic_publish(exchange='', routing_key="ecg", body=json.JSONEncoder().encode(ecgSensor.getMeasureArr(30)))
        if connected_sensors['oxi']:
            channel.basic_publish(exchange='', routing_key="oxi", body=json.JSONEncoder().encode([oxiSensor.getMeasureOxi(), oxiSensor.getMeasureHR(), oxiSensor.getMeasurePI()]))
    
        print("Sending continous sensors' data", channel)
        sleep(1)
        

if __name__ == '__main__':
    sys.exit(main(sys.argv))
