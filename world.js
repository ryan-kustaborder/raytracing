import { HittableList } from "./Sphere.js";
import Point3D from "./Point3D.js";
import { rayColor, averageColor } from "./controller.js";
import { writeToImageData } from "./util.js";

export default class World extends HittableList {
    constructor() {
        super();
    }

    renderSection(x0, y0, w, h, cam, img) {
        // Define these as consts for slightly faster read times
        const imgWidth = img.imgWidth;
        const imgHeight = img.imgHeight;
        const myImageData = img.ctx.createImageData(imgWidth, imgHeight);
        const maxDepth = img.maxDepth;
        const samplesPerPixel = img.samplesPerPixel;

        for (let y = y0; y < h; y++) {
            //console.log("Scanning row " + y);
            for (let x = 0; x < w; x++) {
                let pixelColor = new Point3D(0, 0.5, 0);

                // Cast samplesPerPixel rays for each pixel
                for (let s = 0; s < img.samplesPerPixel; s++) {
                    let u = (x + Math.random()) / (imgWidth - 1);
                    let v = (y + Math.random()) / (imgHeight - 1);

                    let r = cam.getRay(u, v);

                    // Cast the ray
                    let colorFromRay = rayColor(r, this, maxDepth);

                    // Add to cumulative color for this pixel
                    pixelColor = pixelColor.addVector(colorFromRay);
                }

                // Write the final pixel to the image
                writeToImageData(
                    myImageData,
                    x,
                    y,
                    averageColor(pixelColor, samplesPerPixel)
                );
            }
        }

        return myImageData;
    }

    render(cam, img) {
        let test = new Worker("./workers/worker.js");
        test.postMessage("beep");
        test.onmessage = function (msg) {
            console.log(msg.data);
        };

        return this.renderSection(0, 0, 100, 100, cam, img);
    }
}
