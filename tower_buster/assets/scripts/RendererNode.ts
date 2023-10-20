import { _decorator, Component, Node, sys } from 'cc';
import { Tankcontroller } from './Tankcontroller';
import { EGZPStateType, GamezopSDK } from '../Gamezop/GamezopSDK';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('RendererNode')
export class RendererNode extends Component {
    public static Instance: RendererNode;
    protected onLoad(): void {
        RendererNode.Instance = this;
    }


    @property
    Index: number = 0;
    rot = 0;
    @property(Node)
    TankToEquip: Node = null;

    protected start(): void {
        if (GameManager.instance.gameData != null && !GamezopSDK.isBattle)
            this.Index = GameManager.instance.gameData.currentActiveTank;
        else if (GamezopSDK.isBattle) this.Index = 0;

        this.EnableAndEquip(this.Index);
    }

    protected update(dt: number): void {
        if (!GamezopSDK.isBattle) {
            this.rot -= 0.3;
            this.node.setRotationFromEuler(this.node.rotation.x, this.rot, this.node.rotation.z);
        }
    }


    EnableAndEquip(index) {
        this.Index = index;
        // GamezopSDK.Instance.setState(EGZPStateType.STATE_META_UPDATE, 0, "default", GameManager.instance.gameData);
        for (let i = 0; i < this.node.children.length; i++) {
            this.node.children[i].active = false;
            if (i == index) {
                this.node.children[i].active = true;
                Tankcontroller.instance.setskin(index, true);
                GameManager.instance.hp = GameManager.instance.hpList[index];
                GameManager.instance.damage = GameManager.instance.DamageList[index];
            }
        }
    }


}


