/// <reference path="index.js" />
declare module 'mecha' {

  export type key = string | symbol

  /**
   * context app
   */
  export interface IContext {
    [k: key]: any
  }

  /**
   * event for change state
   */
  export interface IAction<P = any> {
    type: number,
    payload?: P
  }

  /**
   * generate new context after action perform
   */
  export interface IReducer<C extends IContext = IContext, P = any> {
    fn: (c?: C, a?: IAction<P>) => C
  }

  /**
   * stop change state if condition disrespect
   */
  export interface IGuard<C extends IContext = IContext, P = any> {
    fn: (c?: C, a?: IAction<P>) => boolean
  }

  /**
   * link between 2 states, use reducer or guard option
   */
  export interface ITransition<C extends IContext = IContext> {
    where: number,
    how: number,
    reducer?: IReducer<C>,
    guard?: IGuard<C>
  }

  /**
   * unstable state between 2, need fix state with success or error
   */
  export interface IIntermediate<C extends IContext = IContext> extends ITransition<C> {
    error: number
  }

  /**
   * state identify by id and use some transitions if isn't final state
   */
  export interface IState<C extends IContext = IContext> {
    id: number,
    transitions: ITransition<C>[]
  }

  /**
   * list of states and has one current state
   */
  export interface IStatesGroup<C extends IContext = IContext> {
    get current(): IState<C>
  }

  /**
   * result of config machine
   */
  export interface IMachine<C extends IContext = IContext> {
    states: IState<C>[],
    makeCtx: () => C
  }

  /**
   * result of interpret machine
   */
  export interface IService<C extends IContext = IContext> {
    state: number,
    states: IStatesGroup<C>,
    context: C,
    resetContext(): C,
    send(type: number, payload?: { [key: string]: any }): void
  }

  export function createMachine<C extends IContext>(states: IState<C>[], makeCtx: () => C): IMachine<C>;

  export function state<C extends IContext>(id: number, ...transitions: ITransition<C>[]): IState<C>;

  export function reduce<C extends IContext, P = any>(fn: ((ctx?: C, action?: IAction<P>) => C)): IReducer<C, P>;

  export function guard<C extends IContext, P = any>(fn: ((ctx?: C, action?: IAction<P>) => boolean)): IGuard<C, P>;

  export function transition<C extends IContext, P = any>(
    how: number,
    where: number,
    reducer?: IReducer<C, P>,
    guard?: IGuard<C, P>
  ): ITransition<C>;

  export function intermediate<C extends IContext, P = any>(
    how: number,
    guard: IGuard<C, P>,
    succes: number,
    error: number,
    finaly?: IReducer<C, P>
  ): IIntermediate<C>;

  export function interpret<C extends IContext, P = any>(
    machine: IMachine<C>,
    onStateChange?: (s: IState<C>) => void,
    onContextChange?: (c: C) => void,
    initState?: number,
    initContext?: () => C
  ): IService<C>;

}