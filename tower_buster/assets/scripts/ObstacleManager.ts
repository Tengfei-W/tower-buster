import { _decorator, BoxCollider, Collider, Component, game, Game, instantiate, log, math, Node, Prefab, Quat, quat, randomRangeInt, tween, Vec3, } from 'cc';
import { bullet } from './bullet';
import { GameManager } from './GameManager';
import { SoundManager } from './SoundManager';
import { PlayerManager } from './PlayerManager';
const { ccclass, property } = _decorator;

@ccclass('ObstacleManager')
export class ObstacleManager extends Component {


    @property
    behavviourIndex = 1;

    speedMultiplier = 0

    speed = 1;
    @property(Prefab)
    outerObstacle: Prefab[] = [];
    @property(Prefab)
    InnerObstacle: Prefab[] = [];
    @property(Node)
    obsParent: Node = null;
    @property
    numberOfObestacals = 0;
    @property
    radiusOfCircle = 4;
    dir = 0;
    slowMotion = 0;
    canmoveSlow = true;
    @property(Node)
    innerObstacleNode: Node = null;
    @property(Node)
    InnerRing: Node = null;
    isThereInnerObstacle = false;

    ObstacleTypeIDs: string[] = [];

    startRotation: boolean = false

    _oPostStart() {
        this.InnerRing.active = false;
        // this.behavviourIndex = randomRangeInt(1, 3);
        // this.behavviourIndex = 2;
        // this.dir = randomRangeInt(0, 2);

        var os1, os2, is1, is2;

        if (this.ObstacleTypeIDs.length == 1) {
            os1 = this.ObstacleTypeIDs[0].charAt(0);
            os2 = this.ObstacleTypeIDs[0].charAt(1);
        }
        else if (this.ObstacleTypeIDs.length == 2) {
            os1 = this.ObstacleTypeIDs[0].charAt(0);
            os2 = this.ObstacleTypeIDs[0].charAt(1);
            is1 = this.ObstacleTypeIDs[1].charAt(0);
            is2 = this.ObstacleTypeIDs[1].charAt(1);
        }
        else {
            os1 = this.ObstacleTypeIDs[0].charAt(0);
            os2 = this.ObstacleTypeIDs[0].charAt(1);
            is1 = this.ObstacleTypeIDs[1].charAt(0);
            is2 = this.ObstacleTypeIDs[1].charAt(1);

        }
        this.behavviourIndex = parseInt(os2);
        for (let i = 0; i < this.numberOfObestacals; i++) {
            this.DecionTerminal(os1, os2, is1, is2);
        }
        if (this.dir == 0) {
            this.speed = 0.7 + this.speedMultiplier;
        }
        else {
            this.speed = -0.7 - this.speedMultiplier;
        }
        /*
        let angle = 0;
        if (this.numberOfObestacals != 0) {
            for (let i = 0; i < this.numberOfObestacals; i++) {
                if (i <= 1) {
                    let rot = new Quat();
                    Quat.fromEuler(rot, 0, angle, 0);
                    let _obs = instantiate(this.outerObstacle);
                    var col = _obs.getComponentInChildren(BoxCollider);
                    col.on('onCollisionEnter', this.collisionEnter, this);
                    _obs.setRotation(rot);
                    _obs.parent = this.node;
                    angle += (360 / this.numberOfObestacals);
                }
                else {
                    let rot = new Quat();
                    Quat.fromEuler(rot, 0, angle, 0);
                    let _obs = instantiate(this.InnerObstacle);
                    var col = _obs.getComponentInChildren(BoxCollider);
                    col.on('onCollisionEnter', this.collisionEnter, this);
                    _obs.setRotation(rot);
                    _obs.parent = this.innerObstacleNode;
                    angle += (360 / this.numberOfObestacals - 4);
                    this.isThereInnerObstacle = true;
                    this.InnerRing.active = true;
                }
            }
        }*/
    }


    DecionTerminal(o1 = null, o2 = null, i1 = null, i2 = null) {
        if (o1 && !i1) {
            this.SpawnOuterObstacle(o2);
        }
        else if (o1 && i1) {
            this.SpawnOuterObstacle(o2);
            this.SpawnInnerObstacle(i2);
        }
    }

    SpawnOuterObstacle(index) {
        let angle = 0;
        let rot = new Quat();
        Quat.fromEuler(rot, 0, angle, 0);
        let _obs = instantiate(this.outerObstacle[index - 1]);
        var col = _obs.getComponentInChildren(BoxCollider);
        col.on('onCollisionEnter', this.collisionEnter, this);
        _obs.setRotation(rot);
        _obs.parent = this.node;
        angle += (360 / this.numberOfObestacals);
        this.startRotation = true;
    }

    SpawnInnerObstacle(index) {
        let angle = 0;
        let rot = new Quat();
        Quat.fromEuler(rot, 0, angle, 0);
        let _obs = instantiate(this.InnerObstacle[index - 1]);
        var col = _obs.getComponentInChildren(BoxCollider);
        col.on('onCollisionEnter', this.collisionEnter, this);
        _obs.setRotation(rot);
        _obs.parent = this.innerObstacleNode;
        angle += (360 / this.numberOfObestacals - 4);
        this.isThereInnerObstacle = true;
        this.InnerRing.active = true;
        this.startRotation = true;
    }

    ReviveAnimation(self: ObstacleManager) {
        // console.log("Revival of obstacle", self.obsParent, self.innerObstacleNode);
    }
    towerDestAnimation() {
        tween(this.node).to(
            0.5,
            { position: new Vec3(this.node.position.x, this.node.position.y - 2, this.node.position.z) },
            {
                easing: "quadIn", onComplete: () => {
                }
            },
        ).start();
        this.innerObstacleNode
        tween(this.innerObstacleNode).to(
            0.5,
            { position: new Vec3(this.innerObstacleNode.position.x, this.innerObstacleNode.position.y - 2, this.innerObstacleNode.position.z) },
            {
                easing: "quadIn", onComplete: () => {
                }
            },
        ).start();
    }

    collisionEnter(event) {
        if (event.otherCollider.node.parent.getComponent(bullet)) {
            SoundManager.inst.playSFX(SoundManager.inst.OBSTACLE_HIT);
            PlayerManager.instance.startDestroySequence();
            // GameManager.instance.GameDeclaration(false);
        }
    }
    update(deltaTime: number) {
        if (!GameManager.instance.isgameOver) {
            if (this.startRotation) {
                if (this.behavviourIndex == 1 || this.behavviourIndex == 3) this.FirstMovement();
                else if (this.behavviourIndex == 2) this.SecondMovement();
            }
        }
    }
    FirstMovement() {
        if (this.dir == 0) {
            this.speed++;
        }
        else {
            this.speed--;
        }
        this.node.setRotationFromEuler(0, this.speed, 0);
        this.innerObstacleNode.setRotationFromEuler(0, -this.speed, 0);
    }
    SecondMovement() {
        if (this.canmoveSlow) {
            this.slowMotion = 1;
            this.scheduleOnce(this.ResetSecondMovement, 3);
            this.canmoveSlow = false;
        }

        if (this.slowMotion == 1 && !this.canmoveSlow) {

            if (this.dir == 0) {
                this.speed += 0.4 + this.speedMultiplier;
            }
            else {
                this.speed -= 0.4 - this.speedMultiplier;
            }
        }
        else if (this.slowMotion == 0) {
            if (this.dir == 0) {
                this.speed++;
            }
            else {
                this.speed--;
            }
        }
        this.node.setRotationFromEuler(0, this.speed, 0);
        this.innerObstacleNode.setRotationFromEuler(0, -this.speed, 0);
    }
    ResetSecondMovement() {
        this.slowMotion = 0;
        this.scheduleOnce(() => {
            if (!this.canmoveSlow) {
                this.canmoveSlow = true;
            }
        }, 6);
    }
}


