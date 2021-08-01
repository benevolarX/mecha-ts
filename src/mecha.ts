interface IContext {
  [k: string]: any
}

interface IAction<P = any> {
  type: number,
  payload?: P
}

interface IReducer<C extends IContext = IContext, P = any> {
  fn: (c?: C, a?: IAction<P>) => C
}

interface IGuard<C extends IContext = IContext, P = any> {
  fn: (c?: C, a?: IAction<P>) => boolean
}

interface ITransition<C extends IContext = IContext> {
  where: number,
  how: number,
  reducer?: IReducer<C>,
  guard?: IGuard<C>
}

interface IIntemediate<C extends IContext = IContext> extends ITransition<C> {
  error: number
}

interface IState<C extends IContext = IContext> {
  id: number,
  transitions: ITransition<C>[]
}

interface IStatesGroup<C extends IContext = IContext> {
  get current(): IState<C>
}

interface IMachine<C extends IContext = IContext> {
  states: IState<C>[],
  makeCtx: () => C
}

interface IService<C extends IContext = IContext> {
  state: number,
  states: IStatesGroup<C>,
  context: C,
  resetContext(): C,
  send(type: number, payload?: { [key: string]: any }): void
}

/***
CLASS
***/

class Transition<C extends IContext> implements ITransition<C> {
  constructor(
    public how: number,
    public where: number,
    public reducer?: IReducer<C>,
    public guard?: IGuard<C>
  ) {
  }
}

class Intermediate<C extends IContext = IContext> implements IIntemediate<C> {
  constructor(public how: number,
    public guard: IGuard<C>,
    public where: number,
    public error: number,
    public reducer?: IReducer<C>
  ) {
  }
}

class State<C extends IContext = IContext> implements IState<C> {
  constructor(public id: number, public transitions: ITransition<C>[]) {
  }
}

class Machine<C extends IContext = IContext> implements IMachine<C> {
  constructor(public states: IState<C>[], public makeCtx: () => C) {
  }
}

class ServiceStates<C extends IContext = IContext> implements IStatesGroup<C> {

  constructor(private service: Service<C>) {
  }

  get current(): IState<C> {
    const state: IState<C> = this.service.machine.states.find(s => s.id === this.service.state) || this.service.machine.states[0]
    return state
  }

}

class Service<C extends IContext = IContext> implements IService<C> {

  public states: IStatesGroup<C>
  public context: C

  constructor(
    public state: number,
    public machine: IMachine<C>,
    protected onStateChange: (s: IState<C>) => void = (s: IState<C>) => { },
    protected onContextChange: (c: C) => void = (c: C) => { },
    protected makeCtx?: () => C
  ) {
    // const current: IState<C> = this.machine.states.find(s => s.id === this.state) || this.machine.states[0]
    this.states = new ServiceStates<C>(this)
    this.context = this.resetContext()
  }

  resetContext(): C {
    if (this.makeCtx) {
      return this.makeCtx()
    }
    return this.machine.makeCtx()
  }

  setState(state: number) {
    this.state = state
    this.onStateChange(this.states.current)
  }

  setContext(ctx: C) {
    this.context = ctx
    this.onContextChange(this.context)
  }

  send(type: number, payload: { [key: string]: any } = {}): void {
    const transition = this.states.current.transitions.find(t => t.how === type)
    if (transition) {
      const action: IAction = { ...{ payload }, type: transition.how }
      if (transition.guard && !transition.guard.fn(this.context, action)) {
        if (!(transition as IIntemediate)?.error) {
          return
        }
        this.setState((transition as IIntemediate).error)
      }
      else {
        this.setState(transition.where)
      }
      if (transition.reducer) {
        const r = transition.reducer.fn(this.context, action)
        this.setContext(transition.reducer.fn(this.context, action))
      }
    }
  }

}

/***
FUNCTION
***/

function createMachine<C extends IContext>(states: IState<C>[], makeCtx: () => C): IMachine<C> {
  return new Machine<C>(states, makeCtx)
}

function state<C extends IContext>(id: number, ...transitions: ITransition<C>[]): IState<C> {
  return new State<C>(id, transitions)
}

function reduce<C extends IContext, P = any>(fn: ((ctx?: C, action?: IAction<P>) => C)): IReducer<C, P> {
  return ({ fn } as IReducer<C, P>)
}

function guard<C extends IContext, P = any>(fn: ((ctx?: C, action?: IAction<P>) => boolean)): IGuard<C, P> {
  return ({ fn } as IGuard<C, P>)
}

function transition<C extends IContext, P = any>(
  how: number,
  where: number,
  reducer?: IReducer<C, P>,
  guard?: IGuard<C, P>
): ITransition<C> {
  return new Transition<C>(how, where, reducer, guard)
}

function intermediate<C extends IContext, P = any>(
  how: number,
  guard: IGuard<C, P>,
  succes: number,
  error: number,
  finaly?: IReducer<C, P>
): IIntemediate<C> {
  return new Intermediate(how, guard, succes, error, finaly)
}

function interpret<C extends IContext, P = any>(
  machine: IMachine<C>,
  onStateChange?: (s: IState<C>) => void,
  onContextChange?: (c: C) => void,
  initState?: number,
  initContext?: () => C
): IService<C> {
  const initial = initState || machine.states[0].id
  return new Service<C>(initial, machine, onStateChange, onContextChange, initContext)
}

export {
  createMachine,
  guard,
  IAction,
  IContext,
  IGuard,
  IMachine,
  IIntemediate,
  IReducer,
  IService,
  IState,
  ITransition,
  intermediate,
  interpret,
  reduce,
  state,
  transition
}
