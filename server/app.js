// Smart Hydrate
// Use Cases:
//   1. Press button1 to start the system
//   2. Press button1 to stop the alert.
//   3. Press button1 to restart the system.
//   4. Press setting button2 to choose/change the frequency of alert.


// Scenario: when you do drink enough water which means the alert will not happen.
// As I don't know how to use resistor in johnny-five, I only write the code for the ideal scenario, I only altered 
// text showed on screen when it came to the alert scenario.

var five = require("johnny-five");
var board = new five.Board(), timer = 5;
var songs = require('j5-songs');
var alert = false, start = false;

board.on("ready", function() {
  var piezo = new five.Piezo(10);
  var led1 = new five.Led(7);
  var led2 = new five.Led(13);
  var stopStartAlert = new five.Button({
    pin: 2,
    isPullup: true
  });
  var setTime = new five.Button({
    pin: 3,
    isPullup: true
  });

  var l = new five.LCD({
    controller: "PCF8574T"
  });

  stopStartAlert.on('press', function(){
    if( alert ) {
      alert = false;
      led1.off();
      led2.off();
    } else {
      start = true;
      led2.on();

    }
  });
  setTime.on('press', function() {
    timer = timer + 5;
    led2.on();
  });

  setInterval( function(){
    if( start ) {
      if( timer >= 0 ) {
        led1.off();
        var n = ('0' + timer--).slice(-2);
        l.cursor(0, 0).print("Time Left 00:" + n + '           ');
        if( timer === 0 ) { alert = true; }
      } else {
        if( alert ) {
          l.cursor(0, 0).print('Good Habits!     ');
          alert = false;
          start = true;
        }
      }
    } else {
      var n = ('0' + timer).slice(-2);
      l.cursor(0, 0).print("Level 1: 5s/ounce");
      led1.off();
    }
  }, 1000);
});
