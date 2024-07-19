import { _decorator, Component, director, JsonAsset, Prefab, resources, SpriteAtlas } from 'cc';
import DataStorage from '../DataStorage';
const { ccclass } = _decorator;
@ccclass('SceneLoading')
export class SceneLoading extends Component {

    private loadConfigDone = false;
    private loadPrefabsDone = false;
    private loadSpriteAtlasDone = false;
    private isSceneLoaded = false;

    onLoad() {
        this.loadConfigMap(0);
        this.loadPrefabs();
        this.loadSpriteAltas();
    }

    loadConfigMap(id: number) {
        resources.load('config/map' + id, JsonAsset, (err, jsonAsset) => {
            if (err) {
                console.warn("Load map finished");
                this.loadConfigDone = true;
                return;
            }
            const data = jsonAsset.json;
            DataStorage.getInstance().addDataStorage(id, data);
            this.loadConfigMap(id + 1);
        });
    }

    loadPrefabs() {
        resources.loadDir('prefabs', (err, assets) => {
            if (err) {
                console.error("Failed to load dir 'scene':", err);
                this.loadPrefabsDone = true;
                return;
            }
            let numAssets = assets.length;
            if (numAssets == 0) {
                this.loadPrefabsDone = true;
                return;
            }
            console.info("numAssets: " + numAssets);
            assets.forEach(asset => {
                resources.load('prefabs/' + asset["name"], Prefab, (err, prefab) => {
                    if (err) {
                        console.error("Failed to load prefab:", err);
                        return;
                    }
                    console.info("loaded prefab: " + asset["name"])
                    if (--numAssets == 0) {
                        this.loadPrefabsDone = true;
                    }
                });
            });
        });
    }

    loadSpriteAltas() {
        resources.load("plists/breakout", SpriteAtlas, (err, atlas) => {
            this.loadSpriteAtlasDone = true;
            if (err) {
                console.error('Failed to load sprite atlas:', err);
                return;
            }
            DataStorage.getInstance().setSpriteAtlas(atlas);
        });
    }

    update(deltaTime: number) {
        if (this.loadConfigDone
            && this.loadPrefabsDone
            && this.loadSpriteAtlasDone
            && !this.isSceneLoaded) {
            this.isSceneLoaded = true;
            director.loadScene("SceneMain");
        }
    }
}


