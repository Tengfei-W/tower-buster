import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;




@ccclass('LevelManager')
export class LevelManager extends Component {
    public static instance: LevelManager = null;
    protected onLoad(): void {
        LevelManager.instance = this;
    }

    @property
    AllLevels = 12;
    @property(Prefab)
    ShopComponent: Prefab = null;

    start() {

    }


}


