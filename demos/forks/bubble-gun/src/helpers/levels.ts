import { Sprite } from '../constants'

const MINUTE = 60

export const levels = [
  // 0 - 0.5
  {
    start: 0,
    end: 0.5 * MINUTE,
    loop: {
      enemy: 4,
      drain: 10,
    },
    enemies: [Sprite.Shellie, Sprite.Spiny],
    multiplier: {
      damage: 1,
      health: 1,
      speed: 1,
    },
  },

  // 0.5 - 1
  {
    start: 0.5 * MINUTE,
    end: 2 * MINUTE,
    loop: {
      enemy: 3,
      drain: 10,
    },
    enemies: [Sprite.Gooba],
    multiplier: {
      damage: 1,
      health: 1,
      speed: 1,
    },
  },

  // 1 - 2
  {
    start: 1 * MINUTE,
    end: 2 * MINUTE,
    loop: {
      enemy: 3,
      drain: 10,
    },
    enemies: [Sprite.Gooba, Sprite.Shellie, Sprite.Spiny],
    multiplier: {
      damage: 1,
      health: 1,
      speed: 1,
    },
  },

  // 2 - 3
  {
    start: 2 * MINUTE,
    end: 3 * MINUTE,
    loop: {
      enemy: 3,
      drain: 15,
    },
    enemies: [Sprite.Bubbie],
    multiplier: {
      damage: 1,
      health: 1,
      speed: 1,
    },
  },

  // 3 - 4
  {
    start: 3 * MINUTE,
    end: 4 * MINUTE,
    loop: {
      enemy: 4,
      drain: 15,
    },
    enemies: [Sprite.Pokey],
    multiplier: {
      damage: 1.5,
      health: 1.5,
      speed: 1.5,
    },
  },

  // 4 - 5
  {
    start: 4 * MINUTE,
    end: 5 * MINUTE,
    loop: {
      enemy: 4,
      drain: 15,
    },
    enemies: [Sprite.Gooba, Sprite.Bubbie, Sprite.Pokey],
    multiplier: {
      damage: 1.5,
      health: 1.5,
      speed: 1.5,
    },
  },

  // 5 - 6
  {
    start: 5 * MINUTE,
    end: 6 * MINUTE,
    loop: {
      enemy: 1,
      drain: 20,
    },
    enemies: [
      Sprite.Bubbie,
      Sprite.Gooba,
      Sprite.Shellie,
      Sprite.Spiny,
      Sprite.Pokey,
    ],
    multiplier: {
      damage: 2,
      health: 2,
      speed: 2,
    },
  },

  // 6 - ∞
  {
    start: 6 * MINUTE,
    end: undefined,
    loop: {
      enemy: 0.5,
      drain: 30,
    },
    enemies: [
      Sprite.Bubbie,
      Sprite.Gooba,
      Sprite.Shellie,
      Sprite.Spiny,
      Sprite.Pokey,
    ],
    multiplier: {
      damage: 2.5,
      health: 2.5,
      speed: 2.5,
    },
  },
]
