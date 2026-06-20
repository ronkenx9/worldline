import type { AnchorComp, GameObj, ScaleComp, SpriteComp } from 'kaplay'

import { addBubble, addEnemy, addPlayer, addScore } from '../gameobjects'

export type Bubble = ReturnType<typeof addBubble>
export type ChildBubble = GameObj<AnchorComp | SpriteComp | ScaleComp>
export type Enemy = ReturnType<typeof addEnemy>
export type Player = ReturnType<typeof addPlayer>
export type Score = ReturnType<typeof addScore>
