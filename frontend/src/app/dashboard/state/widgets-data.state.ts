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
import { Injectable } from '@angular/core';
import {
    State,
    Action,
    StateContext,
    Selector
} from '@ngxs/store';
import { HttpService } from '../../core/http/http.service';
import { UtilsService } from '../../core/services/utils.service';
import { DatatranformerService } from '../../core/services/datatranformer.service';
import { Observable } from 'rxjs';
import { Actions  } from '@ngxs/store';

export interface RawDataModel {
    lastModifiedWidget: {
        wid: string;
        data: any;
    };
}

// action
// payload includes widgetid, groupid and query obj
export class GetQueryDataByGroup {
    public static type = '[Rawdata] Get Query Data By Group';
    constructor(public readonly payload: any) {}
}

export class SetQueryDataByGroup {
    public static type = '[Rawdata] Set Query Data By Group';
    constructor(public readonly payload: any) {}
}

export class ClearQueryData {
    public static type = '[Rawdata] Clear Query Data';
    constructor(public readonly payload: any) {}
}

export class ClearWidgetsData {
    public static type = '[Rawdata] Clear Widgets Data';
    constructor() {}
}

@Injectable()
@State<RawDataModel>({
    name: 'Rawdata',
    defaults: {
        lastModifiedWidget: {
            wid: '',
            data: {},
        },
    },
})
export class WidgetsRawdataState {
    queryObserver: Observable<any>;
    subs: any = {};

    constructor(
        private httpService: HttpService,
        private actions$: Actions,
        private utils: UtilsService,
        private dataTransformer: DatatranformerService,
    ) {}

    @Selector() static getLastModifiedWidgetRawdataByGroup(
        state: RawDataModel,
    ) {
        return state.lastModifiedWidget;
    }

    @Action(GetQueryDataByGroup)
    getQueryDataByGroup(
        ctx: StateContext<RawDataModel>,
        { payload }: GetQueryDataByGroup,
    ) {
        const qid = payload.wid;
        // cancels the previous call
        if (this.subs[qid]) {
            this.subs[qid].unsubscribe();
        }
        this.queryObserver = this.httpService.getOpenTSDBData(payload);

        this.subs[qid] = this.queryObserver.subscribe(
            (data) => {
                data = this.dataTransformer.removeEmptySeries(data);
                payload.data = data;
                ctx.dispatch(new SetQueryDataByGroup(payload));
            },
            (err) => {
                if (err.status !== 400) {
                    payload.error = err;
                }
                ctx.dispatch(new SetQueryDataByGroup(payload));
            },
        );
    }

    @Action(SetQueryDataByGroup)
    setQueryDataByGroup(
        ctx: StateContext<RawDataModel>,
        { payload }: SetQueryDataByGroup,
    ) {
        const qid = payload.wid;
        const wdata =
            payload.data !== undefined
                ? payload.data
                : { error: payload.error };

        const lastModifiedWidget = { wid: payload.wid, data: wdata };
        ctx.patchState({ lastModifiedWidget: lastModifiedWidget });
        if (this.subs[qid]) {
            this.subs[qid].unsubscribe();
        }
        this.queryObserver = null;
    }

    @Action(ClearQueryData)
    clearQueryData(
        ctx: StateContext<RawDataModel>,
        { payload }: ClearQueryData,
    ) {
        const lastModifiedWidget = { wid: payload.wid, data: {} };
        ctx.patchState({ lastModifiedWidget: lastModifiedWidget });
    }

    @Action(ClearWidgetsData)
    clearWidgetsData(ctx: StateContext<RawDataModel>) {
        for (const k in this.subs) {
            if (typeof this.subs[k].unsubscribe === 'function') {
                this.subs[k].unsubscribe();
            }
        }
        ctx.patchState({ lastModifiedWidget: { wid: null, data: {} } });
    }
}
