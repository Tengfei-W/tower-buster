import { _decorator, BoxCollider, Collider, Component, ConeCollider, instantiate, log, Material, MeshRenderer, Node, ParticleAsset, ParticleSystem, Prefab, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { BlockController } from './BlockController';
import { Text3D } from '../assets/3DText/Script/Text3D';
import { TowerScript } from './TowerScript';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('BossScript')
export class BossScript extends Component {
    BossSwingIndex = 0;

    @property(Node)
    rotatorNode: Node = null;
    rot = 0;
    @property(Node)
    targatesParent: Node = null;
    curTargateIndex = 0;

    clampingZaxis = 60;
    rotation = 0;

    targetCount = 0;

    @property(Prefab)
    TargetPrefab: Prefab = null;

    towerScript: TowerScript = null

    curRotation = 0;
    RotationAdder = 0;

    @property(ParticleSystem)
    targetDestParticle: ParticleSystem[] = [];


    PostStart(data = { index: "" }, TowerScr: TowerScript) {
        this.targetDestParticle = this.node.getComponentsInChildren(ParticleSystem);
        this.towerScript = TowerScr;
        // this.TextOnPlatform.setNumber(this.targatesParent.children.length);

        let b = parseInt(data.index.charAt(1)) - 1;

        switch (b) {
            case 0:
                this.targetCount = 16;
                break;
            case 1:
                this.targetCount = 8;
                break;
            case 2:
                this.targetCount = 8;
        }
        this.BossSwingIndex = b;
        this.RotationAdder = 360 / this.targetCount;
        TowerScr.SetTextOntrackPos(this.targetCount);
        for (let i = 0; i < this.targetCount; i++) {
            this.spawnTarget();
        }
    }

    spawnTarget() {
        let _tar = instantiate(this.TargetPrefab);
        var col = _tar.getComponentInChildren(BoxCollider);
        col.on('onCollisionEnter', this.TargetHit.bind(this), this);
        let rot: Vec3;
        switch (this.BossSwingIndex) {
            case 0:
                rot = new Vec3(0, 0, this.curRotation);
                break;
            case 1:
                rot = new Vec3(0, this.curRotation, 0);
                break;
            case 2:
                rot = new Vec3(0, this.curRotation, 0);
                break;
        }
        _tar.setRotationFromEuler(rot);
        _tar.parent = this.targatesParent;
        this.curRotation += this.RotationAdder;
    }

    TargetHit(event) {
        if (event.otherCollider.node.getComponent(ConeCollider)) {
            GameManager.instance.vibrationOn(150);
            let selectedParticle: ParticleSystem = null;
            if (!this.targetDestParticle[0].isPlaying) selectedParticle = this.targetDestParticle[0];
            else if (!this.targetDestParticle[1].isPlaying) selectedParticle = this.targetDestParticle[1];
            else if (!this.targetDestParticle[2].isPlaying) selectedParticle = this.targetDestParticle[2];
            // selectedParticle.clear();
            if (selectedParticle != null) selectedParticle.play();

            // if (this.targetDestParticle[2].isPlaying || this.targetDestParticle[0].isPlaying) this.targetDestParticle[1].play();
            // else this.targetDestParticle[2].play();

            // if (this.targetDestParticle[1].isPlaying || this.targetDestParticle[2].isPlaying) this.targetDestParticle[0].play();
            // else this.targetDestParticle[1].play();

            // if (this.targetDestParticle[0].isPlaying || this.targetDestParticle[1].isPlaying) this.targetDestParticle[2].play();
            // else this.targetDestParticle[0].play();
            SoundManager.inst.playSFX(SoundManager.inst.BLOCK_HIT)
            event.selfCollider.node.parent.destroy();
            let num = this.targatesParent.children.length - 1;
            this.towerScript.SetTextOntrackPos(num);
            GameManager.instance.updateScore(1);
            if (num <= 0) {
                // GameManager.instance.towersLeft--;
                // GameManager.instance.onTowerDestroyed();
                this.towerScript.BossTowerDeath();

                // this.towerScript.obsManager.towerDestAnimation();
            }
        }
        // console.log("hit", event, this.targatesParent.children.length);
    }

    pendlumMoment(TAR: Node) {

    }

    update(deltaTime: number) {
        if (!GameManager.instance.isgameOver) {
            this.rot -= 1.4;
            switch (this.BossSwingIndex) {
                case 0:
                    this.rotatorNode.setRotationFromEuler(0, 0, this.rot);
                    break;
                case 1:
                    this.rotatorNode.setRotationFromEuler(-90, this.rot, 0);
                    break;
                case 2:
                    this.rotatorNode.setRotationFromEuler(-90, this.rot, 0);
                    break;
                default:
                    console.error("No Node Avalible or Out of index", this.rotatorNode, this.BossSwingIndex);
                    break;
            }
        }
    }
}


/*let _targate = instantiate(this.targatePrefab);
this.targatesParent.children[this.curTargateIndex].addChild(_targate);
_targate.getComponentInChildren(MeshRenderer).material = this.targateMat;
let tc = _targate.getComponent(BlockController);
tc.isBossTargate = true;
tc.scrBoss = this;
// _targate.setRotationFromEuler(90, 0, 0);
switch (this.BossSwingIndex) {
    case 0:
        _targate.setRotationFromEuler(90, 0, 0);
        _targate.setScale(_targate.scale.x / 2.5, _targate.scale.y / 2.5, _targate.scale.z / 2.5);
        break;
    case 1:
        this.pendlumMoment(_targate);
        _targate.setRotationFromEuler(0, this.targatesParent.children[this.curTargateIndex].rotation.y, 90);
        _targate.setScale(_targate.scale.x / 3, _targate.scale.y / 3, _targate.scale.z / 3);
        break;
    case 2:
        _targate.setRotationFromEuler(0, this.targatesParent.children[this.curTargateIndex].rotation.y, 90);
        _targate.setScale(_targate.scale.x / 3, _targate.scale.y / 3, _targate.scale.z / 3);
        break;
    default:
        console.error("No Node Avalible or Out of index", this.rotatorNode, this.BossSwingIndex);
        break;
}
_targate.setPosition(0, 0, 0);
this.curTargateIndex++;

if (!GameManager.instance.isgameOver) {
            this.rot--;
            switch (this.BossSwingIndex) {
                case 0:
                    this.rotatorNode.setRotationFromEuler(0, 0, this.rot);
                    break;
                case 1:
                    this.rotatorNode.setRotationFromEuler(0, this.rot, 0);
                    break;
                case 2:
                    this.rotatorNode.setRotationFromEuler(-90, this.rot, 0);
                    break;
                default:
                    console.error("No Node Avalible or Out of index", this.rotatorNode, this.BossSwingIndex);
                    break;
            }
        }

*/