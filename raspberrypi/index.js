
var { io } = require('socket.io-client');
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');

var spawn = require('child_process').spawn;
var proc;

const productionUrl = 'http://ec2-18-188-141-169.us-east-2.compute.amazonaws.com/'

const devUrl = 'http://localhost:4001'

const serverUrl = productionUrl
const socket = io(serverUrl)

app.listen(3001, () => console.log(`server listening on port 3001`))




const imagePath = '/run/shm/%04d.jpg'
// const imagePath = "./stream/image_stream.jpg"

var args = ["-w", "640", "-h", "480", "-o", imagePath, "-t", "99999999", "-tl", "50", /**"-n",**/ "-q", "10", "-th", "none"];

proc = spawn('raspistill', args);

console.log('Watching for changes...');

app.set('watchingFile', true);


fs.watchFile(imagePath, function (current, previous) {
    // socket.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    fs.readFile(imagePath, (err, data) => {
        if (err) return

        socket.emit('liveStream', data)
        console.log("image emitted")


    });

})



