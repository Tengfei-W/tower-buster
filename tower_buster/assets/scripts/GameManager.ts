import { _decorator, Component, director, log, Node, RichText, sys, Scheduler, fragmentText, instantiate, randomRangeInt, ParticleAsset, ParticleSystem, MeshRenderer, game, input, Input, EventKeyboard, KeyCode, EventHandheld, EventHandler, view, Label, SceneAsset, assetManager, AssetManager } from 'cc';
import { PlayerManager } from './PlayerManager';
import { DataManager } from './DataManager';
import { TowerScript } from './TowerScript';
import { StageManager } from './StageManager';
import { EGZPStateType, GamezopSDK } from '../Gamezop/GamezopSDK';
import { SoundManager } from './SoundManager';
import { ResultScreen } from './ResultScreen';
import { Shop } from './Shop';
import { ObstacleManager } from './ObstacleManager';
import { RendererNode } from './RendererNode';
const { ccclass, property } = _decorator;

export interface LvlData {
    _itteration: number,
    _platformCount: number,
    _obstacleCount: number,
    _obstacleBehaviour: number,
    _HasDiamonds: boolean
}



export interface StageData {
    _levels: number,
    TowerData: LvlData
}

@ccclass('GameManager')
export class GameManager extends Component {

    gameData = {
        currentGems: 0,
        currentActiveTank: 0,
        currentLevel: "",
        tlevelIndex: 0,
        tanks: []
    };

    public static instance: GameManager;
    // public static currentLevelData = null;
    protected onLoad(): void {
        GameManager.instance = this;
        this.vibrationOn(200);
    }

    vibrationOn(timems) {
        if (GamezopSDK.Instance.isVaibrateSupport)
            if (navigator && navigator.vibrate) {
                navigator.vibrate(timems);
            }
    }
    sentState = false;
    isgameOver = false;
    towerDestroyed = false;
    LevelName: string = "";
    DestroyedTowers = 0;
    Normalscore = 0;
    currentLevel: string = "";
    @property(Node)
    CurrentTank: Node = null;
    CurrentTankIndex: number = null;
    allTanksArray: number[] = [];
    bonus = 0;
    @property(RichText)
    DiamondReward: RichText = null;

    @property(RichText)
    costToReviveBtnText: RichText = null;

    @property
    levelIndex: number = 0;
    _tLevelIndex: number = 0;
    //layouts
    @property(Node)
    MenuLayout: Node = null;
    @property(Node)
    Shop: Node = null;
    @property(Node)
    Settings: Node = null;
    @property(Node)
    LevelSelection: Node = null;
    @property(Node)
    GameLayout: Node = null;
    @property(Node)
    GameLayoutBattle: Node = null;
    @property(Node)
    PauseLayout: Node = null;
    @property(Node)
    OverLayoutWin: Node = null;
    @property(Node)
    OverLayoutLost: Node = null;
    @property(Node)
    CommonNodeLayout: Node = null;
    // @property(Node)
    // PreviewLayout: Node = null;
    @property(Node)
    loadingScreen: Node = null;
    @property(Node)
    notEnoughGemsPopup: Node = null;
    @property(Node)
    notEnoughGemsPopupLostRevive: Node = null;
    allLayouts: Node[] = [];
    @property(RichText)
    GemText: RichText = null;
    @property(RichText)
    HealthText: RichText = null;
    Gems: number = 0;
    @property(RichText)
    LevelText: RichText = null;
    @property(RichText)
    LevelTextWon: RichText = null;
    @property(RichText)
    LevelTextOver: RichText = null;
    @property(RichText)
    TowerLeftText: RichText = null;
    @property(RichText)
    BattleScoreText: RichText = null;
    @property(RichText)
    DamageDone: RichText = null;
    scoreDamage = 0
    @property(Label)
    FPS: Label = null;
    BattleScore = 0;
    towersLeft = 0;
    isLoading = false;
    isPaused = false;
    private inactivityTimer: any;
    public static isMutedGM = false;
    hpList: number[] = [];
    DamageList: number[] = [];
    hp = 0;
    damage = 0;

    //ipad vars
    @property(Node)
    TitleLogo: Node = null;
    @property(Node)
    playButton: Node = null;

    hasRestarted = false;

    @property BatlleTime = 120;

    FPSUpdate(number) {
        this.FPS.string = (1 / number).toString();
    }

    @property(RichText)
    battleTimeText: RichText = null;
    haswon = false;

    start() {

        let isIpad = false;
        // if (screen.width > screen.height && screen.height / screen.width > 0.7) isIpad = true;
        // if (screen.width < screen.height && screen.width / screen.height > 0.7) isIpad = true;
        let aspectRatio = view.getFrameSize().width / view.getFrameSize().height;
        if (aspectRatio > 0.7) {
            this.SetOrientationAccordingToIpad();
        }

        addEventListener("resize", () => {
            if (ResultScreen.instance != null) {
                ResultScreen.instance?.show(GameManager.instance.overStatus);
            }
        });

        this.gameData = GamezopSDK.Instance.getMetadata();

        SoundManager.inst.playLooping(SoundManager.inst.BGM_Audio);
        if (GamezopSDK.isBattle) this.loadingScreen.active = true;
        if (this.gameData == null) {
            if (sys.localStorage.getItem("currentLevel")) {
                this.currentLevel = JSON.stringify(sys.localStorage.getItem("currentLevel"));
                // if (this.currentLevel == "Level 41") {
                //     this.currentLevel = "Level 40";
                //     sys.localStorage.setItem("currentLevel", this.currentLevel);
                // }
            }
            else {
                this.currentLevel = "Level 40";
                sys.localStorage.setItem("currentLevel", this.currentLevel);
            }
            if (sys.localStorage.getItem("gems")) {
                // console.log("gems are", parseInt(sys.localStorage.getItem("gems")))
                this.Gems = parseInt(sys.localStorage.getItem("gems")) + 1000;
            }
            else {
                sys.localStorage.setItem("gems", "50");
                this.Gems = 50;

            }
        }
        else {
            if (this.gameData.currentLevel) {
                this.currentLevel = this.gameData.currentLevel;

                // if (this.currentLevel == "Level 41") {
                //     this.currentLevel = "Level 1";
                //     this.sendDataToServer("meta-update");
                // }
            }
            else {
                this.currentLevel = "Level 1";
            }
            if (this.gameData.tlevelIndex) {
                this._tLevelIndex = this.gameData.tlevelIndex
            }
            else {
                this._tLevelIndex = 0;
            }
            if (this.gameData.currentGems) {
                // console.log("gems are", parseInt(sys.localStorage.getItem("gems")))
                this.Gems = this.gameData.currentGems;
            }
            else {
                // sys.localStorage.setItem("gems", "50");
                this.Gems = 50;
            }

            if (this.gameData.tanks) {
                this.allTanksArray = this.gameData.tanks;
            }
            this.sendDataToServer("");
        }

        this.GemText.string = "< color=#ffffff> <outline color=00000f  width = 2 >" + this.Gems.toString() + "</color>";
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        Shop.instance.poststart()
    }


    SetOrientationAccordingToIpad() {
        this.TitleLogo.setPosition(this.TitleLogo.position.x, this.TitleLogo.position.y + 40, this.TitleLogo.position.z);
        this.TitleLogo.setScale(this.TitleLogo.scale.x / 1.2, this.TitleLogo.scale.y / 1.2, this.TitleLogo.scale.z);
        this.playButton.setScale(this.playButton.scale.x / 1.2, this.playButton.scale.y / 1.2, this.playButton.scale.z);
    }


    onKeyDown(event: EventKeyboard) {
        if (!GamezopSDK.isBattle) {
            switch (event.keyCode) {
                case KeyCode.ENTER:
                    if (this.MenuLayout.active) this.onClickPlay();
                    else if (this.OverLayoutWin.active) this.OnLevelContinue();
                    else if (this.OverLayoutLost.active) this.Restart();
                    break;
            }
        }
    }
    private setInactivityTimer() {
        if (!GamezopSDK.isBattle) return;
        this.inactivityTimer = this.scheduleOnce(() => {
            GamezopSDK.Instance.broadcastWinner({ eventName: "inactivity", time: 5 });
            this.inactivityTimer = this.scheduleOnce(() => { }, 5000);
        }, 30000);
    }

    disableInactivityTimer() {
        if (!GamezopSDK.isBattle) return;
        GamezopSDK.Instance.broadcastWinner({ eventName: "activity" });
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
    }
    sendDataToServer(state: string = "") {
        //comment if play locally
        if (GamezopSDK.isBattle) return;
        this.gameData.tlevelIndex = this._tLevelIndex;
        this.gameData.currentGems = this.Gems;
        this.gameData.currentActiveTank = this.CurrentTankIndex;
        this.gameData.currentLevel = this.currentLevel;
        this.gameData.tanks = this.allTanksArray;
        // localStorage.setItem("dataKey", JSON.stringify(this.gameData));
        switch (state) {
            case "playing":
                // GamezopSDK.Instance.setState(EGZPStateType.STATE_PLAYING, 0, "default", this.gameData);
                break;
            case "levelUp":
                // GamezopSDK.Instance.setState(EGZPStateType.STATE_LEVELUP, 0, "default", this.gameData);
                break;
            case "over":
                GamezopSDK.Instance.setState(EGZPStateType.STATE_OVER, 0, "default", this.gameData);
                break;
            case "meta-update":
                GamezopSDK.Instance.setState(EGZPStateType.STATE_META_UPDATE, 0, "default", this.gameData);
                break;
        }

    }
    ShopBack() {
        this.buttonClockAudio();
        this.MenuLayout.active = true;
        this.Shop.active = false;
        //this.PreviewLayout.active = true;
        this.CommonNodeLayout.children[1].active = true;
        this.CommonNodeLayout.children[2].active = true;
    }

    onTowerDestroyed() {
        // console.log("destroyed");
        GameManager.instance.towerDestroyed = true;
        StageManager.instance.onTowerDestroyStageActive();
        this.DestroyedTowers++;
        this.sendDataToServer();
        GamezopSDK.Instance.setState(EGZPStateType.STATE_PLAYING, this.Normalscore, 'default', this.gameData);
    }
    onClickPlay() {
        if (this.currentLevel != null) {
            this.buttonClockAudio();
            this.isPaused = false;
            // this.CommonNodeLayout.children[2].active = false;
            this.isLoading = true;
            this.MenuLayout.active = false;
            this.Shop.active = false;
            this.GameLayout.active = true;
            // this.PreviewLayout.active = false;
            // console.log("current level", this.currentLevel);
            this.loadingScreen.active = true;
            // console.log("cur level", JSON.stringify(sys.localStorage.getItem("currentLevel")));
            // console.log("cur level and meta level", JSON.stringify(this.gameData.currentLevel));
            this.CommonNodeLayout.children[1].active = false;
            if (this.gameData == null)
                this.loadSceneFromData(sys.localStorage.getItem("currentLevel"));
            else
                this.loadSceneFromData(this.gameData.currentLevel);


        }
    }
    //battles
    onClickPlayBattle(data) {
        this.isLoading = true;
        this.MenuLayout.active = false;
        this.Shop.active = false;
        this.GameLayout.active = false;
        // this.loadingScreen.active = true;
        this.GameLayoutBattle.active = true;
        this.loadSceneFromData(this.getBattleLevelData(data.matchId));
        // this.scheduleOnce(() => {
        //     if (this.CurrentTank != null) {
        //         console.log("Going in gaem manager 1");
        //         // console.log("setting tank");
        //         PlayerManager.instance.SetTank(this.CurrentTank);
        //         PlayerManager.instance.hitpts = 1;
        //         PlayerManager.instance.damage = 1;
        //         GamezopSDK.Instance.setState(EGZPStateType.STATE_PLAYING, 0, 'default');
        //         this.setInactivityTimer();
        //     }
        // }, 0.5);

    }

    loadingOnforbattles(data) {
        this.loadingScreen.active = true;
        this.scheduleOnce(() => {
            this.BattleScore = 0;
            this.onClickPlayBattle(data);
        }, 0.2);
    }

    setBattleScore() {

        if (!this.battleOverCheck) {
            // <color=000000 > <outline>Score: 0 < /color>
            this.BattleScore++;
            this.BattleScoreText.string = "<color=000000 ><outline><color=ffffff><outline color=000000 width=3>" + this.BattleScore + "< /color>"
            GamezopSDK.Instance.setState(EGZPStateType.STATE_PLAYING, this.BattleScore, 'default');
        }
        else
            console.log("tried to score when over");

    }
    battleOverCheck = false;
    onBattleOver() {
        if (!this.battleOverCheck) {
            this.battleOverCheck = true;
            this.disableInactivityTimer();
            GamezopSDK.Instance.isMuted = true;
            SoundManager.inst.setMute();
            SoundManager.inst.SoundB.node.active = false;
            this.loadingScreen.active = true;
            GamezopSDK.Instance.setState(EGZPStateType.STATE_OVER, this.BattleScore, 'default');
        }
    }

    getBattleLevelData(battleID: string) {
        var levelDataID = (battleID.charCodeAt(0) % DataManager.instance.battleLevelData.length) + 1;
        return "Level " + levelDataID;
    }

    buttonClockAudio() {
        SoundManager.inst.playSFX(SoundManager.inst.BTN_CLICK);
    }

    onClickShop() {
        this.buttonClockAudio();
        this.MenuLayout.active = false;
        // this.PreviewLayout.active = false;
        // this.CommonNodeLayout.getChildByName("AudioBtn").setPosition(280, -531.5, 0);
        this.Shop.active = true;
        this.CommonNodeLayout.children[2].active = false;
        this.CommonNodeLayout.children[1].active = false;
    }

    loadSceneFromData(_Level: string) {
        // if (this.currentLevel == "Level 41") {
        //     console.log("cur level is", this.currentLevel);
        //     this.currentLevel = "Level 40";
        //     sys.localStorage.setItem("currentLevel", this.currentLevel);
        // }
        this.LevelName = _Level;
        let index = parseInt(_Level.split(" ")[1]) - 1;
        this.levelIndex = parseInt(_Level.split(" ")[1]);
        if (!this.hasRestarted) this._tLevelIndex++;
        this.hasRestarted = false;
        this.sendDataToServer();
        // console.log("index value ", index);
        _Level = _Level.replace(" ", "");
        // console.log("level name", _Level, index);
        // GameManager.currentLevelData = DataManager.instance.setLevelData(index);
        DataManager.instance.setLevelData(index);
        this.ConstructGameScene(index++);
    }
    getCurrentTank(mesh: Node) {

        for (let i = 0; i < this.CommonNodeLayout.children.length; i++) {
            if (this.CommonNodeLayout.children[i].getComponent(MeshRenderer)) {
                this.CommonNodeLayout.children[i].destroy();
            }
        }
        var tank = instantiate(mesh);
        tank.setParent(this.CommonNodeLayout);
        // tank.active = false;
        this.CurrentTank = tank;
    }

    cLvlIndex = 0;

    ConstructGameScene(_cLvlIndex) {
        this.Shop.active = false;
        this.cLvlIndex = _cLvlIndex;
        this.loadScenAccordingToPlatform(this.OnSceneLoadingCompleate);

    }

    OnSceneLoadingCompleate() {
        this.loadingScreen.active = false;
        if (this.CurrentTank != null) {
            // console.log("setting tank");
            PlayerManager.instance.SetTank(this.CurrentTank);
            PlayerManager.instance.hitpts = this.hp;
            PlayerManager.instance.damage = this.damage;
            this.sendDataToServer();
            GamezopSDK.Instance.setState(EGZPStateType.STATE_PLAYING, 0, 'default', this.gameData);
        }
        // this.CommonNodeLayout.children[this.CommonNodeLayout.children.length ].active = false;
        if (!GamezopSDK.isBattle) {
            this.GameLayout.active = true;
            this.CommonNodeLayout.children[2].active = false;
            // this.CommonNodeLayout.children[1].active = true;
        }
        else this.CommonNodeLayout.active = false;
        this.produceGameSceneAccordingToLevel();
        this.Shop.active = false;
        StageManager.instance.PostStart(this.cLvlIndex);
        if (GamezopSDK.isBattle)
            this.schedule(this.TimeDecrementBattles.bind(this), 1, this.BatlleTime);
    }

    _battleTime = 120;
    TimeDecrementBattles() {
        this._battleTime--;
        this.battleTimeText.string = "<color=ffffff><outline color=000000 width=3>" + this.giveTime(this._battleTime) + "</color>";
        if (this._battleTime <= 0) {
            PlayerManager.instance.startDestroySequence();
            this.battleTimeText.string = "<color=ffffff><outline color=000000 width=3>" + "0: 00" + "</color>";
        }
    }
    giveTime(seconds: number) {
        let minutes = Math.floor(seconds / 60);
        let extraSeconds = seconds % 60;
        if (extraSeconds < 10)
            return (minutes + " : 0" + extraSeconds).toString();
        else
            return (minutes + " : " + extraSeconds).toString();
    }

    produceGameSceneAccordingToLevel() {
        this.LevelText.string = "<color=#ffffff > <outline color=00000f  width = 2 >" + this._tLevelIndex.toString() + "</color>";
        this.LevelTextOver.string = "<color=#ffffff > <outline color=00000f  width = 2 >" + this._tLevelIndex.toString() + "</color>";
    }
    gameWon() {
        SoundManager.inst.playSFX(SoundManager.inst.LevelCleared);
        this.haswon = true;
        this.PauseLayout.active = false;
        this.DamageDone.string = "<color=#ffffff >" + this.scoreDamage + "</color>";
        //console.log("my masti is defined by Level " + JSON.stringify(this.levelIndex + 1));
        if (this.currentLevel != "Level 40") {
            sys.localStorage.setItem("currentLevel", "Level " + JSON.stringify(this.levelIndex + 1));
            this.currentLevel = "Level " + JSON.stringify(this.levelIndex + 1);
        }
        else {
            sys.localStorage.setItem("currentLevel", "Level 1");
            this.currentLevel = "Level 1";
            this.levelIndex = 0;
        }
        this.sendDataToServer("meta-update");

        this.bonus = randomRangeInt(25, 51);
        // StageManager.instance.lastTowerFX.PlayFinalParticle();
        this.LevelTextWon.string = "<color=#ffffff ><outline width = 4 color = ad5e1c>" + this._tLevelIndex.toString() + "</color>";
        this.DiamondReward.string = "<color=#ffffff >" + this.bonus + "< /color>";
        ResultScreen.instance.show(true);
        this.OverLayoutWin.active = true;
        this.GameLayout.active = false;
    }

    SendlevelUpStateAfterGAmeWin() {
        this.sentState = true;
        GamezopSDK.Instance.setState(EGZPStateType.STATE_LEVELUP, this.scoreDamage, 'default', this.gameData);
        GamezopSDK.Instance.setState(EGZPStateType.STATE_LEVELUP, parseInt(this.LevelName.split(" ")[1]), 'level', this.gameData);
    }

    gameLost() {
        SoundManager.inst.playSFX(SoundManager.inst.LevelLost);
        this.haswon = false;
        this.PauseLayout.active = false;
        this.CommonNodeLayout.children[0].active = false;
        // SoundManager.inst.playSFX(SoundManager.inst.TANK_BLAST);

        this.TowerLeftText.string = "<color=#ffffff > <outline color=000000 width=3>" + this.towersLeft + "< /color>";

        this.OverLayoutLost.active = true;
        ResultScreen.instance.show(false);
        this.GameLayout.active = false;
        // this.scheduleOnce(this.setGameOverstateNonBattles, 0.3);
        if (this.Gems >= 50) this.costToReviveBtnText.string = "<color=ffffff > <outline color=000000 width = 2 >" + 50 + "< /color>";
        else {
            this.costToReviveBtnText.string = "<color=FF647F > <outline color=000000 width = 2 >" + 50 + "< /color>";
        }
    }

    updateScore(num: number) {
        this.Normalscore += num;
        this.scoreDamage += num;
    }
    goBackToHome() {
        this.sentState = false;
        this.scoreDamage = 0;
        this.Normalscore = 0
        if (!this.OverLayoutLost.active && !this.OverLayoutWin.active) {
            this.sendDataToServer();
            this._tLevelIndex = this.levelIndex - 1;
            GamezopSDK.Instance.setState(EGZPStateType.STATE_OVER, this.Normalscore, 'default', this.gameData);
            this.DestroyedTowers = 0;
        }
        else {
            if (!this.haswon) this._tLevelIndex = this.levelIndex - 1;
        }
        this.towersLeft = 0;
        this.buttonClockAudio();
        this.isPaused = false;
        this.loadingScreen.active = true;
        this.DestroyedTowers = 0;
        //this.PreviewLayout.active = true;
        this.MenuLayout.active = true;
        this.PauseLayout.active = false;
        this.OverLayoutWin.active = false;
        this.OverLayoutLost.active = false;
        this.GameLayout.active = false;
        this.CommonNodeLayout.active = true;
        this.CommonNodeLayout.children[2].active = true;
        this.CommonNodeLayout.children[1].active = true;
        this.CommonNodeLayout.children[0].active = true;
        this.isgameOver = false;
        director.loadScene("MainMenu");
        ResultScreen.instance.resetUi();
        this.haswon = false
        this.scheduleOnce(() => {
            this.loadingScreen.active = false;
        }, 0.4);

        // this.CommonNodeLayout.getChildByName("AudioBtn").setPosition(0, -421.71, 0);
    }
    onGamePause() {
        this.isPaused = true;
        this.buttonClockAudio();
        this.PauseLayout.active = true;
        this.GameLayout.active = false;
        this.CommonNodeLayout.active = false;
    }
    onBtnContinue() {
        this.isPaused = false;
        this.buttonClockAudio();
        this.DestroyedTowers = 0;
        this.PauseLayout.active = false;
        this.GameLayout.active = true;
        this.CommonNodeLayout.active = true;
    }
    overStatus: boolean = false;
    GameDeclaration(HasWon: boolean = false) {
        console.log("won");
        this.overStatus = HasWon;
        this.isgameOver = true;
        this.CommonNodeLayout.children[2].active = false
        this.CommonNodeLayout.children[1].active = false;
        if (HasWon) {
            // SoundManager.inst.playSFX(SoundManager.inst);

            this.gameWon();
        } else {
            // SoundManager.inst.playSFX(SoundManager.inst.TANK_BLAST);
            this.gameLost();
        }
        if (PlayerManager.instance != null) {
            PlayerManager.instance.GameCompleated();
        }
    }
    setGameOverstateNonBattles() {
        this.sentState = true;
        this.sendDataToServer();
        GamezopSDK.Instance.setState(EGZPStateType.STATE_OVER, this.scoreDamage, 'default', this.gameData);
        this.DestroyedTowers = 0;
    }


    Restart() {
        this.sentState = false;
        if (!this.haswon) this.scoreDamage = 0
        this.Normalscore = 0;
        this.buttonClockAudio();
        this.isLoading = true;
        this.hasRestarted = true;
        this.DestroyedTowers = 0;
        this.towersLeft = 0;
        this.loadingScreen.active = true;
        this.OverLayoutWin.active = false;
        this.OverLayoutLost.active = false;
        this.GameLayout.active = true;
        this.CommonNodeLayout.active = true;
        this.CommonNodeLayout.children[0].active = true;
        // this.CommonNodeLayout.children[2].active = false;
        this.isgameOver = false;
        this.loadSceneFromData(this.LevelName);
        this.haswon = false;
        ResultScreen.instance.resetUi();
        // console.log("current tank", this.CurrentTank);
        this.scheduleOnce(() => {
            if (this.CurrentTank != null) {
                // console.log("setting tank", this.CurrentTank);
                PlayerManager.instance.SetTank(this.CurrentTank);
                PlayerManager.instance.hitpts = this.hp;
                PlayerManager.instance.damage = this.damage;

                this.CommonNodeLayout.children[2].active = false;
                // this.CommonNodeLayout.children[1].active = true;
                this.sendDataToServer();
            }
        }, 0.5);
    }

    playerRevive() {
        this.buttonClockAudio();
        PlayerManager.instance.hitpts = this.hp;
        this.HealthText.string = "<color=#ffffff> <outline color=00000f  width = 2 >" + PlayerManager.instance.hitpts + "</color>";
        this.OverLayoutLost.active = false;
        this.GameLayout.active = true;
        this.isgameOver = false;
        this.CommonNodeLayout.children[0].active = true;
        // ObstacleManager.ins.ReviveAnimation();
        PlayerManager.instance.Revive(PlayerManager.instance);
        game.emit("revive");
        ResultScreen.instance.resetUi();
    }

    DirectLevelContinue() {
        this.haswon = false;
        this.GetGem(this.bonus);
        if (this.currentLevel != "Level 40") {
            sys.localStorage.setItem("currentLevel", "Level " + JSON.stringify(this.levelIndex + 1));
            this.currentLevel = "Level " + JSON.stringify(this.levelIndex + 1);
        }
        else {
            sys.localStorage.setItem("currentLevel", "Level 1");
            this.currentLevel = "Level 1";
            this.levelIndex = 0;
        }

        this.buttonClockAudio();
        this.isLoading = true;
        this.loadingScreen.active = true;
        this.OverLayoutWin.active = false;
        this.OverLayoutLost.active = false;
        this.GameLayout.active = true;
        this.CommonNodeLayout.active = true;
        this.CommonNodeLayout.children[0].active = true;
        this.isgameOver = false;
        ResultScreen.instance.resetUi();
        this.towersLeft = 0;
        this.DestroyedTowers = 0;
        // console.log("current tank", this.CurrentTank);
        // console.log("this is elon  musk", JSON.stringify(sys.localStorage.getItem("currentLevel")));
        if (this.gameData == null)
            this.loadSceneFromData(JSON.stringify(sys.localStorage.getItem("currentLevel")));
        else
            this.loadSceneFromData(this.currentLevel);
    }

    OnLevelContinue() {
        this.haswon = false;
        this.sentState = false;
        this.GetGem(this.bonus);
        this.Normalscore = 0
        this.buttonClockAudio();
        this.isLoading = true;
        this.loadingScreen.active = true;
        this.OverLayoutWin.active = false;
        this.OverLayoutLost.active = false;
        this.GameLayout.active = true;
        this.CommonNodeLayout.active = true;
        this.CommonNodeLayout.children[0].active = true;
        this.isgameOver = false;
        ResultScreen.instance.resetUi();
        this.towersLeft = 0;
        this.DestroyedTowers = 0;
        // console.log("current tank", this.CurrentTank);
        // console.log("this is elon  musk", JSON.stringify(sys.localStorage.getItem("currentLevel")));

        if (this.gameData == null)
            this.loadSceneFromData(JSON.stringify(sys.localStorage.getItem("currentLevel")));
        else
            this.loadSceneFromData(this.currentLevel);
    }

    GetGem(value: number = 0) {
        if (value == 0) this.Gems++;
        else if (value == -1) console.log("nothing");
        else this.Gems += value;
        this.GemText.string = "< color=#ffffff> <outline color=00000f  width = 2 >" + this.Gems.toString() + "</color>";
        // this.gemBUttonGamePlay.getComponentInChildren(RichText).string = "<color=#ffffff>" + this.Gems + "</color>";
        if (this.gameData != null) this.sendDataToServer("meta-update");
        sys.localStorage.setItem("gems", this.Gems.toString());
    }

    loadScenAccordingToPlatform(callback) {
        if (sys.isMobile)
            director.loadScene("GameSceneMobile", callback.bind(this));
        else
            director.loadScene("GameSceneDesktop", callback.bind(this));

    }

    private onProgress(finished: number, total: number, item: AssetManager.RequestItem) {
        let unit = finished / total;
    }
}