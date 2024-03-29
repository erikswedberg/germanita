/*
Copyright (c) 2011 Rdio Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

// a global variable that will hold a reference to the api swf once it has loaded
var apiswf = null;


// Some constants used for communicating with The Echo Nest API
// and the link affiliate

var version = "v1.0";
var host = 'developer.echonest.com';
var std_params = "?api_key=" + echonest_api_key +  "&format=jsonp" + "&callback=?" ;
//var std_params = "?api_key=GPMDLFZYI599QAAY8" + "&format=json";
var std_sim_params = std_params + "&bucket=id:rdio-us-streaming&limit=true";

var playFlag = false;

$(document).ready(function() {
  // on page load use SWFObject to load the API swf into div#apiswf
  var flashvars = {
    'playbackToken': playback_token, // from token.js
    'domain': domain,                // from token.js
    'listener': 'callback_object'    // the global name of the object that will receive callbacks from the SWF
    };
  var params = {
    'allowScriptAccess': 'always'
  };
  var attributes = {};
  swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
      'apiswf', // the ID of the element that will be replaced with the SWF
      1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);


  // set up the controls
  $('#play').click(function() {
    //apiswf.rdio_play($('#play_key').val());
	initPlay($('#play_key').val());
	playFlag = true;
  });
  $('#stop').click(function() { apiswf.rdio_stop(); playFlag = false; });
  $('#pause').click(function() { apiswf.rdio_pause();
	playFlag = false;
	//if (playFlag) { playFlag = false; } else { playFlag = true; }
	 });
  $('#previous').click(function() { apiswf.rdio_previous(); });
  $('#next').click(function() { apiswf.rdio_next(); });
});


function initPlay(thisRdioTrack) {
	
           apiswf.rdio_play(thisRdioTrack);

}


function getEchonestTrackId(rdioTrackArtist, rdioTrackTitle, rdioTrackId) {
		
		var url = "http://" + host + "/api/v4/song/search" + std_params + 
		        "&bucket=id:rdio-us-streaming&results=1&artist=" + rdioTrackArtist + "&title="+rdioTrackTitle;
	
	
			$.getJSON(url, null, function(data) {
			    if (checkResponse(data)) {

					console.log(data);
					

					if (data.response.songs && data.response.songs.length > 0) {
						
						
						getEchoNestTrackMetadata(data.response.songs[0].id);
						
					}

			    }
			});
	
}


function getEchoNestTrackMetadata(echonestTrackId) {
	
		var url = "http://" + host + "/api/v4/song/profile" + std_params + 
		        "&bucket=audio_summary&id=" + echonestTrackId;
		
		$.getJSON(url, null, function(data) {
		    if (checkResponse(data)) {
		
				console.log(data);
				
				if (data.response.songs && data.response.songs.length > 0) {
					
					info('<h3>bpm: '+ data.response.songs[0].audio_summary.tempo + '</h3>');
					
					callBPM(Math.round(data.response.songs[0].audio_summary.tempo));
					
					//getEchoNestTrackAnalysis(data.response.songs[0].audio_summary.analysis_url);
					
				}
		
			}
		});
	
}

function getEchoNestTrackAnalysis(echonestTrackAnalysisUrl) {
	
	
		/*
		//curl -F "api_key=N6E4NIOVYMTHNDM8J" -F "format=json" -F "id=TRXXHTJ1294CD8F3B3" -F "bucket=audio_summary" 
		
		console.log(echonestTrackAnalysisUrl);
		
		$.ajax({
		  url: echonestTrackAnalysisUrl+"&jsonp=if(typeof(Delicious)%3D%3D%27undefined%27)Delicious%3D%7B%7D%3BDelicious.posts%3D",
		  dataType: 'jsonp',
		  success: getEchoNestTrackAnalysisCB
		});
		*/
	
}

function getEchoNestTrackAnalysisCB(data) {
	console.log(data);
}

function getAnalysis(data) {
	
	console.log('here');
	//console.log(data);
	
}

function callBPM(thisBPM) {
	
	var url = "/bpm";
	
	$.post(
		url,
		{bpm: thisBPM},
		function(data)
		{

			console.log(data);

	});
	
}

function callIntensity(thisVol) {

	var url = "/volume";
	
	$.post(
		url,
		{volume: thisVol},
		function(data)
		{

			console.log(data);

	});

}


// the global callback object
var callback_object = {};

callback_object.ready = function ready() {
  // Called once the API SWF has loaded and is ready to accept method calls.

  // find the embed/object element
  apiswf = $('#apiswf').get(0);

  apiswf.rdio_startFrequencyAnalyzer({
   frequencies: '4-band',
   period: 100
 })
}

callback_object.playStateChanged = function playStateChanged(playState) {
  // The playback state has changed.
  // The state can be: 0 - paused, 1 - playing, 2 - stopped, 3 - buffering or 4 - paused.
  $('#playState').text(playState);
}

callback_object.playingTrackChanged = function playingTrackChanged(playingTrack, sourcePosition) {
  // The currently playing track has changed.
  // Track metadata is provided as playingTrack and the position within the playing source as sourcePosition.

	console.log(playingTrack);

  if (playingTrack != null) {
    $('#track').text(playingTrack['name']).css({visibility: 'visible'});
    $('#album').text(playingTrack['album']).css({visibility: 'visible'});
    $('#artist').text(playingTrack['artist']).css({visibility: 'visible'});
    $('#art').attr('src', playingTrack['icon']).css({visibility: 'visible'});

	getEchonestTrackId(playingTrack['artist'], playingTrack['name']);

  }
}

callback_object.playingSourceChanged = function playingSourceChanged(playingSource) {
  // The currently playing source changed.
  // The source metadata, including a track listing is inside playingSource.
}

callback_object.volumeChanged = function volumeChanged(volume) {
  // The volume changed to volume, a number between 0 and 1.
}

callback_object.muteChanged = function muteChanged(mute) {
  // Mute was changed. mute will either be true (for muting enabled) or false (for muting disabled).
}

callback_object.positionChanged = function positionChanged(position) {
  //The position within the track changed to position seconds.
  // This happens both in response to a seek and during playback.
  $('#position').text(position);
}

callback_object.queueChanged = function queueChanged(newQueue) {
  // The queue has changed to newQueue.
}

callback_object.shuffleChanged = function shuffleChanged(shuffle) {
  // The shuffle mode has changed.
  // shuffle is a boolean, true for shuffle, false for normal playback order.
}

callback_object.repeatChanged = function repeatChanged(repeatMode) {
  // The repeat mode change.
  // repeatMode will be one of: 0: no-repeat, 1: track-repeat or 2: whole-source-repeat.
}

callback_object.playingSomewhereElse = function playingSomewhereElse() {
  // An Rdio user can only play from one location at a time.
  // If playback begins somewhere else then playback will stop and this callback will be called.
}

callback_object.updateFrequencyData = function updateFrequencyData(arrayAsString) {
  // Called with frequency information after apiswf.rdio_startFrequencyAnalyzer(options) is called.
  // arrayAsString is a list of comma separated floats.

//	console.log(arrayAsString);

  var arr = arrayAsString.split(',');

  //$('#freq div').each(function(i) {
  //  $(this).width(parseInt(parseFloat(arr[i])*500));
  //})

	var thisAvg = 0;

	var i = 0;
	for (i=0; i<arr.length; i++) {
		
		thisAvg += parseInt(parseFloat(arr[i])*350);
		
	}
	
	thisAvg = (thisAvg / i);
	
	if (thisAvg > 255) { thisAvg = 255; }
	
	$('#freq div').each(function(j) {
	   //$(this).width(thisAvg);
		$(this).height(Math.floor(thisAvg / 255 * 200));
	})
	
	if (playFlag) {
		callIntensity(Math.round(thisAvg));
	}
	
	info(thisAvg);

}

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};

function error(msg) {
    Log.write(msg);
}

function info(msg) {
    Log.write(msg);
}

function warn(msg) {
    Log.write(msg);
}

function log(msg) {
    Log.write(msg);
}

// Performs basic error checking on the return response from the JSONP call
function checkResponse(data) {
    if (data.response) {
        if (data.response.status.code !== 0) {
            error("Whoops... Unexpected error from server. " + data.response.status.message);
        } else {
            return true;
        }
    } else {
        error("Unexpected response from server");
    }
    return false;
}

function getFullPath() {
    var path = findPath();
    var url = window.location.protocol + "//" + window.location.host + "?path=" + path.join(",");
    return url;
}
function DumpObject(obj)
{
  var od = new Object;
  var result = "";
  var len = 0;

  for (var property in obj)
  {
    var value = obj[property];
    if (typeof value == 'string')
      value = "'" + value + "'";
    else if (typeof value == 'object')
    {
      if (value instanceof Array)
      {
        value = "[ " + value + " ]";
      }
      else
      {
        var ood = DumpObject(value);
        value = "{ " + ood.dump + " }";
      }
    }
    result += "'" + property + "' : " + value + ", ";
    len++;
  }
  od.dump = result.replace(/, $/, "");
  od.len = len;

  return od;
}