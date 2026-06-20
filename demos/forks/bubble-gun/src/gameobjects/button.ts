import type { GameObj } from 'kaplay'

interface Props {
  width: number
  height: number
  radius?: number
  x: number
  y: number
  text: string
  onClick: () => void
  fixed?: boolean
  parent?: GameObj
}

export function addButton(props: Props) {
  const comps = [
    rect(props.width, props.height, { radius: props.radius }),
    pos(props.x, props.y),
    area(),
    scale(1),
    anchor('center'),
    outline(4),
    color(255, 255, 255),
  ]

  let button

  if (props.parent) {
    button = props.parent.add(comps)
  } else {
    button = add(comps)
  }

  if (props.fixed) {
    button.use(fixed())
  }

  button.add([text(props.text), anchor('center'), color(0, 0, 0)])

  button.onHover(() => {
    button.scaleTo(1.1)
  })

  button.onHoverEnd(() => {
    button.scaleTo(1)
  })

  button.onClick(props.onClick)

  return button
}
