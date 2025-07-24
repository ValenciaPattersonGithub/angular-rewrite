import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VoiceRecognitionService } from '../../../providers/voice-recognition/voice-recognition.service';

export interface IWindow extends Window {
    webkitSpeechRecognition: any;
}

@Component({
    selector: 'app-textarea-with-voice',
    templateUrl: './textarea-with-voice.component.html',
    styleUrls: ['./textarea-with-voice.component.scss'],
    providers: [VoiceRecognitionService]
})
export class TextareaWithVoiceComponent implements OnInit {
    isSpeechInit = false;

    constructor(public voiceRecognitionService: VoiceRecognitionService) {
        this.isSpeechInit = this.voiceRecognitionService.init();
    }

    ngOnInit(): void { 
    }

    toggleDictation() {
        if (this.voiceRecognitionService.isStoppedSpeechRecog) {
            this.voiceRecognitionService.start();
        } else {
            this.voiceRecognitionService.stop();
        }
    }
}
