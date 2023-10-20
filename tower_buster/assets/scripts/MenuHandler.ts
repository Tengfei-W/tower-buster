import { _decorator, Component, director, instantiate, log, Node, Prefab } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('MenuHandler')
export class MenuHandler extends Component {
    public static isprestNodeCreated: boolean = false;

    @property(Prefab)
    gameManager: Prefab = null;
    onLoad() {
        if (!MenuHandler.isprestNodeCreated) {
            let gm = instantiate(this.gameManager);
            gm.setParent(director.getScene());
            MenuHandler.isprestNodeCreated = true;
            director.addPersistRootNode(gm);
        }
    }
}


