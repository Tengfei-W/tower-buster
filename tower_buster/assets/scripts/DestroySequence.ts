import { _decorator, Component, Node, ParticleSystem, Scheduler, tween, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { PlayerManager } from './PlayerManager';
import { GamezopSDK } from '../Gamezop/GamezopSDK';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('DestroySequence')
export class DestroySequence extends Component {
    @property(Node) startPos: Node = null;
    @property(Node) bulletNode: Node = null;
    @property(ParticleSystem) tankDestPartical: ParticleSystem = null;
    @property hitduration = 0.2;
    StartSequence() {
        GameManager.instance.vibrationOn(500);
        // console.log("Bullet node and start position", this.bulletNode, this.startPos);
        this.bulletNode.position = this.startPos.position;
        this.node.active = true;
        tween(this.bulletNode).to(this.hitduration, { position: Vec3.ZERO }, {
            onComplete: () => {
                this.bulletNode.active = false;
                this.tankDestPartical.play();
                PlayerManager.instance.obstacleHit();
                this.scheduleOnce(() => {
                    if (!GamezopSDK.isBattle) GameManager.instance.GameDeclaration(false);
                    else GameManager.instance.onBattleOver();
                    SoundManager.inst.playSFX(SoundManager.inst.TANK_BLAST);
                    this.node.active = false;
                    this.bulletNode.active = true;
                }, 1);
            }
        }).start();
    }
    DecrimentSequence() {
        this.bulletNode.position = this.startPos.position;
        this.node.active = true;
        tween(this.bulletNode).to(this.hitduration, { position: Vec3.ZERO }, {
            onComplete: () => {
                this.bulletNode.active = false;
                this.tankDestPartical.play();
                // PlayerManager.instance.obstacleHit();
                this.scheduleOnce(() => {
                    this.node.active = false;
                    this.bulletNode.active = true;
                }, 1);
            }
        }).start();
    }
}


