let bg
let palette
let offsets = []
let passions = []
let fire = []

class Flame {
    constructor(fireW, fireH, img) {
        this.fireW = fireW; 
        this.fireH = fireH; 
        this.offsets = []; 
        this.img = img
        const aspectRatio = this.img.width / this.img.height;

        if ((fireW * 2) / (abs(fireH) + 200) > aspectRatio) {
            this.img.resize(0, abs(fireH) + 200);
          } else {
            this.img.resize(fireW * 2, 0);
          }
        
      }
    show() {
        push()
        beginClip();
        beginShape();

  // Bottom arc (rounded base of the flame)
  
  for (let angle = 0; angle < PI; angle += 0.1) {
    vertex(
      this.fireW / 2 + this.fireW / 2 * cos(angle) - this.fireW / 2, // Shift x
      0 - this.fireW / 2 + this.fireW / 2 * sin(angle) - this.fireH / 2 // Shift y
    );
  }

  // Left upward flick
  bezierVertex(
    0 - this.fireW / 2, this.fireH - 0.6 * this.fireH - this.fireH / 2, // Midway up the flame
    0.33 * this.fireW - this.fireW / 2, this.fireH - 0.45 * this.fireH - this.fireH / 2, // Curve inward
    0.2 * this.fireW - this.fireW / 2, this.fireH - this.fireH / 3 - this.fireH / 2 // Left flick peak
  );

  // Left middle curve
  bezierVertex(
    0.41 * this.fireW - this.fireW / 2, this.fireH - 0.39 * this.fireH - this.fireH / 2,
    0.34 * this.fireW - this.fireW / 2, this.fireH - 0.49 * this.fireH - this.fireH / 2,
    0.375 * this.fireW - this.fireW / 2, this.fireH - 0.5 * this.fireH - this.fireH / 2
  );

  // Central peak (sharpest point)
  bezierVertex(
    0.5 * this.fireW - this.fireW / 2, this.fireH - 0.26 * this.fireH - this.fireH / 2, // Curve up to tip
    0.14 * this.fireW - this.fireW / 2, this.fireH - 0.19 * this.fireH - this.fireH / 2, // Curve down from tip
    0.55 * this.fireW - this.fireW / 2, this.fireH - 0 * this.fireH - this.fireH / 2 // Flame tip
  );

  // Right downward curve (returning to base)
  bezierVertex(
    0.42 * this.fireW - this.fireW / 2, this.fireH - 0.24 * this.fireH - this.fireH / 2,
    1.06 * this.fireW - this.fireW / 2, this.fireH - 0.23 * this.fireH - this.fireH / 2,
    0.75 * this.fireW - this.fireW / 2, this.fireH - 0.75 * this.fireH - this.fireH / 2
  );

  // Right side flicks
  bezierVertex(
    0.96 * this.fireW - this.fireW / 2, this.fireH - 0.65 * this.fireH - this.fireH / 2,
    0.95 * this.fireW - this.fireW / 2, this.fireH - 0.55 * this.fireH - this.fireH / 2,
    0.95 * this.fireW - this.fireW / 2, this.fireH - 0.55 * this.fireH - this.fireH / 2
  );

  // Right base connection
  bezierVertex(
    1.02 * this.fireW - this.fireW / 2, this.fireH - 0.68 * this.fireH - this.fireH / 2,
    1 * this.fireW - this.fireW / 2, this.fireH - 0.75 * this.fireH - this.fireH / 2,
    this.fireW - this.fireW / 2, this.fireH - 0.75 * this.fireH - this.fireH / 2
  );

  endShape();
        
        endClip();
        
    ambientMaterial(255)
        texture(this.img);
      
      plane(this.fireW * 2, abs(this.fireH) + 200); // Match the flame's bounding box
      pop()
    }
    
    
}

function preload() {
    bg = loadImage("resources/ash.jpg")
    for (let i =0;i<11;i++) {
        passions.push(loadImage(`resources/passion/${i}.jpg`))
    }

}

function setup() {
    let dim = min(windowWidth,windowHeight)
    createCanvas(dim,dim,WEBGL)
    palette = [
        color(255,0,0),
        color(255,90,0),
        color(255,154,0),
        color(255,206,0),
        color(255,232,8)
    ]
    for (let i = 0; i<5;i++) {
        offsets.push(random(10000))
    }
    shuffle(passions,true)
    for (let i = 1; i<5;i++) {
        fire.push(new Flame(height/(i*2),-height/i,passions[i]))
    }
    
}

function draw() {
    clear()
    noStroke()
    for (let i = 0; i<5;i++) {
    spotLight(
        palette[i],
        0,height/10,noise(frameCount/100+offsets[i])*5000/(i+1)**0.75,
        0,0,-1,
        
    )
}
push()
specularMaterial(255)
    shininess(50)
        texture(bg)
    plane(1000)
    pop()
    push()
    translate(0,0,1)
    for (const flame of fire) {
        flame.show()
        translate(0,height/6,1)
        
    }
    pop()
}

