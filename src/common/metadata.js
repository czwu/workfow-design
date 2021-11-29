import eventBus, { EVENTS } from '../common/eventBus'
import { uuid2 } from '../utils/tools'
/**
 * 元数据管理对象
 */
class Metadata {

    _data_ = { nodes: [], edges: [], workflow: { id: `process_${uuid2()}` } }

    load() {

    }

    setData(data) {
        this._data_ = data
    }

    getData() {
        return this._data_;
    }


    getRootWorkflow() {
        return this._data_.workflow;
    }

    toJson() {
        return JSON.stringify(this.getData())
    }

    add(node) {
        this._data_.nodes.push(node);
    }

    remove(node) {
        this._data_.nodes = this._data_.nodes.filter(d => d != node)
    }

    getNodeById(id) {
        return this._data_.nodes.filter(node => node.id == id)[0];
    }

    getEdgById(id) {
        return this._data_.edges.filter(edg => edg.id == id)[0];
    }
}
const metadata = new Metadata();
export default metadata