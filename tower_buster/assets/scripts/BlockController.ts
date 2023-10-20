import { _decorator, BoxCollider, Collider, Component, Material, Mesh, MeshRenderer, Node, randomRange, randomRangeInt, tween, Vec3 } from 'cc';
import { TowerScript } from './TowerScript';
import { GameManager } from './GameManager';
import { SoundManager } from './SoundManager';
import { GamezopSDK } from '../Gamezop/GamezopSDK';
import { BossScript } from './BossScript';
import { PlayerManager } from './PlayerManager';
const { ccclass, property } = _decorator;

@ccclass('BlockController')
export class BlockController extends Component {

    @property(String)
    ObjectName: string = "";

    @property(Material)
    hitMat: Material = null;
    @property(Material)
    NormalMat: Material = null;


    HP: number = 0;
    start() {
        let col = this.node.getComponent(Collider);
        //this.getComponentInChildren(MeshRenderer).material = this.hitMat;
        var parent = this.node.getParent();
        var tscr = parent.getParent().getComponent(TowerScript);
        if (this.ObjectName == "Diamond") {
            col.on('onCollisionEnter', (event) => {
                tscr.preArrange(this.node);
                if (event.otherCollider.node.name != "bulletDestroyer") {
                    this.HP -= PlayerManager.instance.damage;
                    // console.log(this.HP);
                    if (this.HP <= 0) {
                        SoundManager.inst.playSFX(SoundManager.inst.DIAMOND_DESTROY);
                        // console.log("towerModule OnCollider");
                        this.node.destroy();
                        GameManager.instance.GetGem();
                    }
                }
            }, this);
        }
        else {
            col.on('onCollisionEnter', (event) => {
                if (event.otherCollider.node.name != "bulletDestroyer") {
                    GameManager.instance.vibrationOn(150);
                    this.HP -= PlayerManager.instance.damage;
                    GameManager.instance.updateScore(PlayerManager.instance.damage);
                    this.getComponentInChildren(MeshRenderer).material = this.hitMat;
                    this.scheduleOnce(() => {
                        if (this.HP != 0) this.getComponentInChildren(MeshRenderer).material = this.NormalMat;
                    }, 0.05);
                    // console.log(this.HP);
                    if (this.HP <= 0) {
                        SoundManager.inst.playSFX(SoundManager.inst.BLOCK_HIT);
                        if (GamezopSDK.isBattle) GameManager.instance.setBattleScore();
                        // SoundManager.inst.playSFX(SoundManager.inst.DIAMOND_DESTROY);
                        var p = this.node.getParent();
                        tscr.showDestructionFX(this);
                        tscr.preArrange(this.node);
                        // console.log("towerModule OnCollider");
                        // this.node.destroy();
                    }
                }
            }, this);
        }
    }



    getNormalMat(_material: Material) {
        this.NormalMat = _material;
    }


}


