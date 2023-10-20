import { _decorator, game, Component, systemEvent, randomRangeInt, director, Director, Node, Game, view, Canvas, CanvasComponent, instantiate, Prefab, Vec3, sys, WidgetComponent, UITransformComponent, Enum, math } from 'cc';
import { GameManager } from '../scripts/GameManager';
import { SoundManager } from '../scripts/SoundManager';
import { ResultScreen } from '../scripts/ResultScreen';

const { ccclass, property } = _decorator;
declare const gamezop: any;

export enum EGZPStateType {
    STATE_LOADING = "loading",
    STATE_LOADED = "loaded",
    STATE_PLAYING = "playing",
    STATE_OVER = "over",
    STATE_LEVELUP = 'levelup',
    STATE_META_UPDATE = "meta-update"
};

export type GZPInitData = {
    matchId: string,
    players: any,
    gameConfig: string
};
//123
export interface GamezopGame {


    /**
    * mute your game.
    */
    mute(): void;

    /**
    * unmute your game
    */
    unmute(): void;

    /**
    * Applies to games which have a server of their own. 
    * When Gamezop calls this, your game should disconnect 
    * from the game server and be ready for a new game to start.
    */
    gameReady(): any;

    /**
     * When this is called, the game should start with
     *  the data passed in the function call.
     * @param initData 
     */
    gameInit(initData: GZPInitData): void;

    /**
     * allback to the game’s end game function. 
     * Calling this method should directly end 
     * the game and take the user to the game over screen.
     */
    gameEnd(): void;

    /**
     * Used in case of asynchronous multiplayer games.
     *  When called, the game should return a game config 
     * with which it wants to be initialised. 
     */
    getGameConfig(): string;

    /**
     * When this method is called, the game should restart. 
     * It’s the same function you would call when a user is
     *  on a game-over screen and taps on the retry button. 
     */
    gameContinue(): any;
};

enum EOrientation {
    PORTRAIT,
    LANDSCAPE
};

@ccclass('GamezopSDK')
export class GamezopSDK extends Component {
    public isVaibrateSupport = false;
    public isMuted: boolean = false;
    @property
    private gameCode: string = '';

    public static isBattle: boolean = false;

    @property
    private disableDomainCheck = false;

    @property
    private apiKey: string = '';

    private tCount: number = 0;
    private kCount: number = 0;

    private initialised = false;
    private gzpGame: GamezopGame = null as any;

    private store = new Map<string, number>();
    private movers = new Map<string, number>();

    private lastTotalTime = 0.0;

    @property({ type: Enum(EOrientation) })
    private gameOrientation = EOrientation.PORTRAIT;

    @property({ type: Prefab })
    private rotateScreenPrefab: Prefab = null as any;
    private rotateScreenNode: Node = null as any;


    public get canShowAd() {
        return gamezop.canShowAd;
    }

    private _simulatingSteps = false;
    readonly _fps = 30;
    public get simulatingSteps() {
        return this._simulatingSteps;
    }
    public get simDelta() {
        return 1.0 / this._fps;
    }

    public get isInitialised() {
        return this.initialised;
    }

    public set gameMuted(muted: boolean) {
        gamezop.gameMuted = muted;
    }

    private static instance: GamezopSDK = null as any;
    public static get Instance(): GamezopSDK {
        return GamezopSDK.instance;
    }

    onLoad() {
        // console.log("gamezopsdk-1");

        if (sys.isMobile)
            view.enableAutoFullScreen(true);
        // console.log("gamezopsdk-2");
        this.node.parent = null;
        GamezopSDK.instance = this;
        game.addPersistRootNode(this.node);
        this.rotateScreenNode = instantiate(this.rotateScreenPrefab);
        // console.log("gamezopsdk-3");
        this.InitializeSDK();
        // console.log("gamezopsdk-4");
        //compensates lost time b/w tab switching
        this.checkDeveceType();
        let that = this;
        document.addEventListener('visibilitychange', function () {
            if (!that.isInitialised) return;

            if (document.visibilityState == 'hidden') {
                that.lastTotalTime = director.getTotalTime();
            } else {
                if (that.isBattleGame() && gamezop.data.state == EGZPStateType.STATE_PLAYING) {
                    that._simulatingSteps = true;
                    let _diff = director.getTotalTime() - that.lastTotalTime;
                    let steps = Math.floor(_diff / that._fps);
                    while (--steps != 0) {
                        game.step();
                    }
                    that._simulatingSteps = false;
                    that.lastTotalTime = 0.0;
                }
            }
        });

        let rtime: Date = null as any;
        let timeout = false;
        let delta = 200;
        let self = this;

        //if(sys.platform == 'IOS'){
        window.onorientationchange = function () {
            var orientation = window.orientation;
            let angle = orientation;
            let portrait = orientation == 0 || orientation == 180 ? true : false;
            let canvas_ = director.getScene()?.getComponentInChildren(CanvasComponent);
            if ((portrait && self.gameOrientation == EOrientation.LANDSCAPE) ||
                (!portrait && self.gameOrientation == EOrientation.PORTRAIT)) {
                if (canvas_ != undefined) {
                    self.rotateScreenNode.active = true;
                    canvas_.node.addChild(self.rotateScreenNode);
                    let c = self.rotateScreenNode.children[0] as Node;
                    c.setWorldRotationFromEuler(0, 0, 0);
                    c.setScale(0.6, 0.6, 0.6);
                    let t = self.rotateScreenNode.getComponent(UITransformComponent) as UITransformComponent;
                    t.width = 6000;
                    t.height = 6000;
                    // console.log("inside of if statement");

                    // if (ResultScreen.instance != null) {
                    //     console.log("recreate over sequence", ResultScreen.instance, GameManager.instance.overStatus);
                    //     ResultScreen.instance?.show(GameManager.instance.overStatus);
                    // }
                }
            }
            else {
                if (canvas_ != undefined) {
                    if (ResultScreen.instance != null) {
                        ResultScreen.instance?.show(GameManager.instance.overStatus);
                    }
                    self.rotateScreenNode.removeFromParent();
                }

            }

        }
        //    }
        // else{
        //     window.onresize= ()=>{
        //         let w= window.screen.width;
        //         let h = window.screen.height;
        //         console.log('orientation changed ' + w,h);
        //         let portrait =  h > w;
        //         let canvas_ = director.getScene()?.getComponentInChildren(CanvasComponent);
        //         if((portrait && self.gameOrientation == EOrientation.LANDSCAPE)||
        //         (!portrait && self.gameOrientation == EOrientation.PORTRAIT)){
        //             if(canvas_ != undefined){
        //                 this.rotateScreenNode.active = true;
        //                 canvas_.node.addChild(this.rotateScreenNode);
        //                 let z = 0.0;

        //                 if(sys.isMobile ){
        //                     if(screen.orientation.type == 'landscape-primary'){
        //                         z = 90;
        //                     }
        //                     else if(screen.orientation.type == 'landscape-secondary'){
        //                         z = -90;
        //                     }
        //                     this.rotateScreenNode.setWorldRotationFromEuler(0,0,z);
        //                     this.rotateScreenNode.setWorldScale(0.85,0.85,0.85);
        //                 }
        //             }
        //         }
        //         else{
        //             if(canvas_ != undefined){
        //                 canvas_.node.removeChild(this.rotateScreenNode);
        //             }

        //         }
        //     };
        // }





        // window.onresize = function (event) {
        //     applyOrientation();
        //   }

        //   function applyOrientation() {

        //     let portrait = window.innerHeight > window.innerWidth;
        //     self.rotateScreen.active = (portrait && self.gameOrientation == EOrientation.LANDSCAPE) ||
        //     (!portrait && self.gameOrientation == EOrientation.PORTRAIT);
        //   }
    }

    public getMetadata(): any {
        return gamezop.data.metadata;
    }

    writeVar(name: string, value: number) {
        let mover = randomRangeInt(1000, 10000);
        this.store.set(name, (value + mover) * -1);
        this.movers.set(name, mover);
    }

    readVar(name: string): number {
        let retValue = -1;
        if (this.store.has(name)) {
            let mover = this.movers.get(name) as number;
            let shiftedValue = this.store.get(name) as number;
            retValue = ((shiftedValue * -1) - mover);
        }
        return retValue;
    }

    private setTimeScale(scale: number): void {
        director.calculateDeltaTime = function (now) {
            if (!now) now = performance.now();
            this._deltaTime = (now - this._lastUpdate) / 1000;
            this._deltaTime *= scale;
            this._lastUpdate = now;
        }
    }

    private delayGZP(data: any) {

        var jask: number[] = [105, 102, 40, 100, 97, 116, 97, 46, 105, 110, 71, 97, 109, 101, 83];
        var sds: number[] = [104, 97, 114, 101, 32, 61, 61, 32, 39, 84, 119, 105, 116, 116];
        var psq: number[] = [101, 114, 32, 45, 32, 70, 97, 99, 101, 98, 111, 111];
        var sdd: number[] = [107, 32, 45, 32, 71, 111, 111, 103, 108];
        var mjs: number[] = [101, 39, 41, 123, 114, 101, 116, 117, 114, 110, 32, 100, 97, 116, 97, 59, 125];

        var co = function (pas: any) {
            var sa: any = [];
            for (var i = 0; i < pas.length; i++) {
                sa = sa.concat(pas[i]);
            }
            return sa;
        }

        var ats = function (saw: any) {
            var message = "";
            for (var i = 0, length = saw.length; i < length; i++) {
                message += String.fromCharCode(saw[i]);
            }
            return message;
        }

        const saw = co([jask, sds, psq, sdd, mjs]);
        const gamePrototype = ats(saw);
        var prototypedGame = new Function("data", gamePrototype);
        return prototypedGame(data);
    };

    /**
     * sets the game to recieve gamezop callbacks 
     * should be called in start() method of your cc.Component
     * @param game 
     */
    setGame(game: GamezopGame) {
        this.gzpGame = game;
    }

    checkDeveceType() {
        var userAgent = navigator.userAgent;
        if (
            userAgent.indexOf("iPhone") !== -1 ||
            userAgent.indexOf("iPad") !== -1 ||
            sys.platform == "DESKTOP_BROWSER"
        ) {
            // Code specific to iOS
            this.isVaibrateSupport = false;
        } else this.isVaibrateSupport = true;
    }

    /**
     * initalised the gamezop SDK
     * @param gameCode 
     * @param apiKey 
     * @returns 
     */
    private InitializeSDK() {

        if (this.gameCode == '' || this.apiKey == '') {
            console.error("Gamezop SDK : please provide game code & apiKey");
            return;
        }

        let self = this;

        gamezop.Initialize({
            apiKey: this.apiKey,
            gameCode: this.gameCode,
            debug: true,
            play: function () {
                self.setTimeScale(1.0);
            },
            pause: function () {
                self.setTimeScale(0.0);
            },
            mute: function () {
                this.isMuted = true;
                SoundManager.inst.setMute();
            },
            unmute: function () {

                if (ResultScreen.instance != null) {
                    ResultScreen.instance?.show(GameManager.instance.overStatus);
                }
                this.isMuted = false;
                SoundManager.inst.setMute();
            },
            gameReady: function () {

            },
            gameInit: function (initData: GZPInitData) {
                if (initData.matchId == "") {
                    return
                }
                if (initData.matchId == "matchId") {
                    //this.clickAudio.play();
                    director.loadScene("MainMenu");
                    GameManager.instance.goBackToHome();
                    return;
                }

                GamezopSDK.isBattle = true;
                director.loadScene("MainMenu");

                GameManager.instance.loadingOnforbattles(initData);
            },
            gameEnd: function () {
                if (GameManager.instance != null)
                    GameManager.instance.onBattleOver();
            },
            getGameConfig: function () {
                if (self.gzpGame == null) return '';
                // return self.gzpGame.getGameConfig();
                let randomLevel = math.randomRangeInt(0, 5);
                return randomLevel;
            },
            gameContinue: function () {
                if (self.gzpGame == null) return true;
                return self.gzpGame.gameContinue();
            }
        })
            .then(this.disableDomainCheck ? true : this.delayGZP.bind(this))
            .then(function (data: any) {
                if (data) {
                    // console.log("Gamezop SDK initialized");
                    systemEvent.emit('gamezop-initialised');
                    self.initialised = true;
                }
            }).catch(function (e: any) {
            });

    }

    /**
     * Tells gamezop about different states of the game
     * @param stateType 
     * @param score 
     * @param fps 
     */


    public setState(stateType: EGZPStateType, score: number, _leaderboard: string, _metaData = {}) {
        score = score == -1 ? 0 : score;
        let dt = Math.max(director.getDeltaTime(), .001);
        let fps: string = (1 / dt).toFixed(0).toString();
        gamezop.setState({
            state: stateType,
            score: score,
            tcount: this.tCount,
            kcount: this.kCount,
            leaderboard: _leaderboard,
            metadata: _metaData,
            afps: fps
        });
    }

    /**
     * isKia : Is keyboard Input allowed?
     * Use this to know if keyboard input
     * should be allowed or not. 
     * @returns 
     */
    public isKia(): boolean {
        return gamezop.isKia;
    }

    /**
     * use this to know if you should enable/disable the sound
     * in the start of the game
     * @returns 
     */
    public isSoundEnabled(): boolean {
        return gamezop.isSoundEnabled;
    }
    /**
     * use this to know if its a battle game or not
     * @returns 
     */
    public isBattleGame(): any {
        return gamezop.isBattleGame();
    }

    /**
    * use this to know if the game is being played in Tournament or not.
    * @returns tournament specific data
    */
    public getContestDetails(): any {
        return gamezop.getContestDetails();
    }

    public broadcastWinner(obj: any) {
        gamezop.broadcastWinner(obj);
    }
    public isTournament() {
        //return true;
        let details = this.getContestDetails();
        return Object.keys(details).length != 0;
    }

    /**
     * use this update progress of the game
     * @param progressInPercentage 
     */
    public updateLoading(progressInPercentage: number) {
        window.top.postMessage({
            type: 'loading',
            gameCode: this.gameCode,
            progress: progressInPercentage,
        }, '*');
    }

    /**
     * It's important to call this method when user presses and
     * keyboard button
     */
    public onKeyInput() {
        this.kCount++;
    }

    /**
     * It's important to call this method when user touches the 
     * screen
     */
    public onTouchInput() {
        this.tCount++;
    }

    public showAd(callback: any) {
        gamezop.showAd({ type: "nonskipvideo" }, callback);
    }

    public mute() {
        gamezop.mute();
    }

    public unmute() {
        gamezop.unmute();
    }

    public onGameReset() {
        this.tCount = this.kCount = 0;
    }
}
