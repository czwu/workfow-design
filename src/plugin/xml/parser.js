
import xml2json from 'xml-parser'
import { getValueByPath, setValueByPath } from '../../utils/tools'
import { message } from '../../utils/message'
import metadata from '../../common/metadata'
import { Tags } from './compile'
const Parser = {
    install() {
        document.ondragover = function (e) {
            e.preventDefault();  //只有在ondragover中阻止默认行为才能触发 ondrop 而不是 ondragleave
        };
        document.ondrop = (e) => {
            var list = e.dataTransfer.files;
            for (var i = 0; i < list.length; i++) {
                var f = list[i];
                if (f.name.indexOf('.xml') > 0) {
                    this.reader(f);
                } else {
                    message.error('请拖入流程相关的xml文件!')

                }
            }
            e.preventDefault();  //阻止 document.ondrop的默认行为  *** 在新窗口中打开拖进的xml文件
        };
    },

    parseToJson(xmlText) {
        let jsonObj = xml2json(xmlText);
        return jsonObj
    },

    xml2Meta(xml) {
        let json = this.parseToJson(xml);
        this.parseToMetadata(json);
    },

    reader(f) {
        var reader = new FileReader();
        reader.readAsText(f);
        reader.onload = () => {
            let json = this.parseToJson(reader.result);
            this.parseToMetadata(json);
        }
    },

    parseToMetadata(json) {
        let process = getValueByPath(json, 'root.children[0]');
        let mdata = { nodes: [], edges: [], workflow: {} };
        if (!process) {
            message.error('不是有效的工作流xml文件!')
            return
        }
        let diList = getValueByPath(json, 'root.children[1].children[0].children');
        let uidata = {};
        diList.forEach(element => {
            uidata[element.attributes.bpmnElement] = element;
        });
        Tags.process.node2Meta(process, uidata, mdata);
        let data = metadata.getData();
        Object.assign(data, mdata);
        fixDotLink(data);
    }
}

function fixDotLink(metadata) {
    const range = 3
    metadata.edges.forEach(edge => {
        const pointArray = edge.d.split(' ').filter(item => item.includes(',')).map(item => item.split(',')).map(item => [Math.floor(Number(item[0])), Math.floor(Number(item[1]))])
        const sourceLinkNode = metadata.nodes.filter(node => edge.source === node.id)[0].linkNode
        const targetLinkNode = metadata.nodes.filter(node => edge.target === node.id)[0].linkNode
        if (Math.abs(sourceLinkNode['top'].x - pointArray[0][0]) <= range && Math.abs(sourceLinkNode['top'].y - pointArray[0][1]) <= range) {
            edge.dotLink = 'top'
        } else if (Math.abs(sourceLinkNode['right'].x - pointArray[0][0]) <= range && Math.abs(sourceLinkNode['right'].y - pointArray[0][1]) <= range) {
            edge.dotLink = 'right'
        } else if (Math.abs(sourceLinkNode['bottom'].x - pointArray[0][0]) <= range && Math.abs(sourceLinkNode['bottom'].y - pointArray[0][1]) <= range) {
            edge.dotLink = 'bottom'
        } else if (Math.abs(sourceLinkNode['left'].x - pointArray[0][0]) <= range && Math.abs(sourceLinkNode['left'].y - pointArray[0][1]) <= range) {
            edge.dotLink = 'left'
        }

        if (Math.abs(targetLinkNode['top'].x - pointArray[pointArray.length - 1][0]) <= range && Math.abs(targetLinkNode['top'].y - pointArray[pointArray.length - 1][1]) <= range) {
            edge.dotEndLink = 'top'
        } else if (Math.abs(targetLinkNode['right'].x - pointArray[pointArray.length - 1][0]) <= range && Math.abs(targetLinkNode['right'].y - pointArray[pointArray.length - 1][1]) <= range) {
            edge.dotEndLink = 'right'
        } else if (Math.abs(targetLinkNode['bottom'].x - pointArray[pointArray.length - 1][0]) <= range && Math.abs(targetLinkNode['bottom'].y - pointArray[pointArray.length - 1][1]) <= range) {
            edge.dotEndLink = 'bottom'
        } else if (Math.abs(targetLinkNode['left'].x - pointArray[pointArray.length - 1][0]) <= range && Math.abs(targetLinkNode['left'].y - pointArray[pointArray.length - 1][1]) <= range) {
            edge.dotEndLink = 'left'
        }
    })
}
Parser.install();
export default Parser