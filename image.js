export default class image {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.aspectRatio = 16.0 / 9.0;
        this.imgWidth = canvas.width;
        this.imgHeight = this.imgWidth / this.aspectRatio;
        this.samplesPerPixel = 100;
        this.maxDepth = 100;
    }
}
