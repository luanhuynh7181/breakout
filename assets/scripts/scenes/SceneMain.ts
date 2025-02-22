import { _decorator, BoxCollider, BoxCollider2D, Canvas, Component, director, ERigidBody2DType, instantiate, Label, math, Node, Prefab, resources, RigidBody2D, Scene, Sprite, SpriteAtlas, SpriteFrame, UITransform, Vec2 } from 'cc';
import DataStorage from '../DataStorage';
import { BLOCK_SIZE, MAGRIN_BLOCK } from '../Const';
const { ccclass, property } = _decorator;

@ccclass('SceneMain')
export class SceneMain extends Component {

    private numBlock: number = 0;
    private blockActive: boolean[][] = null;

    @property(Prefab) blockPrefab: Prefab = null;
    onLoad() {
        console.info("SceneMain onLoad");
        this.loadBlocks();
    }

    start() {

    }

    loadBlocks() {
        let mapData: string[][] = DataStorage.getMapData();
        const canvasSize = {
            width: this.node.getComponent(UITransform).width, height:
                this.node.getComponent(UITransform).height
        };
        let cellWidth = DataStorage.getCellWidth();
        let blockSize: math.Size = BLOCK_SIZE;
        let scaleBlock = canvasSize.width / cellWidth / blockSize.width;
        let newBlockSize: math.Size = new math.Size(scaleBlock * blockSize.width, scaleBlock * blockSize.height);
        let marginTop = DataStorage.getPinTop() * newBlockSize.height;
        let blockSizeWithPadding = new math.Size(newBlockSize.width - MAGRIN_BLOCK, newBlockSize.height - MAGRIN_BLOCK);
        let midX = mapData[0].length / 2;
        this.blockActive = new Array(mapData.length).fill(false).map(() => new Array(mapData[0].length).fill(false));
        let weightBlocks = DataStorage.getWeightBlocks();
        for (let i = 0; i < mapData.length; i++) {
            let posY = canvasSize.height / 2 - marginTop - i * newBlockSize.height;
            for (let j = 0; j < mapData[i].length; j++) {
                let type = mapData[i][j];
                if (type === "EMPTY") continue;
                let posX = (j - midX) * newBlockSize.width + newBlockSize.width / 2;

                this.loadUIBlocks(posX, posY, blockSizeWithPadding, type, weightBlocks[type], i + "_" + j);
                this.blockActive[i][j] = true;
            }

        }
    }

    loadUIBlocks(posX: number, posY: number, newBlockSize: math.Size, type: string, weight: number, id: string) {
        const canvas = this.node;
        const newNode: Node = instantiate(this.blockPrefab);
        canvas.addChild(newNode);
        newNode.setPosition(posX, posY);
        const sprite = newNode.getComponent(Sprite);

        let collider = newNode.getComponent(BoxCollider2D);
        collider.size = newBlockSize;
        newNode.weight = weight;
        newNode.idTracking = id;
        if (weight > 0) {// stone, can't remove on map
            this.numBlock++;
        }
        const newSpriteFrame = DataStorage.getSpriteAtlas().getSpriteFrame(type);
        if (newSpriteFrame) {
            sprite.spriteFrame = newSpriteFrame;
        }
        newNode.getComponent(UITransform).setContentSize(newBlockSize);
    }

    inactiveBlock(block: Node) {
        if (block.weight == 0) return; // stone, can't remove on map
        if (--block.weight) return;

        block.active = false;
        let idTracking = [block.idTracking.split("_")];
        let rowBlock = parseInt(idTracking[0]);
        let colBlock = parseInt(idTracking[1]);
        this.blockActive[rowBlock][colBlock] = false;
        if (--this.numBlock === 0) {
            DataStorage.nextMap();
            if (DataStorage.isWin()) {
                director.loadScene('SceneResult');
            } else {
                director.loadScene('SceneLoading');
            }

        }
    }

    getBlockActive(): boolean[][] {
        return this.blockActive;
    }

}


