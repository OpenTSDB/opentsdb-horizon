import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { LoggerService } from "../../core/services/logger.service";
import { UtilsService } from "../../core/services/utils.service";
import { WidgetClipboardService } from "../services/widget-clipboard.service";
import { WidgetModel } from "./widgets.state";

// MODEL INTERFACES
export interface WidgetCopyModel {
    dashboard: {
        id: any;
        path: any;
        name: any;
    };
    widget: WidgetModel;
}

export interface WidgetClipboardModel {
    loaded: boolean;
    items: WidgetCopyModel[];
}

// ACTION DEFINITIONS

export class WidgetClipboardError {
    static readonly type = '[Widgets Copy] Error happened';
    constructor(
        public readonly error: any,
        public readonly label: string = 'Generic Error'
    ) { }
}

export class WidgetClipboardLoad {
    public static type = '[Widgets Copy] Load';
    constructor() { }
}

export class WidgetClipboardLoadSuccess {
    public static type = '[Widgets Copy] Load SUCCESS';
    constructor(
        public readonly response: any
    ) {}
}

export class WidgetClipboardAdd {
    public static type = '[Widgets Copy] Add';
    constructor(
        public readonly item: any
    ) {}
}

export class WidgetClipboardAddSuccess {
    public static type = '[Widgets Copy] Add SUCCESS';
    constructor(
        public readonly response: any
    ) {}
}

export class WidgetClipboardRemove {
    public static type = '[Widgets Copy] Remove';
    constructor(
        public readonly response: any
    ) {}
}

export class WidgetClipboardRemoveSuccess {
    public static type = '[Widgets Copy] Remove SUCCESS';
    constructor(
        public readonly response: any
    ) {}
}


// state
@State<WidgetClipboardModel>({
    name: 'WidgetClipboard',
    defaults: {
        loaded: false,
        items: []
    }
})
export class WidgetClipboardState {
    constructor(
        private utils: UtilsService,
        private logger: LoggerService,
        private store: Store,
        private service: WidgetClipboardService
    ) {}

    // SELECTORS

    @Selector() static clipboardLoaded(state: WidgetClipboardModel) {
        return state.loaded;
    }

    @Selector() static getClipboardItems(state: WidgetClipboardModel) {
        return state.items;
    }

    // ACTIONS
    @Action(WidgetClipboardLoad)
    widgetClipboardLoad(ctx: StateContext<WidgetClipboardModel>, {}: WidgetClipboardLoad) {
        this.logger.action('State :: Load Widget Clipboard Items');


    }


}
