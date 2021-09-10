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
import { State, Action, StateContext, Selector } from '@ngxs/store';

// this is just schema for what a config should be
export interface WidgetConfig {
    id: {
        gridPos: {
            x: number;
            y: number;
            w: number;
            h: number;
            xMd?: number;
            yMd?: number;
        },
        query: {
            start: string;
            end?: string;
            downsample: string;
            groups: any[];
        }
    }
}

// action

export class LoadWidgetsConfig {
    public static type = '[Widget] Load Widgets Config';
    constructor(public readonly payload: any[]) {}
}

/* the idea is hash object with id => config */

@State<any>({
    name: 'Configs',
    defaults: []
})

export class WidgetsConfigState {

    @Selector() static getWidgetsConfig(state: any) {
        return state;
    } 

    @Action(LoadWidgetsConfig)
    loadWidgetsConfig(ctx: StateContext<any>, { payload }: LoadWidgetsConfig) {
        const state = ctx.getState();
        //ctx.setState({...state, ...payload});
        ctx.setState(payload);
    }
}