import './game'
import './lose'
import './preload'
import './title'
import './tutorial'

import { Scene } from '../constants'

export function start() {
  go(Scene.Preload)
}
