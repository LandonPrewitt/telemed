import ardSensor, blueOxiSensor, pika
from time import sleep

def main(argv):
    if len(argv) != 2:
        print "Usage: %s server "%argv[0]
        return 1
    
    # Initializing sensors
    tempSensor = ardSensor.ArdSensor("t")
    ecgSensor = ardSensor.ArdSensor("e")
    oxiSensor = blueOxiSensor.BlueOxiSensor()
    
    # Connecting to rabbitmq message broker
    connection = pika.BlockingConnection(pika.ConnectionParameters(argv[1]))
    channel = connection.channel()
    channel.queue_declare(queue="temp")
    channel.queue_declare(queue="ecg")
    channel.queue_declare(queue="oxi")
    channel.queue_declare(queue="hr")
    channel.queue_declare(queue="pi")
    
    # Producing sensor data messages 
    try:
        while(True):
            channel.basic_publish(exchange='', routing_key="temp", body=tempSensor.getMeasure())
            channel.basic_publish(exchange='', routing_key="ecg", body=ecgSensor.getMeasure())
            channel.basic_publish(exchange='', routing_key="oxi", body=oxiSensor.getMeasureOxi())
            channel.basic_publish(exchange='', routing_key="hr", body=oxiSensor.getMeasureHR())
            channel.basic_publish(exchange='', routing_key="pi", body=oxiSensor.getMeasurePI())]
            print("Five sensors decoded data sent")
            sleep(1)
            
    # Stop with ctrl+c        
    except KeyboardInterrupt:
        connection.close()
        sys.exit(-1)
        

if __name__ == '__main__':
    sys.exit(main(sys.argv))
