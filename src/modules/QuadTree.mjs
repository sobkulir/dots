import { Rect } from "./Rect.mjs";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

export class QuadTree {
    // bounds is Rect
    constructor(bounds, maxPoints, maxLevel, level) {
        this.bounds = bounds
        this.splitOffsetWidth = Math.floor(bounds.width / 2)
        this.splitOffsetHeight = Math.floor(bounds.height / 2)

        assert(maxLevel && maxPoints)

        this.maxPoints = maxPoints
        this.maxLevel = maxLevel

        // (this.nodes === null) <=> is a leaf
        this.nodes = null
        // Array of [x, y, data].
        this.points = []
        this.level = level || 0
    }

    add(x, y, data) {
        if (this.nodes !== null) {
            // We can recurse.
            const [q, offX, offY] = this.getQuadrant(x, y)
            this.nodes[q].add(x - offX, y - offY, data)
        } else if (this.points.length < this.maxPoints || this.level == this.maxLevel) {
            // New object can be pushed into current node.
            this.points.push([x, y, data])
        } else {
            // We need to create another level.
            this.splitNodes()
            assert(this.nodes !== null)
            this.add(x, y, data) // Dangerous :P
        }
    }

    // Stops after a clbk returns true, otherwise goes through all points and returns false.
    // It's early-stopping mechanism.
    forEachInRect(rect, offX, offY, clbk) {
        if (this.nodes === null) {
            for (let [x,y,data] of this.points) {
                if (rect.containsPoint(x, y)) {
                    if (clbk(x + offX, y + offY, data)) {
                        return true
                    }
                }
            }
        } else {
            const qxy = [[0,0], [1,0], [0,1], [1,1]]
            for (const [i, [qx, qy]] of qxy.entries()) {
                const quadrantRect = new Rect(
                    qx * this.splitOffsetWidth,
                    qy * this.splitOffsetHeight,
                    (qx) ? this.bounds.width - this.splitOffsetWidth : this.splitOffsetWidth,
                    (qy) ? this.bounds.height - this.splitOffsetHeight : this.splitOffsetHeight)
                const overlap = quadrantRect.getRelativeOverlap(rect)
                if (overlap) {
                    if (this.nodes[i].forEachInRect(overlap, offX + quadrantRect.topLeftX, offY + quadrantRect.topLeftY, clbk)) {
                        return true
                    }
                }
            }
        }
        return false;
    }

    // Returns quadrant in 1D coordinates (as this.nodes is indexed) and also offsets of the quadrant relative to the current node.
    getQuadrant(x, y) {
        const qx = (x < this.splitOffsetWidth) ? 0 : 1
        const qy = (y < this.splitOffsetHeight) ? 0 : 1
        return [qy * 2 + qx, qx * this.splitOffsetWidth, qy * this.splitOffsetHeight]
    }

    splitNodes() {
        assert(this.nodes === null);
        this.nodes = Array(4)
        const qxy = [[0,0], [1,0], [0,1], [1,1]]
        for (const [i, [qx, qy]] of qxy.entries()) {
            this.nodes[i] = new QuadTree(
                new Rect(0, 0,
                    (qx) ? this.bounds.width - this.splitOffsetWidth : this.splitOffsetWidth,
                    (qy) ? this.bounds.height - this.splitOffsetHeight : this.splitOffsetHeight),
                this.maxPoints, this.maxLevel, this.level + 1)
        }
        
        for (let [x,y, data] of this.points) {
            // Living dangerously again.
            this.add(x, y, data)
        }

        this.points = []
    }
}