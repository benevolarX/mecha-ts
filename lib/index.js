"use strict"

/**!
 * mecha-ts
 *
 * @copyright 2021-2022 benevolarX
 * @license MIT
 */

class Transition {
  constructor(how, where, reducer = null, guard = null) {
    this.how = how
    this.where = where
    this.reducer = reducer
    this.guard = guard
  }
}

class Intermediate extends Transition {
  constructor(how, guard, where, error, reducer = null) {
    super(how, where, reducer, guard)
    this.error = error
  }
}

class State {
  constructor(id, transitions = []) {
    this.id = id
    this.transitions = transitions
  }
}

class Machine {
  constructor(states = [], makeCtx = () => ({})) {
    this.states = states
    this.makeCtx = makeCtx
  }
}

class ServiceStates {

  constructor(service) {
    this.service = service
  }

  get current() {
    return this.service.machine.states.find(s => s.id === this.service.state) || this.service.machine.states[0]
  }

}

class Service {

  constructor(state, machine, onStateChange = (s) => { }, onContextChange = (c) => { }, makeCtx = () => ({})) {
    this.state = state
    this.machine = machine
    this.onStateChange = onStateChange
    this.onContextChange = onContextChange
    this.makeCtx = makeCtx
    // const current: IState<C> = this.machine.states.find(s => s.id === this.state) || this.machine.states[0]
    this.states = new ServiceStates(this)
    this.context = this.resetContext()
  }

  resetContext() {
    if (this.makeCtx) {
      return this.makeCtx()
    }
    return this.machine.makeCtx()
  }

  setState(state) {
    this.state = state
    this.onStateChange(this.states.current)
  }

  setContext(ctx) {
    this.context = ctx
    this.onContextChange(this.context)
  }

  send(type, payload = {}) {
    const transition = this.states.current.transitions.find(t => t.how === type)
    if (transition) {
      const action = { ...{ payload }, type: transition.how }
      if (transition.guard && !transition.guard.fn(this.context, action)) {
        if (!transition?.error) {
          return
        }
        this.setState(transition.error)
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

function createMachine(states = [], makeCtx = () => { }) {
  return new Machine(states, makeCtx)
}

function state(id, ...transitions) {
  return new State(id, transitions)
}

function reduce(fn) {
  return { fn }
}

function guard(fn) {
  return { fn }
}

function transition(how, where, reducer = null, guard = null) {
  return new Transition(how, where, reducer, guard)
}

function intermediate(how, guard, succes, error, finaly = null) {
  return new Intermediate(how, guard, succes, error, finaly)
}

function interpret(machine, onStateChange = () => { }, onContextChange = () => { }, initState = 0, initContext = () => ({})) {
  const initial = initState || machine.states[0].id
  return new Service(initial, machine, onStateChange, onContextChange, initContext)
}

module.exports = {
  createMachine,
  guard,
  intermediate,
  interpret,
  reduce,
  state,
  transition
}
