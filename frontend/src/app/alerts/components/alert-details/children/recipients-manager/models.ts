export enum Mode {
    all = 'ALL',
    edit = 'EDIT',
    editRecipient = 'EDITRECIPIENT',
    createRecipient = 'CREATERECIPIENT',
}

export enum RecipientType {
    opsgenie = 'opsgenie',
    slack = 'slack',
    http = 'http',
    oc = 'oc',
    email = 'email'
}

export class Recipient {
    type: RecipientType;
    name: string;
    [key: string]: any;
}
