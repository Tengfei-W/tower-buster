import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cosmetic')
export class Cosmetic {
    @property
    Name: string = "";
    @property
    Cost: number = 30;
    @property
    isFree: boolean = false;
    @property(SpriteFrame)
    tankImage: SpriteFrame = null;
    @property
    HP = 1;
    @property
    Damage = 0;
}