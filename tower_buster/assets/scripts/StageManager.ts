import { _decorator, Component, director, game, instantiate, log, Node, ParticleSystem, Prefab, Quat, quat, randomRangeInt, Vec3 } from 'cc';
import { PlayerManager } from './PlayerManager';
import { TowerScript } from './TowerScript';
import { GameManager, LvlData } from './GameManager';
import { DataManager } from './DataManager';
import sha1 from 'sha1';
import { FinalTowerFX } from './FinalTowerFX';
const { ccclass, property } = _decorator;

@ccclass('StageManager')
export class StageManager extends Component {

    public static instance: StageManager = null;
    protected onLoad(): void {
        StageManager.instance = this;
    }

    allLevelData: LvlData = null;
    @property(Prefab)
    stageParent: Prefab = null;
    @property
    numberOfStages: number = 0;

    allStages: Node[] = [];
    lastStageSpawnnes: Node = null;
    LastDirection = 0;

    offset = 0;

    // @property(FinalTowerFX)
    // lastTowerFX: FinalTowerFX = null;

    _levelIndex = 0;

    activeStage = -1;

    start() {

    }

    onTowerDestroyStageActive() {
        this.activeStage++;
        // console.log("towerDestStageActive1");

        if (GameManager.instance.towersLeft != 0) {
            // console.log("towerDestStageActive2", GameManager.instance.towersLeft);
            let j = 0;
            for (let i = 0; i < this.allStages.length; i++) {
                this.allStages[i].active = false;
                if (i == this.activeStage) {
                    j = i;
                }
            }
            if (this.allStages[j - 1] != null) this.allStages[j - 1].active = true;
            this.allStages[j].active = true;
            if (this.allStages[j + 1] != null) this.allStages[j + 1].active = true;
            // console.log("towerDestStageActive3");
        }
    }

    PostStart(levelIndex: number) {
        this._levelIndex = levelIndex;
        DataManager.instance.setLevelData(levelIndex);
        this.numberOfStages = DataManager.currentLevelData["stages"].length;
        for (let i = 0; i < this.numberOfStages; i++) {
            this.SpawnStage(i);
            GameManager.instance.towersLeft++;
        }
        // if (this.lastStageSpawnnes != null) {
        //     this.lastStageSpawnnes.addChild(this.lastTowerFX.node);
        //     var q = new Quat();
        //     Quat.fromEuler(q, 0, 0, 0);
        //     this.lastTowerFX.node.setRotation(q);
        //     this.lastTowerFX.node.setPosition(this.lastStageSpawnnes.position);
        // }
        this.scheduleOnce(this.onTowerDestroyStageActive, 0.3);
    }

    private SpawnStage(stageID: number) {
        let Stage = instantiate(this.stageParent);
        director.getScene().addChild(Stage);
        var levelSHA1Str = (this._levelIndex + 1).toString();

        var stageDirString = sha1(levelSHA1Str);
        let direction = (stageDirString.charCodeAt(stageID) % 3) + 1;
        // console.log("sha1 dir", direction);
        if (this.lastStageSpawnnes == null) {
            //wedqwd
        }
        else {
            let PastCylinder = this.lastStageSpawnnes.getChildByName("Cylinder");

            // console.log(direction);
            let rot;
            this.offset;
            let dirNode: Node;
            //let levelID = GameManager.instance.levelIndex;

            // if (direction == this.LastDirection) {
            //     direction++;
            //     if (direction > 3) {
            //         if (this.LastDirection == 1) direction = 2;
            //         else direction = 1;
            //     }
            // }
            if (direction == 1) {
                rot = 0;
                dirNode = PastCylinder.getChildByName("FRONT");
            }
            else if (direction == 2) {
                rot = -90;
                dirNode = PastCylinder.getChildByName("LEFT");
            }
            else if (direction == 3) {
                rot = 90;
                dirNode = PastCylinder.getChildByName("RIGHT");
            }
            else {
            }
            this.LastDirection = direction;
            // console.log(Stage.position);
            Stage.setPosition(dirNode.getWorldPosition());
            Stage.setRotation(dirNode.getWorldRotation());
        }
        let TowScr = Stage.getComponent(TowerScript);
        let waypts = Stage.getChildByName("WayPoints").children;
        // console.log("way points", waypts);
        for (let i = 0; i < waypts.length; i++) {
            if (PlayerManager.instance != null)
                PlayerManager.instance.WaypointCal(waypts[i]);
        }
        // console.log(" i val ", DataManager.currentLevelData["stages"][stageID]);
        if (DataManager.currentLevelData != null)
            TowScr.prestart(DataManager.currentLevelData["stages"][stageID]);
        this.allStages.push(Stage);
        this.lastStageSpawnnes = Stage;
    }
}


