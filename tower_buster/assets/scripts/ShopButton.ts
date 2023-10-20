import { _decorator, Component, isDisplayStats, Label, Node, RichText, settings, Sprite, SpriteRenderer, sys } from 'cc';
import { Cosmetic } from './Cosmetic';
import { GameManager } from './GameManager';
import { Shop } from './Shop';
const { ccclass, property } = _decorator;

@ccclass('ShopButton')
export class ShopButton extends Component {

    private id: number = 0;

    @property(Label) tankName: Label = null;
    @property(RichText) tankCost: RichText = null;
    @property(Label) Health: Label = null;
    @property(Label) Damage: Label = null;
    @property(Sprite) tankIcon: Sprite = null;

    @property(Node) stateNotPurchased: Node = null;
    @property(Node) statePurchased: Node = null;
    @property(Node) stateSelecteted: Node = null;

    setup(tankData: Cosmetic, tankID: number) {
        this.id = tankID;
        this.tankName.string = tankData.Name;
        if (tankData.Cost == 0) this.selectTank(tankID);
        else this.tankCost.string = " <outline color=00000f  width = 1 >" + tankData.Cost.toString() + " </outline>";
        this.tankIcon.spriteFrame = tankData.tankImage;
        this.Health.string = tankData.HP.toString();
        this.Damage.string = tankData.Damage.toString();
        // this.setState(0);
        // if (isPurchased) this.setTankStatePurchased();
        // else if (isSelected) this.setTankStateSelected();
    }
    setTankStateToBePurchased() { this.setState(0); }
    setTankStatePurchased() { this.setState(1); }
    setTankStateSelected() { this.setState(2); }

    selectTank(_id) { if (_id == this.id) this.setState(1); }

    tryPurchase() {
        Shop.instance.OnCosmeticShopItemClick(this.id);
    }

    private setState(state: number) {
        this.statePurchased.active = false;
        this.stateNotPurchased.active = false;
        this.stateSelecteted.active = false;
        // console.log(this.tankName.string, " state to be set ", state);
        switch (state) {
            case 0:
                this.stateNotPurchased.active = true;
                // console.log("state is C ", state);
                break;
            case 1:
                this.statePurchased.active = true;
                // console.log("state is B ", state);
                break;
            case 2:
                this.stateSelecteted.active = true;
                // console.log("state is A ", state);
                break;
        }
    }

}


