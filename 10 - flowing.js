//https://www.pexels.com/video/a-tall-waterfall-down-pouring-on-a-plunge-basin-2892038/
let video 
let ready = false
let scaledWidth, xOffset

function preload() {
    video = createVideo('resources/video/2892038-hd_1280_720_30fps.mp4')
}

function setup() {
    const dim = min(windowWidth, windowHeight);
    createCanvas(dim, dim);
    video.hide()

    let sclFactor = height/video.height
    scaledWidth = video.width*sclFactor
    xOffset = (width - scaledWidth) / 2

    playButton = createButton('Play');
    playButton.position(10, 10);
    playButton.mousePressed(startPlayback);
}

function startPlayback() {
    video.loop()
    ready = true

}

function draw() {
    image(video, xOffset, 0, scaledWidth, height);
}
