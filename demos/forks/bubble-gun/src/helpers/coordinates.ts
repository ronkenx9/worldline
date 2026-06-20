import { getPlayer } from '../gameobjects'
import { coinflip } from './chance'

/**
 * Generate random coordinates outside the camera view.
 */
export function outsideCoordinates() {
  const player = getPlayer()

  if (!player) {
    return vec2()
  }

  const halfWidth = width() / 2
  const halfHeight = height() / 2
  const multiplier = coinflip() ? 1 : -1

  return vec2(
    player.pos.x + halfWidth * multiplier,
    player.pos.y + halfHeight * multiplier,
  )
}

/**
 * Generate random coordinates inside the camera view.
 */
export function insideCoordinates() {
  const player = getPlayer()

  if (!player) {
    return vec2()
  }

  const randomWidth = rand(0, width() / 2)
  const randomHeight = rand(0, height() / 2)
  const multiplier = coinflip() ? 1 : -1

  return vec2(
    player.pos.x + randomWidth * multiplier,
    player.pos.y + randomHeight * multiplier,
  )
}
