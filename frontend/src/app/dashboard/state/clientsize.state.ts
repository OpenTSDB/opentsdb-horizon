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
import { State, StateContext, Selector, Action } from '@ngxs/store';

export interface GridsterUnitSizeModel {
    width: number;
    height: number;
    winSize: string;
}

// action
export class UpdateGridsterUnitSize {
    public static type = '[Widget] Update Widget Size';
    constructor(public readonly payload: any) {}
}

@Injectable()
@State<GridsterUnitSizeModel>({
    name: 'ClientSize',
    defaults: {
        width: 120,
        height: 80,
        winSize: 'md'
    },
})
export class ClientSizeState {
    @Selector() static getUpdatedGridsterUnitSize(
        state: GridsterUnitSizeModel
    ) {
        return state;
    }

    @Action(UpdateGridsterUnitSize)
    updateGridsterUnitSize(
        ctx: StateContext<GridsterUnitSizeModel>,
        { payload }: UpdateGridsterUnitSize
    ) {
        const state = ctx.getState();
        ctx.setState({ ...state, ...payload });
    }
}
