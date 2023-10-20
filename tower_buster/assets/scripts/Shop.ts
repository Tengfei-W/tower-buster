import { _decorator, Component, Node, sys, instantiate, Sprite, Button, Prefab, Label, EventHandler, director, RichText, SpriteFrame, log, renderer, profiler, EmptyDevice } from 'cc';
import { GameManager } from './GameManager';
import { DataManager } from './DataManager';
import { Cosmetic } from './Cosmetic';
import { RendererNode } from './RendererNode';
import { Tankcontroller } from './Tankcontroller';
import { TankShopData } from './TankShopData';
import { ShopButton } from './ShopButton';
import { SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('Shop')
export class Shop extends Component {
    public static instance: Shop = null;
    protected onLoad(): void {
        Shop.instance = this;
    }
    @property(Node)
    Locks: Node[] = [];

    @property
    selectedTankID = 0;

    tankButtons: ShopButton[] = [];

    @property(Node)
    ShopLayoutParent: Node = null;
    @property(Prefab)
    ShopModules: Prefab = null;
    @property(Node)
    getMoreGemsNode: Node = null;
    @property(Prefab)
    CosmeticsPrefab: Prefab = null;
    @property(Node)
    DataNodeForTank: Node = null;
    @property(TankShopData)
    tankShopData: TankShopData = null;
    everyCosmetics: Node = null;
    currentCosmetic: number = 0;

    poststart() {
        for (let i = 0; i < this.tankShopData.tankData.length; i++) { this.CreateCosmeticsButton(i); }
        this.selectedTankID = GameManager.instance.gameData.currentActiveTank;
        this.selectTank(this.selectedTankID);
        if (this.selectedTankID != 0) {
            this.PurchasedTank(0, false);
        }
    }
    CreateCosmeticsButton(id: number = 0) {
        let _CosmeticObject = instantiate(this.CosmeticsPrefab).getComponent(ShopButton);
        this.ShopLayoutParent.addChild(_CosmeticObject.node);
        this.tankButtons.push(_CosmeticObject);

        GameManager.instance.hpList.push(this.tankShopData.tankData[id].HP);
        GameManager.instance.DamageList.push(this.tankShopData.tankData[id].Damage);

        _CosmeticObject.setup(this.tankShopData.tankData[id], id);
        // console.log("id to chq", id);
        this.PurchasedTank(id, false);
    }
    OnCosmeticShopItemClick(id: number) {
        var tankInfo = this.tankShopData.tankData[id];
        let isBought = false;
        if (GameManager.instance.gameData.tanks.length != 0) {
            var storedTankData;
            GameManager.instance.gameData.tanks.forEach(num => {
                if (id == num) {
                    storedTankData = id;
                }
                else {
                    // console.log("not found index");
                }
            });
        }
        // console.log("storedTankData", storedTankData);
        if (storedTankData != undefined || storedTankData != null || storedTankData > -1) isBought = true;
        if (isBought) {
            this.selectTank(id);
            SoundManager.inst.playSFX(SoundManager.inst.TANK_BAUGHT);
        }
        else {
            if (GameManager.instance.Gems >= tankInfo.Cost) {
                // sys.localStorage.setItem(tankInfo.Name, id.toString());
                GameManager.instance.allTanksArray.push(id);
                GameManager.instance.sendDataToServer("meta-update");
                this.tankButtons[id].setTankStatePurchased();
                SoundManager.inst.playSFX(SoundManager.inst.DIAMOND_COLLECT);
                GameManager.instance.Gems -= tankInfo.Cost;
                GameManager.instance.GetGem(-1);

            }
            else {
                this.getMoreGemsNode.active = true;
                SoundManager.inst.playSFX(SoundManager.inst.ErrorBuzz);
                this.scheduleOnce(() => {
                    this.getMoreGemsNode.active = false;
                }, 1);
            }
        }
    }
    PurchasedTank(id, playSFX = true) {
        if (playSFX) {
            SoundManager.inst.playSFX(SoundManager.inst.TANK_SELECTED);
        }
        // var tankInfo = this.tankShopData.tankData[id];
        let isBought = false;
        if (GameManager.instance.gameData.tanks.length != 0) {
            var storedTankData;
            GameManager.instance.gameData.tanks.forEach(num => {
                if (id == num) {
                    storedTankData = id;
                }
            });
        }
        if (id == 0) {
            isBought = true;
        }
        if (storedTankData != null || storedTankData != undefined || storedTankData > -1) isBought = true;
        // console.log("id and storatankdata", id, " ", storedTankData);
        if (isBought) {
            this.tankButtons[id].setTankStatePurchased();
        }
        else {
            this.tankButtons[id].setTankStateToBePurchased();
        }
    }
    selectTank(id: number) {
        this.tankButtons[this.selectedTankID].setTankStatePurchased();
        this.tankButtons[id].setTankStateSelected();
        this.selectedTankID = id;
        // sys.localStorage.setItem("TankActiveFromLastGame", id.toString());
        RendererNode.Instance.EnableAndEquip(id);
    }
}
