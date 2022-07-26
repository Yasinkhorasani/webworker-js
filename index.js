'use strict';

import dom from './dom.js';
import settings from './settings.js';

const elements = {};

// FUNKTIONEN
const renderAvg = c => {
    const ctx = c.getContext("2d");

    const workerAvg = new Worker('./worker_avg.js');
    const bildDaten = ctx.getImageData(0, 0, c.width, c.height);

    workerAvg.postMessage(bildDaten.data);

    workerAvg.onmessage = msg => {
        let data = msg.data;
        workerAvg.terminate();

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        let max = c.width * c.height;
        data.forEach((value, index) => {
            ctx.lineTo(
                c.width / 256 * index,
                c.height - (c.height / max * value * settings.amp)
            )
        })
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#fff";
        data.forEach((value, index) => {
            ctx.lineTo(
                c.width / 256 * index,
                c.height - (c.height / max * value * settings.amp)
            )
        })
        ctx.stroke();
    }
}

const renderColor = (c, channel) => {
    const ctx = c.getContext("2d");

    const workerAvg = new Worker('./worker_color.js');
    const bildDaten = ctx.getImageData(0, 0, c.width, c.height);

    workerAvg.postMessage({
        data: bildDaten.data,
        channel
    });

    workerAvg.onmessage = msg => {
        let data = msg.data;
        workerAvg.terminate();

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        let max = c.width * c.height;

        // Zeiger an Startpunkt setzen
        ctx.moveTo(
            0,
            c.height - (c.height / max * data[0] * settings.amp)
        )
        // Zeichnen
        data.forEach((value, index) => {
            ctx.lineTo(
                c.width / 256 * index,
                c.height - (c.height / max * value * settings.amp)
            )
        })
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgb(${channel == 0 ? 255 : 0},${channel == 1 ? 255 : 0},${channel == 2 ? 255 : 0})`;

        // Zeiger an Startpunkt setzen
        ctx.moveTo(
            0,
            c.height - (c.height / max * data[0] * settings.amp)
        )
        // Zeichnen
        data.forEach((value, index) => {
            ctx.lineTo(
                c.width / 256 * index,
                c.height - (c.height / max * value * settings.amp)
            )
        })
        ctx.stroke();
    }
}

// Bild ins Canvas zeichnen und 
const renderCanvas = (c, img) => {
    const ctx = c.getContext("2d");

    ctx.drawImage(img, 0, 0, c.width, c.height);

    renderColor(c, 0);
    renderColor(c, 1);
    renderColor(c, 2);

    renderAvg(c);

}

const createCanvas = img => {

    // Eltern-Element
    const container = dom.create({
        parent: elements.output,
        classes: ['container']
    })

    // Zu füllender Canvas
    const c = dom.create({
        parent: container,
        type: 'canvas',
        attr: {
            height: settings.imgHeight,
            // Breite des Canvas verwendet die wirklichen Ausmaße des Bildes für die Proportionen
            width: settings.imgHeight / img.naturalHeight * img.naturalWidth
        }
    })

    // Knopf zum Entfernen des Bildes
    const btnClose = dom.create({
        type: 'button',
        parent: container,
        content: 'Close',
        listeners: {
            click() {
                container.remove();
            }
        }
    })

    return c;

}

const loadImage = () => {
    // console.log(elements.inputURL.value);
    // Um mit DOM-Elementen zu arbeiten genügt es, darauf zugreifen zu können.
    // Sie müssen dafür nicht unbedingt in der Webseite angezeigt werden

    // URL zwischenspeichern, damit sie nicht zwischenzeitlich verändert werden kann
    let url = elements.inputURL.value;

    const img = dom.create({
        type: 'img',
        attr: {
            // Zusätzliche Attribute, um einen Crossorigin-Fehler zu beheben, der bei der Canvas-Verarbeitung sonst auftritt
            src: url + '?' + new Date().getTime(),
            crossOrigin: ''
        },
        listeners: {
            // Um auf die Bilddaten zurückgreifen zu können, muss das Bild vollständig geladen sein
            load() {
                let c = createCanvas(img);
                renderCanvas(c, img);
                elements.inputURL.value = '';
            },
            error(evt) {
                console.log(`${url} konnte nicht geladen werden.`);
            }
        }
    })
}

const domMapping = () => {
    elements.inputURL = dom.$('#inputURL');
    elements.btnLoad = dom.$('#btnLoad');
    elements.output = dom.$('#output');

    elements.btnLoad.addEventListener('click', loadImage);
    elements.inputURL.addEventListener('keydown', evt => {
        // Checken, ob die Enter-Taste gedrückt wurde
        if (evt.key == 'Enter') loadImage();
    });
}

const init = () => {
    domMapping();
}

init();