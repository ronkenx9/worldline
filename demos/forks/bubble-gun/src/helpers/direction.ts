import type { Vec2 } from 'kaplay'

/**
 * Get direction from origin to target.
 */
export function getDirection(origin: Vec2, target: Vec2) {
  return target.sub(origin).unit()
}
