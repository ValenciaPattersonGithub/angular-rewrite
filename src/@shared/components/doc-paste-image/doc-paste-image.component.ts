import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
declare var _: any;
declare var window: any;

@Component({
    selector: 'doc-paste-image',
    templateUrl: './doc-paste-image.component.html',
    styleUrls: ['./doc-paste-image.component.scss']
})
export class DocPasteImageComponent implements OnInit {

    @Output() pasteSuccess = new EventEmitter<File>();
    processingImage = false;
    isIE = false;
    dataUrl: String;

    @Input()
    set pasteActive(pasteActive: boolean) {
        if (!pasteActive) {
            this.reset();
        }
    }

    constructor() { }

    ngOnInit() {
        this.isIE = window.PattersonWindow.isIE;
    }

    onPaste(event: ClipboardEvent) {
        event.preventDefault();

        let clipboardData = !this.isIE ? event.clipboardData : window.clipboardData;
        if (!clipboardData) return;

        let file: File;
        if (clipboardData.files && clipboardData.files.length > 0 && clipboardData.files[0].type.startsWith('image/')) {
            file = clipboardData.files[0];
        } else if (clipboardData.items && clipboardData.items.length > 0 && clipboardData.items[0].type.startsWith('image/')) {
            file = clipboardData.items[0].getAsFile();
        }
        if (file) {
            let reader = new FileReader();
            reader.onload = (e: any) => {
                this.dataUrl = e.target.result;
            };
            reader.readAsDataURL(file);
            this.pasteSuccess.emit(file);
        }

        return false;
    }

    onLoad() {
        this.processingImage = false;
    }

    onKeyDown(event: KeyboardEvent) {
        if (this.isIE && !(event.ctrlKey && event.keyCode === 86))
            event.preventDefault();
    }

    reset() {
        this.dataUrl = null;
    }

}
