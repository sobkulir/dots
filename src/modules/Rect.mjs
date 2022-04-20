export class Rect {
    constructor(topLeftX, topLeftY, width, height) {
        this.topLeftX = topLeftX
        this.topLeftY = topLeftY
        this.width = width
        this.height = height
    }

    containsPoint(x, y) {
        return (this.topLeftX <= x && x < this.topLeftX + this.width
                && this.topLeftY <= y && y < this.topLeftY + this.height)
    }

    getRelativeOverlap(rectB) {
        const x = Math.max(rectB.topLeftX - this.topLeftX, 0)
        const y = Math.max(rectB.topLeftY - this.topLeftY, 0)
        const width = Math.min(rectB.topLeftX + rectB.width, this.topLeftX + this.width) - Math.max(rectB.topLeftX, this.topLeftX)
        const height = Math.min(rectB.topLeftY + rectB.height, this.topLeftY + this.height) - Math.max(rectB.topLeftY, this.topLeftY)
        if (width <= 0 || height <= 0) {
            return null
        } else {
            return new Rect(x, y, width, height)
        }
    }
}