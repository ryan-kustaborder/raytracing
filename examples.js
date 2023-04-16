import vec3 from "./vec3.js";
import sphere from "./sphere.js";
import Camera from "./camera.js";
import world from "./world.js";
import image from "./image.js";

function singleSphere() {
    // Camera
    const camera = new Camera();

    // Canvas
    let canvas = document.getElementById("canvas");

    // Image
    const img = new image(canvas);

    // World
    let wor = new world();
    wor.add(new sphere(new vec3(0, 0, -1), 0.5));
    wor.add(new sphere(new vec3(0, -100.5, -1), 100));

    let imgData = wor.render(camera, img);

    img.ctx.putImageData(imgData, 0, 0);
}

singleSphere();
