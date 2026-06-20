import { getRewards } from '../helpers'
import { addButton, addModal, addText, game } from '.'

export function addReward() {
  game.reward = true
  game.paused = true

  const modal = addModal()
  const { x, y } = center()

  const rewardMenu = modal.add([
    rect(520, 400),
    color(255, 255, 255),
    outline(4),
    anchor('center'),
    pos(x, y + 700),
  ])

  rewardMenu.hidden = true

  addText({
    width: 0,
    height: 0,
    x: 0,
    y: -120,
    text: 'Choose a reward',
    fontSize: 48,
    parent: rewardMenu,
  })

  getRewards().forEach((reward, index) => {
    reward.setPercentage()

    addButton({
      width: reward.text.length * 25,
      height: 80,
      radius: 8,
      x: 0,
      y: index * 100,
      text: reward.text,
      onClick() {
        reward.action()
        modal.destroy()
        game.reward = false
        game.paused = false
      },
      parent: rewardMenu,
    })
  })

  tween(
    rewardMenu.pos,
    game.paused ? center() : center().add(0, 700),
    1,
    (position) => (rewardMenu.pos = position),
    easings.easeOutElastic,
  )

  rewardMenu.hidden = false
}
