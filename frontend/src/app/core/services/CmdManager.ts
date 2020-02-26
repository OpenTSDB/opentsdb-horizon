
export interface ICommand {
    name?: string;
    state?: any;
    execute: () => any;
    unexcute: () => any;
}

export class CmdManager {
    private commands: ICommand[] = [];
    private _currentCmd: ICommand;

    public getLastCommand() {
       if (this.commands.length > 0) {
           return this.commands[this.commands.length - 1];
       }
       return undefined;
    }

    public get currentCommand() {
        return this._currentCmd;
    }

    public resetCommands() {
        this.commands = [];
    }

    public execute(cmd: ICommand) {
        cmd.execute();
        this.commands.push(cmd);
    }


    public undo() {
        const cmd = this.commands.pop();
        this._currentCmd = cmd;
        if (cmd !== undefined && cmd.unexcute !== undefined) {
            cmd.unexcute();
        }
    }
}
