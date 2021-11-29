
export default {
    left(nodes) {
        let minX = Math.min(...nodes.map(node => node.x))
        nodes.forEach(node => {
            node.x = minX
        });
    },
    center(nodes) {
        let minX = Math.min(...nodes.map(node => node.x))
        let maxRight = Math.max(...nodes.map(node => node.x + node.w))
        let center = parseInt((minX + maxRight) / 2);
        nodes.forEach(node => {
            node.x = center - Math.floor(node.w / 2)
        });
    },
    right(nodes) {
        let maxRight = Math.max(...nodes.map(node => node.x + node.w))
        nodes.forEach(node => {
            node.x = maxRight - node.w
        });
    },
    top(nodes) {
        let minY = Math.min(...nodes.map(node => node.y))
        nodes.forEach(node => {
            node.y = minY
        });
    },
    middle(nodes) {
        let minY = Math.min(...nodes.map(node => node.y))
        let maxHeight = Math.max(...nodes.map(node => node.y + node.h))
        let center = parseInt((minY + maxHeight) / 2);
        nodes.forEach(node => {
            node.y = center - Math.floor(node.h / 2)
        });
    },
    bottom(nodes) {
        let maxHeight = Math.max(...nodes.map(node => node.y + node.h))
        nodes.forEach(node => {
            node.y = maxHeight - node.h
        });
    },
    //水平等间距
    hEquidistant(nodes) {
        if (nodes.length < 3)
            return
        let minX =1000, maxRight = 0
        let widthTotal = 0
        nodes.forEach(node => {
            minX = Math.min(minX, node.x)
            maxRight = Math.max(maxRight,node.x + node.w)
            widthTotal += node.w;
        });
       
        let array = [...nodes]
        array.sort((a, b) => {
            return a.x - b.x
        })
        //水平总距离
        let total = maxRight -  minX
        let space = Math.floor((total - widthTotal) / (nodes.length - 1))
        console.error(minX,maxRight,space)
        let preNode = null;
        array.forEach((node, i) => {
            if (i > 0) {
                node.x = preNode.x + preNode.w + space
            }
            preNode = node;
        })
    },
    //垂直等间距
    vEquidistant(nodes) {
        if (nodes.length < 3)
            return
        let minY =1000, maxBottom = 0
        let heightTotal = 0
        nodes.forEach(node => {
            minY = Math.min(minY, node.y)
            maxBottom = Math.max(maxBottom,node.y + node.h)
            heightTotal += node.h;
        });
       
        let array = [...nodes]
        array.sort((a, b) => {
            return a.y - b.y
        })
        //水平总距离
        let total = maxBottom -  minY
        let space = Math.floor((total - heightTotal) / (nodes.length - 1))
        console.error(minY,maxBottom,space)
        let preNode = null;
        array.forEach((node, i) => {
            if (i > 0) {
                node.y = preNode.y + preNode.h + space
            }
            preNode = node;
        })
    },

    updateLinkeNode(node){
        const midX = node.x + node.w / 2;
        const midY = node.y + node.h / 2;
        node.linkNode = {
          top: {
            x: Math.floor(midX),
            y: Math.floor(node.y),
          },
          bottom: {
            x: Math.floor(midX),
            y: Math.floor(node.y + node.h),
          },
          left: {
            x: Math.floor(node.x),
            y: Math.floor(midY),
          },
          right: {
            x: Math.floor(node.x + node.w),
            y: Math.floor(midY),
          },
        };
    }

}
