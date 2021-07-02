/**
 * This file is part of OpenTSDB.
 * Copyright (C) 2021  Yahoo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    HostBinding
} from '@angular/core';

import { Subscription } from 'rxjs';
import { IntercomService, IMessage } from '../../../../../core/services/intercom.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'generic-message-bar',
    templateUrl: './generic-message-bar.component.html',
    styleUrls: []
})
export class GenericMessageBarComponent implements OnInit, OnDestroy {

    @HostBinding('class.generic-message-bar') private _hostClass = true;

    @HostBinding('class.is-error')      private _errorMsgType = false;
    @HostBinding('class.is-success')    private _successMsgType = false;
    @HostBinding('class.is-warning')    private _warningMsgType = false;
    @HostBinding('class.is-info')       private _infoMsgType = false;

    @HostBinding('class.show-message') private _showMessage = false;

    listenSub: Subscription;

    data: any = {
        message: 'this is a test message'
    };
    // tslint:disable-next-line:no-inferrable-types
    messageType: string = 'error';

    get isVisible() {
        return this._showMessage;
    }

    get fontIcon() {
        switch (this.messageType) {
            case 'error':
                return 'd-urgent-solid';
                break;
            case 'warning':
                return 'd-warning-solid';
                break;
            case 'success':
                return 'd-check-circle-solid';
                break;
            case 'info':
                return 'd-information-circle-solid';
                break;
        }
    }

    constructor(
        private interCom: IntercomService
    ) { }

    ngOnInit() {

        this.listenSub = this.interCom.responseGet().subscribe((message: IMessage) => {

            if (message && message.action) {
                switch (message.action) {
                    case 'genericErrorMessage':
                        this.setTypeClass('error');
                        this.showMessage(message.payload);
                        break;
                    case 'genericSuccessMessage':
                        this.setTypeClass('success');
                        this.showMessage(message.payload);
                        break;
                    case 'genericWarningMessage':
                        this.setTypeClass('warning');
                        this.showMessage(message.payload);
                        break;
                    case 'genericInfoMessage':
                        this.setTypeClass('info');
                        this.data = message.payload;
                        this._showMessage = true;
                        break;
                    default:
                        break;
                }
            }

        });
    }

    ngOnDestroy() {
        this.listenSub.unsubscribe();
    }

    hideMessage() {
        this._showMessage = false;
    }

    showMessage(data?: any) {
        if (data) {
            this.data = data;
        }
        this._showMessage = true;
    }


    setTypeClass(type: string) {
        // set message type
        this.messageType = type.toLowerCase();

        // set HostBinding variables (lines 24-27) to make sure correct class is applied
        this._errorMsgType      = this.messageType === 'error';
        this._successMsgType    = this.messageType === 'success';
        this._warningMsgType    = this.messageType === 'warning';
        this._infoMsgType       = this.messageType === 'info';
    }

}
