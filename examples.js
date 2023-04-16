import vec3 from "./vec3.js";
import sphere from "./sphere.js";
import Camera from "./camera.js";
import world from "./world.js";
import image from "./image.js";
import material, { metal } from "./materials.js";

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

function metallicSpheres() {
    // Camera
    const camera = new Camera();

    // Canvas
    let canvas = document.getElementById("canvas");

    // Image
    const img = new image(canvas);

    // World
    let wor = new world();

    let material_ground = new material();
    let material_center = new material();
    let material_left = new metal();
    let material_right = new metal();

    wor.add(new sphere(new vec3(0.0, -100.5, -1.0), 100.0, material_ground));
    wor.add(new sphere(new vec3(0.0, 0.0, -1.0), 0.5, material_center));
    wor.add(new sphere(new vec3(-1.0, 0.0, -1.0), 0.5, material_left));
    wor.add(new sphere(new vec3(1.0, 0.0, -1.0), 0.5, material_right));

    let imgData = wor.render(camera, img);

    img.ctx.putImageData(imgData, 0, 0);
}

//singleSphere();
metallicSpheres();
