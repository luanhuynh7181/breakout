import { _decorator, Canvas, CircleCollider2D, Collider2D, Component, Contact2DType, director, EventMouse, EventTouch, Input, input, IPhysics2DContact, JsonAsset, Node, Sprite, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import DataStorage from './DataStorage';
import _ from 'lodash';
import { SceneMain } from './scenes/SceneMain';
import { MAGRIN_BLOCK } from './Const';
@ccclass('Ball')
export class Ball extends Component {

    @property(Node)
    puddle: Node = null;

    private speed: number = 600; // Speed of the ball
    private direction: Vec2 = new Vec2(0, 0); // Initial direction of movement
    private isStarted: boolean = false;

    private lastBlockPos: Vec2 = new Vec2(0, 0);
    private lastTimeCollisionBlock: number = 0;

    onLoad() {
        console.info("Ball onLoad");
        this.updateSizeBall()
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        let collider = this.getComponent(Collider2D);
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    start() {

    }

    updateSizeBall() {
        let ballScale = DataStorage.getInstance().getBallScale();
        let node = this.node;
        node.getComponent(UITransform).width *= ballScale;
        node.getComponent(UITransform).height *= ballScale;
        // update  radius collider
        let collider = this.getComponent(CircleCollider2D);
        collider.radius *= ballScale;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let name = otherCollider.node.name;

        if (name === "borderRight" || name === "borderLeft") {
            this.direction.x *= -1;
            return;
        }

        if (name === "borderTop") {
            this.direction.y *= -1;
            return;
        }

        if (name === "borderBottom") {
            director.loadScene('SceneResult');
            return;
        }

        if (name === "paddle") {
            let pos = selfCollider.node.position;
            if (pos.y < this.puddle.position.y) {
                this.direction.x = -1;
            } else {
                this.updateDirectionBallWhenCollisionPaddle(pos.x);
            }
            return;
        }

        if (name === "block") {
            let node: Node = otherCollider.node;
            this.updateDirectionBallWhenCollisionBlock(node);

        }
    }

    update(deltaTime: number) {
        if (!this.isStarted) {
            this.updateBallByPaddle();
            return;
        }
        this.updateBallPosition(deltaTime);
    }

    updateBallPosition(deltaTime: number) {
        let pos = this.node.position;
        let x = pos.x + this.direction.x * this.speed * deltaTime;
        let y = pos.y + this.direction.y * this.speed * deltaTime;
        this.node.setPosition(x, y);
    }

    updateBallByPaddle() {
        let paddlePosition = this.puddle.position;
        this.node.setPosition(paddlePosition.x, this.node.position.y);
    }

    onTouchStart(event: EventTouch) {
        if (this.isStarted) return;
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        let paddle = this.puddle;
        let halfPaddleWidth = paddle.getComponent(UITransform).width / 2;
        this.updateDirectionBallWhenCollisionPaddle(paddle.position.x + _.random(-halfPaddleWidth, halfPaddleWidth));
        this.isStarted = true;
    }

    updateDirectionBallWhenCollisionPaddle(posX: number) {
        let puddle = this.puddle;
        let xDelta = (posX - puddle.position.x) / (puddle.getComponent(UITransform).width / 2);
        xDelta = _.clamp(xDelta, - 0.94, 0.94);
        let yDelta = Math.sqrt(1 - xDelta * xDelta);
        this.direction = new Vec2(xDelta, yDelta);
    }

    isValidCollisionBlock(node: Node): boolean {
        if (!node.active) return false;
        let pos = node.position;
        if (Math.abs(this.lastBlockPos.x - pos.x) < 2 // 2block nearby
            || Math.abs(this.lastBlockPos.y - pos.y) < 2) {// 2block nearby
            return Date.now() - this.lastTimeCollisionBlock > 40;
        }
        return true;
    }

    updateDirectionBallWhenCollisionBlock(node: Node) {
        if (!this.isValidCollisionBlock(node)) return;
        this.lastTimeCollisionBlock = Date.now();
        this.lastBlockPos = new Vec2(node.position.x, node.position.y);
        const canvas = this.node.scene.getComponentInChildren(Canvas);
        const canvasScript: SceneMain = canvas.getComponent('SceneMain') as SceneMain;
        const blockActive: boolean[][] = canvasScript.getBlockActive();
        this.scheduleOnce(() => {
            canvasScript.inactiveBlock(node);
        });
        this.setupDirectionWhenCollisionBlock(node, blockActive);

    }

    setupDirectionWhenCollisionBlock(node: Node, blockActive: boolean[][]) {
        let nodeWidth = node.getComponent(UITransform).width;
        let nodeHeight = node.getComponent(UITransform).height;
        // make rect of block 
        let rect = {
            x: node.position.x - nodeWidth / 2,
            y: node.position.y - nodeHeight / 2,
            width: nodeWidth + MAGRIN_BLOCK,
            height: nodeHeight + MAGRIN_BLOCK
        }
        let circle = {
            x: this.node.position.x,
            y: this.node.position.y,
            R: this.node.getComponent(UITransform).width / 2
        }
        // console.warn("-----------------------------track id:" + node.idTracking);
        // console.log({ director: this.direction })
        // console.log(rect);
        // console.log(circle);
        let debugValue = this.updateDirectionWhenCollisionSide(circle, rect, blockActive, node);
        if (debugValue < 0) this.updateDirectionWhenCollisionBorder();
        // console.log({ director: this.direction })
        //console.warn("----------------------------- debug value:" + debugValue);
    }

    updateDirectionWhenCollisionBorder() {
        let direction = this.direction;
        let x = Math.abs(direction.y) * (direction.x > 0 ? -1 : 1);
        let y = Math.abs(direction.x) * (direction.y > 0 ? -1 : 1);
        this.direction.x = x;
        this.direction.y = y;
    }

    isExitsBlock(blockActive: boolean[][], row: number, col: number): boolean {
        if (row < 0 || row >= blockActive.length) return false;
        if (col < 0 || col >= blockActive[0].length) return false;
        return blockActive[row][col];
    }

    updateDirectionWhenCollisionSide(circle, rect, blockActive, node): number {
        let direction = this.direction;
        if (_.inRange(circle.x, rect.x, rect.x + rect.width)) {
            direction.y *= -1;
            if (circle.y > rect.y) { // top
                direction.y = Math.abs(direction.y);
            } else { // bottom
                direction.y = -Math.abs(direction.y);
            }
            return 1;
        }

        if (_.inRange(circle.y, rect.y, rect.y + rect.height)) {
            if (circle.x < rect.x) { // left
                direction.x = -Math.abs(direction.x);
            } else {
                direction.x = Math.abs(direction.x); // right
            }
            return 2;
        }

        let idTracking = [node.idTracking.split("_")];
        let rowBlock = parseInt(idTracking[0]);
        let colBlock = parseInt(idTracking[1]);
        // bottom left rect
        if (circle.x < rect.x && circle.y < rect.y) {
            if (direction.x > 0 && direction.y > 0) {  // collision side rect
                let blockLeft = this.isExitsBlock(blockActive, rowBlock, colBlock - 1);
                let blockBottom = this.isExitsBlock(blockActive, rowBlock + 1, colBlock);
                if (!blockLeft && !blockBottom) return -1;
                if (blockLeft) {
                    direction.y = -Math.abs(direction.y);
                    return 11
                } else {
                    direction.x = -Math.abs(direction.x);
                    return 12;
                }

            }
            if (direction.x >= 0) {
                direction.x = -Math.abs(direction.x);
                return 13
            } else {
                direction.y = -Math.abs(direction.y);
                return 14;
            }
        }

        // bottom right rect
        if (circle.x > rect.x + rect.width && circle.y < rect.y) {
            if (direction.x < 0 && direction.y > 0) {// collision side rect
                let blockRight = this.isExitsBlock(blockActive, rowBlock, colBlock + 1);
                let blockBottom = this.isExitsBlock(blockActive, rowBlock + 1, colBlock);
                if (!blockRight && !blockBottom) return -2;
                if (blockRight) {
                    direction.y = -Math.abs(direction.y);
                    return 21;
                } else {
                    direction.x = Math.abs(direction.x);
                    return 22;
                }
            }
            if (direction.x <= 0) {
                direction.x = Math.abs(direction.x);
                return 23;
            } else {
                direction.y = -Math.abs(direction.y);
                return 24;
            }
        }

        // top right rect
        if (circle.x > rect.x + rect.width && circle.y > rect.y + rect.height) {
            if (direction.x < 0 && direction.y < 0) {// collision side rect
                let blockRight = this.isExitsBlock(blockActive, rowBlock, colBlock + 1);
                let blockTop = this.isExitsBlock(blockActive, rowBlock - 1, colBlock);
                if (!blockRight && !blockTop) return -3;
                if (blockRight) {
                    direction.y = Math.abs(direction.y);
                    return 31;
                } else {
                    direction.x = Math.abs(direction.x);
                    return 32;
                }

            }
            if (direction.x <= 0) {
                direction.x = Math.abs(direction.x);
                return 33;
            } else {
                direction.y = Math.abs(direction.y);
                return 34;
            }
        }

        // top left rect
        if (circle.x < rect.x && circle.y > rect.y + rect.height) {
            if (direction.x > 0 && direction.y < 0) {// collision side rect
                let blockLeft = this.isExitsBlock(blockActive, rowBlock, colBlock - 1);
                let blockTop = this.isExitsBlock(blockActive, rowBlock - 1, colBlock);
                if (!blockLeft && !blockTop) return -4;
                if (blockLeft) {
                    direction.y = Math.abs(direction.y);
                    return 41;
                } else {
                    direction.x = -Math.abs(direction.x);
                    return 42;
                }

            }
            if (direction.x >= 0) {
                direction.x = -Math.abs(direction.x);
                return 43;
            } else {
                direction.y = Math.abs(direction.y);
                return 44;
            }
        }
        console.error("updateDirectionWhenCollisionSide failed");
        return 0;

    }

    onDestroy() {
    }

}


