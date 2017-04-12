# Telemed

### Running The App
1. clone repository 
2. run prompt > npm install 
3. run server > nodemon add.js
4. Open browser and search > 128.194.131.156:3000 
5. Proceed to demo the application!

Note: (the ip before the :3000 is contingent on server / your computer's ip. Localhost works as well)

### Starting Sensor Layer Daemon
1. Move into the sensor daemon folder
2. Run as: sudo python SLD.py amqp://telemed:telemed@128.194.131.156:5672

### Error Definitions

error = {
   1: "e1",
   2: "e2",
   3: "e3",
   4: "e4",
}

error_desc = {
   1: "Offline sensor",
   2: "Measurement did not complete correctly",
   3: "Invalid command was received",
   4: "Invalid sensor name in cmd",
}


### DO NOT PUSH TO MASTER
Make a branch -> Make sure it works properly -> Send pull request
