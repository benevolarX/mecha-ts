# mecha-ts
finished state machine using typescript

[![GitHub license](https://img.shields.io/github/license/benevolarX/mecha-ts?style=for-the-badge)](https://github.com/benevolarX/mecha-ts/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/mecha-ts?style=for-the-badge)](https://www.npmjs.com/package/mecha-ts)
[![npm](https://img.shields.io/npm/dw/mecha-ts?style=for-the-badge)](https://www.npmjs.com/package/mecha-ts)
![npm bundle size](https://img.shields.io/bundlephobia/min/mecha-ts?style=for-the-badge)
[![GitHub issues](https://img.shields.io/github/issues/benevolarX/mecha-ts?style=for-the-badge)](https://github.com/benevolarX/mecha-ts/issues)
# mecha-ts
mecha-ts is a 0-dependency finished state machine ts compatible
## Installation
Download [nodejs](https://nodejs.org/) first.
Use [npm](https://www.npmjs.com/package/npm) to install get-ip-from-request.
```bash
npm i mecha-ts@latest
```
## Usage
```js
// machine.js
import { createMachine, guard, IAction, intermediate, reduce, state, transition } from "mecha-ts"

const STATES = Object.freeze({
  LOGIN_SCREEN: 0,
  HUB_SCREEN: 1,
  GAME_SCREEN: 2
})

const EVENTS = Object.freeze({
  LOGIN: 0,
  LOGOUT: 1,
  JOIN: 2,
  PLAY: 3,
  LEAVE: 4,
  END_GAME: 5
})

const makeCtx = () => ({
  pseudo: '',
  room: '',
  life: 0,
  x: 0,
  y: 0
})
// guard
const validPseudo = (ctx, e) => ctx?.pseudo !== e?.payload?.pseudo
const endGame = (ctx) => ctx?.life === 0
// reducer
const login = (ctx, e) => ({ ...ctx, pseudo: e?.payload?.pseudo ?? '' })
const initGame = (ctx) => ({ ...ctx, life: 3, x: 10, y: 10 })
const leaveGame = (ctx) => ({ ...ctx, life: 0, x: 0, y: 0, room: '' })
const play = (ctx, e) => ({
  ...ctx,
  life: e?.payload?.life,
  x: e?.payload?.x,
  y: e?.payload?.y
})

const MyMachine = createMachine([
  state(
    STATES.LOGIN_SCREEN,
    intermediate(EVENTS.LOGIN, guard(validPseudo), STATES.HUB_SCREEN, STATES.LOGIN_SCREEN, reduce(login))
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

```
## Important
mecha-ts is inspired by [robot3](https://github.com/matthewp/robot) 
but mecha-ts and robot3 has some differences : 
mecha-ts use number for identify states and events, robot3 accept only string
robot3 use invoke for async transition, mecha-ts haven't
## Contributing
...
## License
[MIT](https://github.com/benevolarX/get-ip-from-request/blob/main/LICENSE)