import { _decorator, Component, Node, geometry, Vec3, tween, Texture2D, Vec4, quat, Quat, Prefab, input, Input, director, RigidBody, instantiate, Camera, game, EventKeyboard, KeyCode, TypeScript, ParticleSystem, MeshRenderer, Material } from 'cc';
import { GameManager } from './GameManager';
import { SoundManager } from './SoundManager';
import { DestroySequence } from './DestroySequence';
import { GamezopSDK } from '../Gamezop/GamezopSDK';
import { TowerScript } from './TowerScript';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    public static instance: PlayerManager = null;
    @property(Node)
    MuzzleFlash: Node = null;
    @property(Material)
    allMat: Material[] = [];
    //cannon components
    @property(Prefab)
    bullet: Prefab = null;
    @property(Node)
    barrel: Node = null;
    @property(Vec3)
    ForcePos: Vec3 = null;
    @property(Node)
    localLookAtNode: Node;
    @property(Node)
    Waypoints: Node[] = [];
    lastWayPointIndex = 0;
    cameraNode: Node = null;
    @property(Camera)
    PlayerCamera: Camera = null;
    @property
    shootInterval = 10;
    shootGapCounter = 0;
    isFiring = false;
    tankOrientationNode: Node = null;
    @property(Node)
    OrientationNode: Node = null;
    @property(DestroySequence)
    destroySequence: DestroySequence = null;
    hitpts = 0;
    damage = 1;
    private inactivityTimer: any;
    canTakeDamage = true;

    onLoad() {
        PlayerManager.instance = this;
    }
    start() {
        this.cameraNode = this.node.getChildByName("camera node");
        input.on(Input.EventType.TOUCH_START, this.touchStart, this);
        input.on(Input.EventType.TOUCH_END, this.touchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.touchEnd, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUP, this);
        this.destroySequence.node.active = false;
        // console.log("all child", this.node.children);
        GameManager.instance.HealthText.string = "<color=#ffffff> <outline color=00000f  width = 2 >" + GameManager.instance.hp + "</color>";
        this.scheduleOnce(() => {
            //@ts-ignore
            let wayptsParent = this.Waypoints[this.lastWayPointIndex].getParent();
            //@ts-ignore
            let mainparent = wayptsParent.getParent();
            mainparent.getComponent(TowerScript).StartTweenUpwards();
        }, 0.5);
        this.destroySequence.bulletNode.getComponentInChildren(MeshRenderer).material = this.allMat[GameManager.instance.gameData.currentActiveTank];
        // game.on("revive", () => { this.node.active = true; this.Revive(this) })
    }

    Revive(self: PlayerManager) {
        // console.log("reviving player", self);
        // self.node.active = true;
        self.barrel.active = true;
        self.OrientationNode.active = true;
        for (let i = 0; i < this.barrel.children.length; i++) {
            if (this.barrel.children[i].name != "MuzzleFlash")
                this.barrel.children[i].destroy();
        }
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
                this.touchStart(event);
                break;
        }
    }
    onKeyUP(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
                this.touchEnd(event);
                break;
        }
    }

    SetTank(mesh) {
        // console.log("mesh name and all", mesh);
        var Tank = instantiate(GameManager.instance.CurrentTank);
        this.tankOrientationNode = Tank;
        Tank.setParent(this.OrientationNode);
        Tank.active = true;
        Tank.setPosition(0, 0, 0);
        Tank.setRotationFromEuler(0, 180, 0);
    }

    startDestroySequence() {
        if (this.canTakeDamage) {
            this.canTakeDamage = false;
            let died = false
            this.hitpts--;
            this.barrel.active = false;
            GameManager.instance.HealthText.string = "<color=#ffffff> <outline color=00000f  width = 2 >" + this.hitpts + "</color>";
            // console.log("hit points left ", this.hitpts);
            if (this.hitpts <= 0) {
                died = true;
                // console.log("layer death sequence ");
                this.destroySequence.StartSequence();
            }
            else {
                this.destroySequence.DecrimentSequence();
            }
            this.scheduleOnce(() => {
                // console.log("died layer death sequence", died);
                if (died == false) this.barrel.active = true;
                for (let i = 0; i < this.barrel.children.length; i++) {
                    if (this.barrel.children[i].name != "MuzzleFlash")
                        this.barrel.children[i].destroy();
                }
                this.canTakeDamage = true;
            }, 0.3);
        }
    }

    touchStart(event) {
        // GameManager.instance.updateTcount();
        this.isFiring = true;
        GamezopSDK.Instance.onTouchInput();

    }
    touchEnd(event) {
        GameManager.instance.disableInactivityTimer();
        this.shootGapCounter = 0;
        this.isFiring = false;
    }

    obstacleHit() {
        this.barrel.active = false;
        this.OrientationNode.active = false;
    }
    shootBullet() {
        // console.log("shooting", GameManager.instance.isLoading);
        if (!GameManager.instance.isLoading && !GameManager.instance.loadingScreen.active) {
            SoundManager.inst.playSFX(SoundManager.inst.TANK_SHOOT);
            if (!GameManager.instance.isgameOver) {
                var _bullet = instantiate(this.bullet);
                // console.log("current active tank", GameManager.instance.gameData.currentActiveTank);
                _bullet.getComponentInChildren(MeshRenderer).material = this.allMat[GameManager.instance.gameData.currentActiveTank];
                _bullet.setParent(this.barrel);
                //_bullet.parent = director.getScene();
                _bullet.setWorldPosition(this.barrel.worldPosition);
                //_bullet.setWorldRotation(this.barrel.rotation);
                this.MuzzleFlash.active = true;
                this.scheduleOnce(() => {
                    this.MuzzleFlash.active = false;
                }, 0.05)
                var rb = _bullet.getComponentInChildren(RigidBody).applyLocalForce(this.ForcePos, _bullet.position);
                this.tweenTankOrientation();
            }
            // this.shootPS.node.active = true;
            // if (this.shootPS.isPlaying) this.shootPS.stop();
            // this.shootPS.play();
        }

    }
    tweenTankOrientation() {
        tween(this.OrientationNode).to(0.01, { position: new Vec3(0, 0, this.OrientationNode.position.z - 0.5) }, {
            easing: "circOut",
            onComplete: () => {
                tween(this.OrientationNode).to(0.02, { position: new Vec3(0, 0, this.OrientationNode.position.z + 0.5) }, {
                    onComplete: () => {
                        this.OrientationNode.setPosition(0, 0, 0);
                    }
                }).start();
            }
        }).start();
    }
    FollowCammera() {
        this.PlayerCamera.node.setWorldPosition(this.cameraNode.worldPosition);
        this.PlayerCamera.node.setWorldRotation(this.cameraNode.worldRotation);
    }

    MoveToWayPoints(index, parentOfTower: Node = null) {
        this.barrel.active == false;
        // console.log("acompc b");
        if (this.lastWayPointIndex > this.Waypoints.length - 2) {
            GameManager.instance.GameDeclaration(true);
            return;
        }
        // console.log("acompc", this.lastWayPointIndex);
        let nextPos = this.Waypoints[index].getWorldPosition();

        // let targetRotQ = this.localLookAtNode.getWorldRotation();
        // let targetRotE = new Vec3();
        // Quat.toEuler(targetRotE, targetRotQ);
        // console.log("rot val : ", targetRotQ.y, targetRotQ);
        this.barrel.active = false;
        tween(this.node).to(2, { worldPosition: nextPos }, {
            onComplete: () => {
                if (this.lastWayPointIndex % 2 == 0) {
                    let wayptsParent = this.Waypoints[this.lastWayPointIndex].getParent();
                    let mainparent = wayptsParent.getParent();
                    mainparent.getComponent(TowerScript).StartTweenUpwards();
                    this.scheduleOnce(() => { this.barrel.active = true; }, 0.5)

                    return;
                }
                else {

                    this.localLookAtNode.setWorldPosition(this.node.worldPosition);
                    this.localLookAtNode.lookAt(this.Waypoints[index + 1].getWorldPosition());
                    tween(this.node).to(0.5, { rotation: this.localLookAtNode.getRotation() }, {
                        onComplete: () => {
                            this.node.lookAt(this.Waypoints[index + 1].getWorldPosition());
                            // console.log("node rot", this.node.rotation);
                            GameManager.instance.towerDestroyed = true;
                            for (let i = 0; i < this.barrel.children.length; i++) {
                                if (this.barrel.children[i].name != "MuzzleFlash")
                                    this.barrel.children[i].destroy();
                            }
                            this.localLookAtNode.setRotationFromEuler(0, 0, 0);
                        }
                    }).start();
                }
            }
        }).start();

        if (this.lastWayPointIndex >= this.Waypoints.length - 1) {
            // console.log("ACCHA VRO");
        }
    }
    WaypointCal(_waypt: Node) {
        // console.log("added waypoint", _waypt);
        if (_waypt != null) this.Waypoints.push(_waypt);
    }

    GameCompleated() {
        // this.node.active = false;
    }
    rot = 0;

    active = false
    update(dt: number) {
        if (!GameManager.instance.isgameOver && !GameManager.instance.isLoading) {
            if (!this.OrientationNode.children[0].active && this.active == true && !GameManager.instance.isLoading) {
                this.active = true;
                this.OrientationNode.children[0].active
            }
            // console.log("shooting", this.isFiring, this.barrel.active, this.active, GameManager.instance.isPaused);
            if (this.isFiring && this.barrel.active && !this.active && !GameManager.instance.isPaused) {
                if (this.shootGapCounter <= 0) {
                    this.shootGapCounter = this.shootInterval;
                    this.shootBullet();
                }
            }
            if (this.shootGapCounter >= 0) {
                this.shootGapCounter -= 1;
            }
            this.FollowCammera();
        }

        // console.log("bruhmoment");
        if (GameManager.instance.towerDestroyed) {
            // console.log("acomp");
            this.lastWayPointIndex++;
            // console.log("acompa");
            this.MoveToWayPoints(this.lastWayPointIndex);
            // console.log("acompb");
            GameManager.instance.towerDestroyed = false;
        }

        this.rot--;
        this.MuzzleFlash.setRotationFromEuler(90, 0, this.rot);
    }

}

