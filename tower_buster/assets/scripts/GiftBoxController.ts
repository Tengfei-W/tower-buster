import { _decorator, BoxCollider, Component, MeshRenderer, Node, ParticleSystem, quat, Quat, randomRangeInt, tween, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { PlayerManager } from './PlayerManager';
import { TowerScript } from './TowerScript';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('GiftBoxController')
export class GiftBoxController extends Component {

    fromBossLvl = false

    @property(Node)
    chestClosed: Node = null
    @property(Node)
    chestOpen: Node = null


    @property(Node)
    TresureBoxCap: Node;
    @property(Node)
    TresureBoxCapPlaceholder: Node;
    @property(ParticleSystem)
    DaimondConfittieParticle: ParticleSystem;
    @property(ParticleSystem)
    GiftBoxHitParticle: ParticleSystem;
    TowerScr: TowerScript = null;
    HP: number = 0;
    start() {
        let col = this.getComponent(BoxCollider);
        col.on('onCollisionEnter', this.onCollissionenterMesh, this);
    }
    onCollissionenterMesh(event) {

        this.HP--;
        GameManager.instance.updateScore(1);
        this.TowerScr.HitEffectChest(this.node);
        if (this.HP <= 0) {
            SoundManager.inst.playSFX(SoundManager.inst.DIAMOND_COLLECT);
            PlayerManager.instance.barrel.active = false;
            tween(this.chestClosed).to(0.4, { scale: new Vec3(1.3, 1, 1.3) }, {
                easing: "bounceIn",
                onComplete: () => {
                    GameManager.instance.vibrationOn(300);
                    this.chestClosed.active = false;
                    this.chestClosed.setScale(1, 1, 1);
                    this.chestOpen.active = true;
                    this.DaimondConfittieParticle.play();
                    let bonus = randomRangeInt(25, 50);
                    GameManager.instance.GetGem(bonus);
                    this.scheduleOnce(this.aftermath, 0.5);
                    this.TowerScr.SetTextOntrackPos(0);
                }
            }).start();
        }
        else {
            SoundManager.inst.playSFX(SoundManager.inst.BLOCK_HIT);
            if (this.GiftBoxHitParticle.isPlaying) this.GiftBoxHitParticle.stop();
            this.GiftBoxHitParticle.play();
        }
    }

    onCollissionenterTween(event) {
        this.HP--;
        GameManager.instance.updateScore(1);
        SoundManager.inst.playSFX(SoundManager.inst.BLOCK_HIT);
        this.TowerScr.HitEffectChest(this.node);
        if (this.HP <= 0) {
            PlayerManager.instance.barrel.active = false;
            tween(this.TresureBoxCap).to(0.15, { rotation: this.TresureBoxCapPlaceholder.rotation }, {
                easing: "bounceIn",
                onComplete: () => {
                    this.DaimondConfittieParticle.play();
                    let bonus = randomRangeInt(25, 50);
                    GameManager.instance.GetGem(bonus);
                    this.scheduleOnce(this.aftermath, 0.5);
                    this.TowerScr.SetTextOntrackPos(0);
                }
            }).start();
        }
    }

    aftermath() {
        tween(this.node).to(0.6, {
            position: new Vec3(this.node.position.x,
                this.node.position.y - 8,
                this.node.position.z)
        },
            {
                onComplete: () => {
                    // GameManager.instance.onTowerDestroyed();
                    this.TowerScr.GiftDestProcess();

                }
            }).start();
    }
    // tweenDown() {
    //     tween(this.node).to(1, { position: new Vec3(this.node.position.x, this.node.position.y - 5, this.node.position.z) }, {
    //         easing: "bounceIn",
    //         onComplete: () => {

    //         }
    //     }).start();
    // }
}


