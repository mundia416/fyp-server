
var { io } = require('socket.io-client');
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
const FormData = require('form-data'); // npm install --save form-data
// var piblaster = require('pi-servo-blaster.js');
var PiServo = require('pi-servo');

var spawn = require('child_process').spawn;
const { exec } = require('child_process');
var gpio = require('rpi-gpio');
const axios = require('axios');

let cameraRunning = false

var proc;

const productionUrl = 'http://ec2-18-188-141-169.us-east-2.compute.amazonaws.com'

// const devUrl = 'http://localhost:4001'

const serverUrl = productionUrl
const socket = io(serverUrl)

app.listen(3001, () => console.log(`server listening on port 3001`))


exec('fswebcam -c ./webcam.conf');


const imagePath = "./stream/image_stream.jpg"

// exec('fswebcam -c ./webcam.conf');

console.log('Watching for changes...');

app.set('watchingFile', true);


fs.watchFile(imagePath, { interval: 500 }, function (current, previous) {
    if (cameraRunning) {
        const form = new FormData();
        form.append('file', fs.createReadStream(imagePath));

        const request_config = {
            headers: {
                ...form.getHeaders()
            }
        };

        // console.log("file changed")

        axios.post(productionUrl + '/image-upload', form, request_config)
            .then(function (response) {
                console.log("image emitted")
            })
            .catch(function (error) {
                console.log({ error });
            });;

    }
})


const BUTTON_PIN = 12
// const ORANGE_LED_PIN = 0
const GREEN_LED_PIN = 38
const RED_LED_PIN = 40
gpio.setup(BUTTON_PIN, gpio.DIR_IN, gpio.EDGE_BOTH)
// gpio.setup(ORANGE_LED_PIN, gpio.DIR_OUT)
gpio.setup(GREEN_LED_PIN, gpio.DIR_OUT)
gpio.setup(RED_LED_PIN, gpio.DIR_OUT)


socket.on("approved", (data) => {
    console.log({ data })
    gpio.write(GREEN_LED_PIN, true)
    cameraRunning = false

    setTimeout(() => {
        gpio.write(GREEN_LED_PIN, false)
        console.log("turned off green LED")
    }, 5000)
})

socket.on("denied", (data) => {
    console.log({ data })
    gpio.write(RED_LED_PIN, true)
    cameraRunning = false

    setTimeout(() => {
        gpio.write(RED_LED_PIN, false)
        console.log("turned off red LED")
    }, 5000)

})





gpio.on('change', function (channel, value) {
    // console.log('Channel ' + channel + ' value is now ' + value);
    if (channel === 12 && value) {
        if (!cameraRunning) {
            console.log("camera set to true")
            cameraRunning = true
        }
    }
});


// function angleToPercent(angle) {
//     return Math.floor((angle / 180) * 100);
// }


// var curAngle = 0;
// var direction = 1;
let di = true
setInterval(() => {
    console.log("interval")
    // pass the GPIO number
    var sv1 = new PiServo(11);

    sv1.open().then(function () {
        console.log("run servo")
        sv1.setDegree(di ? 90 : 0); // 0 - 180
    });

    di = !di

    // piblaster.setServoPwm("P1-11", angleToPercent(curAngle) + "%");
    // console.log("Setting angle at: ", curAngle, angleToPercent(curAngle));
    // curAngle += direction;
    // // Change direction when it exceeds the max angle.
    // if (curAngle >= 180) {
    //     direction = -1;
    // } else if (curAngle <= 0) {
    //     direction = 1;
    // }
}, 1000);