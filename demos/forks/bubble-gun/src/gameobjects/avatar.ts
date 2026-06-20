import { Layer, Sprite } from '../constants'

type Avatar = ReturnType<typeof addAvatar>

let avatar: Avatar

export function addAvatar() {
  const avatar = add([
    sprite(Sprite.Avatar),
    pos(125, height() - 185),
    anchor('center'),
    scale(0.5),
    fixed(),
    z(Layer.Foreground),
  ])

  setAvatar(avatar)

  return avatar
}

function setAvatar(currentAvatar: Avatar) {
  avatar = currentAvatar
}

export function getAvatar() {
  return avatar
}
