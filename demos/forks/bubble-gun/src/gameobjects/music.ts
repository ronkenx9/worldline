import type { AudioPlay } from 'kaplay'

import { Music } from '../constants'

export let music: AudioPlay

export function addMusic() {
  music = play(Music.Background, {
    loop: true,
    paused: true,
  })
  music.volume = 0.5
}
