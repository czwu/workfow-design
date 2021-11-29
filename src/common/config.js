import service from './service'
const comps = [
    {
        type: 'startEvent',
        label: '开始',
        icon: 'start',
        w: 32,
        h: 32
    },
    {
        type: 'task',
        label: '起草',
        icon: 'task1',
        w: 120,
        h: 64,
        workflow: {
            showSubflow: false,
            showApproval: false,
            approval: null,
            unRevoke: true,
            canInvalid: true,
            canPushes: true,
            canDelegate: true,
            canEmail: true,
            canMessage: true,
            isStartTask: true,
            icon: 'task1'
        }
    },
    {
        type: 'task',
        label: '任务',
        icon: 'task',
        w: 120,
        h: 64,
        workflow: {
            showSubflow: true,
            showApproval: true,
            approval: null,
            unRevoke: true,
            canInvalid: true,
            canPushes: true,
            canDelegate: true,
            canEmail: true,
            canMessage: true,
            subProcess: '',
            subFieldMaping: '',
            icon: 'task'
        }
    },
    {
        type: 'endEvent',
        label: '结束',
        icon: 'end',
        w: 32,
        h: 32
    },

    {
        type: 'gateway',
        label: '网关',
        icon: 'gateway',
        w: 64,
        h: 64
    }
]

const properties = {
    workflow: [

    ],

    startEvent: [],

    task: [
        // {
        //     label: "触发事件", mapping: "workflow.emailEvent", type: "select", value: "", options: [
        //         { value: "create", label: "任务创建" },
        //         { value: "assignment", label: "任务分配" },
        //         { value: "complete", label: "任务完成" },
        //     ],
        //     vif: "workflow.canEmail"
        // },
        // { label: "处理人配置", type: "divider", vif: 'workflow.showApproval' },
        // {
        //     addLabel: "添加", mapping: "workflow.approval", type: "$List", supportAddRow: false, supportDelRow: false, vif: 'workflow.showApproval',
        //     value: [{ type: "user", value: "" }],
        //     columns: [
        //         {
        //             field: 'type', type: "select", value: "user", style: 'width:90px',
        //             options: [{ value: "user", label: "用户" }, { value: "group", label: "用户组" }],
        //             onChange(val, data, field) {
        //                 data.value = '';
        //             }
        //         },
        //         {
        //             field: 'value', type: "input", value: "", multiple: true, placeholder: "", options: [], dynamic(data) {
        //                 return { field: 'value', type: data.type === "user" ? "selectUser" : "select", value: "", options: data.type || [], multiple: true, multipleLimit: data.type === "user" ? 0 : 1 }
        //             }
        //         }
        //     ],
        //     addHandler() {
        //         return { type: "", value: "" }
        //     }
        // },

        // { label: "参数", type: "divider" },
        // {
        //     addLabel: "添加参数", mapping: "workflow.params", type: "$List", supportAddRow: true, supportDelRow: true, value: [], columns: [
        //         { field: 'field', type: "input", value: "", placeholder: "参数名" },
        //         { field: 'value', type: "input", value: "", placeholder: "参数值" }
        //     ],
        //     addHandler() {
        //         return { field: "", value: "" }
        //     }
        // }
    ],
    gateway: [ ],
    sequenceFlow: [],
    endEvent: [],
}


export {
    comps,
    properties
}