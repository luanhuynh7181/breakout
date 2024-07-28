import { _decorator, BoxCollider2D, Component, EventMouse, Input, input, UITransform } from 'cc';
import DataStorage from './DataStorage';
import _ from 'lodash';
const { ccclass, property } = _decorator;

@ccclass('Paddle')
export class Paddle extends Component {

    private minXPos: number = 0;
    private maxXPos: number = 0;
    private halfWidthScene: number = 0;

    onLoad() {
        console.info("Paddle onLoad");
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.updateSizePaddle();
        this.updateMinMaxPosition();
    }

    updateSizePaddle() {
        let paddleScale = DataStorage.getPaddleScale();
        let node = this.node;
        node.getComponent(UITransform).width *= paddleScale;
        node.getComponent(UITransform).height *= paddleScale;
        let collider = this.getComponent(BoxCollider2D);
        collider.size.width *= paddleScale;
        collider.size.height *= paddleScale;
    }

    updateMinMaxPosition() {
        this.halfWidthScene = this.node.parent.getComponent(UITransform).width * 0.5;
        const halfPaddleWidth: number = this.node.getComponent(UITransform).width * 0.5;
        this.minXPos = -this.halfWidthScene + halfPaddleWidth;
        this.maxXPos = this.halfWidthScene - halfPaddleWidth;
    }

    onMouseMove(event: EventMouse) {
        let x: number = event.getLocationX();
        this.node.setPosition(_.clamp(x - this.halfWidthScene, this.minXPos, this.maxXPos), this.node.position.y);
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
}


