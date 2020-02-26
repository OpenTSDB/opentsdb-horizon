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

@State<GridsterUnitSizeModel>({
    name: 'ClientSize',
    defaults: {
        width: 120,
        height: 80,
        winSize: 'md'
    }
})

export class ClientSizeState {

    @Selector() static getUpdatedGridsterUnitSize(state: GridsterUnitSizeModel) {
        return state;
    }

    @Action(UpdateGridsterUnitSize)
    updateGridsterUnitSize(ctx: StateContext<GridsterUnitSizeModel>, { payload }: UpdateGridsterUnitSize) {
        const state = ctx.getState();
        ctx.setState({...state, ...payload});
    }
}
