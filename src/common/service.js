import http from '../utils/http'

/*
    // 批量查询用户简单信息
    list = [
        {
            account: 'admin'
        }
    ]
*/
const cacheSimpleInfoArray = []
const batchUsers = function (list) {
    let hasInfoArray = []
    const tempList = []
    list.forEach(item => {
        const itemArray = cacheSimpleInfoArray.filter(user => user.account === item.account)
        if (itemArray.length > 0) {
            hasInfoArray = hasInfoArray.concat(itemArray)
        } else {
            tempList.push(item)
        }
    })
    if (tempList.length === 0) {
        return Promise.resolve({
            code: 200,
            data: [...hasInfoArray]
        })
    } else {
        return http.post('/api/user/info/query/batch/simple_info', { list: tempList }).then(res => {
            if (res.code === 200) {
                if (res.data && res.data.length > 0) {
                    res.data.forEach(item => {
                        if (cacheSimpleInfoArray.every(user => user.account !== item.account)) {
                            cacheSimpleInfoArray.push({ ...item })
                        }
                    })
                }
                return {
                    code: 200,
                    data: res.data ? res.data.concat(hasInfoArray) : [...hasInfoArray]
                }
            } else {
                return res
            }
        })
    }
}

export default {

    // 保存
    save(content) {
        return http.post('/api/workflow/model/savexml', content)
    },

    // 发布
    deploy(modelId, processName) {
        return http.get('/api/workflow/process/definition/process/definition/model/deploy', { modelId, processName })
    },

    // mdc工作流模板修改(只传模板id，为更新模板修改记录)
    mdcTemplateUpdate(id) {
        return http.post('/api/mdc/workflow/template/update', { id })
    },

    queryById(modelId) {
        return http.get('/api/workflow/model/querymodelbymodelid', { modelId })
    },

    // 通过流程id例如：process_244twt1n查询流程模板
    querymodelbykey(modelKey) {
        return http.get('/api/workflow/model/querymodelbykey', { modelKey })
    },

    // 进度跟踪
    queryByInstanceId(instanceId) {
        return http.get('/api/workflow/activiti/history/high/line', { instanceId })
    },

    queryRoles() {
        return http.post('/api/workflow/role/page', { pageNum: 1, pageSize: 100 })
    },

    // 分页查询用户
    queryUsers(option) {
        return http.post('/api/user/info/get/list', option)
    },

    // 批量查询用户简单信息
    batchUsers,

    queryUserGroups() {
        return http.post('/api/workflow/user/group/select/page', { pageNum: 1, pageSize: 100 })
    },

    // 查询流程模板
    getFlowTemplateList(option) {
        return http.post('/api/workflow/model/queryallmodel', option)
    },

    // 查询mdc流程模板
    getMdcFlowTemplateList(option) {
        return http.post('/api/mdc/workflow/template/page', option)
    },

    // 工作流子流程属性查询
    getSubFieldMapping(option) {
        return http.post('/api/mdc/workflow/form/config/sub/field/mapping', option)
    },

    // MDC根据processKey查询流程详情
    getTemplateByProcessKey(option) {
        return http.post('/api/mdc/workflow/template/detail/by/process/key', option)
    },

    getSubInfo(params) {
        return http.post('/api/mdc/workflow/info/sub/info', params)
    }


}