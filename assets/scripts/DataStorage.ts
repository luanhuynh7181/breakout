import { SpriteAtlas } from "cc";

export default class DataStorage {
    
    private static instance: DataStorage;
    private mapId: number = 0;
    private mapData = {};
    private prefab = {};
    private spriteAtlas: SpriteAtlas | null = null;
    private constructor() {
    }

    public static getInstance(): DataStorage {
        if (!DataStorage.instance) {
            DataStorage.instance = new DataStorage();
        }
        return DataStorage.instance;
    }

    public addDataStorage(id: number, data: any) {
        this.mapData[id] = data;
    }

    public getCurrentMap(): JSON {
        return this.mapData[this.mapId];
    }

    public getBallScale(): number {
        return this.getCurrentMap()["Mics"]["ballScale"];
    }

    public getPaddleScale(): number {
        return this.getCurrentMap()["Mics"]["paddleScale"];
    }

    public getMapData(): string[][] {
        return this.getCurrentMap()["Map"];
    }

    public getCellWidth(): number {
        return this.getCurrentMap()["Mics"]["cellWidth"];
    }

    public getPinTop(): number {
        return this.getCurrentMap()["Mics"]["pinTop"];
    }

    public setSpriteAtlas(spriteAtlas: SpriteAtlas) {
        this.spriteAtlas = spriteAtlas;
    }

    public getSpriteAtlas(): SpriteAtlas {
        return this.spriteAtlas;
    }

    public getWeightBlocks() {
        return this.getCurrentMap()["WeightBlock"];
    }

    public isWin(): boolean {
        return this.mapId == Object.keys(this.mapData).length;
    }

    public nextMap() {
        this.mapId++;
    }

}