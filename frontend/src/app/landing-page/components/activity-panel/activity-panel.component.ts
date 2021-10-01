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
import { Component, OnInit, HostBinding } from '@angular/core';

import * as moment from 'moment';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'activity-panel',
    templateUrl: './activity-panel.component.html',
    styleUrls: ['./activity-panel.component.scss']
})
export class ActivityPanelComponent implements OnInit {
    @HostBinding('class.activity-panel') private _hostClass = true;

    // TODO: Make this real data. The format is subject to change. Just for getting some UI elements in place.
    fakeActivityData: Array<any> = [
        {
            day: 'TODAY',
            hours: [
                {
                    hour: '02:00 PM',
                    events: [
                        {
                            time: '02:45 PM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '02:32 PM',
                            type: 'dashboard',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '02:13 PM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '02:02 PM',
                            type: 'admin',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '02:01 PM',
                            type: 'alert',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                },
                {
                    hour: '12:00 PM',
                    events: [
                        {
                            time: '12:45 PM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '12:32 PM',
                            type: 'dashboard',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '12:13 PM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                },
                {
                    hour: '09:00 AM',
                    events: [
                        {
                            time: '09:45 AM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:13 AM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:02 AM',
                            type: 'admin',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:01 AM',
                            type: 'alert',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                },
                {
                    hour: '07:00 AM',
                    events: [
                        {
                            time: '07:45 AM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:32 AM',
                            type: 'dashboard',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:13 AM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:02 AM',
                            type: 'admin',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:01 AM',
                            type: 'alert',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                }
            ]
        },
        {
            day: 'YESTERDAY',
            hours: [
                {
                    hour: '12:00 PM',
                    events: [
                        {
                            time: '12:45 PM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '12:32 PM',
                            type: 'dashboard',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '12:13 PM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                },
                {
                    hour: '09:00 AM',
                    events: [
                        {
                            time: '09:45 AM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:13 AM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:02 AM',
                            type: 'admin',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:01 AM',
                            type: 'alert',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                },
                {
                    hour: '07:00 AM',
                    events: [
                        {
                            time: '07:45 AM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:32 AM',
                            type: 'dashboard',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:13 AM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:02 AM',
                            type: 'admin',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:01 AM',
                            type: 'alert',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                }
            ]
        },
        {
            day: 'AUG 12',
            hours: [
                {
                    hour: '12:00 PM',
                    events: [
                        {
                            time: '12:45 PM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '12:32 PM',
                            type: 'dashboard',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '12:13 PM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                },
                {
                    hour: '09:00 AM',
                    events: [
                        {
                            time: '09:45 AM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:13 AM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:02 AM',
                            type: 'admin',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '09:01 AM',
                            type: 'alert',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                },
                {
                    hour: '07:00 AM',
                    events: [
                        {
                            time: '07:45 AM',
                            type: 'namespace',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:32 AM',
                            type: 'dashboard',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:13 AM',
                            type: 'bug',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:02 AM',
                            type: 'admin',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        },
                        {
                            time: '07:01 AM',
                            type: 'alert',
                            message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
                        }
                    ]
                }
            ]
        }
    ];

    constructor() { }

    ngOnInit() {
    }


    hourEventTypes(events: any) {
        const types = {};

        for (const ev of events) {
            if (!types[ev.type]) {
                types[ev.type] = 1;
            }
        }

        return Object.keys(types);

    }

}
