import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

//cannon boost, incrim,ent in obstacke speed, tower hight incriment, 

@ccclass('GameVars')
export class GameVars extends Component {
    public static instance: GameVars = null;
    public static Direction: number = 1;
    public static isMuted: boolean = false;
    public static isOver: boolean = false;
    onLoad() {
        GameVars.instance = this;
    }
    update(deltaTime: number) { }


}

export enum allObstalceType {
    Cylinder = "towerModuleCylender",
    Hexagon = "towerModuleHexagon",
    Square = "towerModuleHexagon",
    Star = "towerModuleStar"
}

