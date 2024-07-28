import { SpriteAtlas } from "cc";

class _DataStorage {

    private static instance: _DataStorage;
    private mapId: number = 0;
    private mapData = {};
    private prefab = {};
    private spriteAtlas: SpriteAtlas | null = null;
    private constructor() {
    }

    public static getInstance(): _DataStorage {
        if (!_DataStorage.instance) {
            _DataStorage.instance = new _DataStorage();
        }
        return _DataStorage.instance;
    }

    public addDataStorage(id: number, data: any) {
        this.mapData[id] = data;
    }

    public get CurrentMap(): JSON {
        return this.mapData[this.mapId];
    }

    public getBallScale(): number {
        return this.CurrentMap["Mics"]["ballScale"];
    }

    public getPaddleScale(): number {
        return this.CurrentMap["Mics"]["paddleScale"];
    }

    public getMapData(): string[][] {
        return this.CurrentMap["Map"];
    }

    public getCellWidth(): number {
        return this.CurrentMap["Mics"]["cellWidth"];
    }

    public getPinTop(): number {
        return this.CurrentMap["Mics"]["pinTop"];
    }

    public setSpriteAtlas(spriteAtlas: SpriteAtlas) {
        this.spriteAtlas = spriteAtlas;
    }

    public getSpriteAtlas(): SpriteAtlas {
        return this.spriteAtlas;
    }

    public getWeightBlocks() {
        return this.CurrentMap["WeightBlock"];
    }

    public isWin(): boolean {
        return this.mapId == Object.keys(this.mapData).length;
    }

    public nextMap() {
        this.mapId++;
    }

}
const DataStorage = _DataStorage.getInstance();
export default DataStorage;