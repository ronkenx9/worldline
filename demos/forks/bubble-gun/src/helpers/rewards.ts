import { getPlayer } from '../gameobjects'
import { gameState } from '../helpers'

const rewards = [
  // heal hp
  {
    percentage: 0,
    setPercentage(percentage = randi(10, 30)) {
      this.percentage = percentage
    },
    get text() {
      return `Heal ${this.percentage}% HP`
    },
    action() {
      const player = getPlayer()!
      const hp = player.maxHP()! * (this.percentage / 100)
      player.heal(hp)
    },
  },

  // max hp
  {
    percentage: 0,
    setPercentage(percentage = randi(10, 30)) {
      this.percentage = percentage
    },
    get text() {
      return `Max HP +${this.percentage}%`
    },
    action() {
      const player = getPlayer()!
      const maxHP = player.maxHP()!
      const hp = maxHP * (this.percentage / 100)
      player.setMaxHP(maxHP + hp)
      player.heal(hp)
    },
  },

  // player speed
  {
    percentage: 0,
    setPercentage(percentage = randi(5, 20)) {
      this.percentage = percentage
    },
    get text() {
      return `Player Speed +${this.percentage}%`
    },
    action() {
      const player = getPlayer()!
      player.speed *= (this.percentage + 100) / 100
    },
  },

  // fire rate
  {
    percentage: 0,
    setPercentage(percentage = randi(5, 20)) {
      this.percentage = percentage
    },
    get text() {
      return `Fire Rate +${this.percentage}%`
    },
    action() {
      const player = getPlayer()!
      player.attack.delay *= (100 - this.percentage) / 100
    },
  },

  // bubble damage
  {
    percentage: 0,
    setPercentage(percentage = randi(5, 20)) {
      this.percentage = percentage
    },
    get text() {
      return `Bubble Damage +${this.percentage}%`
    },
    action() {
      gameState.player.bubble.damage *= (100 + this.percentage) / 100
    },
  },

  // bubble size
  {
    percentage: 0,
    setPercentage(percentage = randi(5, 20)) {
      this.percentage = percentage
    },
    get text() {
      return `Bubble Size +${this.percentage}%`
    },
    action() {
      gameState.player.bubble.size *= (100 + this.percentage) / 100
    },
  },

  // bubble stun
  {
    percentage: 0,
    setPercentage(percentage = randi(10, 25)) {
      this.percentage = percentage
    },
    get text() {
      return `Bubble Stun +${this.percentage}%`
    },
    action() {
      gameState.player.bubble.stun *= (100 + this.percentage) / 100
    },
  },
]

export function getRewards(total = 2) {
  const result = []
  const copy = rewards.slice()

  for (let i = 0; i < total; i++) {
    result.push(copy.splice(randi(copy.length), 1)[0])
  }

  return result
}
