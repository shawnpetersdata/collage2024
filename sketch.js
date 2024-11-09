let img

function preload() {
    img = loadImage("resources/fire.jpg")
}

function setup() {

    createCanvas(700,700)
    
}

function draw() {
    clear()
    //image(img,0,0)
    let fireW = img.width
    let fireH = img.height
    strokeWeight(5)
    stroke(0,100)
    noFill()
    /*
    beginShape()
    for (let angle = 0; angle<PI;angle += 0.1) {
        vertex(fireW/2+fireW/2*cos(angle), fireH-fireW/2+fireW/2*sin(angle))
    }

    bezierVertex(0,387,107,289,0.2*fireW,1/3*fireH)
    bezierVertex(130,250,108,315,3/8*fireW,0.5*fireH)
    bezierVertex(160,170,44,122,0.55*fireW,0*fireH)
    bezierVertex(133,158,337,148,0.75*fireW,0.75*fireH)
    bezierVertex(305,420,0.95*fireW,0.55*fireH,0.95*fireW,0.55*fireH)
    bezierVertex(324,440,318,486,318,486)
    endShape()
    circle(318,486,50)
    console.log(img.width,img.height) //318,647
    */
    beginShape();

    // Bottom arc (rounded base of the flame)
    for (let angle = 0; angle < PI; angle += 0.1) {
      vertex(fireW / 2 + fireW / 2 * cos(angle), fireH - fireW / 2 + fireW / 2 * sin(angle));
    }
    
    // Left upward flick
    bezierVertex(0, 0.6 * fireH, 0.33 * fireW, 0.45 * fireH, 0.2 * fireW, fireH / 3);
    
    // Left middle curve
    bezierVertex(0.41 * fireW, 0.39 * fireH, 0.34 * fireW, 0.49 * fireH, 0.375 * fireW, 0.5 * fireH);
    
    // Central peak (sharpest point)
    bezierVertex(0.5 * fireW, 0.26 * fireH, 0.14 * fireW, 0.19 * fireH, 0.55 * fireW, 0 * fireH);
    
    // Right downward curve (returning to base)
    bezierVertex(0.42 * fireW, 0.24 * fireH, 1.06 * fireW, 0.23 * fireH, 0.75 * fireW, 0.75 * fireH);
    
    // Right side flicks
    bezierVertex(0.96 * fireW, 0.65 * fireH, 0.95 * fireW, 0.55 * fireH, 0.95 * fireW, 0.55 * fireH);
    
    // Right base connection
    bezierVertex(1.02 * fireW, 0.68 * fireH, 1 * fireW, 0.75 * fireH, fireW, 0.75 * fireH);
    
    endShape();
    
}