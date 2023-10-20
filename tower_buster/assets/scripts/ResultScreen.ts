import { _decorator, Component, game, Label, Node, ParticleSystem, ParticleSystem2D, RichText, Tween, tween, UIOpacity, v3, Vec3 } from 'cc';
import { EGZPStateType, GamezopSDK } from '../Gamezop/GamezopSDK';
import { GamezopSceneLoader } from '../Gamezop/GamezopSceneLoader';
import { SoundManager } from './SoundManager';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('ResultScreen')
export class ResultScreen extends Component {

    public static instance: ResultScreen;
    protected onLoad(): void {
        ResultScreen.instance = this;
        addEventListener("orientationchange", this.show.bind(this, GameManager.instance.overStatus));
    }



    @property(UIOpacity) uiOpacityWin: UIOpacity = null;
    @property(UIOpacity) uiOpacityLose: UIOpacity = null;
    @property(Node) upperNode: Node = null;
    @property(Node) stats: Node = null;
    @property(Node) controls: Node = null;

    //lose
    @property(Node) Banner: Node = null;
    @property(Node) StatsLose: Node = null;
    @property(Node) LevelIndex: Node = null;
    @property(Node) Towersleft: Node = null;
    @property(Node) controlsLose: Node = null;
    // @property(Node) UppercontrolsNode: Node = null;
    // @property(Node) controlsNode: Node = null;


    // @property(Node) bannerNode: Node = null;
    // @property(Node) starNode: Node = null;
    // @property(Node) crownNode: Node = null;
    // @property(Node) gemsNode: Node = null;
    @property(ParticleSystem2D) confittie: ParticleSystem2D;



    // @property(Node) controlsNodeLose: Node = null;
    // @property(Node) bannerNodeLose: Node = null;
    // @property(Node) LevelNode: Node = null;
    // @property(Node) TowerLeftNode: Node = null;
    // @property(Node) crownNode: Node = null;
    // @property(Node) gemsNode: Node = null;



    show(didWin: boolean) {
        if (didWin) this.startWinSequence();
        else this.startLoseSequence();
        this.stats.setScale(0, 0, 0);
        this.StatsLose.setScale(0, 0, 0);
    }

    private startLoseSequence() {
        this.uiOpacityLose.opacity = 0;
        tween(this.uiOpacityLose).to(0.3, { opacity: 255 }, {
            onComplete: () => {
                tween(this.Banner).to(0.2, { position: new Vec3(0, 300, 0) }, {
                    easing: "elasticOut",
                    onComplete: () => {
                        tween(this.StatsLose).to(0.2, { scale: new Vec3(1, 1, 1) }, {
                            easing: "elasticOut",
                            onComplete: () => {
                                // console.log("Rescaling over issue1", GamezopSDK.isBattle, GamezopSDK.Instance.isBattleGame());
                                // this.confittie.resetSystem();
                                if (GameManager.instance.sentState == false &&
                                    GameManager.instance.GameLayout.active == false &&
                                    GameManager.instance.MenuLayout.active == false &&
                                    GameManager.instance.Shop.active == false &&
                                    GameManager.instance.PauseLayout.active == false) {
                                    if (!GamezopSDK.isBattle) {
                                        // console.log("Rescaling over issue", GamezopSDK.isBattle, GamezopSDK.Instance.isBattleGame());
                                        GameManager.instance.setGameOverstateNonBattles();
                                    }
                                }
                                tween(this.controlsLose).to(0.2, { position: new Vec3(0, -350, 0) }, { easing: "backOut" }).start();
                            }
                        }).start();
                    }
                }).start();
            }
        }).start();
    }

    private startWinSequence() {
        this.uiOpacityWin.opacity = 0;
        tween(this.uiOpacityWin).to(0.4, { opacity: 255 }, {
            onComplete: () => {
                tween(this.upperNode).to(0.3, { position: new Vec3(0, 76, 0) }, {
                    easing: "elasticOut",
                    onComplete: () => {
                        tween(this.stats).to(0.2, { scale: new Vec3(1, 1, 1) }, {
                            easing: "elasticOut",
                            onComplete: () => {
                                if (GameManager.instance.sentState == false && GameManager.instance.GameLayout.active == false && GameManager.instance.MenuLayout.active == false && GameManager.instance.Shop.active == false && GameManager.instance.PauseLayout.active == false)
                                    if (!GamezopSDK.isBattle) {
                                        GameManager.instance.SendlevelUpStateAfterGAmeWin();
                                    }
                                tween(this.controls).to(0.3, { position: new Vec3(0, -62, 0) }, {
                                    easing: "backOut",
                                    onComplete: () => {
                                        // GameManager.instance.setGameOverstateNonBattles();
                                        this.confittie.resetSystem();
                                    }
                                }).start();
                            }
                        }).start();
                    }
                }).start();
            }
        }).start();
        // tween(this.uiOpacityWin).to(0.4, { opacity: 255 }, {
        //     onComplete: () => {
        //         tween(this.bannerNode).to(0.3, { position: new Vec3(0, 132, 0) }, {
        //             onComplete: () => {
        //                 tween(this.starNode).to(0.3, { position: new Vec3(0, 312, 0) }, {
        //                     onComplete: () => {
        //                         tween(this.crownNode).to(0.3, { position: new Vec3(0, 483, 0) }, {
        //                             onComplete: () => {
        //                                 // GameManager.instance.setGameOverstateNonBattles();
        //                                 tween(this.controlsNode).to(0.2, { position: new Vec3(0, -550, 0) }).start();
        //                                 this.gemsNode.active = true;
        //                                 this.scheduleOnce(() => {
        //                                     this.confittie.resetSystem();
        //                                 }, 0.4);
        //                             }
        //                         }).start();
        //                     }
        //                 }).start();
        //             }
        //         }).start();
        //     }
        // }).start();

    }

    resetUi(): void {
        // console.log("in reset ui");
        this.uiOpacityLose.opacity = 0;
        this.Banner.setPosition(0, 750, 0);
        //this.LevelIndex.setPosition(490, 154, 0)
        // this.Towersleft.setPosition(-490, 68, 0);
        this.uiOpacityWin.opacity = 0;
        this.controls.setPosition(0, -512, 0);
        // this.stats.setPosition(-450, 57, 0);
        this.upperNode.setPosition(0, 512, 0);
        // this.bannerNode.setPosition(0, 741, 0);
        // this.crownNode.setPosition(0, 922.058, 0);
        // this.starNode.setPosition(0, 1092.482, 0);
    }
}


