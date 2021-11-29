
import eventBus, { EVENTS } from '../common/eventBus'

const HotKey = {
    isInContainer: false, //是否聚焦在指定容器中
    install(Selector) {
        document.body.addEventListener("mousedown", () => {
            this.isInContainer = false;
        }, true);
        let container = document.querySelector(Selector);
        if (container) {
            container.addEventListener("mousedown", () => {
                this.isInContainer = true;
            }, true);
        }
        document.body.addEventListener("keydown", (e) => {
            if (this.isInContainer) {
                console.log(e.code)
                if (e.ctrlKey && e.code == 'KeyC') {
                    //触发 快捷键复制
                    eventBus.$emit(EVENTS.HOTKEY_CTRLC)
                } else if (e.ctrlKey && e.code == 'KeyV') {
                    //触发 快捷键粘贴
                    eventBus.$emit(EVENTS.HOTKEY_CTRLV)
                } else if (e.code == 'Delete') {
                    //触发 快捷键删除
                    eventBus.$emit(EVENTS.HOTKEY_DEL)
                } else if (e.ctrlKey && e.code == 'KeyZ') {
                    //触发 快捷键撤销
                    eventBus.$emit(EVENTS.HOTKEY_CTRLZ)
                } else if (e.ctrlKey && e.code == 'KeyY') {
                    //触发 快捷键重做
                    eventBus.$emit(EVENTS.HOTKEY_CTRLY)
                } else if (e.code == 'ArrowUp') {
                    //触发 快捷键往上
                    e.preventDefault()
                    eventBus.$emit(EVENTS.HOTKEY_UP, e)
                } else if (e.code == 'ArrowDown') {
                    //触发 快捷键往下
                    e.preventDefault()
                    eventBus.$emit(EVENTS.HOTKEY_DOWN, e)
                } else if (e.code == 'ArrowLeft') {
                    //触发 快捷键往左
                    e.preventDefault()
                    eventBus.$emit(EVENTS.HOTKEY_LEFT, e)
                } else if (e.code == 'ArrowRight') {
                    //触发 快捷键王右
                    e.preventDefault()
                    eventBus.$emit(EVENTS.HOTKEY_RIGHT, e)
                }
            }
        }, true);
    }

}

setTimeout(() => {
    HotKey.install(".graph-container");
}, 1000)

export default HotKey