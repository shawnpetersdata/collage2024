let video;
let prevFrame; // Previous frame pixel array
let ready = false;
let trackedMotion = [];
let countedFrames = 0;
let noChange = 0

let gridSize = 8; // 10x10 grid
let cellWidth, cellHeight; // Dimensions of each grid cell
let playButton;

function preload() {
    video = createVideo('resources/video/5560963-hd_1920_1080_30fps.mp4');
}

function setup() {
    const dim = min(windowWidth, windowHeight);
    createCanvas(dim, dim);

    video.size(width, height); // Resize video to match canvas
    video.hide(); // Hide the video DOM element

    cellWidth = width / gridSize;
    cellHeight = height / gridSize;

    // Initialize the tracked motion array
    for (let i = 0; i < gridSize ** 2; i++) {
        trackedMotion.push({ maxMotion: 0, img: createGraphics(cellWidth, cellHeight) });
    }

    // Create the play button
    playButton = createButton('Play');
    playButton.position(10, 10);
    playButton.mousePressed(startPlayback);
}

function startPlayback() {
    video.play();
    video.volume(0);
    playButton.hide(); // Hide the button after starting playback
    ready = true;
}

function draw() {
    background(0);
    
    if (ready) {
        console.log(noChange)
        let changed
        video.loadPixels();

        if (video.pixels.length > 0) {
            changed = detectMovement(video.pixels);
            countedFrames++;
        }

        if (changed) {
            noChange = 0
        }
        else {
            noChange ++
        }

        for (let i =0; i<trackedMotion.length;i++) {
            let x = i%gridSize * cellWidth
            let y = Math.floor(i/gridSize) * cellHeight
            image(trackedMotion[i].img, x, y);
        }
    }

    if (noChange >= 100) {
        console.log('done')
        noLoop();
        
        
    }
}

function detectMovement(currentPixels) {
    // Skip the first frame (or any invalid frames)
    if (!prevFrame) {
        prevFrame = new Uint8ClampedArray(currentPixels); 
        return false; 
    }

    // Create a new array for the difference frame
    let diffFrame = new Uint8ClampedArray(currentPixels.length);

    // Compute frame differences
    for (let i = 0; i < currentPixels.length; i += 4) {
        let diff = abs(currentPixels[i] - prevFrame[i]);
        diffFrame[i] = diff;     // R
        diffFrame[i + 1] = diff; // G
        diffFrame[i + 2] = diff; // B
        diffFrame[i + 3] = 255;  // Alpha
    }

    // Process the grid and display average intensity
    let changed = processGrid(diffFrame, currentPixels);

    // Update the previous frame
    prevFrame.set(currentPixels); // Copy current frame into prevFrame

    return changed
}

function processGrid(diffFrame, currentPixels) {
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Calculate the start and end coordinates for this cell
            let xStart = Math.floor(col * cellWidth);
            let xEnd = Math.floor((col + 1) * cellWidth);
            let yStart = Math.floor(row * cellHeight);
            let yEnd = Math.floor((row + 1) * cellHeight);

            // Compute the average intensity for this cell
            let sum = 0;
            let count = 0;
            for (let y = yStart; y < yEnd; y++) {
                for (let x = xStart; x < xEnd; x++) {
                    let index = (y * width + x) * 4; // Get the index in the diffFrame array
                    sum += diffFrame[index]; // Use R channel (or G/B, since they're identical)
                    count++;
                }
            }
            let avgIntensity = sum / count;

            // Update tracked motion if the current cell has more motion
            let index = (row * gridSize) + col;
            if (trackedMotion[index].maxMotion < sum) {
                trackedMotion[index].maxMotion = sum;
                trackedMotion[index].img = video.get(xStart, yStart, cellWidth, cellHeight);
                return true
            }
        }
    }
    return false
}