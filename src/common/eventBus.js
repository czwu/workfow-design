import Vue from 'vue'
const bus = new Vue()
const EVENTS = {
    NODE_SELECTED: "选中图形节点",
    TO_EXPORT_XML: "导出XML文件",
    TO_EXPORT_SVG: "导出SVG图片文件",
    METADATA_NODE_UPDATED: "元数据节点更新",
    //快捷键
    HOTKEY_DEL: "按键Del",
    HOTKEY_CTRLC: "按键CTRL+C",
    HOTKEY_CTRLV: "按键CTRL+V",
    HOTKEY_CTRLZ: "按键CTRL+Z",
    HOTKEY_CTRLY: "按键CTRL+Y",
    HOTKEY_UP: "按键-向上",
    HOTKEY_DOWN: "按键-向下",
    HOTKEY_LEFT: "按键-向左",
    HOTKEY_RIGHT: "按键-向右",
    // 画布操作
    GRAPH_BOXESSELECTED: '完成框选操作',
    GRAPH_SCALE: '缩放操作',
    GRAPH_LEFT_NODE_MOUSEDOWN: '左区节点鼠标按下事件',
    GRAPH_LEFT_NODE_MOUSEUP: '左区节点鼠标松开事件',
    GRAPH_NODE_MOUSEDOWN: '画布中间操作区节点鼠标按下事件',
    GRAPH_LINE_SELECT: '节点间连线选中事件',
    GRAPH_LINE_MOUSEDOWN: '节点间连线轨迹鼠标按下事件',
    GRAPH_LINE_MOUSEUP: '节点间连线轨迹鼠标松开事件',
    GRAPH_LINE_MOUSEMOVE: '节点间连线轨迹鼠标滑动事件',

    SHOW_EDITOR:'显示节点中心编辑框',
    SHOW_MENU:'显示右键菜单',
    SHOW_SUBFLOW:'显示子流程'

}
export default bus
export {
    EVENTS,
    bus
}