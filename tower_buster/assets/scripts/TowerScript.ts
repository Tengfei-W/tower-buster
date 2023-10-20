import { _decorator, Color, Component, EventMouse, GradientRange, Input, input, instantiate, log, Material, MeshColliderComponent, MeshRenderer, Node, ParticleAsset, ParticleSystem, Prefab, randomRangeInt, Script, tween, Vec3 } from 'cc';
import { PlayerManager } from './PlayerManager';
import { GameManager } from './GameManager';
import { allObstalceType } from './GameVars';
import { BlockController } from './BlockController';
import { LvlData } from './GameManager';
import { ObstacleManager } from './ObstacleManager';
import { Text3D } from '../assets/3DText/Script/Text3D';
import { GiftBoxController } from './GiftBoxController';
import { BossScript } from './BossScript';

const { ccclass, property } = _decorator;

@ccclass('TowerScript')
export class TowerScript extends Component {
    @property(Text3D)
    textOnTrack: Text3D = null;
    @property(Node)
    obsControllerNode: Node = null;
    obsManager: ObstacleManager = null;
    @property(Boolean)
    shouldStartIfNoData: boolean = false;
    @property(Material)
    Allmaterials: Material[] = [];
    @property(ParticleSystem)
    DestructionParticle: ParticleSystem[] = [];
    @property(Node)
    parentNode: Node;
    @property
    rotationAngle = 6;
    allPlatforms: Node[] = [];
    @property
    platformCount = 15;
    tempPlatformCount = 0;
    towerStartPosition = 0;
    @property
    obstacleCount = 10;
    SpawnningOffset = 1;
    platformSpawnnedBefore: Node;
    // TOWER PROPERTIES
    @property(Prefab)
    TowerModuleList: Prefab[] = [];
    @property(Prefab)
    GiftBoxPrefab: Prefab = null;
    itteration: any;
    rot = 0;
    hasgift: number = 0;
    DaimondsPerTower: number = 0;
    @property(MeshRenderer)
    HitEffectMesh: MeshRenderer = null;
    @property(Node)
    HitEffectNode: Node = null;
    @property(Material)
    HitEffectMat: Material = null;
    @property
    multipleDeviderForHitEffectMesh = 1.4;
    @property
    startTweenTime = 0.5;

    bossTower: boolean = false;
    @property(Prefab)
    BossStages: Prefab[] = [];
    bossStageIndex: any;

    @property(GiftBoxController)
    GiftBoxScript: GiftBoxController = null;
    @property(Node)
    BossGiftNode: Node = null;



    devidor = 1;
    canReverse = false;

    devidorHitEf = 1;
    canReverseHitEf = false;

    blockHP = 0;

    BossDestroyed = false;

    start() {
        this.obsManager = this.obsControllerNode.getComponent(ObstacleManager);
        if (this.shouldStartIfNoData) {
            this.prestart(null);
        }
    }
    prestart(TowerData = null) {
        this.towerStartPosition = this.parentNode.position.y;
        //this.itteration = randomRangeInt(0, this.TowerModuleList.length - 1);
        // console.log("tdata ", TowerData);
        if (TowerData != null) {
            this.bossTower = TowerData["bossLvl"];
            const _tB = TowerData["blocks"];
            const _tO = TowerData["obstacle"];
            const _td = TowerData["diamonds"];
            // console.log("tow obs", _tO);

            this.itteration = _tB["style"];
            // console.log("Tower Module List", this.TowerModuleList);
            if (this.itteration == "C1" || this.itteration == "C2" || this.itteration == "C3") {
                this.bossTower = true;
                this.bossStageIndex = this.itteration;
            }

            this.platformCount = _tB["count"];
            this.blockHP = _tB["health"];
            this.hasgift = _td["giftWrap"];
            this.DaimondsPerTower = _td["count"];
            // console.log("Diamonds on this tower", this.DaimondsPerTower);

            this.scheduleOnce(() => {
                // console.log("obsmanager", this.obsManager);
                // console.log(_tO["type"]);
                this.obsManager.ObstacleTypeIDs = _tO["type"];
                this.obsManager.dir = _tO["speed"];
                this.obsManager.numberOfObestacals = _tO["count"];

                this.obsManager._oPostStart();
            }, 0.2);
            // input.on(Input.EventType.MOUSE_DOWN, () => {
            //     this.tempPlatformCount--;
            //     this.textOnTrack.setNumber(this.tempPlatformCount);
            // }, this);
        }
        this.tempPlatformCount = this.platformCount;
        if (this.bossTower && !this.shouldStartIfNoData) {

            this.SpawnBoss({ index: this.bossStageIndex });
            return;
        }
        for (let i = 0; i < this.platformCount; i++) {
            if (i == this.platformCount - 1 && this.hasgift == 1) {
                this.SpawnGift(i);
            }
            else if (i == 0) {
                this.spawnInnitial(this.itteration, i);
            }
            else {
                this.spawnBlock(this.itteration, i);
            }
            //this._pLenth++;
        }
        if (this.platformCount <= -1) {
            this.platformCount = 0;
        }
        this.textOnTrack.setNumber(this.platformCount);
        if (this.tempPlatformCount > 99) this.textOnTrack.node.setPosition(0.6, 0.15, -12.537);
        else if (this.tempPlatformCount < 10) this.textOnTrack.node.setPosition(1.8, 0.15, -12.537);
        else this.textOnTrack.node.setPosition(1.2, 0.15, -12.537);
        if (!this.shouldStartIfNoData) {
            this.parentNode.active = false;
            this.parentNode.setPosition(this.parentNode.position.x,
                this.parentNode.position.y - (this.allPlatforms.length + 1),
                this.parentNode.position.z);
        }
    }
    // span innitial and spawn platform should boe in same function
    spawnInnitial(index: number = 0, colIndex) {
        let _platform = instantiate(this.TowerModuleList[index]);
        this.HitEffectMesh.mesh = _platform.getComponentInChildren(MeshRenderer).mesh;
        // _platform.getComponentInChildren(MeshRenderer).mesh = this.HitEffectMesh.mesh;
        this.allPlatforms.push(_platform);
        var tCtr = _platform.getComponent(BlockController);

        if (this.canReverse == false) this.devidor += 0.05;
        else this.devidor -= 0.05;
        if (this.devidor <= 0.8) this.canReverse = false;
        else if (this.devidor >= 1.4) this.canReverse = true;
        // _platform.getComponentInChildren(MeshRenderer).material = this.Allmaterials[1];
        _platform.setWorldScale(_platform.scale.x / (this.devidor), _platform.scale.y, _platform.scale.z / (this.devidor));
        if (colIndex % 2 == 0) {
            _platform.getComponentInChildren(MeshRenderer).material = this.Allmaterials[0];
            tCtr.getNormalMat(this.Allmaterials[0]);
            tCtr.HP = this.blockHP;
        }
        else {
            tCtr.HP = this.blockHP;
            _platform.getComponentInChildren(MeshRenderer).material = this.Allmaterials[1];
            tCtr.getNormalMat(this.Allmaterials[1]);
        }

        _platform.setPosition(0, 1, 0);
        _platform.setRotationFromEuler(0, this.rotationAngle, 0)
        this.rotationAngle -= 6;

        _platform.setParent(this.parentNode);
        this.platformSpawnnedBefore = _platform;
    }
    spawnBlock(index: number = 0, colIndex) {
        if (this.platformSpawnnedBefore != null) {
            let _platform = instantiate(this.TowerModuleList[index]);
            this.allPlatforms.push(_platform);
            var tCtr = _platform.getComponent(BlockController);
            // if (colIndex % 2 == 0) {
            //     _platform.getComponentInChildren(MeshRenderer).material = this.Allmaterials[0];
            //     tCtr.HP = 1;
            //     tCtr.getNormalMat(this.Allmaterials[0]);
            // }
            // else {
            //     _platform.getComponentInChildren(MeshRenderer).material = this.Allmaterials[1];
            //     _platform.setWorldScale(_platform.scale.x + _platform.scale.x / 4, _platform.scale.y, _platform.scale.z + _platform.scale.z / 4);
            //     
            // }
            // console.log("devidor val", this.devidor);

            if (this.canReverse == false) this.devidor += 0.05;
            else this.devidor -= 0.05;
            if (this.devidor <= 0.8) this.canReverse = false;
            if (this.devidor >= 1.4) this.canReverse = true;

            _platform.getComponentInChildren(MeshRenderer).material = this.Allmaterials[1];
            _platform.setWorldScale(_platform.scale.x / (this.devidor), _platform.scale.y, _platform.scale.z / (this.devidor));
            if (colIndex % 2 == 0) {
                _platform.getComponentInChildren(MeshRenderer).material = this.Allmaterials[0];
                tCtr.HP = this.blockHP;
                tCtr.getNormalMat(this.Allmaterials[0]);
            }
            else {
                _platform.getComponentInChildren(MeshRenderer).material = this.Allmaterials[1];
                tCtr.HP = this.blockHP;
                tCtr.getNormalMat(this.Allmaterials[1]);
            }
            _platform.setParent(this.parentNode);
            // _platform.getComponent(BlockController).HP = randomRangeInt(1, 4);
            _platform.setPosition(0, this.platformSpawnnedBefore.position.y + 1, 0);
            _platform.setRotationFromEuler(0, this.rotationAngle, 0);
            this.rotationAngle -= 6;
            this.platformSpawnnedBefore = _platform;

            this.canReverseHitEf = !this.canReverse;
            this.devidorHitEf = this.devidor;
        }
    }
    SpawnGift(colIndex) {
        if (this.platformSpawnnedBefore != null) {
            let GiftBox = instantiate(this.GiftBoxPrefab);
            GiftBox.setParent(this.parentNode);
            this.allPlatforms.push(GiftBox);
            this.GiftBoxScript = GiftBox.getComponent(GiftBoxController)
            this.GiftBoxScript.HP = 7;
            this.GiftBoxScript.TowerScr = this;
            GiftBox.setPosition(0, this.platformSpawnnedBefore.position.y + 2, 0);
            // this.allPlatforms.push(_diamond);
            // _diamond.setParent(this.parentNode);
            // _diamond.setPosition(0, this.platformSpawnnedBefore.position.y + 2, 0);
            // _diamond.getComponentInChildren(MeshRenderer).material = this.Allmaterials[0];
            // _diamond.getComponent(BlockController).HP = 1;

        }
    }

    SpawnGiftBoss() {
        // console.log("gb1");
        let GiftBox = instantiate(this.GiftBoxPrefab);
        GiftBox.setParent(this.BossGiftNode);
        this.GiftBoxScript = GiftBox.getComponent(GiftBoxController)
        this.GiftBoxScript.HP = 7;
        this.GiftBoxScript.TowerScr = this;
        GiftBox.setPosition(0, 2, 0);
        // console.log("gb2");
    }

    show = true;
    update(dt: number): void {
        if (this.show) {
            GameManager.instance.FPSUpdate(dt);
            this.show = false;
        }
        if (!this.bossTower || this.BossDestroyed) {
            this.rot--;
        }

        if (this.BossDestroyed == true) this.BossGiftNode.setRotationFromEuler(0, this.rot, 0);
        this.parentNode.setRotationFromEuler(0, this.rot, 0);
        this.HitEffectNode.setRotationFromEuler(0, this.rot, 0);
    }
    // re write for parent object -1 instead of all nodes
    showDestructionFX(block: BlockController) {
        // console.log("showDestructionFX");
        for (var i = 0; i < this.Allmaterials.length; i++) {
            if (this.Allmaterials[i] == block.NormalMat) {
                // console.log("showDestructionFX found");
                if (this.DestructionParticle[i].isPlaying) {
                    this.DestructionParticle[i].stop();
                }
                this.DestructionParticle[i].play();
                break;
            }
        }
    }

    SpawnBoss(data = { index: "" }) {
        let BossObj = instantiate(this.BossStages[parseInt(data.index.charAt(1)) - 1]);
        let index = parseInt(data.index.charAt(1)) - 1;
        switch (index) {
            case 0:
                // console.log("index is verg good ", index);
                BossObj.setPosition(0, 7.75, 0);
                break;
            case 1:
                // console.log("index ", index);
                BossObj.setPosition(0, 8.85, 0);
                break;
            case 2:
                // console.log("index ", index);
                BossObj.setPosition(0, 6.6, 0);
                break;
        }
        BossObj.setParent(this.parentNode);
        // BossObj.setPosition(0, 6, 0);
        if (this.textOnTrack != null)
            BossObj.getComponent(BossScript).PostStart(data, this);
    }


    StartTweenUpwards() {
        if (!this.bossTower) {
            this.parentNode.active = true;
            tween(this.parentNode).to(
                this.startTweenTime,
                { position: new Vec3(this.parentNode.position.x, this.parentNode.position.y + (this.allPlatforms.length + 1), this.parentNode.position.z) },
                {
                    onComplete: () => {
                        if (GameManager.instance.isLoading) {
                            GameManager.instance.isLoading = false;
                        }
                    }
                }
            ).start();
        }
    }


    BossTowerDeath() {
        this.BossDestroyed = true;
        this.scheduleOnce(() => {
            tween(this.parentNode).to(
                1,
                { position: new Vec3(this.parentNode.position.x, this.parentNode.position.y - 30, this.parentNode.position.z) },
                {
                    easing: "quadIn", onComplete: () => {
                        this.SpawnGiftBoss();
                        let y = Math.round(this.parentNode.position.y);
                        this.parentNode.setPosition(this.parentNode.position.x, y, this.parentNode.position.z);
                    }
                },
            ).start();
        }, 0.5);
    }


    HitEffectChest(nChest: Node) {
        this.HitEffectNode.active = false;
        tween(nChest).to(0.1, {
            scale: new Vec3(1.3, 1.1, 1.3)
        }, {
            easing: "backOut",
            onComplete: () => {
                // nChest.active = false;
                nChest.setScale(1, 1, 1);
            }
        }).start();
    }

    GiftDestProcess() {
        if (this.parentNode.children.length <= 1) {
            GameManager.instance.towersLeft--;
            // console.log("btow", this.bossTower);
            this.obsManager.towerDestAnimation();
            GameManager.instance.onTowerDestroyed();
            this.scheduleOnce(() => {
                // console.log("Tower check 2");
                if (GameManager.instance.towersLeft == 0) { console.log("Tower check 3 count", GameManager.instance.towersLeft); return; }
                // console.log("Tower check 4 ");
                this.node.active = false;
            }, 5);
        }
    }

    SetTextOntrackPos(n: number) {
        this.textOnTrack.setNumber(n);
        if (n > 99) this.textOnTrack.node.setPosition(0.6, 0.15, -12.537);
        else if (n < 10) this.textOnTrack.node.setPosition(1.8, 0.15, -12.537);
        else this.textOnTrack.node.setPosition(1.2, 0.15, -12.537);
    }

    public preArrange(_node: Node) {
        this.towerStartPosition -= 1;
        tween(this.HitEffectNode).to(0.01, {
            scale: new Vec3(this.HitEffectNode.scale.x * (this.devidorHitEf + 0.1), this.HitEffectNode.scale.y, this.HitEffectNode.scale.z * (this.devidorHitEf + 0.1))
        }, {
            onComplete: () => {
                // console.log("creds", this.HitEffectNode);
                this.HitEffectNode.active = false;
                this.HitEffectNode.setScale(this.HitEffectNode.scale.x / (this.devidorHitEf + 0.1), this.HitEffectNode.scale.y, this.HitEffectNode.scale.z / (this.devidorHitEf + 0.1));
            }
        }).start();
        tween(this.parentNode).to(
            0.01,
            { position: new Vec3(this.parentNode.position.x, this.towerStartPosition, this.parentNode.position.z) },
            {
                easing: "quadIn", onComplete: () => {
                    // console.log("position of all block parent", this.parentNode.position);
                    // let y = Math.round(this.parentNode.position.y);
                    // this.parentNode.setPosition(this.parentNode.position.x, y, this.parentNode.position.z);
                }
            },
        ).start();
        this.reArange(_node);
    }

    public reArange(block: Node) {
        this.show = true;
        let bMesh = block.getComponentInChildren(MeshRenderer);
        let mNode = bMesh.node;
        this.HitEffectNode.active = true;
        this.tempPlatformCount--;
        // console.log("Plat count", this.tempPlatformCount);
        this.textOnTrack.setNumber(this.tempPlatformCount);
        if (this.tempPlatformCount > 99) this.textOnTrack.node.setPosition(0.6, 0.15, -12.537);
        else if (this.tempPlatformCount < 10) this.textOnTrack.node.setPosition(1.8, 0.15, -12.537);
        else this.textOnTrack.node.setPosition(1.2, 0.15, -12.537);

        if (this.canReverseHitEf == false) this.devidorHitEf += 0.05;
        else this.devidorHitEf -= 0.05;
        if (this.devidorHitEf <= 0.8) this.canReverseHitEf = false;
        else if (this.devidorHitEf >= 1.4) this.canReverseHitEf = true;

        block.destroy();
        // tween(this.parentNode).to(
        //     0.01,
        //     { position: new Vec3(this.parentNode.position.x, this.parentNode.position.y - 1, this.parentNode.position.z) },
        //     { easing: "quadIn" },
        // ).start();
        // console.log("mobing123", this.parentNode.children.length);
        if (this.parentNode.children.length == 1) {
            GameManager.instance.towersLeft--;
            // console.log("Tower check 1 level", GameManager.instance.LevelName);
            this.obsManager.towerDestAnimation();
            if (!this.hasgift) GameManager.instance.onTowerDestroyed();
            this.schedule(() => {
                // console.log("Tower check 2");
                if (GameManager.instance.towersLeft == 0) { console.log("Tower check 3 count", GameManager.instance.towersLeft); return; }
                // console.log("Tower check 4 ");
                this.node.active = false;
            }, 5);
        }
        // this.parentNode.setPosition(this.parentNode.position.x, this.parentNode.position.y - 1, this.parentNode.position.z);
    }

}


