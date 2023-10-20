import { _decorator, Component, Node, Material, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TextMat3D')
export class TextMat3D extends Component {
	@property([Material]) mat: Material[] = [];
	public static instance: TextMat3D;

	onLoad() {
		TextMat3D.instance = this;
	}

	getDigitMat(digit: number) {
		return this.mat[digit];
	}
}

