import { createMachine, guard, IAction, intermediate, reduce, state, transition } from "../src/mecha"
import { EVENTS, STATES, MyContext, LoginAction, IInput } from './constantes'

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

const MyMachine = createMachine<MyContext>([
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

export { MyMachine }
