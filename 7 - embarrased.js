let layers = []
let imgs = []
let bg
let texture

function preload() {
    for (let i = 1; i<7;i++) {
        imgs.push(loadImage(`resources/finals/${i}.png`))
    }
    texture = loadImage(`resources/olga-thelavart-HZm2XR0whdw-unsplash.jpg`)
}


function setup() {
    shuffle(imgs,true)
    const dim = min(windowWidth, windowHeight)
    if (texture.width < width) {
        const scl = width/texture.width
        texture.resize(width,scl*texture.height)
    }
    if (texture.height < height) {
        const scl = height/texture.height
        texture.resize(scl*texture.width,height)
    }
    



    createCanvas(dim,dim)
    pixelDensity(1)
    bg = createGraphics(width,height)
    bg.pixelDensity(1)
    for (let i = 0; i<imgs.length; i++) {
        let temp = createGraphics(width,height)
        temp.pixelDensity(1)
        temp.image(imgs[i],0,0,width,height)
        temp.loadPixels()
        layers.push(temp)
    }
    //bg.background(255)
    bg.stroke(0)
    bg.textFont("Geist Mono")
    bg.textSize(100)
    bg.textStyle(BOLD)
    for (let y = random(-10,10); y<height;y+=100) {
        for (let x = random(-10,10);x<width;x+=75) {
            bg.textSize(150*noise(x/1500,y/100) + 50)
            bg.text('0',x,y)
            x += randomGaussian(0,20)
            y += randomGaussian(0,20)
        }
    }
    bg.loadPixels()
    for (let x = 0;x<width;x++) {
        for (let y = 0;y<height;y++) {
            
            let index = (x + y*width)*4
            if (bg.pixels[index] > 100) {
                continue
            }
            let depth = Math.floor(noise(x/100,y/100)*layers.length)
            bg.pixels[index]= layers[depth].pixels[index]
            bg.pixels[index+1]= layers[depth].pixels[index+1]
            bg.pixels[index+2]= layers[depth].pixels[index+2]
        }
    }
    bg.updatePixels()
}

function draw() {
    noLoop()
    image(texture,0,0)
    for(let x = 0;x<width;x+=200) {
        for (let y = 0;y<height;y+=200) {
            textSize(random(50,200))
            text(random(["🙂","🔁","❤️","👍"]),x+random(-50,50),y+random(-50,50))
        }
    }
    image(bg,0,0)
}