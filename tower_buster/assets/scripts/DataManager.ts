import { _decorator, Component, JsonAsset, Node, sys } from 'cc';
import { GamezopSDK } from '../Gamezop/GamezopSDK';
const { ccclass, property } = _decorator;

@ccclass('DataManager')
export class DataManager extends Component {
    LevelData = {};
    CosmeticsData = {};
    @property({ type: JsonAsset })
    private levelDataJson: JsonAsset = null as any;
    @property({ type: JsonAsset })
    private BattleLevelDataJson: JsonAsset = null as any;
    levelData: any = {};
    battleLevelData: any = {};
    curLevel: number = 0;
    public static currentLevelData = null;
    public static instance: DataManager;

    onLoad() {
        DataManager.instance = this;
        this.levelData = this.levelDataJson.json;
        this.battleLevelData = this.BattleLevelDataJson.json;
    }
    setLevelData(levelID: number) {
        //console.log(" all level data ", this.levelDataJson, " perticular level data ");
        // console.log("all level data ", this.LevelData = this.allLevelData.json['stages'][0]);
        //return this.LevelData = this.allLevelData.json["allLevels"][levelName];
        if (GamezopSDK.isBattle) DataManager.currentLevelData = this.BattleLevelDataJson.json[levelID];
        else DataManager.currentLevelData = this.levelDataJson.json[levelID];
    }

}


