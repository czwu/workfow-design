/**
 * 横坐标最小连线误差直线拟合
 * @argument {String} startX 起始点XAxis
 * @argument {String} endY 终点YAxis
 */
export function getFittedEndX (startX, endX) {
  const minX = Math.abs(startX - endX)
  const rangeNum = 3
  if (minX < rangeNum) {
    endX = startX
  }
  return endX
}

/**
 * 纵坐标最小连线误差直线拟合
 * @argument {String} startY
 * @argument {String} endY
 */
export function getFittedEndY (startY, endY) {
  const minY = Math.abs(startY - endY)
  const rangeNum = 3
  if (minY < rangeNum) {
    endY = startY
  }
  return endY
}

/**
 * 获取顺向异端相连时中间横坐标路径
 * @argument {String} startX 起始点XAxis
 * @argument {String} startY 起始点YAxis
 * @argument {String} endX 终点XAxis
 * @argument {String} endY 终点YAxis
 */
export function getMidXPath (
  startX,
  startY,
  endX,
  endY
) {
  const midX1 = (startX + endX) / 2
  const midY1 = startY
  const midX2 = midX1
  const midY2 = endY
  return {
    midX1,
    midY1,
    midX2,
    midY2
  }
}

/**
 * 获取顺向异端相连时中间纵坐标路径
 * @argument {String} startX 起始点XAxis
 * @argument {String} startY 起始点YAxis
 * @argument {String} endX 终点XAxis
 * @argument {String} endY 终点YAxis
 */
export function getMidYPath (
  startX,
  startY,
  endX,
  endY
) {
  const midX1 = startX
  const midY1 = (startY + endY) / 2
  const midX2 = endX
  const midY2 = midY1
  return {
    midX1,
    midY1,
    midX2,
    midY2
  }
}

/**
 * 获取上端连上端时中间路径坐标
 * @argument {String} startX 起始点XAxis
 * @argument {String} startY 起始点YAxis
 * @argument {String} endX 终点XAxis
 * @argument {String} endY 终点YAxis
 * @argument {String} startH 起始节点的高
 * @argument {String} endH 终点节点的高
 */
function getTTMidPath (
  startX,
  startY,
  endX,
  endY,
  startH,
  endH
) {
  let dY = Math.abs(startY - endY) * 2
  if (dY === 0 || dY < (startH + endH)) {
    dY = 44
  }
  if (dY > (startH + endH)) {
    dY = 44
  }
  const minY = startY > endY ? endY : startY
  const midY = minY - dY
  const midX1 = startX
  const midX2 = endX
  return {
    midY,
    midX1,
    midX2
  }
}

/**
 * 获取上端连上端时中间路径坐标
 * @argument {String} startX 起始点XAxis
 * @argument {String} startY 起始点YAxis
 * @argument {String} endX 终点XAxis
 * @argument {String} endY 终点YAxis
 * @argument {String} startH 起始节点的高
 * @argument {String} endH 终点节点的高
 */
function getBBMidPath (
  startX,
  startY,
  endX,
  endY,
  startH,
  endH
) {
  let dY = Math.abs(startY - endY) * 2
  if (dY === 0 || dY < (startH + endH)) {
    dY = 44
  }
  if (dY > (startH + endH)) {
    dY = 44
  }
  const maxY = startY > endY ? startY : endY
  const midY = maxY + dY
  const midX1 = startX
  const midX2 = endX
  return {
    midY,
    midX1,
    midX2
  }
}

/**
 * 获取左端连左端时中间路径坐标
 * @argument {String} startX 起始点XAxis
 * @argument {String} startY 起始点YAxis
 * @argument {String} endX 终点XAxis
 * @argument {String} endY 终点YAxis
 * @argument {String} startW 起始节点的宽
 * @argument {String} endW 终点节点的宽
 */
function getLLMidPath (
  startX,
  startY,
  endX,
  endY,
  startW,
  endW
) {
  let dX = Math.abs(startX - endX) * 2
  if (dX === 0 || dX < (startW + endW)) {
    dX = 88
  }
  if (dX > (startW + endW)) {
    dX = 88
  }
  const minX = startX > endX ? endX : startX
  const midX = minX - dX
  const midY1 = startY
  const midY2 = endY
  return {
    midX,
    midY1,
    midY2
  }
}

/**
 * 获取右端连右端时中间路径坐标
 * @argument {String} startX 起始点XAxis
 * @argument {String} startY 起始点YAxis
 * @argument {String} endX 终点XAxis
 * @argument {String} endY 终点YAxis
 * @argument {String} startW 起始节点的宽
 * @argument {String} endW 终点节点的宽
 */
function getRRMidPath (
  startX,
  startY,
  endX,
  endY,
  startW,
  endW
) {
  let dX = Math.abs(startX - endX) * 2
  if (dX === 0 || dX < (startW + endW)) {
    dX = 88
  }
  if (dX > (startW + endW)) {
    dX = 88
  }
  const maxX = startX > endX ? startX : endX
  const midX = maxX + dX
  const midY1 = startY
  const midY2 = endY
  return {
    midX,
    midY1,
    midY2
  }
}

/**
 * 同侧端点连接： T-T || B-B
 */
export function handleTheColSameLinkDot (linkData) {
  const { dotLink, dotEndLink, startX, startY, endX, endY, startH, endH } = linkData
  let pathData = {}
  if (dotLink === 'top' && dotEndLink === 'top') {
    pathData = getTTMidPath(startX, startY, endX, endY, startH, endH)
  } else if (dotLink === 'bottom' && dotEndLink === 'bottom') {
    pathData = getBBMidPath(startX, startY, endX, endY, startH, endH)
  }
  if (Object.keys(pathData).length > 0) {
    const { midY, midX1, midX2 } = pathData
    return `M ${startX},${startY} L ${midX1},${midY} L ${midX2},${midY} L ${endX},${endY}`
  }
  return ''
}

/**
 * 同侧端点连接： L-L || R-R
 */
export function handleTheSameLinkDot (linkData) {
  const { dotLink, dotEndLink, startX, startY, endX, endY, startW, endW } = linkData
  let pathData = {}
  if (dotLink === 'left' && dotEndLink === 'left') {
    pathData = getLLMidPath(startX, startY, endX, endY, startW, endW)
  } else if (dotLink === 'right' && dotEndLink === 'right') {
    pathData = getRRMidPath(startX, startY, endX, endY, startW, endW)
  }
  if (Object.keys(pathData).length > 0) {
    const { midX, midY1, midY2 } = pathData
    return `M ${startX},${startY} L ${midX},${midY1} L ${midX},${midY2} L ${endX},${endY}`
  }
  return ''
}

/**
 * 连接端点为纵向不同侧且节点之间处于同一水平线的
 * @argument linkData - 连线数据
 */
export function handleNotSameLinkDotAndAlongStraightLine (linkData) {
  const { dotLink, dotEndLink, startX, startY, endX, endY, startW, startH, endW, endH } = linkData
  if (dotLink === 'bottom' && dotEndLink === 'top') {
    if (endY < startY) {
      if (startX + startW < endX) {
        const newStartX = startX + startW / 2
        const newStartY = startY - startH / 2
        const newEndX = endX - endW / 2
        let newEndY = endY + endH / 2

        // 纵坐标最小连线误差直线拟合
        newEndY = getFittedEndY(newStartY, newEndY)

        const { midX1, midY1, midX2, midY2 } = getMidXPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      } else if (startX - startW > endX) {
        const newStartX = startX - startW / 2
        const newStartY = startY - startH / 2
        const newEndX = endX + endW / 2
        let newEndY = endY + endH / 2

        // 纵坐标最小连线误差直线拟合
        newEndY = getFittedEndY(newStartY, newEndY)

        const { midX1, midY1, midX2, midY2 } = getMidXPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      } else {
        const newStartX = startX
        const newStartY = startY - startW
        let newEndX = endX
        const newEndY = endY + endH

        // 横坐标最小连线误差直线拟合
        newEndX = getFittedEndX(newStartX, newEndX)

        const { midX1, midY1, midX2, midY2 } = getMidYPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      }
    }
  } else if (dotLink === 'top' && dotEndLink === 'bottom') {
    if (startY < endY) {
      if (startX + startW < endX) {
        const newStartX = startX + startW / 2
        const newStartY = startY + startH / 2
        const newEndX = endX - endW / 2
        let newEndY = endY - endH / 2

        // 纵坐标最小连线误差直线拟合
        newEndY = getFittedEndY(newStartY, newEndY)

        const { midX1, midY1, midX2, midY2 } = getMidXPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      } else if (startX - startW > endX) {
        const newStartX = startX - startW / 2
        const newStartY = startY + startH / 2
        const newEndX = endX + endW / 2
        let newEndY = endY - endH / 2

        // 纵坐标最小连线误差直线拟合
        newEndY = getFittedEndY(newStartY, newEndY)

        const { midX1, midY1, midX2, midY2 } = getMidXPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      } else {
        const newStartX = startX
        const newStartY = startY + startW
        let newEndX = endX
        const newEndY = endY - endH

        // 横坐标最小连线误差直线拟合
        newEndX = getFittedEndX(newStartX, newEndX)

        const { midX1, midY1, midX2, midY2 } = getMidYPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      }
    }
  }
  return ''
}

/**
 * 连接端点不同侧且节点之间处于同一纵向水平线的
 * @argument linkData - 连线数据
 */
export function handelNotSameLinkDotAndAlongColStraightLine (linkData) {
  const { dotLink, dotEndLink, startX, startY, endX, endY, startW, startH, endW, endH } = linkData
  if (dotLink === 'left' && dotEndLink === 'right') {
    if (startX < endX) {
      if (startX + (startW + endW) < endX) {
        // 起始端口距离终止端口两倍距离时连线(非顺向)
        const newStartX = startX + startW
        const newStartY = startY
        const newEndX = endX - endW
        let newEndY = endY

        // 纵坐标最小连线误差直线拟合
        newEndY = getFittedEndY(newStartY, newEndY)

        const { midX1, midY1, midX2, midY2 } = getMidXPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      } else if (startX + (startW + endW) >= endX) {
        // 两者正对(包括偏差)时连线
        const newStartX = startX + startW / 2
        let newStartY = startY + startH / 2
        let newEndX = endX - endW / 2
        let newEndY = endY - endH / 2

        if (startY > endY) {
          // 起始端口位于终止端口下方时
          newStartY = startY - startH / 2
          newEndY = endY + endH / 2
        }

        // 横坐标最小连线误差直线拟合
        newEndX = getFittedEndX(newStartX, newEndX)

        const { midX1, midY1, midX2, midY2 } = getMidYPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      }
    }
  } else if (dotLink === 'right' && dotEndLink === 'left') {
    if (startX > endX) {
      if (endX + (startW + endW) < startX) {
        // 起始端口距离终止端口两倍距离时连线(非顺向)
        const newStartX = startX - startW
        const newStartY = startY
        const newEndX = endX + endW
        let newEndY = endY

        // 纵坐标最小连线误差直线拟合
        newEndY = getFittedEndY(newStartY, newEndY)

        const { midX1, midY1, midX2, midY2 } = getMidXPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        // console.log('有问题')
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      } else if (endX + (startW + endW) >= startX) {
        // 两者正对(包括偏差)时连线
        const newStartX = startX - startW / 2
        let newStartY = startY + startH / 2
        let newEndX = endX + endW / 2
        let newEndY = endY - endH / 2

        if (startY > endY) {
          // 起始端口位于终止端口下方时
          newStartY = startY - startH / 2
          newEndY = endY + endH / 2
        }

        // 横坐标最小连线误差直线拟合
        newEndX = getFittedEndX(newStartX, newEndX)

        const { midX1, midY1, midX2, midY2 } = getMidYPath(
          newStartX,
          newStartY,
          newEndX,
          newEndY
        )
        // console.log('有问题101010')
        return `M ${newStartX},${newStartY} L ${midX1},${midY1} L ${midX2},${midY2} L ${newEndX},${newEndY}`
      }
    }
  }
  return ''
}


/**
 * 连接点为水平方向与纵向时
 */
export function commonLine(linkData) {
  const { startX, startY, endX, endY } = linkData
  return `M ${startX},${startY} L ${endX},${endY}`
}


/**
 * 连接点仅为上或下
 */
export function linkDotIsTopOrBottom(linkData) {
  let { startX, startY, endX, endY } = linkData;
  // 连接纵向端点同侧
  const sameLinkDotResult = handleTheColSameLinkDot(linkData);

  if (sameLinkDotResult !== "") {
    return sameLinkDotResult;
  }

  // 连接端点为纵向不同侧且节点之间处于同一水平线的
  const NotSameLinkDotAndASLResult = handleNotSameLinkDotAndAlongStraightLine(
    linkData
  );

  if (NotSameLinkDotAndASLResult !== "") {
    return NotSameLinkDotAndASLResult;
  }

  // 横坐标最小连线误差直线拟合
  endX = getFittedEndX(startX, endX);

  // 连接端点不同侧且为纵向水平线连接（最常见的连接情况）
  const { midX1, midY1, midX2, midY2 } = getMidYPath(
    startX,
    startY,
    endX,
    endY
  );
  return `M ${startX},${startY} L ${midX1},${midY1} L ${midX2},${midY2} L ${endX},${endY}`;
}


/**
 * 连接点仅为左或右
 */
export function linkDotIsLeftOrRight(linkData, edge, sourceNodeY) {
  let { startX, startY, endX, endY } = linkData;
  // 连接端点同侧
  const sameLinkDotResult = handleTheSameLinkDot(linkData);

  if (sameLinkDotResult !== "") {
    return sameLinkDotResult;
  }

  // 连接端点不同侧且节点之间处于同一纵向水平线的
  const NotSameLinkDotAndACSLResult = handelNotSameLinkDotAndAlongColStraightLine(
    linkData
  );

  if (NotSameLinkDotAndACSLResult !== "") {
    return NotSameLinkDotAndACSLResult;
  }

  // 纵坐标最小连线误差直线拟合
  // const minY = Math.abs(startY - endY);
  // const rangeNum = 3;
  // if (minY < rangeNum) {
  //   endY = startY;
  //   this.nodes.forEach((i) => {
  //     if (i.id === edge.target) {
  //       i.y = sourceNodeY;
  //       console.log('00000000000')
  //       return i;
  //     }
  //   });
  // }
  // 连接端点不同侧且为水平线连接（最常见的连接情况）
  const { midX1, midY1, midX2, midY2 } = getMidXPath(
    startX,
    startY,
    endX,
    endY
  );

  return `M ${startX},${startY} L ${midX1},${midY1} L ${midX2},${midY2} L ${endX},${endY}`;
}



/**
     * 连线数据
     * @argument {EdgeClass} edge - 路径元数据
     */
export function edgeData(edge, nodes) {
  if (edge && edge.source && edge.target) {
    const { linkNode: sourceLinkNode, y: sourceNodeY, w: startW, h: startH } = nodes.find(
      (node) => node.id === edge.source
    );
    const { linkNode: targetLinkNode, w: endW, h: endH } = nodes.find(
      (node) => node.id === edge.target
    );
    const { dotLink, dotEndLink } = edge;

    const startX = sourceLinkNode[dotLink].x;
    const startY = sourceLinkNode[dotLink].y;
    const endX = targetLinkNode[dotEndLink].x;
    const endY = targetLinkNode[dotEndLink].y;

    const linkData = {
      dotLink,
      dotEndLink,
      startX,
      startY,
      endX,
      endY,
      startW,
      startH,
      endW,
      endH
    };

    let d = ""

    // 连接端点同侧
    d = handleTheSameLinkDot(linkData);

    if (d !== "") {
      return handleDecimal(d);
    }

    // link dot is left or right.
    if (
      dotLink !== "top" &&
      dotLink !== "bottom" &&
      dotEndLink !== "top" &&
      dotEndLink !== "bottom"
    ) {
      d = linkDotIsLeftOrRight(linkData, edge, sourceNodeY);
      return handleDecimal(d)
    }

    // link dot is top or bottom.
    if (
      dotLink !== "left" &&
      dotLink !== "right" &&
      dotEndLink !== "left" &&
      dotEndLink !== "right"
    ) {
      d = linkDotIsTopOrBottom(linkData);
      return handleDecimal(d)
    }

    d = commonLine(linkData)
    return handleDecimal(d)
  } else {
    return false;
  }
}


// 处理线条中可合并的点，格式 d = `M 368,104 L 729,104 L 729,104 L 1090,104`（只处理横线段或竖线段，不处理斜线，因为后期开发中线条不会有斜线）
export function handleLinePoint (d) {
  if (d) {
    const pointList = d.split(' ').filter(item => item.includes(',')).map(item => item.split(','))
    const uniqueList = []
    pointList.forEach((item, index) => {
      if (index === 0 || index === (pointList.length - 1)) {
        uniqueList.push(item)
      } else {
        if (
          // 竖线中的中间点
          (uniqueList[uniqueList.length - 1][0] === item[0] && pointList[index + 1][0] === item[0]) ||
          // 横线中的中间点
          (uniqueList[uniqueList.length - 1][1] === item[1] && pointList[index + 1][1] === item[1])
        ) {
          // console.log('此点可省略', item)
        } else {
          uniqueList.push(item)
        }
      }
    })
    return 'M ' + uniqueList.slice().map(item => `L ${item.join(',')}`).join(' ').substring(2)
  } else {
    return d
  }
}

// 返回的线条数据去掉小数点
export function handleDecimal(d) {
  const pointList = d.split(' ').filter(item => item.includes(',')).map(item => item.split(',')).map(item => [Math.floor(Number(item[0])), Math.floor(Number(item[1]))])
  return 'M ' + pointList.slice().map(item => `L ${item.join(',')}`).join(' ').substring(2)
}
