/*
*  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

// globals main */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

/* globals main, MediaRecorder */

const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var recordedBlobs = [];
let sourceBuffer;

const canvas = document.querySelector('canvas');
const video = document.querySelector('video');

const recordButton = document.querySelector('button#record');
const playButton = document.querySelector('button#play');
const downloadButton = document.querySelector('button#download');
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;
var recorder;
var blobs = [];
// Start the GL teapot on the canvas
main();


var cStream = canvas.captureStream(); // frames per second
var stream = new MediaStream;
var aStream = new MediaStream;

console.log('Started stream capture from canvas element: ', stream);

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}


function toggleRecording() {
  var vCanvas = document.getElementById('recorded');
  var tCanvas = document.getElementById('jeeFaceFilterCanvas');
  if (recordButton.textContent === 'Start Recording') {
    tCanvas.style.display = 'block';
    vCanvas.style.display = 'none';
    startRecording();
  } else {
    stopRecording();
    tCanvas.style.display = 'none';
    vCanvas.style.display = 'block';
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;

    vCanvas.style.position = "relative";
    vCanvas.style.zIndex = "100";
    vCanvas.style.top = "80px";
    vCanvas.style.margin = "auto";
  }
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (audioStream) {

    getTracks(audioStream, 'audio').forEach(function (track) {
      stream.addTrack(track);
    });
    getTracks(cStream, 'video').forEach(function (track) {
      stream.addTrack(track);
    });

    recorder = RecordRTC(stream, {
      type: 'video',
      ondataavailable: function (blob) {
        recordedBlobs.push(blob);
      }
    });
    recordButton.textContent = 'Stop Recording';
    recorder.startRecording();

    playButton.disabled = true;
    downloadButton.disabled = true;
  });;
  //recorder.onstop = handleStop;
}

function stopRecording() {
  recorder.stopRecording(function () {
    var blob = recorder.getBlob();
    //const superBuffer = new File(recordedBlobs, "video.webm",{type: 'video/webm'});
    video.src = window.URL.createObjectURL(blob);

  });
  video.controls = true;
}

function play() {
  video.play();
}

function download() {
  const blob = recorder.getBlob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
