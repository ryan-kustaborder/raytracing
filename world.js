import { HittableList } from "./sphere.js";
import vec3 from "./vec3.js";
import { rayColor, averageColor } from "./controller.js";
import { writeToImageData } from "./util.js";

export default class world extends HittableList {
    constructor() {
        super();
    }

    render(cam, img) {
        const imgWidth = img.imgWidth;
        const imgHeight = img.imgHeight;
        const maxDepth = img.maxDepth;
        const samplesPerPixel = img.samplesPerPixel;

        const myImageData = img.ctx.createImageData(imgWidth, imgHeight);

        for (let y = img.imgHeight - 1; y >= 0; y--) {
            //console.log("Scanning row " + y);
            for (let x = img.imgWidth; x >= 0; x--) {
                let pixelColor = new vec3(0, 0.5, 0);

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
}
