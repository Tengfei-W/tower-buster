import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { Cosmetic } from './Cosmetic';
const { ccclass, property } = _decorator;

@ccclass('TankShopData')
export class TankShopData extends Component {
    @property([Cosmetic])
    tankData: Cosmetic[] = [];
}


