import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {

    private recognition;
    public isStoppedSpeechRecog = true;
    public text = '';
    private tempWords;

    constructor() { }

    init() {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.addEventListener('result', (e) => {
            const transcript = Array.from(e.results)
                .map((result) => result[0])
                .map((result) => result.transcript)
                .join('');

            if (!isNullOrUndefined(transcript)) {
                this.tempWords = transcript;
            }
        });

        return true;
    }

    start() {
        this.isStoppedSpeechRecog = false;
        this.recognition.start();

        this.recognition.addEventListener('end', (condition) => {
            if (this.isStoppedSpeechRecog) {
                this.recognition.stop();
            } else {
                this.wordConcat();
                this.recognition.start();
            }
        });
    }

    stop() {
        this.isStoppedSpeechRecog = true;
        this.wordConcat();
        this.recognition.stop();
    }

    private wordConcat() {
        this.text = this.text + ' ' + this.tempWords + '.';
        this.tempWords = '';
    }
}
