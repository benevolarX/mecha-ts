import { interpret, IState } from "../src/mecha"
import { MyContext, EVENTS } from "./constantes"
import { MyMachine as machine } from "./machine"

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
