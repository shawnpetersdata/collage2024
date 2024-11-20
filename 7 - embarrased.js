let layers = []
let bg


function setup() {
    const dim = min(windowWidth, windowHeight)
    
    createCanvas(dim,dim)
    pixelDensity(1)
    bg = createGraphics(width,height)
    bg.pixelDensity(1)
    for (let i = 0; i<10; i++) {
        let temp = createGraphics(width,height)
        temp.pixelDensity(1)
        temp.background(random(255),random(255),random(255))
        temp.loadPixels()
        layers.push(temp)
    }
    bg.background(255)
    bg.stroke(0)
    bg.textFont("Geist Mono")
    bg.textSize(100)
    bg.textStyle(BOLD)
    for (let y = random(-10,10); y<height;y+=100) {
        for (let x = random(-10,10);x<width;x+=75) {
       bg.textSize(100*noise(x/1500,y/100) + 50)
            bg.text('0',x,y)
       x+= random(-5,5)
       y += random(-5,5)
        }
    }
    bg.loadPixels()
    for (let x = 0;x<width;x++) {
        for (let y = 0;y<height;y++) {
            
            let index = (x + y*width)*4
            if (bg.pixels[index] > 100) {
                continue
            }
            let depth = Math.floor(noise(x/250,y/250)*layers.length)
            bg.pixels[index]= layers[depth].pixels[index]
            bg.pixels[index+1]= layers[depth].pixels[index+1]
            bg.pixels[index+2]= layers[depth].pixels[index+2]

            //console.log(layers[depth].pixels[index])
        }
    }
    bg.updatePixels()
}

function draw() {
    noLoop()
    image(bg,0,0)
}