import { Layer } from '../constants'
import { gameState } from '../helpers'
import type { Score } from '../types'
import { recordBubbleScore } from '../worldline'
import { addReward } from '.'

let score: Score

const CHARACTER_WIDTH = 40

export function addScore() {
  const box = add([
    rect(CHARACTER_WIDTH, 60),
    pos(50, 50),
    anchor('center'),
    color(255, 255, 255),
    fixed(),
    z(Layer.Foreground),
  ])

  const score = box.add([
    text('0', { size: 48 }),
    anchor('center'),
    color(0, 0, 0),
  ])

  setScore(score)

  return score
}

function setScore(currentScore: Score) {
  score = currentScore
}

export function getScore() {
  return score
}

export function getScoreValue() {
  return score ? parseInt(score.text, 10) : 0
}

export function incrementScore(value = 1) {
  const newScore = parseInt(score.text, 10) + value
  score.text = newScore.toString()
  recordBubbleScore(newScore)

  score.parent!.width = CHARACTER_WIDTH * score.text.length

  if (newScore === gameState.reward.score) {
    gameState.reward.increment += 1
    gameState.reward.score += gameState.reward.increment
    addReward()
  }
}
