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