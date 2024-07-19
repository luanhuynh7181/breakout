import { _decorator, Component, Label, Node } from 'cc';
import DataStorage from '../DataStorage';
const { ccclass, property } = _decorator;

@ccclass('Result')
export class Result extends Component {
    start() {
        let isWin = DataStorage.getInstance().isWin();
        let labelComponent = this.node.getChildByName("lbResult");
        const label = labelComponent.getComponent(Label);
        label.string = isWin ? "You Win" : "You Lose";
    }

    update(deltaTime: number) {

    }
}


