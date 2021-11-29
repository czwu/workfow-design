import { Message } from 'element-ui'

function commonMessage(msg, timeout, closable, type) {
  Message({
    showClose: closable,
    message: msg,
    type: type,
    duration: timeout * 1000,
  })
}
class MessageClass {
  success(msg, timeout = 1.5, closable = true) {
    commonMessage(msg, timeout, closable, "success")
  };
  error(msg, timeout = 1.5, closable = true) {
    commonMessage(msg, timeout, closable, "error")
  };
  info(msg, timeout = 1.5, closable = true) {
    commonMessage(msg, timeout, closable, "info")
  };
}
const message = new MessageClass()
export default {
  install(Vue) {
    Vue.prototype.$msg = message
  }
}
export {
  message
}