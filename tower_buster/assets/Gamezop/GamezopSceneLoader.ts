
import { _decorator, Component, Node, UITransformComponent, Size, systemEvent, assetManager, AssetManager, director, SceneAsset } from 'cc';
import { GamezopSDK, EGZPStateType } from './GamezopSDK';
const { ccclass, property } = _decorator;
declare const gamezop: any;
@ccclass('GamezopSceneLoader')
export class GamezopSceneLoader extends Component {
    @property({ type: UITransformComponent })
    maskUITransform: UITransformComponent = null as any;

    private uSize: Size = new Size();

    @property
    private gameStartSceneName: string = '';

    onLoad() {
        this.uSize = this.maskUITransform.contentSize.clone();
        this.maskUITransform.setContentSize(new Size(0, this.uSize.height));
        systemEvent.on('gamezop-initialised', this.startLoader.bind(this), this);
    }

    start() {

    }

    onDestroy() {
        systemEvent.removeAll(this);
    }

    startLoader() {
        assetManager.main?.loadScene(this.gameStartSceneName, this.onProgress.bind(this), this.onCompleted.bind(this));
    }

    private onProgress(finished: number, total: number, item: AssetManager.RequestItem) {
        let unit = finished / total;
        let currWidth = (unit * this.uSize.width);
        this.maskUITransform.setContentSize(new Size(currWidth, this.uSize.height));
        unit = 0.5 + (unit / 2.0);
        GamezopSDK.Instance.updateLoading(Math.floor(unit * 100));
        gamezop.un
    }

    private onCompleted(err: any, scene: SceneAsset) {
        GamezopSDK.Instance.setState(EGZPStateType.STATE_LOADED, 0, 'default');
        director.runScene(scene);
    }
}
