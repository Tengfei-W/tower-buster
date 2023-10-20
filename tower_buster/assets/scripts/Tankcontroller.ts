import { _decorator, Component, log, Material, MeshRenderer, Node, TextureCube } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Tankcontroller')
export class Tankcontroller extends Component {

    public static instance: Tankcontroller = null;
    protected onLoad(): void {
        Tankcontroller.instance = this;
    }
    protected start(): void {
        for (let i = 0; i < 2; i++) {
            this.setskin(i);
        }
    }
    @property(Material)
    tankMat: Material[] = [];
    @property
    selSkin = 0;
    setskin(skinId: number, shouldSendToGameManager = false) {
        // console.log("skinid is ", skinId);
        var meshes = this.node.children[skinId].getComponentsInChildren(MeshRenderer);
        meshes.forEach(mesh => { mesh.material = this.tankMat[skinId]; mesh.shadowCastingMode = 1 });
        if (shouldSendToGameManager) {
            GameManager.instance.getCurrentTank(this.node.children[skinId]);
            GameManager.instance.CurrentTankIndex = skinId;
            // console.log("setskin and meta");
            GameManager.instance.sendDataToServer();
        }
    }
}