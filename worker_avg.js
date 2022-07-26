'use strict';

// Dieser Worker soll für ein gegebenes Bild die Helligkeitsverteilung ermitteln
// Rückgabe soll ein Array sein, das für jede Helligkeitsstufe die Anzahl an Pixeln in dieser Helligkeitsstufe enthält

self.onmessage = msg => {

    let data = msg.data;

    let brightness = [...new Array(256)].map(() => 0);

    for ( let i = 0; i < data.length; i+=4){
        let avg = data[i] + data[i+1] + data[i+2];
        avg /= 3;
        avg = Math.round(avg);

        brightness[avg]++;
    }

    self.postMessage(brightness);

}
