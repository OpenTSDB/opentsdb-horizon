import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { LoggerService } from "../../core/services/logger.service";
import { UtilsService } from "../../core/services/utils.service";
import { WidgetModel } from "../../dashboard/state";
import { ClipboardService } from "../services/clipboard.service";
import { DbfsFileModel, DbfsFolderModel } from "./dbfs-resources.interfaces";


// MODEL INTERFACES

// this is basically a modified widget model
/*export interface ClipboardItemModel {
    dashboard: {
        id: any;
        fullPath: any;
        path: any;
        name: any;
    };
    widget: WidgetModel;
}*/

// this.is basially a DBFS file/dashboard
export interface ClipboardModel {
    resource: any; // pointer to DBFS file resource <DbfsFileModel>
    active: boolean; // actual dashboard content
}

// this is basically loads and transforms a DBFS folder '/user/[user.namer]/_clipboard_'
export interface ClipboardResourceModel {
    loaded: boolean;
    resource: any; // pointer to DBFS folder resource <DbfsFolderModel>
    clipboardsList: ClipboardModel[];  // list of clipboards ClipboardModel[]
    clipboard: any; // active clipboard
}

// ACTION DEFINITIONS

export class WidgetClipboardError {
    static readonly type = '[Clipboard] Error happened';
    constructor(
        public readonly error: any,
        public readonly label: string = 'Generic Error'
    ) { }
}

export class ClipboardResourceInitialize {
    public static type = '[Clipboard] Initialize';
    constructor() { }
}

/** CLIPBOARD ACTION */

// Create CLIPBOARD
export class ClipboardCreate {
    public static type = '[Clipboard] Create';
    constructor(
        public readonly clipboard: any
    ) {}
}

export class ClipboardCreateSuccess {
    public static type = '[Clipboard] Create SUCCESS';
    constructor(
        public readonly response: any
    ) {}
}

// Delete/remove CLIPBOARD
export class ClipboardRemove {
    public static type = '[Clipboard] Remove';
    constructor(
        public readonly clipboard: any
    ) {}
}

export class ClipboardRemoveSuccess {
    public static type = '[Clipboard] Remove SUCCESS';
    constructor(
        public readonly response: any
    ) {}
}

// Modify (rename maybe?) CLIPBOARD
export class ClipboardModify {
    public static type = '[Clipboard] Modify';
    constructor(
        public readonly clipboard: any
    ) {}
}

export class ClipboardModifySuccess {
    public static type = '[Clipboard] Modify SUCCESS';
    constructor(
        public readonly response: any
    ) {}
}

// Load a CLIPBOARD into active
export class ClipboardLoad {
    public static type = '[Clipboard] Load';
    constructor() { }
}

export class ClipboardLoadSuccess {
    public static type = '[Clipboard] Load SUCCESS';
    constructor(
        public readonly response: any
    ) { }
}

/** CLIPBOARD ITEM(S) */
export class ClipboardAddItem {
    public static type = '[Clipboard] Add Item';
    constructor(
        public readonly item: any,
        public readonly index: any
    ) { }
}

export class ClipboardAddItemSuccess {
    public static type = '[Clipboard] Add Item SUCCESS';
    constructor(
        public readonly response: any
    ) { }
}

export class ClipboardRemoveItem {
    public static type = '[Clipboard] Remove Item';
    constructor(
        public readonly item: any,
        public readonly index: any
    ) { }
}

export class ClipboardRemoveItemSuccess {
    public static type = '[Clipboard] Remove Item SUCCESS';
    constructor(
        public readonly response: any
    ) { }
}

export class ClipboardModifyItem {
    public static type = '[Clipboard] Modify Item';
    constructor(
        public readonly item: any,
        public readonly index: any
    ) {}
}

export class ClipboardModifyItemSuccess {
    public static type = '[Clipboard] Modify Item SUCCESS';
    constructor(
        public readonly response: any
    ) {}
}


// state
@State<ClipboardResourceModel>({
    name: 'Clipboard',
    defaults: {
        loaded: false,
        resource: false,
        clipboardsList: [],
        clipboard: false
    }
})
export class UniversalClipboardState {
    constructor(
        private utils: UtilsService,
        private logger: LoggerService,
        private store: Store,
        private service: ClipboardService
    ) { }

    // SELECTORS

    @Selector() static getClipboardResourceLoaded(state: ClipboardResourceModel) {
        return state.loaded;
    }

    @Selector() static getClipboards(state: ClipboardResourceModel) {
        return state.clipboardsList;
    }

    @Selector() static getActiveClipboardSelected(state: ClipboardResourceModel) {
        const active = state.clipboardsList.filter(item => item.active);
        return active;
    }

    @Selector() static getActiveClipboard(state: ClipboardResourceModel) {
        return state.clipboard;
    }

    @Selector() static getClipboardItems(state: ClipboardResourceModel) {
        return (state.clipboard && state.clipboard.widgets) ? state.clipboard.widgets : [];
    }

    // ACTIONS
    @Action(ClipboardLoad)
    widgetClipboardLoad(ctx: StateContext<ClipboardResourceModel>, { }: ClipboardLoad) {
        this.logger.action('State :: Load Widget Clipboard Items');


    }


}
