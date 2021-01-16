import { State, StateContext, Action, Selector, createSelector } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { UtilsService } from '../../core/services/utils.service';

export interface Axis {
    type: string;
    min: number;
    max: number;
    label: string;
    unit: string;
    scale: string;
    decimals: number;
    enabled: boolean;
}

export interface ThresholdConfig {
    value: number;
    lineColor: string;
    lineWeight: string;
    linePattern: string;
}

export interface StackConfig {
    id: string;
    label: string;
    color: string;
}

export interface WidgetModel {
    id: string;
    settings: {
        title: string;
        component_type: string;
        data_source?: string;
        description?: string;
        useDBFilter?: boolean;
        time?: any;
        visual?: {
            type?: string;
            stacks?: StackConfig[];
            [x: string]: any;
            showEvents?: boolean;
        };
        axes?: {
            x?: Axis;
            y1?: Axis;
            y2?: Axis;
        };
        legend?: {
            display: boolean;
            position: string;
            columns?: string[];
            tags?: string[];
        };
        thresholds?: ThresholdConfig[];
        multigraph?: any;
        chartOptions?: any;
        batchSelect?: boolean;
    };
    gridPos: {
        x: number;
        y: number;
        w: number;
        h: number;
        xMd?: number;
        yMd?: number;
        wMd?: number;
        hMd?: number;
        xSm?: number;
        ySm?: number;
        wSm?: number;
        hSm?: number
    };
    queries: any[];
    eventQueries?: any[];
}

export interface WidgetsModel {
    widgets: WidgetModel[];
    lastUpdated: {
        id: string,
        widget: any;
        needRefresh: boolean;
    };
}

// actions
export class UpdateWidgets {
    public static type = '[Widget] Update Widgets';
    constructor(public readonly payload: WidgetModel[]) {}
}

export class UpdateGridPos {
    public static type = '[Widget] Update GridPos';
    constructor(public readonly gridpos: any) {}
}

export class UpdateWidget {
    public static type = '[Widget] Update a Widget';
    constructor(public readonly payload: any) {}
}

export class DeleteWidget {
    public static type = '[Widget] Delete Widget';
    constructor(public readonly wid: string) {}
}

@State<WidgetsModel>({
    name: 'Widgets',
    defaults: {
        widgets: [],
        lastUpdated: {
            id: '',
            widget: {},
            needRefresh: true
        }
    }
})

export class WidgetsState {

    constructor(private utils: UtilsService) {}

    @Selector() static getWigets(state: WidgetsModel) {
        return state.widgets;
    }

    @Selector() static lastUpdated(state: WidgetsModel) {
        return state.lastUpdated;
    }

    // a dynamic selector to return a selected widget by id
    static getUpdatedWidget(wid: string) {
        return createSelector([WidgetsState], (state: WidgetModel[]) => {
            return state.filter(w => w.id === wid);
        });
    }

    // update state with the loading dashboard
    @Action(UpdateWidgets)
    updateWidgets(ctx: StateContext<WidgetsModel>, { payload }: UpdateWidgets) {
        ctx.patchState({widgets: payload});
    }

    @Action(UpdateGridPos)
    updateGridPos(ctx: StateContext<WidgetsModel>, { gridpos }: UpdateGridPos) {
        const curState = ctx.getState();
        const state = this.utils.deepClone(curState);
        for (let i = 0; i < state.widgets.length; i++) {
            state.widgets[i].gridPos = {...state.widgets[i].gridPos, ...gridpos[state.widgets[i].id] };
        }
        ctx.patchState({ widgets: state.widgets });
    }

    // updating a widget config after editing it
    // only editing widget needs to update
    @Action(UpdateWidget)
    updateWidget({ setState }: StateContext<WidgetsModel>, { payload }: UpdateWidget) {
        setState(
            patch<WidgetsModel>({
                widgets: updateItem<WidgetModel>(widget => widget.id === payload.id, payload.widget),
                lastUpdated: {
                    id: payload.id,
                    widget: payload.widget,
                    needRefresh: payload.needRequery
                }
            })
        );
    }

    @Action(DeleteWidget)
    deleteWidget(ctx: StateContext<WidgetsModel>, { wid }: DeleteWidget) {
        const curState = ctx.getState();
        const state = this.utils.deepClone(curState);
        const index = state.widgets.findIndex( d => d.id === wid );
        if ( index !== -1 ) {
            state.widgets.splice(index, 1);
            ctx.patchState({ widgets: state.widgets });
        }
    }

}
