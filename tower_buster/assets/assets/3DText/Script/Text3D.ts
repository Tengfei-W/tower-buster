import { _decorator, Component, Node, MeshRenderer, Material, Vec3 } from 'cc';
import { TextMat3D } from './TextMat3D';
const { ccclass, property } = _decorator;

@ccclass('Text3D')
export class Text3D extends Component {
	@property([MeshRenderer]) digitPlane: MeshRenderer[] = [];
	@property digitWidth = 10;
	start() {

	}


	setNumber(value: number) {
		var str = "" + value;
		let curPos = new Vec3();
		curPos.x -= ((this.digitWidth * (str.length - 1)) / 2) - 1.507;
		this.digitPlane[0].node.parent.setPosition(curPos);
		for (var i = 0; i < this.digitPlane.length; i++) {
			if (i >= str.length) {
				this.digitPlane[i].node.active = false;
			}
			else {
				this.digitPlane[i].node.active = true;
				this.digitPlane[i].material = TextMat3D.instance.getDigitMat(parseInt(str.charAt(i)));
			}
		};
	}
}

