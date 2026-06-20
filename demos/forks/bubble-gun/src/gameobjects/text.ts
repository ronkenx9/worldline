import type { GameObj } from 'kaplay'

import { Layer } from '../constants'

interface Props {
  width: number
  height: number
  x: number
  y: number
  text: string
  fontSize?: number
  parent?: GameObj
}

export function addText(props: Props) {
  const comps = [
    rect(props.width, props.height),
    pos(props.x, props.y),
    anchor('center'),
    color(255, 255, 255),
    z(Layer.Background),
  ]

  let box

  if (props.parent) {
    box = props.parent.add(comps)
  } else {
    box = add(comps)
  }

  return box.add([
    text(props.text, { size: props.fontSize }),
    anchor('center'),
    color(0, 0, 0),
    opacity(1),
  ])
}
