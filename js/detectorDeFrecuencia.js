/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Se asegura de que se utiliza el contexto de audio adecuado en todos los navegadores
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// Inicialización de variables globales
var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;

var mediaStreamSource = null;
var detectorElem, pitchElem, detuneElem, detuneAmount;

// La función window.onload se ejecuta cuando se carga completamente el documento HTML
window.onload = function () {
  // Crea un contexto de audio
  // El objeto AudioContext es parte de la Web Audio API, que es una interfaz de programación
  //  de aplicaciones (API) de JavaScript diseñada para procesar y sintetizar audio en la web.
  //  No es parte de JavaScript puro estándar, sino que es una API específica del navegador que
  //   proporciona funcionalidades avanzadas para trabajar con audio en aplicaciones web.

  audioContext = new AudioContext();
  // Define el tamaño máximo para el análisis de frecuencia
  MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 5000)); // corresponde a una señal de 5kHz

  detectorElem = document.getElementById("detector");
  pitchElem = document.getElementById("pitch");
  detuneElem = document.getElementById("detune");
  detuneAmount = document.getElementById("detune_amt");
};



// Inicia la detección de tono desde una fuente de audio en vivo
function startPitchDetect() {

  sourceNode = audioContext.createOscillator();
  analyser = audioContext.createAnalyser(); 
  sourceNode.start(0);
  isPlaying = true;
  isLiveInput = false; 


  // Intenta obtener la entrada de audio
  navigator.mediaDevices
    .getUserMedia({
      audio: {
        mandatory: {
          googEchoCancellation: "false",
          googAutoGainControl: "false",
          googNoiseSuppression: "false",
          googHighpassFilter: "false",
        },
        optional: [],
      },
    })
    .then((stream) => {
      // Crea un nodo de audio a partir del flujo de entrada
      mediaStreamSource = audioContext.createMediaStreamSource(stream);

      // Conecta el nodo de entrada al analizador de frecuencia
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      
      mediaStreamSource.connect(analyser);
      // Actualiza continuamente la frecuencia de tono
      updatePitch();
    })
    .catch((err) => {
      // Verifica siempre los errores
      console.error(`${err.name}: ${err.message}`);
      alert("La generación del flujo falló.");
    });
}



// Alterna la entrada de audio en vivo
function toggleLiveInput() {
  if (isPlaying) {
    // Detiene la reproducción y retorna
    sourceNode.stop(0);
    sourceNode = null;
    analyser = null;
    isPlaying = false;
    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
    window.cancelAnimationFrame(rafID);
  }
  getUserMedia(
    {
      audio: {
        mandatory: {
          googEchoCancellation: "false",
          googAutoGainControl: "false",
          googNoiseSuppression: "false",
          googHighpassFilter: "false",
        },
        optional: [],
      },
    },
    gotStream
  );
}

var rafID = null;
var tracks = null;
var buflen = 2048;
var buf = new Float32Array(buflen);

// Implementa el algoritmo de autocorrelación para la detección de tono
// el algoritmo de autocorrelación es una técnica comúnmente utilizada en procesamiento de señales
//  para determinar la periodicidad de una señal. En el contexto de la detección de tono,
//  este algoritmo se utiliza para estimar la frecuencia fundamental de una señal de audio,
//   es decir, la frecuencia principal que define el tono de la señal.
function autoCorrelate(buf, sampleRate) {
  var SIZE = buf.length;
  var rms = 0;

  for (var i = 0; i < SIZE; i++) {
    var val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.005)
    // no hay suficiente señal
    return -1;

  var r1 = 0,
    r2 = SIZE - 1,
    thres = 0.2;
  for (var i = 0; i < SIZE / 2; i++)
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  for (var i = 1; i < SIZE / 2; i++)
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  var c = new Array(SIZE).fill(0);
  for (var i = 0; i < SIZE; i++)
    for (var j = 0; j < SIZE - i; j++) c[i] = c[i] + buf[j] * buf[j + i];

  var d = 0;
  while (c[d] > c[d + 1]) d++;
  var maxval = -1,
    maxpos = -1;
  for (var i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  var T0 = maxpos;

  var x1 = c[T0 - 1],
    x2 = c[T0],
    x3 = c[T0 + 1];
  a = (x1 + x3 - 2 * x2) / 2;
  b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

// Actualiza continuamente la frecuencia de tono
function updatePitch(time) {
  var cycles = new Array();
  analyser.getFloatTimeDomainData(buf);
  var ac = autoCorrelate(buf, audioContext.sampleRate);

  if (ac == -1) {
    detectorElem.className = "vague";
    pitchElem.innerText = "--";
  } else {
    detectorElem.className = "confident";
    pitch = ac;
    pitchElem.innerText = Math.round(pitch);
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  rafID = window.requestAnimationFrame(updatePitch);
}


