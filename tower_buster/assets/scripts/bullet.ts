import { _decorator, Component, Node, Event, Collider, input, MeshRenderer, Material, random, randomRangeInt, BoxCollider } from 'cc';
import { TowerScript } from './TowerScript';
import { BlockController } from './BlockController';
const { ccclass, property } = _decorator;

@ccclass('bullet')
export class bullet extends Component {
    @property(Collider)
    col: Collider = null;
    damage = 1;
    start() {
        // console.log("1221");
        //var col = this.node.getComponentInChildren(Collider);
        this.col.on('onCollisionEnter', this.collisionEnter, this);
    }
    collisionEnter(event) {
        if (event.otherCollider.getComponent(BlockController)) {
            let par1 = event.otherCollider.node.getParent();

            // console.log("par1: ", par1);

            this.node.destroy()
            // console.log("12321");
        }
        else if (event.otherCollider.getComponent(BoxCollider)) {
            this.node.destroy()
        }
    }

    // update(deltaTime: number) {
    // }
}


