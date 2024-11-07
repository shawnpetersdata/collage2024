let furs = []
let fishes = []
let earth
let spaces = []

function preload() {
    for (let i = 0; i<5;i++) {
        furs.push(loadImage(`resources/fur/${i}.jpg`))
    }
    for (let i = 0; i<3;i++) {
        spaces.push(loadImage(`resources/space/${i}.jpg`))
    }
    earth = loadImage('resources/earth.png')
}

function setup() {
    const dim = min(windowWidth, windowHeight)
    createCanvas(dim,dim)
    
}

function draw() {
    noLoop()
    imageMode(CENTER)
    background(0,0,100)
    
    let bg = random(spaces)
    image(bg, random(width / 2, width - bg.width / 2), random(height / 2, height - bg.height / 2));
    for (let i = 0; i<10; i++) {
        push()
        let x = random(width)
        let y = random(0.2,0.8)*height
        fishes.push({x:x, y:y, img:clipFish(random(1,2))})
        //image(random(furs),width/2,height/2)
        pop()
    }

    if (earth.width < 0.95*width) {
        earth.resize(width,height)
    }
    
    
    
    push()
    drawFishbowl(width/2,height/2,0.95*width,0.65*width)
    image(earth,width/2,height/2)
    for (const {x,y,img} of fishes) {
        image(img,x,y)
    }
    pop()


}



function clipFish(s) {
    let canvas = createGraphics(100*s, 60*s)
    canvas.push();
    canvas.beginClip()
    canvas.translate(50*s,30*s)
    canvas.scale(s); 
  
    canvas.beginShape();
    
    // Main fish body
    canvas.vertex(40, 0);
    canvas.bezierVertex(60, -20, -20, -30, -50, 0); // Rounded head
    canvas.bezierVertex(-20, 30, 60, 20, 40, 0);    // Lower body
  
    // Tail fin
    canvas.vertex(40, 0);  
    canvas.vertex(60, -15); // Top of tail fin
    canvas.vertex(60, 15);  // Bottom of tail fin
    canvas.vertex(40, 0);   // Back to body
  
    // Eye hole (small circular cutout)
    canvas.beginContour();
    for (let angle = 0; angle < TWO_PI; angle += 0.1) {
      let x = -25 + cos(angle) * 5; // X position of eye
      let y = -5 + sin(angle) * 5;   // Y position of eye
      canvas.vertex(x, y);
    }
    canvas.endContour();
  
    canvas.endShape(CLOSE);
    canvas.pop();
  
    // Apply clipping to the fish shape
    canvas.endClip();
    const img = random(furs)
    canvas.image(img,  random(-img.width + canvas.width, 0), random(-img.height + canvas.height, 0))

    return canvas
  }

  function drawFishbowl(x, y, w, h) {
    beginClip()
    push();
    translate(x, y); 
    noFill()
   
    // Outer fishbowl shape
    beginShape();
    vertex(-w * 0.3, -h / 2);
    bezierVertex(-w / 2, -h / 2, w / 2, -h / 2, w * 0.3, -h / 2);
    bezierVertex(w / 2, -h / 4, w / 2, h / 4, w * 0.25, h / 2);
    bezierVertex(0, h * 0.6, -w * 0.25, h / 2, -w * 0.25, h / 2);
    bezierVertex(-w / 2, h / 4, -w / 2, -h / 4, -w * 0.3, -h / 2);
    endShape(CLOSE);
  
    ellipse(0, -h / 2, w * 0.6, h*0.1);
  
    pop();
    endClip()
  }