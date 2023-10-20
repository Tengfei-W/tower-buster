import { _decorator, Component, Node, ParticleAsset, ParticleSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FinalTowerFX')
export class FinalTowerFX extends Component {


    @property(ParticleSystem)
    finalParticals: ParticleSystem[] = [];

    PlayFinalParticle() {
        // console.log("playing particle");
        this.finalParticals.forEach((particle) => {
            particle.play();
        })
    }
}


