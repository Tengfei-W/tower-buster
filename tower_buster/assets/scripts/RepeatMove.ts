import { _decorator, Component, Material, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RepeatMove')
export class RepeatMove extends Component {

    @property(Vec3) startPos: Vec3 = new Vec3(-1, -1, -1);
    @property(Vec3) endPos: Vec3 = new Vec3(-1, -1, -1);
    @property framesToCover: number = 200;
    speed: Vec3 = new Vec3(0, 0, 1);
    currentFrame = 0;
    targetPos: Vec3 = new Vec3(0, 0, 1);

    // @property(Material) textmat: Material;
    // @property(Vec2) matTile: Vec2 = new Vec2(1, 1);
    // @property(Vec2) matSpeed: Vec2 = new Vec2(1, 1);

    start() {
        // if (this.matTile.x > 0) this.textmat.setProperty("mainTiling", this.matTile);

        let targetDist = Vec3.distance(this.startPos, this.endPos);
        let curDist = Vec3.distance(this.node.position, this.startPos);
        this.currentFrame = (curDist / targetDist) * this.framesToCover;
        // console.log("cur frame count", this.currentFrame, this.node);

        this.speed.x = (this.endPos.x - this.startPos.x) / this.framesToCover;
        this.speed.y = (this.endPos.y - this.startPos.y) / this.framesToCover;
        this.speed.z = (this.endPos.z - this.startPos.z) / this.framesToCover;
    }

    update(deltaTime: number) {
        Vec3.add(this.targetPos, this.node.position, this.speed);
        this.node.position = this.targetPos;
        this.currentFrame++;
        if (this.currentFrame >= this.framesToCover) {
            this.node.position = this.startPos;
            this.currentFrame = 0;
        }

        // this.textmat.setProperty("mainOffset", this.matSpeed);
    }
}


