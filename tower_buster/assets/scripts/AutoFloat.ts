import { _decorator, Component, math, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AutoFloat')
export class AutoFloat extends Component {
    @property amplitude = 10;
    @property frequency = 3;
    position: Vec3 = new Vec3();
    posY = 0;
    angle = 0;

    start() {
        this.position = this.node.position;
        this.posY = this.position.y;
    }

    update(deltaTime: number) {
        this.angle += this.frequency;
        this.position.y = this.posY + Math.sin(math.toRadian(this.angle)) * this.amplitude;
        this.node.position = this.position;
    }
}


