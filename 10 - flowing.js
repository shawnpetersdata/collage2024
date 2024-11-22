//https://www.pexels.com/video/a-tall-waterfall-down-pouring-on-a-plunge-basin-2892038/
let video 
let ready = false
let sclFactor,scaledWidth, xOffset
let faucet, handle

function preload() {
    video = createVideo('resources/video/2892038-hd_1280_720_30fps.mp4')
    faucet = loadImage('resources/faucet.png')
    handle = loadImage('resources/handle.png')
}

function setup() {
    const dim = min(windowWidth, windowHeight);
    createCanvas(dim, dim);
    video.hide()

    sclFactor = height/video.height

    console.log(sclFactor)

    faucet.resize(sclFactor*faucet.width,sclFactor*faucet.height)
    handle.resize(sclFactor*handle.width.sclFactor*handle.width)

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
    if (ready) {
        image(video, xOffset, 0, scaledWidth, height);
        image(faucet,0.37*width,0.05*height)
    }
}
