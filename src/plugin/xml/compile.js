import { saveAs } from 'file-saver';
import eventBus, { EVENTS } from "../../common/eventBus";
import metadata from "../../common/metadata";
import { getValueByPath, setValueByPath } from "../../utils/tools"
const compile = {
    /**
     * 组件启动
     */
    install() {
        eventBus.$on(EVENTS.TO_EXPORT_XML, () => {
            this.downloadFile(this.compile(), 'data.xml')
        });
        /*
        eventBus.$on(EVENTS.TO_EXPORT_SVG, () => {
            let fileName = metadata.getRootWorkflow().id + '.svg';
            let header = `
            <?xml version="1.0" encoding="utf-8"?>
            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`
            let content = document.querySelector("svg").outerHTML;
            var file = new File([header + content], fileName, { type: "image/svg+xml;charset=utf-8" });
            saveAs(file);
        });
        */
    },

    /**
     * 
     * @param {String} content   创建xml文档内容
     * @param {String} fileName  创建的xml文件名称
     */
    downloadFile(content, fileName) {
        var file = new File([content], fileName, { type: "text/xml;charset=utf-8" });
        saveAs(file);
    },

    /**
     * 将元数据内容编译成工作流描述XML文档字符串
     */
    compile() {
        let data = metadata.getData();
        return Tags.xml + Tags.definitions.genXml(data);
    },

    $attr(attrs, data) {
        let props = attrs.map(attr => {
            let value = attr.value;
            if (attr.mapping) {
                value = getValueByPath(data, attr.mapping);
                if (attr.valueFmt) {
                    value = attr.valueFmt(value)
                }
            }
            value = compile.entityUpload(value)
            return value || value === false ? `${attr.key}="${value}"` : ''
        });
        return props.join(" ")
    },

    // xml特殊符号转义上传
    entityUpload(value) {
        if (value && typeof value === 'string') {
            let temp = value
            temp = temp.replace(/\"|\&|\<|\>/g, (item) => {
                if (item === '"') {
                    return '&quot;'
                } else if (item === '&') {
                    return '&amp;'
                } else if (item === '<') {
                    return '&lt;'
                } else if (item === '>') {
                    return '&gt;'
                } else {
                    return item
                }
            })
            return temp
        } else {
            return value
        }
    },

    // xml特殊符号转义本地显示
    entityLocal(value) {
        if (value && typeof value === 'string') {
            let temp = value
            temp = temp.replace(/\&quot\;|\&amp\;|\&lt\;|\&gt\;/g, (item) => {
                if (item === '&quot;') {
                    return '"'
                } else if (item === '&amp;') {
                    return '&'
                } else if (item === '&lt;') {
                    return '<'
                } else if (item === '&gt;') {
                    return '>'
                } else {
                    return item
                }
            })
            return temp
        } else {
            return value
        }
    },

    attrs2Meta(attrs, mdata, json) {
        attrs.map(attr => {
            if (attr.mapping) {
                let key = attr.key;
                let value = json.attributes[key] || '';
                if (value == 'true' || value == 'false') {
                    value = value == 'true' ? true : false
                }
                if (value !== '') {
                    setValueByPath(mdata, compile.entityLocal(value), attr.mapping)
                }

            }
        });
    }
};

function setNodePos(meta, attrs) {
    meta.x = +attrs.x;
    meta.y = +attrs.y;
    meta.w = +attrs.width;
    meta.h = +attrs.height;
}
function setLinkNode(meta) {
    let { x, y, w, h } = meta;
    meta.linkNode = {
        top: {
            x: Math.floor(x + w / 2),
            y: Math.floor(y),
        },
        bottom: {
            x: Math.floor(x + w / 2),
            y: Math.floor(y + h),
        },
        left: {
            x: Math.floor(x),
            y: Math.floor(y + h / 2),
        },
        right: {
            x: Math.floor(x + w),
            y: Math.floor(y + h / 2),
        }
    }
}



const Tags = {

    xml: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`,
    definitions: {
        tagName: "definitions",
        attrs: [
            { key: "xmlns", value: "http://www.omg.org/spec/BPMN/20100524/MODEL" },
            { key: "xmlns:activiti", value: "http://activiti.org/bpmn" },
            { key: "xmlns:bpmndi", value: "http://www.omg.org/spec/BPMN/20100524/DI" },
            { key: "xmlns:dc", value: "http://www.omg.org/spec/DD/20100524/DC" },
            { key: "xmlns:di", value: "http://www.omg.org/spec/DD/20100524/DI" },
            { key: "xmlns:xsd", value: "http://www.w3.org/2001/XMLSchema" },
            { key: "xmlns:xsi", value: "http://www.w3.org/2001/XMLSchema-instance" },
            { key: "expressionLanguage", value: "http://www.w3.org/1999/XPath" },
            { key: "targetNamespace", value: "http://www.activiti.org/testm1598687121176" },
            { key: "typeLanguage", value: "http://www.w3.org/2001/XMLSchema" },
        ],
        genXml(context, mdata) {
            let tagName = 'definitions';
            //获取属性配置内容
            let attrStr = compile.$attr(this.attrs, context);
            //获取子标签 内容
            let process = Tags.process.genXml(context, mdata);
            let BPMNDiagram = Tags.BPMNDiagram.genXml(context, mdata);
            //构建标签并返回
            return `<${tagName} ${attrStr} > ${process} ${BPMNDiagram}</${tagName}>`
        }
    },
    process: {
        tagName: "process",
        attrs: [
            { key: "id", mapping: "workflow.id" },
            { key: "name", mapping: "workflow.name" },
            { key: "isExecutable", mapping: "workflow.isExecutable" },
        ],
        genXml(context) {
            let tagName = 'process';
            //获取属性配置内容
            let attrStr = compile.$attr(this.attrs, context);
            let childs = [...context.nodes, ...context.edges]
            //获取子标签 内容
            let childXmls = childs.map(child => {
                return Tags[child.compType].genXml(child)
            });
            //构建标签并返回
            return `<${tagName} ${attrStr} > ${childXmls.join('')}</${tagName}>`
        },
        //将xml节点数据转换为元数据    json是xml节点json对象
        node2Meta(json, uidata, mdata) {
            compile.attrs2Meta(this.attrs, mdata, json);
            let nodes = json.children || []
            nodes.map(item => {
                let tagName = item.name.split(':').pop();
                if (tagName.indexOf('Task') > 0) {
                    tagName = 'task'
                } else if (tagName.indexOf('Gateway') > 0) {
                    tagName = 'gateway'
                }
                if (Tags[tagName]) {
                    let meta = Tags[tagName].node2Meta(item, uidata[item.attributes.id]);
                    mdata[meta.d ? 'edges' : 'nodes'].push(meta)
                }
            })
        }
    },
    startEvent: {
        attrs: [
            { key: "id", mapping: "id" },
            { key: "name", mapping: "label" }

        ],
        genXml(context) {
            let tagName = 'startEvent';
            //获取属性配置内容
            let attrStr = compile.$attr(this.attrs, context);
            //构建标签并返回
            return `<${tagName} ${attrStr} > </${tagName}>`
        },
        node2Meta(json, uidata) {
            let uiAttr = uidata.children[0].attributes
            let meta = {
                selected: false,
                label: json.attributes.name,
                compType: 'startEvent',
                icon: "start",
                workflow: {}
            }
            compile.attrs2Meta(this.attrs, meta, json);
            setNodePos(meta, uiAttr);
            setLinkNode(meta);
            return meta;
        }
    },
    endEvent: {
        attrs: [
            { key: "id", mapping: "id" },
            { key: "name", mapping: "label" },
        ],
        genXml(context) {
            let tagName = 'endEvent';
            //获取属性配置内容
            let attrStr = compile.$attr(this.attrs, context);
            //构建标签并返回
            return `<${tagName} ${attrStr} > </${tagName}>`
        },
        node2Meta(json, uidata) {
            let uiAttr = uidata.children[0].attributes
            let meta = {
                selected: false,
                label: json.attributes.name,
                compType: 'endEvent',
                icon: "end",
                workflow: {}
            }
            compile.attrs2Meta(this.attrs, meta, json);
            setNodePos(meta, uiAttr);
            setLinkNode(meta);
            return meta;
        }
    },
    sequenceFlow: {
        attrs: [
            { key: "id", mapping: "id" },
            { key: "name", mapping: "label" },
            { key: "sourceRef", mapping: "source" },
            { key: "targetRef", mapping: "target" },
            { key: "readonly", mapping: "statusReadonly" },
            { key: "disabled", mapping: "statusDisabled" }
        ],
        genXml(context) {
            let tagName = 'sequenceFlow';
            //获取属性配置内容
            let attrStr = compile.$attr(this.attrs, context);
            //检查是否含有条件
            let condition = context.workflow.condition;
            let condXml = ''
            if (condition) {
                condition = '${' + condition + '}';
                condXml = `<conditionExpression xsi:type="tFormalExpression"> ${compile.entityUpload(condition)}</conditionExpression>`
            }
            //构建标签并返回
            return `<${tagName} ${attrStr} > ${condXml}</${tagName}>`
        },
        node2Meta(json, uidata) {
            let points = uidata.children.map(p => {
                return [p.attributes.x, p.attributes.y].join(",")
            })
            let path = 'M ' + points.join(" L ");
            let condition = ""
            if (json.children) {
                let conds = json.children.filter(item => item.name == 'conditionExpression');
                if (conds.length) {
                    condition = conds[0].content.trim();
                    condition = condition.substr(2, condition.length - 3)
                }
            }
            let meta = {
                selected: false,
                label: json.attributes.name,
                compType: 'sequenceFlow',
                d: path,
                workflow: {
                    hasCondition: !!condition,
                    condition: compile.entityLocal(condition)
                }
            }
            compile.attrs2Meta(this.attrs, meta, json);
            return meta
        }
    },
    task: {
        attrs: [
            { key: "id", mapping: "id" },
            { key: "name", mapping: "label" },
            { key: "activiti:unRevoke", mapping: "workflow.unRevoke" },
            { key: "activiti:canInvalid", mapping: "workflow.canInvalid" },
            { key: "activiti:canPushes", mapping: "workflow.canPushes" },
            { key: "activiti:canDelegate", mapping: "workflow.canDelegate" },
            { key: "activiti:canEmail", mapping: "workflow.canEmail" },
            { key: "activiti:canMessage", mapping: "workflow.canMessage" },
            { key: "activiti:subProcess", mapping: "workflow.subProcess" },
            { key: "activiti:subFieldMaping", mapping: "workflow.subFieldMaping" },
            { key: "activiti:isStartTask", mapping: "workflow.isStartTask" },
            { key: "activiti:icon", mapping: "workflow.icon" }
        ],
        genXml(context) {
            let tagName = 'userTask';
            //获取属性配置内容
            let attrStr = compile.$attr(this.attrs, context);
            //检查是处理人
            let approvals = context.workflow.approval || [];
            let users = approvals.filter(a => a.type == 'user');
            let groups = approvals.filter(a => a.type == 'group');
            let roles = approvals.filter(a => a.type == 'role');
            let userValue = users.map((a) => a.value).join(',');
            let groupValue = groups.map((a) => a.value).join(',');
            // let groupValue = groups.map((a) => a.value);
            let roleValue = roles.map((a) => a.value).join(',');
            let mergegroups = []
            groupValue && mergegroups.push(`Group(${groupValue})`)
            roleValue && mergegroups.push(`Role(${roleValue})`)
            let userStr = userValue ? `activiti:candidateUsers="${userValue}"` : ''
            let groupStr = mergegroups.length ? ` activiti:candidateGroups="${mergegroups.join(",")}"` : ''
            //用户组审批比例
            let groupRate = groups[0] ? groups[0].rate : ''
            let rateStr = groupRate ? ` activiti:approvalRate="${groupRate}"` : ''
            //根据属性配置,创建内容
            let contents = [], { canEmail, emailEvent } = context.workflow;
            // if (canEmail && emailEvent) {
            //     contents.push(`<extensionElements> <activiti:taskListener event="${emailEvent}" class="com.purcotton.workflow.event.SendMailHandler" /></extensionElements>`)
            // }
            //构建标签并返回
            return `<${tagName} ${attrStr} ${userStr} ${groupStr} ${rateStr} > ${contents.join("")}</${tagName}>`
        },
        node2Meta(json, uidata) {
            let uiAttr = uidata.children[0].attributes
            let meta = {
                selected: false,
                label: json.attributes.name,
                compType: 'task',
                icon: json.attributes['activiti:icon'] ? json.attributes['activiti:icon'] : 'task',
                workflow: {}
            }
            let approvals = [];
            let users = json.attributes['activiti:candidateUsers'];
            let merges = json.attributes['activiti:candidateGroups']
            let rate = json.attributes['activiti:approvalRate']
            if (users) {
                approvals.push({ type: "user", value: users.split(",") })
            }
            if (merges) {
                let groups = merges.match(/Group\((.+?)\)/)
                if (groups && groups[1])
                    approvals.push({ type: "group", value: groups[1].split(","), rate: rate*1 })
                    // approvals.push({ type: "group", value: groups[1] })
                let roles = merges.match(/Role\((.+?)\)/)
                if (roles && roles[1])
                    approvals.push({ type: "role", value: roles[1].split(",") })
            }
            if (json.children) {
                let childs = json.children.filter(item => item.name == 'extensionElements');
                if (childs.length) {
                    meta.workflow.canEmail = true;
                    meta.workflow.emailEvent = childs[0].children[0].attributes.event
                }
            }
            meta.workflow.showSubflow = !(json.attributes['activiti:isStartTask'] === 'true')
            meta.workflow.showApproval = !(json.attributes['activiti:isStartTask'] === 'true')
            meta.workflow.approval = approvals && approvals.length > 0 ? approvals : [{ type: "user", value: "" }];
            compile.attrs2Meta(this.attrs, meta, json);
            setNodePos(meta, uiAttr);
            setLinkNode(meta);
            return meta;
        }
    },

    gateway: {
        attrs: [
            { key: "id", mapping: "id" },
            { key: "name", mapping: "label" }
        ],
        genXml(context) {
            let tagName = context.workflow.isParallel ? 'parallelGateway' : 'exclusiveGateway';
            //获取属性配置内容
            let attrStr = compile.$attr(this.attrs, context);
            //构建标签并返回
            return `<${tagName} ${attrStr} > </${tagName}>`
        },
        node2Meta(json, uidata) {
            let uiAttr = uidata.children[0].attributes
            let meta = {
                selected: false,
                label: json.attributes.name,
                compType: 'gateway',
                icon: "gateway",
                workflow: {
                    isParallel: json.name.indexOf('parallel') > -1 ? true : false
                }
            }
            compile.attrs2Meta(this.attrs, meta, json);
            setNodePos(meta, uiAttr);
            setLinkNode(meta);
            return meta;
        }
    },
    /****************************************************** */
    BPMNDiagram: {
        genXml(context) {
            let tagName = 'bpmndi:BPMNDiagram'
            let BPMNPlane = Tags.BPMNPlane.genXml(context);
            //构建标签并返回
            return `<${tagName} id="BPMNDiagram_1" >${BPMNPlane}</${tagName}>`
        }
    },
    BPMNPlane: {
        attrs: [
            { key: "id", value: "BPMNPlane_1" },
            { key: "bpmnElement", mapping: "workflow.id" }
        ],
        genXml(context) {
            let tagName = 'bpmndi:BPMNPlane'
            let attrStr = compile.$attr(this.attrs, context);
            let shapesXml = context.nodes.map(node => {
                return Tags.BPMNShape.genXml(node)
            }).join("");
            let edgesXml = context.edges.map(edg => {
                return Tags.BPMNEdge.genXml(edg)
            }).join("");
            //构建标签并返回
            return `<${tagName} ${attrStr} >${shapesXml}${edgesXml}</${tagName}>`
        }
    },

    BPMNShape: {
        attrs: [
            { key: "id", mapping: "id", valueFmt(val) { return val + "_di" } },
            { key: "bpmnElement", mapping: "id" }
        ],
        genXml(context) {
            let tagName = 'bpmndi:BPMNShape'
            let attrStr = compile.$attr(this.attrs, context);
            let bounds = `<dc:Bounds x="${context.x}" y="${context.y}" width="${context.w}" height="${context.h}" />`
            //构建标签并返回
            return `<${tagName} ${attrStr} >${bounds}</${tagName}>`
        }
    },

    BPMNEdge: {
        attrs: [
            { key: "id", mapping: "id", valueFmt(val) { return val + "_di" } },
            { key: "bpmnElement", mapping: "id" }
        ],
        genXml(context) {
            let tagName = 'bpmndi:BPMNEdge'
            let attrStr = compile.$attr(this.attrs, context);
            let points = context.d.split(" ").filter(item => item.includes(',')).map(point => point.split(","));
            let waypointXml = points.map(([x, y]) => `<di:waypoint x="${x}" y="${y}" />`).join("");
            //构建标签并返回
            return `<${tagName} ${attrStr} >${waypointXml}</${tagName}>`
        }
    }
};
compile.install();
export default compile;
export { Tags }