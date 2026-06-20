import { Scene, Sound, Sprite } from '../constants'
import {
  addAvatar,
  addButton,
  addDrain,
  addEnemy,
  addGame,
  addHealth,
  addPause,
  addPlayer,
  addReward,
  addScore,
  addText,
  game,
} from '../gameobjects'
import { gameState, resetGameState } from '../helpers'

const INSTRUCTION_MARGIN = 100

const instructions = [
  {
    start: 0,
    text: 'Press P or ESC to pause',
    action() {
      addPause()
    },
  },

  {
    start: 2,
    text: 'WASD or arrow keys to move',
    action() {},
  },

  {
    start: 4,
    text: 'Left click to shoot',
    action() {},
  },

  {
    start: 6,
    text: 'Score is at the top left',
    action() {
      addScore()
    },
  },

  {
    start: 8,
    text: 'Health is at the bottom left',
    action() {
      addHealth()
      addAvatar()
    },
  },

  {
    start: 10,
    text: 'Shoot bubbles at enemies',
    action() {
      gameState.enemy.sprites = [Sprite.Spiny]
      addEnemy()
    },
  },

  {
    start: 20,
    text: 'Enemies in a bubble will fall down the drain',
    action() {
      gameState.enemy.sprites = [Sprite.Spiny]
      addEnemy()
      Array(3).fill(null).forEach(addDrain)
    },
  },

  {
    start: 30,
    text: 'Avoid enemies & projectiles',
    action() {
      ;[Sprite.Bubbie, Sprite.Pokey].forEach((sprite) => {
        gameState.enemy.sprites = [sprite]
        addEnemy()
      })
    },
  },

  {
    start: 40,
    text: 'Upgrade when you reach a certain score',
    action() {
      addReward()
    },
  },

  {
    start: 42,
    text: 'Aim for a high score & have fun!',
    action() {
      addButton({
        width: 220,
        height: 80,
        radius: 8,
        x: center().x,
        y: height() - INSTRUCTION_MARGIN,
        text: 'Play',
        onClick() {
          play(Sound.Shoot)
          go(Scene.Game)
        },
        fixed: true,
      })
    },
  },
]

scene(Scene.Tutorial, () => {
  resetGameState()
  addGame()
  addPlayer()

  const { x } = center()

  instructions.forEach((instruction, index) => {
    game.wait(instruction.start, () => {
      if (instruction.start) {
        play(Sound.Shoot, { detune: index * 100 })
      }
      instruction.action()

      addText({
        ...getWidthAndHeight(instruction.text),
        x,
        y: INSTRUCTION_MARGIN * (index + 1),
        text: instruction.text,
      }).fadeIn(1)
    })
  })
})

function getWidthAndHeight(text: string) {
  return {
    width: 25 * text.length,
    height: 60,
  }
}
