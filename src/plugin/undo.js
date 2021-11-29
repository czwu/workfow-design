import eventBus, { EVENTS } from '../common/eventBus'
import metadata from '../common/metadata'

const plugin = {
    undos: [],
    redos: [],
    currJson: "",
    install() {
        this.currJson = metadata.toJson();
        //监听元数据节点更新 消息
        eventBus.$on(EVENTS.METADATA_NODE_UPDATED, () => {
            this.undos.push(this.currJson);
            this.currJson = metadata.toJson();
            this.redos = [];
        });

        // 监听撤销快捷键
        eventBus.$on(EVENTS.HOTKEY_CTRLZ, () => {
            if (this.undos.length) {
                this.redos.push(this.currJson);
                this.currJson = this.undos.pop();
                this.restoreMetadata(JSON.parse(this.currJson))
            }
        });

        // 监听重做快捷键
        eventBus.$on(EVENTS.HOTKEY_CTRLY, () => {
            if (this.redos.length) {
                this.undos.push(this.currJson);
                this.currJson = this.redos.pop();
                this.restoreMetadata(JSON.parse(this.currJson))
            }

        });
    },

    /**
     * 数据还原
     * @param {Object} redata 
     */
    restoreMetadata(redata) {
        let data = metadata.getData();
        let workflowMap = {}
        data.nodes.forEach(node => {
            workflowMap[node.id] = node.workflow;
        });
        data.edges.forEach(edge => {
            workflowMap[edge.id] = edge.workflow;
        });
        data.nodes = redata.nodes;
        data.edges = redata.edges;
        data.nodes.forEach(node => {
            if (workflowMap[node.id]) {
                node.workflow = workflowMap[node.id]
            }
        })
        data.edges.forEach(edge => {
            if (workflowMap[edge.id]) {
                edge.workflow = workflowMap[edge.id]
            }
        })
    }
};
plugin.install();
export default plugin;