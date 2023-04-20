import Camera from "./camera.js";
import Image from "./Image.js";
import Point3D from "./Point3D.js";

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
    };

    return worker;
}

function runExample(worldConfig, cameraConfig) {
    // Canvas
    let canvas = document.getElementById("canvas");

    // Image
    const img = new Image(canvas);

    const sectionSize = 100;

    for (let x = 0; x * sectionSize < img.imgWidth; x++) {
        for (let y = 0; y * sectionSize < img.imgHeight; y++) {
            // Set up worker

            let config = {
                world: worldConfig,
                camera: cameraConfig,
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

export function runReflectiveSpheres(theta = 90, focalLength = 5) {
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

    const cameraConfig = {
        lookfrom: { x: 3, y: 3, z: 2 },
        lookat: { x: 0, y: 0, z: -1 },
        vup: { x: 0, y: 1, z: 0 },
        theta: theta,
        aspectRatio: 16 / 9,
        dist_to_focus: focalLength,
        aperture: 0.1,
    };

    runExample(reflectiveSpheres, cameraConfig);
}

function runStressTest() {
    const stressTestBase = [
        {
            type: "sphere",
            x: 0,
            y: -1000,
            z: -1,
            radius: 1000,
            material: { type: "lambertian", color: { r: 0.5, g: 0.5, b: 0.5 } },
        },
        {
            type: "sphere",
            x: 0,
            y: 1,
            z: 0,
            radius: 1,
            material: {
                type: "reflective_lambertian",
                color: { r: 0.7, g: 0.5, b: 0.7 },
                roughness: 0.01,
            },
        },
        {
            type: "sphere",
            x: 4,
            y: 1,
            z: 0,
            radius: 1,
            material: {
                type: "reflective_lambertian",
                color: { r: 0.7, g: 0.6, b: 0.5 },
                roughness: 0.01,
            },
        },
        {
            type: "sphere",
            x: -4,
            y: 1,
            z: 0,
            radius: 1,
            material: {
                type: "lambertian",
                color: { r: 0.4, g: 0.2, b: 0.1 },
                roughness: 0.01,
            },
        },
    ];

    // Add balls of random color
    for (let a = -7; a < 7; a++) {
        for (let b = -7; b < 7; b++) {
            let choose_mat = Math.random();
            let center = new Point3D(
                a + 0.9 * Math.random(),
                0.2,
                b + 0.9 * Math.random()
            );

            if (center.subtractVector(new Point3D(4, 0.2, 0)).length() > 0.9) {
                if (choose_mat < 0.8) {
                    // diffuse
                    stressTestBase.push({
                        type: "sphere",
                        x: center.x(),
                        y: center.y(),
                        z: center.z(),
                        radius: 0.2,
                        material: {
                            type: "lambertian",
                            color: {
                                r: Math.random(),
                                g: Math.random(),
                                b: Math.random(),
                            },
                        },
                    });
                } else {
                    // metal
                    stressTestBase.push({
                        type: "sphere",
                        x: center.x(),
                        y: center.y(),
                        z: center.z(),
                        radius: 0.2,
                        material: {
                            type: "reflective_lambertian",
                            color: {
                                r: Math.random(),
                                g: Math.random(),
                                b: Math.random(),
                            },
                            roughness: Math.random() / 3,
                        },
                    });
                }
            }
        }
    }

    const cameraConfig = {
        lookfrom: { x: 13, y: 3, z: 2 },
        lookat: { x: 0, y: 0, z: 0 },
        vup: { x: 0, y: 1, z: 0 },
        theta: 20,
        aspectRatio: 16 / 9,
        dist_to_focus: 0.5,
        aperture: 0.1,
    };

    runExample(stressTestBase, cameraConfig);
}

//runStressTest();
//runReflectiveSpheres();
