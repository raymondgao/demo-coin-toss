try {
  var SpeechRecognition =  window.webkitSpeechRecognition || window.SpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}


var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');
var noteContent = '';
var recognizing = false;
var quote = '';
// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);



/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;
var mobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  mobile = true;
}
// This block is called every time the Speech APi captures a line. 
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;
  if(!mobile){
      recognition.stop();
  }

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if(!mobileRepeatBug) {
    noteContent = transcript;
    //noteTextarea.val(noteContent);
  }
  
    quote = currentQuote.replace(/[.,\/#!\’\'$%\^&\*;:{}=\-_`~()]/g,"");
    quote = quote.replace(/\s{2,}/g," ");
    quote = quote.toLowerCase();
    quote = quote.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
    transcript = transcript.toLowerCase();
    transcript = transcript.replace(/[.,\/#!\’\'$%\^&\*;:{}=\-_`~()]/g,"");
    result = similarity(quote, transcript);
    output = diffString(transcript,quote);
    const div = document.createElement('div');

    noteDiv = document.getElementById("note-textarea");
    while (noteDiv.firstChild) {
        noteDiv.removeChild(noteDiv.firstChild);
    }

    var x = document.getElementById("snackbar");
    x.textContent = "'Here is the score '  is "+ result +"% accurate";
    x.className = "show";
    output = output + "<p>" + x.textContent;
    div.innerHTML = output
    noteDiv.appendChild(div);
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
};

recognition.onstart = function() { 
  instructions.text('Voice recognition activated. Try speaking into the microphone. Please say ' + currentQuote);
}

recognition.onspeechend = function() {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
    recognizing = false;
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');  
  };
}



/*-----------------------------
      App buttons and input 
------------------------------*/

$('#start-record-btn').on('click', function(e) {
  noteTextarea.val('');
  if (noteContent.length) {
    noteContent += ' ';
  }
  if(recognizing == false){
     recognition.start();
     recognizing = true;
  }
});


$('#pause-record-btn').on('click', function(e) {
  recognition.stop();
  noteTextarea.val('');
  instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function() {
  noteContent = $(this).val();
})

$('#save-note-btn').on('click', function(e) {
  recognition.stop();

  if(!noteContent.length) {
    instructions.text('Could not save empty note. Please add a message to your note.');
  }
  else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.
    saveNote(new Date().toLocaleString(), noteContent);

    // Reset variables and update UI.
    noteContent = '';
    renderNotes(getAllNotes());
    noteTextarea.val('');
    instructions.text('Note saved successfully.');
  }
      
})


notesList.on('click', function(e) {
  e.preventDefault();
  var target = $(e.target);

  // Listen to the selected note.
  if(target.hasClass('listen-note')) {
    var content = target.closest('.note').find('.content').text();
    readOutLoud(content);
  }

  // Delete note.
  if(target.hasClass('delete-note')) {
    var dateTime = target.siblings('.date').text();  
    deleteNote(dateTime);
    target.closest('.note').remove();
  }
});



/*-----------------------------
      Speech Synthesis 
------------------------------*/

function readOutLoud(message) {
	var speech = new SpeechSynthesisUtterance();

  // Set the text and voice attributes.
	speech.text = message;
	speech.volume = 1;
	speech.rate = .6;
	speech.pitch = 1.4
  
	window.speechSynthesis.speak(speech);
}



/*-----------------------------
      Helper Functions 
------------------------------*/

function renderNotes(notes) {
  var html = '';
  if(notes.length) {
    notes.forEach(function(note) {
      html+= `<li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
          <a href="#" class="delete-note" title="Delete">Delete</a>
        </p>
        <p class="content">${note.content}</p>
      </li>`;    
    });
  }
  else {
    html = '<li><p class="content"></p></li>';
  }
  notesList.html(html);
}


function saveNote(dateTime, content) {
  localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
  var notes = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);

    if(key.substring(0,5) == 'note-') {
      notes.push({
        date: key.replace('note-',''),
        content: localStorage.getItem(localStorage.key(i))
      });
    } 
  }
  return notes;
}


function deleteNote(dateTime) {
  localStorage.removeItem('note-' + dateTime); 
}


function similarity(a,b) {
  // splitting and sorting arrays (for easier and faster search)
  var arrayA = a.split(/\W/g).sort(),
      arrayB = b.split(/\W/g).sort(),
      uniqueA = [];
      uniqueB = [];
      $.each(arrayA, function(i, el){
         if($.inArray(el, uniqueA) === -1) uniqueA.push(el);
      });

      $.each(arrayB, function(i, el){
         if($.inArray(el, uniqueB) === -1) uniqueB.push(el);
      });

      result = 0

  // loop through a
  for (var i=0,imax=uniqueA.length;i<imax;i++)
    // for every word find amount of occurences in text b
    result += uniqueB.reduce(function(a,b){
                return a + (uniqueA[i] == b?1:0)
              },0)

  // change here to your understanding of similarity
  return Math.round((result/imax * 100)* 100) / 100;
}
