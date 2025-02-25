export class ChangeTracker {
    static stack = [];
    static pointer = -1;

    static pushState(state) {
        this.stack = this.stack.slice(0, this.pointer + 1);
        this.stack.push(JSON.stringify(state));
        this.pointer++;
    }

    static undo() {
        if (this.pointer > 0) {
            this.pointer--;
            return JSON.parse(this.stack[this.pointer]);
        }
        return null;
    }

    static redo() {
        if (this.pointer < this.stack.length - 1) {
            this.pointer++;
            return JSON.parse(this.stack[this.pointer]);
        }
        return null;
    }
}