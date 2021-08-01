import { createMachine, guard, IAction, IContext, intermediate, interpret, IState, reduce, state, transition } from "./mecha"

enum STATES {
  LOGIN_SCREEN,
  HUB_SCREEN,
  GAME_SCREEN
}

enum EVENTS {
  LOGIN,
  LOGOUT,
  JOIN,
  PLAY,
  LEAVE,
  END_GAME,
}

interface MyContext extends IContext {
  pseudo: string,
  room: string,
  life: number,
  x: number,
  y: number
}

interface LoginAction {
  pseudo: string
}

interface IInput {
  x: number,
  y: number,
  life: number
}

const makeCtx: () => MyContext = () => ({
  pseudo: '',
  room: '',
  life: 0,
  x: 0,
  y: 0
})
// guard
const validPseudo = (ctx?: MyContext, e?: IAction<any>) => ctx?.pseudo !== e?.payload?.pseudo
const endGame = (ctx?: MyContext) => ctx?.life === 0
// reducer
const login = (ctx?: MyContext, e?: IAction<LoginAction>) => ({ ...ctx, pseudo: e?.payload?.pseudo ?? '' } as MyContext)
const initGame = (ctx?: MyContext) => ({ ...ctx, life: 3, x: 10, y: 10 } as MyContext)
const leaveGame = (ctx?: MyContext) => ({ ...ctx, life: 0, x: 0, y: 0, room: '' } as MyContext)
const play = (ctx?: MyContext, e?: IAction<IInput>) => ({
  ...ctx,
  life: e?.payload?.life,
  x: e?.payload?.x,
  y: e?.payload?.y
} as MyContext)

const machine = createMachine<MyContext>([
  state(
    STATES.LOGIN_SCREEN,
    intermediate(EVENTS.LOGIN, guard(validPseudo), STATES.HUB_SCREEN, STATES.LOGIN_SCREEN, reduce<MyContext, LoginAction>(login))
  ),
  state(
    STATES.HUB_SCREEN,
    transition(EVENTS.LOGOUT, STATES.LOGIN_SCREEN, reduce(makeCtx)),
    transition(EVENTS.JOIN, STATES.GAME_SCREEN, reduce(initGame))
  ),
  state(
    STATES.GAME_SCREEN,
    transition(EVENTS.LEAVE, STATES.HUB_SCREEN, reduce(leaveGame)),
    transition(EVENTS.PLAY, STATES.GAME_SCREEN, reduce(play)),
    transition(EVENTS.END_GAME, STATES.GAME_SCREEN, reduce(initGame), guard(endGame))
  )
], makeCtx)

const wait = async (n: number) => {
  return new Promise((resolve) => {
    globalThis.setTimeout(() => {
      console.log('---------------------------')
      return resolve(null)
    }, n)
  })
}

const start = async () => {
  const onStateChange = (s: IState<MyContext>) => {
    console.log('on state change : ', s)
  }
  const onContextChange = (c: MyContext) => {
    console.log('on ctx change : ', c)
  }
  const service = interpret<MyContext>(machine, onStateChange, onContextChange)
  console.log('service just create : ', service)
  await wait(500)
  service.send(EVENTS.LOGIN, { pseudo: 'truc' })
  await wait(500)
  console.log('event login send', service)
  await wait(500)
  service.send(EVENTS.JOIN)
  await wait(500)
  console.log('event join send', service)
  while (service.context.life > 0) {
    await wait(500)
    service.send(EVENTS.PLAY, {
      life: service.context.life - 1,
      x: service.context.x + 1,
      y: service.context.y - 1
    })
    await wait(500)
    console.log('event play send', service)
  }
  await wait(500)
  service.send(EVENTS.END_GAME)
  await wait(500)
  console.log('event endgame send', service)
  await wait(500)
  service.send(EVENTS.LEAVE)
  await wait(500)
  console.log('event leave send', service)
  await wait(500)
  service.send(EVENTS.LOGOUT)
  await wait(500)
  console.log('event logout send', service)
  await wait(500)
}

document.addEventListener('readystatechange', () => {
  const elem = (window.addEventListener) ? window : document;
  elem.addEventListener('load', start, false);
});
