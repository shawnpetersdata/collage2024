let woods = []
let plants = []
let papers = []
let layers = []
let poems = []
let bg

function preload() {
    for (let i = 0; i<7;i++) {
        woods.push(loadImage(`resources/wood/${i}.jpg`))
    }
    for (let i = 0; i<8;i++) {
        plants.push(loadImage(`resources/plants/${i}.jpg`))
    }
    for (let i = 0; i<2; i++) {
        papers.push(loadImage(`resources/paper/${i}.jpg`))
    }

    for (let i = 0; i<5;i++) {
        poems.push(loadStrings(`resources/poems/${i}.txt`))
    }

}

function setup() {
    createCanvas(700, 700);
    
    background(0);
    
    let writtenPoems = []

    for (let i = 0; i<100; i++) {
        writtenPoems.push(makePoem())

    }

    layers = Array.from({ length: 6 }, () => createGraphics(width, height));

    for (let i = 0; i < layers.length; i++) {
        let currentLayer = layers[i];
        currentLayer.pixelDensity(1);
        let temp;
        for (let j = 0; j < 100; j++) {
            switch (i) {
                case 0:
                case 1:
                    temp = random(woods);
                    break;
                case 2:
                case 3:
                    temp = random(plants);
                    break;
                default:
                    temp = random(writtenPoems)
            }
            let img = getRandomStrip(temp);

            currentLayer.push();
            currentLayer.translate(random(width), random(height));
            currentLayer.rotate(random(TWO_PI));
            currentLayer.image(img, 0, 0);
            currentLayer.pop();
        }
        currentLayer.loadPixels();
    }
    shuffle(layers, true)
    bg = createGraphics(width, height);
    bg.pixelDensity(1);
    bg.loadPixels();

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) { 
            let index = (x + y * width) * 4;
            let depth = noise(x / 100, y / 250) * layers.length;
            let layerDepth = Math.floor(depth);
            let residue = layerDepth-depth
            residue = 1

            bg.pixels[index] = layers[layerDepth].pixels[index] * residue;
            bg.pixels[index + 1] = layers[layerDepth].pixels[index + 1] * residue;
            bg.pixels[index + 2] = layers[layerDepth].pixels[index + 2] * residue;
            bg.pixels[index + 3] = map((depth - layerDepth),0,1,255,100);
        }
    }

    bg.updatePixels();
    
}

function draw() {
    noLoop()
    background(255)
    image(bg,0,0)
    noStroke()
    
    let skyLevel = random(0.4,0.75) * height
    let offset = random(10000)
    for (let x = -20; x<width; x+=20) {
        for (let y= -20; y<height; y+= 20) {
            //fill(255,random(50,90))
            if (y < skyLevel) {
                let r = map(y,skyLevel, 0,135,255)
                let g = map(y,skyLevel, 0,206,255)
                let b = map(y,skyLevel, 0,235,255)

                fill(r,g,b,map(noise(x/10+offset,y/10+offset),0,1,20,100))
            }
            else {
                fill(1,68,33,map(noise(x/10+offset,y/10+offset),0,1,20,100))
            }
            let w = random(50,100)
            let h = random(25,50)
            rect(x+random(-15,15),y+random(-15,15),w,h,random(0,2),random(0,2),random(0,2),random(0,2))
        }
    }
    
    rectMode(CENTER)
    for (let i = 0;i<10;i++) {
        mushroom(random(width),random(skyLevel,height),0.1*width,0.05*height)
    }
    mushroom(width/2,height/2,0.25*width,0.5*height)
    

}

function getRandomStrip(img) {
    let x1 = random(0, img.width / 2);
    let x2 = random(img.width / 2, img.width);
    let end = img.height;
    let start = 0;
    const stripW = x2 - x1;
    let pnts = [];

    // Generate the first path
    for (let y = 0; y < img.height; y++) {
        const shift = map(noise(x1 / 1000, y / 1000), 0, 1, -0.01, 0.01) * stripW;
        x1 = constrain(x1 + shift, 0, img.width);
        pnts.push({ x: x1, y: y });
        if (random() > 0.999) {
            end = y;
            x2 = x1 + 10;
            break;
        }
    }

    // Generate the second path and find start cutoff
    for (let y = end; y > 0; y--) {
        const shift = map(noise(x2 / 1000, y / 1000), 0, 1, -0.01, 0.01) * stripW;
        x2 = constrain(x2 + shift, 0, img.width);
        let correspondingX1 = pnts.find(p => p.y === y);
        if (correspondingX1 && Math.abs(x2 - correspondingX1.x) < 2) {
            start = y;
            break;
        }
        pnts.push({ x: x2, y: y });
    }

    // Filter points and remove any above the start cutoff
    pnts = pnts.filter(p => p.y >= start);

    // Create the strip by applying the mask
    let mask = createGraphics(img.width, img.height);
    mask.pixelDensity(1);
    mask.clear();
    mask.beginShape();
    for (const { x, y } of pnts) {
        mask.vertex(x, y);
    }
    mask.endShape(CLOSE);

    let stripRegion = img.get(0, 0, img.width, img.height);
    stripRegion.mask(mask);

    // Create the white torn edge
    let tornEdgeGraphic = createGraphics(img.width, img.height);
    tornEdgeGraphic.pixelDensity(1);
    tornEdgeGraphic.background(0, 0, 0, 0); // Transparent background
    tornEdgeGraphic.fill(255); // White color for the torn edge
    tornEdgeGraphic.strokeWeight(2);
    tornEdgeGraphic.stroke(255)
    tornEdgeGraphic.beginShape();

    // Draw the torn edge using noise to perturb the vertices
    for (let i = 0; i < pnts.length; i++) {
        if (random() > 0.7) { // Only draw the torn edge on some segments
            let offset = map(noise(pnts[i].y / 50), 0, 1, -5, 5); // Adjust -5 and 5 for more/less jagged effect
            tornEdgeGraphic.vertex(pnts[i].x + offset, pnts[i].y);
        } else {
            tornEdgeGraphic.vertex(pnts[i].x, pnts[i].y); // Regular edge
        }
    }

    tornEdgeGraphic.endShape(CLOSE);

    // Combine the strip and the torn edge without masking the torn edge
    let finalResult = createGraphics(img.width, img.height);
    finalResult.pixelDensity(1);
    finalResult.image(tornEdgeGraphic, 0, 0); // Draw the torn edge as the background
    finalResult.image(stripRegion, 0, 0); // Overlay the strip on top of the torn edge

    // Trim the final result
    finalResult = trimTransparent(finalResult);

    return finalResult;
}



function trimTransparent(img) {

img.loadPixels();
    let minX = img.width,
        minY = img.height,
        maxX = 0,
        maxY = 0;
  
    // Find the bounds of non-transparent pixels
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        let index = (x + y * img.width) * 4;
        let alpha = img.pixels[index + 3]; // alpha value
  
        if (alpha > 0) { // Non-transparent pixel found
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  
    // Define the width and height of the trimmed area
    let trimmedWidth = maxX - minX + 1;
    let trimmedHeight = maxY - minY + 1;
  
    // Create a new image with the trimmed area
    let trimmedImg = createImage(trimmedWidth, trimmedHeight);
    trimmedImg.loadPixels();
  
    // Copy pixels from the original image to the trimmed image
    for (let y = 0; y < trimmedHeight; y++) {
      for (let x = 0; x < trimmedWidth; x++) {
        let originalIndex = ((x + minX) + (y + minY) * img.width) * 4;
        let newIndex = (x + y * trimmedWidth) * 4;
        trimmedImg.pixels[newIndex] = img.pixels[originalIndex];
        trimmedImg.pixels[newIndex + 1] = img.pixels[originalIndex + 1];
        trimmedImg.pixels[newIndex + 2] = img.pixels[originalIndex + 2];
        trimmedImg.pixels[newIndex + 3] = img.pixels[originalIndex + 3];
      }
    }
  
    trimmedImg.updatePixels();
    return trimmedImg;
}

function makePoem() {
    let poem = random(poems)
    textSize = random(10,30)
    let lineHeight = textAscent() + textDescent();
    let totalHeight = lineHeight * poem.length;
    let temp = random(papers)
    let scl = min(totalHeight,temp.height)/temp.height
    let poemPaper = createGraphics(temp.width*scl,temp.height*scl)
    poemPaper.image(temp,0,0,temp.width*scl,temp.height*scl)
    poemPaper.textAlign(CENTER)
    for (let i = 0; i<poem.length; i++) {
        poemPaper.text(poem[i],poemPaper.width/2,(i+1)*lineHeight)
    }
    
    return poemPaper.get()
}

function mushroom(x,y,w,h) {
    noFill()
    strokeWeight(0.25*h)
    push()
    translate(x-map(noise(x,0.5*y+h,0),0,1,-w/2,w/2),y-h/4)
    //strokeWeight(1)
    for (let i = 0; i<50;i++) {
        stroke(255,253,208,random(5,10))
        curve(-map(noise(x,y-h/2,i/10),0,1,-2*w,2*w),-h/2,
        -map(noise(x,0.5*y+h,i/100),0,1,-w/2,w/2),0,
        -map(noise(x,y+h/2,i/100),0,1,-w/2,w/2),h/2,
        -map(noise(x,y+h,i/10),0,1,-2*w,2*w),h)


        //curve(x-map(noise(x,y-h/2,i/10),0,1,-2*w,2*w),y-h/2,
        //x-map(noise(x,0.5*y+h,i/100),0,1,-w/2,w/2),(0.5*y+h)/2,
        //x-map(noise(x,y+h/2,i/100),0,1,-w/2,w/2),y+h/2,
        //x-map(noise(x,y+h,i/10),0,1,-2*w,2*w),y+h)
    } 
    noStroke()
    let circles = []
    let amount = Math.floor(random(3,6))
    for (i = 0; i<amount; i++) {
        circles.push({x:random(-h/2,h/2),y:-random(w/2),r:random(0.1,0.25)*min(w,h)})
    }
    
    

    let colours = [random(255), random(123), random(123,255)]
    shuffle(colours,true)
    const [r,g,b] = [...colours]
    rotate(random(-Math.PI/32,Math.PI/32))
    for (let j = 0 ;j<100;j++) {
        fill(r,g,b,random(10,30))
    if (j==0) {
        beginClip()
    }
    beginShape()
    for (let i = TWO_PI/2; i<TWO_PI;i+=0.05) {
        let rMod = map(noise(i),0,1,0.8,1.2)
        let p = {x:rMod*h/2*cos(i), y:rMod*w/2*sin(i)}
        vertex(p.x,p.y)
        
    }
    for (let i = h/2; i > -h/2; i-=0.02*w) {
        vertex(i,map(noise(i/100,0),0,1,-0.02*h,0.02*h))
    }
    endShape(CLOSE)
    if (j ==0) {
        endClip()
        
        rect(0,0,width,height)
    }
}
    //
    for (let i = 0; i<10; i++) {
    fill(min(r*2,255),min(b*2,255),min(g*2,255),random(10,50))
    for (let {x,y,r} of circles) {
        circle(x+random(-0.01*r,0.01*r),y+random(-0.01*r,0.01*r),2*r)
    }
}
    pop()
}