import { State, Action, StateContext, Selector } from '@ngxs/store';

export class SetAuth {
  static type = '[Auth] Set Auth';

  constructor(public readonly payload: string) {}
}

export interface AuthStateModel {
  auth: string; //valid/invalid/unknown
}


@State<AuthStateModel>({
  name: 'authState',
  defaults: {
      auth:'unknown'
    }
})

export class AuthState {
  @Selector()
  static getAuth(state: AuthStateModel) {
    return state.auth;
  }

  @Action(SetAuth)
  setAuth( ctx : StateContext<AuthStateModel>, { payload }: SetAuth) {
    const state = ctx.getState();
    ctx.setState({...state, auth:payload});
  }
}

