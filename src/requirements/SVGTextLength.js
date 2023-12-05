/**
 * SVGTextLength.js：SVG文本长度计算类
 */
const config = {
    svg: null,
}
function SVGTextLength(fontSize, fontFamily) {
    const ruler = _getRuler();
    const outer = this;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;

    // 计算文本的显示宽度
    this.visualWidth = function(
        text, // 原始文本
        fontSize, // 字体大小
        fontFamily, // 字体
    ) {
        _setRuler(text, fontSize, fontFamily);
        return ruler.getBoundingClientRect().width;
    }

    // 计算文本的显示高度
    this.visualHeight = function(
        text, // 原始文本
        fontSize, // 字体大小
        fontFamily, // 字体
    ) {
        _setRuler(text, fontSize, fontFamily);
        return ruler.getBoundingClientRect().height;
    }

    // 将文本截断为指定宽度
    this.truncate = function (
        text, // 原始文本
        width, // 截断宽度
        ellipsis, // 后缀省略符（默认为“...”）
        fontSize, // 字体大小
        fontFamily, // 字体
    ) {
        const textWidth = this.visualWidth(text, fontSize, fontFamily);
        if (textWidth <= width) {
        return text;
        }
        ellipsis = ellipsis || '...';
        const ellipsisWidth = this.visualWidth(ellipsis, fontSize, fontFamily);
        const len = _truncate_index(text, width - ellipsisWidth, fontSize, fontFamily);
        if (len === 0) {
        return ellipsisWidth <= width ? ellipsis : '';
        }
        return text.slice(0, len) + ellipsis;
    }

    // 多行文本换行，只支持break word换行
    this.wrap = function(
        text, // 原始文本
        width, // 截断宽度
        maxLines, // 最大行数，如果为Infinity则不限制行数
        ellipsis, // 后缀省略符（默认为“...”）
        fontSize, // 字体大小
        fontFamily, // 字体
    ) {
        ellipsis = ellipsis || '...';
        const ellipsisWidth = this.visualWidth(ellipsis, fontSize, fontFamily);
        
        let p = 0;
        const lines = [];
        while (p < text.length) {
        const textleft = text.slice(p);
        if (lines.length === maxLines - 1) {
            const subtext = this.truncate(textleft, width, ellipsis, fontSize, fontFamily);
            lines.push(subtext);
            break;
        }
        else {
            let len = _truncate_index(textleft, width, fontSize, fontFamily);
            if (len === 0) {
            if (ellipsisWidth <= width) {
                lines.push(ellipsis);
            }
            break;
            }
            lines.push(textleft.slice(0, len));
            p += len;
        }
        }
        return lines;
    }

    // 将文本转换为svg格式
    this.lines2svg = function(
        lines, // 原始文本
        lineHeight, // 行高
    ) {
        lineHeight = lineHeight || this.fontSize * 1.2;
        return lines.map((line, i) => {
        return "<tspan x='0' dy='" + lineHeight * Math.min(i, 1) + "'>" + line + "</tspan>";
        }).join('');
    }

    /* 下面是内部私有函数 */

    function _getRuler() {
        const svg = config.svg || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', 0);
        svg.setAttribute('height', 0);
        svg.style.float = 'left';
        const ruler = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        svg.appendChild(ruler);
        if (config.svg === null) {
        document.body.insertBefore(svg, document.body.firstChild);
        config.svg = svg;
        }
        return ruler;
    }
    function _setRuler(text, fontSize, fontFamily) {
        fontSize = fontSize || outer.fontSize;
        fontFamily = fontFamily || outer.fontFamily;
        ruler.style.fontSize = fontSize;
        ruler.style.fontFamily = fontFamily;
        ruler.innerHTML = text;
    }
    function _truncate_index(text, width, fontSize, fontFamily) { // 返回截断文本的长度
        if (width <= 0) return 0;
        _setRuler(text, fontSize, fontFamily);
        let textWidth = ruler.getBoundingClientRect().width;

        // 边界条件判断
        if (textWidth <= width) {
        return text.length;
        }
        else if (ruler.getEndPositionOfChar(0).x > width) {
        return 0;
        }
        // 二分查找确定长度（此时保证了长度一定不小于1，且达不到最大长度）
        let start = 0;
        let end = text.length - 1;
        while (start < end) {
        const mid = Math.ceil((start + end) / 2);
        const newTextWidth = ruler.getEndPositionOfChar(mid).x;
        if (newTextWidth <= width) {
            start = mid;
        }
        else {
            end = mid - 1;
        }
        }
        return start + 1;
    }
}
export default SVGTextLength;