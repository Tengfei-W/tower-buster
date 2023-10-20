import { _decorator, Component, Node, AudioClip, AudioSource, Sprite, SpriteFrame, Button, game, director, enumerableProps, RichText, ParticleSystem2DAssembler, ParticleSystem, SpriteRenderer } from 'cc';
import { GamezopSDK } from '../Gamezop/GamezopSDK';
import { GameManager } from './GameManager';
import { DataManager } from './DataManager';
const { ccclass, property, requireComponent } = _decorator;



@ccclass('SoundManager')
@requireComponent(AudioSource)
export class SoundManager extends Component {

    Source: AudioSource = null;

    @property(Button)
    SoundB: Button = null;
    @property(Button)
    SoundButBattles: Button = null;
    @property(Button)
    SoundBBig: Button = null;
    @property(Node)
    SoundIcon: Node = null;
    @property(AudioClip)
    BGM_Audio: AudioClip;
    @property(AudioClip)
    LevelCleared: AudioClip;
    @property(AudioClip)
    LevelLost: AudioClip;
    @property(AudioClip)
    BTN_CLICK: AudioClip;
    @property(AudioClip)
    DIAMOND_COLLECT: AudioClip;
    @property(AudioClip)
    DIAMOND_DESTROY: AudioClip;
    @property(AudioClip)
    OBSTACLE_HIT: AudioClip;
    @property(AudioClip)
    STORE_BLOCKED_CARD: AudioClip;
    @property(AudioClip)
    TANK_BLAST: AudioClip;
    @property(AudioClip)
    TANK_BAUGHT: AudioClip;
    @property(AudioClip)
    TANK_MOVING: AudioClip;
    @property(AudioClip)
    TANK_SELECTED: AudioClip;
    @property(AudioClip)
    TANK_SHOOT: AudioClip;
    @property(AudioClip)
    BLOCK_HIT: AudioClip;
    @property(AudioClip)
    ErrorBuzz: AudioClip;

    @property(SpriteFrame)
    MusicBtnSprite: SpriteFrame[] = [];
    @property(SpriteFrame)
    MusicBtnFullSizedSprite: SpriteFrame[] = [];
    @property(SpriteFrame)
    musicIcon: SpriteFrame[] = [];

    public static inst: SoundManager = null;
    public static isBGMplaying = false;
    onLoad() {
        SoundManager.inst = this;
        this.Source = this.getComponent(AudioSource);
    }

    playSFX(_clip: AudioClip) {
        if (GamezopSDK.Instance.isMuted) return;
        if (_clip == null) return;
        this.Source.playOneShot(_clip);
    }
    playLooping(_clip: AudioClip) {
        if (GamezopSDK.Instance.isMuted) return;
        if (_clip == null) return;
        this.Source.clip = _clip;
        this.Source.loop = true;
        this.Source.play();
        SoundManager.isBGMplaying = true;
    }
    RestartSFX() {
        //this.Source.stop();
    }
    start() {
        // if (!SoundManager.isBGMplaying) {
        //     this.playLooping(this.BGM_Audio);
        //     SoundManager.isBGMplaying = true;
        // }
        this.setMute();
        if (!GamezopSDK.Instance.isMuted)
            this.playLooping(this.BGM_Audio);
    }
    toggleMute() {
        GamezopSDK.Instance.isMuted = !GamezopSDK.Instance.isMuted;
        this.setMute();

    }
    setMute() {

        if (!GamezopSDK.Instance.isMuted) {
            // console.log("battle unmute");
            this.Source.volume = 0.5;
            if (!SoundManager.isBGMplaying) {
                this.playLooping(this.BGM_Audio);
            }
            this.Source.loop = true;
            this.SoundB.getComponent(Sprite).spriteFrame = this.MusicBtnSprite[0];
            this.SoundButBattles.getComponent(Sprite).spriteFrame = this.MusicBtnSprite[0];
            this.SoundBBig.getComponent(Sprite).spriteFrame = this.MusicBtnFullSizedSprite[0];
            this.SoundIcon.getComponent(Sprite).spriteFrame = this.musicIcon[0];
            this.SoundBBig.getComponentInChildren(RichText).string = "<color=#ffffff > <outline color = 0f7b9f >" + "MUTE" + " < /color>";
        }
        else {
            // console.log("battle mute");
            this.Source.volume = 0;
            this.SoundB.getComponent(Sprite).spriteFrame = this.MusicBtnSprite[1];
            this.SoundButBattles.getComponent(Sprite).spriteFrame = this.MusicBtnSprite[1];
            this.SoundBBig.getComponent(Sprite).spriteFrame = this.MusicBtnFullSizedSprite[1];
            this.SoundIcon.getComponent(Sprite).spriteFrame = this.musicIcon[1];
            this.SoundBBig.getComponentInChildren(RichText).string = "<color=#ffffff > <outline color = 0f7b9f >" + "UNMUTE" + " < /color>";
            SoundManager.isBGMplaying = false;
            this.Source.stop();
            this.Source.loop = false;

        }
    }
}