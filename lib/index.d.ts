/// <reference path="index.js" />
declare module 'mecha' {

  type key = string | symbol

  /**
   * context app
   */
  interface IContext {
    [k: key]: any
  }

  /**
   * event for change state
   */
  interface IAction<P = any> {
    type: number,
    payload?: P
  }

  /**
   * generate new context after action perform
   */
  interface IReducer<C extends IContext = IContext, P = any> {
    fn: (c?: C, a?: IAction<P>) => C
  }

  /**
   * stop change state if condition disrespect
   */
  interface IGuard<C extends IContext = IContext, P = any> {
    fn: (c?: C, a?: IAction<P>) => boolean
  }

  /**
   * link between 2 states, use reducer or guard option
   */
  interface ITransition<C extends IContext = IContext> {
    where: number,
    how: number,
    reducer?: IReducer<C>,
    guard?: IGuard<C>
  }

  /**
   * unstable state between 2, need fix state with success or error
   */
  interface IIntermediate<C extends IContext = IContext> extends ITransition<C> {
    error: number
  }

  /**
   * state identify by id and use some transitions if isn't final state
   */
  interface IState<C extends IContext = IContext> {
    id: number,
    transitions: ITransition<C>[]
  }

  /**
   * list of states and has one current state
   */
  interface IStatesGroup<C extends IContext = IContext> {
    get current(): IState<C>
  }

  /**
   * result of config machine
   */
  interface IMachine<C extends IContext = IContext> {
    states: IState<C>[],
    makeCtx: () => C
  }

  /**
   * result of interpret machine
   */
  interface IService<C extends IContext = IContext> {
    state: number,
    states: IStatesGroup<C>,
    context: C,
    resetContext(): C,
    send(type: number, payload?: { [key: string]: any }): void
  }

  function createMachine<C extends IContext>(states: IState<C>[], makeCtx: () => C): IMachine<C>;

  function state<C extends IContext>(id: number, ...transitions: ITransition<C>[]): IState<C>;

  function reduce<C extends IContext, P = any>(fn: ((ctx?: C, action?: IAction<P>) => C)): IReducer<C, P>;

  function guard<C extends IContext, P = any>(fn: ((ctx?: C, action?: IAction<P>) => boolean)): IGuard<C, P>;

  function transition<C extends IContext, P = any>(
    how: number,
    where: number,
    reducer?: IReducer<C, P>,
    guard?: IGuard<C, P>
  ): ITransition<C>;

  function intermediate<C extends IContext, P = any>(
    how: number,
    guard: IGuard<C, P>,
    succes: number,
    error: number,
    finaly?: IReducer<C, P>
  ): IIntermediate<C>;

  function interpret<C extends IContext, P = any>(
    machine: IMachine<C>,
    onStateChange?: (s: IState<C>) => void,
    onContextChange?: (c: C) => void,
    initState?: number,
    initContext?: () => C
  ): IService<C>;

  export {
    createMachine,
    guard,
    IAction,
    IContext,
    IGuard,
    IMachine,
    IIntermediate,
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
}