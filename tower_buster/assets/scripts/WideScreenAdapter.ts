import { _decorator, Component, Node, UITransform, Vec2, view, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WideScreenAdapter')
export class WideScreenAdapter extends Component {

    @property orignalWidth = 576;
    @property orignalHeight = 1024;
    @property(Node) affectedNode: Node = null;

    start() {
        if (this.affectedNode == null) this.affectedNode = this.node;
        addEventListener("orientationchange", this.WideScreenAdapt.bind(this));
        addEventListener("resize", this.WideScreenAdapt.bind(this));
        this.scheduleOnce(this.WideScreenAdapt.bind(this), 1);
        // addEventListener("resize", this.WideScreenAdapt);
        // this.WideScreenAdapt();
    }

    WideScreenAdapt() {
        let widget = this.getComponent(Widget);
        if (view.getVisibleSize().width >= view.getVisibleSize().height) {
            widget!.isAlignHorizontalCenter = true;
            widget!.left = 25;
            widget!.right = 25;
            // let curScale = screen.height / this.orignalHeight;
            // let targetWidth = curScale * this.orignalWidth;
            // let finalScale = targetWidth / screen.width;
            // let finalHeight = (1 / finalScale) * screen.height;
            // this.affectedNode.getComponent(UITransform).setContentSize(screen.width, finalHeight);
            // this.affectedNode.setScale(finalScale, finalScale, finalScale);
        }
        else {
            widget!.isAlignHorizontalCenter = false;
            widget!.isAlignLeft = true;
            widget!.isAlignRight = true;
            widget!.verticalCenter = 0;
            // this.affectedNode.getComponent(UITransform).setContentSize(screen.width, screen.height);
            // this.affectedNode.setScale(1, 1, 1);
        }
    }

}


