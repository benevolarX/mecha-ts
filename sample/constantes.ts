import { IContext } from "../src/mecha";

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

export { STATES, EVENTS, MyContext, LoginAction, IInput }
