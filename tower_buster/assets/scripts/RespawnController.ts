import { _decorator, Component, Node, RichText } from 'cc';
import { GameManager } from './GameManager';
import { PlayerManager } from './PlayerManager';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('RespawnController')
export class RespawnController extends Component {

    @property TimeToRevive = 4;
    @property gemsRequiredToRespawn = 50;
    @property(RichText) CostText: RichText = null;


    onButtonClicked() {
        if (GameManager.instance.Gems >= this.gemsRequiredToRespawn) {
            GameManager.instance.GetGem(-this.gemsRequiredToRespawn);
            GameManager.instance.playerRevive();
        }
        else {
            GameManager.instance.notEnoughGemsPopupLostRevive.active = true;
            SoundManager.inst.playSFX(SoundManager.inst.ErrorBuzz);
            this.scheduleOnce(() => {
                GameManager.instance.notEnoughGemsPopupLostRevive.active = false;
            }, 0.5);
        }
    }
}


