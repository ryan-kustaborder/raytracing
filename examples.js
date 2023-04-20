import Camera from "./camera.js";
import Image from "./Image.js";

function createWorker(config) {
    let worker = new Worker("./worker.js");

    worker.onmessage = function (msg) {
        const ctx = document.getElementById("canvas").getContext("2d");
        const imageData = ctx.createImageData(
            config.bounds.width,
            config.bounds.height
        );
        const inputArray = msg.data;

        //Put data into ImageData object
        for (let i = 0; i < inputArray.length; i += 4) {
            const r = inputArray[i];
            const g = inputArray[i + 1];
            const b = inputArray[i + 2];
            const a = inputArray[i + 3];

            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = a;
        }

        // Draw the image to the canvas
        ctx.putImageData(imageData, config.bounds.x0, config.bounds.y0);

        console.log("Worker Finished");
    };

    return worker;
}

function runExample(worldConfig) {
    // Camera
    const camera = new Camera(90, 16 / 9);

    // Canvas
    let canvas = document.getElementById("canvas");

    // Image
    const img = new Image(canvas);

    const sectionSize = 50;

    for (let x = 0; x * sectionSize < img.imgWidth; x++) {
        for (let y = 0; y * sectionSize < img.imgHeight; y++) {
            // Set up worker

            let config = {
                world: worldConfig,
                camera: camera,
                image: img,
                bounds: {
                    x0: sectionSize * x,
                    y0: sectionSize * y,
                    width: sectionSize,
                    height: sectionSize,
                },
            };

            let worker = createWorker(config);

            // Actually start the worker
            worker.postMessage(JSON.parse(JSON.stringify(config)));
        }
    }
}

const reflectiveSpheres = [
    {
        type: "sphere",
        x: 0,
        y: 0,
        z: -1,
        radius: 0.5,
        material: {
            type: "reflective_lambertian",
            color: { r: 1, g: 1, b: 0 },
            roughness: 0.02,
        },
    },
    {
        type: "sphere",
        x: -1,
        y: 0,
        z: -1,
        radius: 0.5,
        material: {
            type: "reflective_lambertian",
            color: { r: 1, g: 0, b: 0 },
            roughness: 0.3,
        },
    },
    {
        type: "sphere",
        x: 1,
        y: 0,
        z: -1,
        radius: 0.5,
        material: {
            type: "reflective_lambertian",
            color: { r: 0, g: 0, b: 1 },
            roughness: 0.1,
        },
    },
    {
        type: "sphere",
        x: 1,
        y: -100.5,
        z: -1,
        radius: 100,
        material: {
            type: "lambertian",
            color: { r: 0.6, g: 0.9, b: 0.4 },
            roughness: 0.1,
        },
    },
];

const cameraDemo_r = Math.cos(Math.PI / 4);

const cameraDemo = [
    {
        type: "sphere",
        x: -cameraDemo_r,
        y: 0,
        z: -1,
        radius: cameraDemo_r,
        material: {
            type: "reflective_lambertian",
            color: { r: 1, g: 1, b: 0 },
            roughness: 0.02,
        },
    },
    {
        type: "sphere",
        x: cameraDemo_r,
        y: 0,
        z: -1,
        radius: cameraDemo_r,
        material: {
            type: "lambertian",
            color: { r: 1, g: 0, b: 0 },
            roughness: 0.3,
        },
    },
];

runExample(reflectiveSpheres);
