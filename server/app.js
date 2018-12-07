// Smart Hydrate
// Use Cases:
//   1. Press setting to specify ratio liquid consumption across time
//   2. Press start button to begin timer countdown
//   3. Press pause to reload water or hold to stop play
//   4. Read timer countdown
//   5. Receive notice on screen, alert sound and/or sms message to Hydrate ASAP
//   6. Watchdog timer resets whenever water level reading goes up

var five = require("johnny-five");
var songs = require('j5-songs');

var board = new five.Board();
var alert = false,
  waterSensor, waterLevel,
  startGame = false, pauseGame = false, playLevel = 1,
  piezo, lcd, stopPauseStartButton, setSettingButton,
  drinkDelta = 0, currentTime, setTime;

var displayLevel = function(msg) {
  lcd.clear();
  lcd.cursor(0,0).print( msg );
  lcd.cursor(1,0).print('Level: '+ playLevel)
};
var displayTime = function( msg ) {
  currentTime = new Date();
  setTime = new Date( currentTime.getTime() );
  setTime.setSeconds( currentTime.getSeconds() + drinkDelta );

  var lengthTime = setTime - currentTime;
  var hours = Math.floor((lengthTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((lengthTime % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((lengthTime % (1000 * 60)) / 1000);

  lcd.clear();
  lcd.cursor(0,0).print( msg );
  if( lengthTime > 0 ) {
    if( waterLevel > 100 ) {
      drinkDelta = 0;
      lcd.clear();
      lcd.cursor(0,0).print( 'Hurray! You met         ' );
      lcd.cursor(1,0).print( 'your goal.           ');
      startGame = false;
    } else {
      lcd.cursor(1,0).print(hours + "h " + minutes + "m " + seconds + "s ");
    }
  } else {
    if( waterLevel < 100 ) {
      lcd.cursor(1,0).print('Hydrate ASAP!');
      if( !alert ) {
        piezo.play( songs.load('mario-intro') );
        alert = true;
      }
    }
  }
};

board.on("ready", function() {
  piezo = new five.Piezo(10);
  waterSensor = new five.Sensor({
    pin: 'A0',
    freq: 1000
  });
  waterSensor.on("data", function(val) {
    val = (val / 10).toFixed();
    if( val < waterLevel ) { // new water reading > current, reset drinkDelta
      drinkDelta  = (playLevel+1) * 15;
    }
    waterLevel = val;
  });
  lcd = new five.LCD({
    controller: "PCF8574T"
  });
  stopPauseStartButton = new five.Button({
    pin: 2,
    isPullup: true
  });
  stopPauseStartButton.on('press', function(){
    if( !startGame ) {
      drinkDelta  = (playLevel+1) * 15;
      startGame = true;
    } else {
      pauseGame = !pauseGame;
    }
  });
  stopPauseStartButton.on('hold', function() {
    startGame = false;
    drinkDelta = 1;
    playLevel = 0;
    alert = false;
    displayLevel('Select Level');
  });
  setSettingButton = new five.Button({
    pin: 3,
    isPullup: true
  });
  setSettingButton.on('press', function() {
    if( startGame ) { // cannot change setting when game running
      return;
    }
    playLevel = playLevel + 1;
    if( playLevel > 4 ) {
      playLevel = 0;
    }
    displayLevel('Select Level');
  });
  displayLevel('Select Level');
});
setInterval( function() {
  if( startGame && !pauseGame ) {
    drinkDelta = drinkDelta - 1;
    displayTime('Time Remaining');
  }
}, 1000);