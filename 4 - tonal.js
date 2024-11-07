let xOff,yOff
let sources = []
let groups = []
let canvas
let pieces = []

function preload() {
    for (let i = 0;i <13;i++) {
        sources.push(loadImage(`resources/skin/${i}.png`))
    }
}

function setup() {
    const dim = min(windowWidth, windowHeight)
    createCanvas(dim,dim)
    xOff = random(10000)
    yOff = random(10000)

    cutSections(2000,groups)

    for (let x = -5*width; x<5*width;x+=50) {
        for (let y = -5*height;y<5*height;y+=50) {
            
            
            const group = Math.floor(noise(x/500,y/500)*groups.length)            
            pieces.push({x:x,y:y,angle:random(TWO_PI),img:random(groups[group]).img})
            
            //rect(x,y,101,101)
        }
    }
    shuffle(pieces,true)
}

function draw() {
    background(255)
    
    noStroke()
    push()
    const scl = map(noise(frameCount/1000),0,1,0.2,1)
    const x = map(noise(frameCount/1000+xOff),0,1,0,width)
        const y = map(noise(frameCount/1000+yOff),0,1,0,height)

        const buffer = 200
        const viewLeft = -x / scl - buffer;
        const viewRight = (width - x) / scl + buffer;
        const viewTop = -y / scl - buffer;
        const viewBottom = (height - y) / scl + buffer;

        translate(x,y)
        scale(scl,scl)
    for (const piece of pieces) {
        if (
            piece.x + piece.img.width / 2 < viewLeft ||
            piece.x - piece.img.width / 2 > viewRight ||
            piece.y + piece.img.height / 2 < viewTop ||
            piece.y - piece.img.height / 2 > viewBottom
        ) {
            continue; // Skip rendering this piece if it's outside the visible bounds
        }
        push()
        translate(piece.x,piece.y)
        rotate(piece.angle)
        image(piece.img,0,0)
    pop()
    }
    pop()
}


function cutSections(amount, group) {
	let pieces = []
	for (let i = 0; i<amount;i++) {
		let temp = getRandomRegion(random(sources))
		if (!isRegionEmpty(temp.img)) {
            temp.img = trimTransparent(temp.img)
			pieces.push(temp)
		}
	}
	groups = groupByColor(pieces, group, 1)
    groups.sort((a, b) => {
        // Calculate brightness for the first color in each group
        let brightnessA = (red(a[0].avgColor) + green(a[0].avgColor) + blue(a[0].avgColor)) / 3;
        let brightnessB = (red(b[0].avgColor) + green(b[0].avgColor) + blue(b[0].avgColor)) / 3;
        return brightnessA - brightnessB; // Ascending order
      });
}

function getRandomRegion(img) {
	let x = floor(random(img.width - 50));
	let y = floor(random(img.height - 50));
	let w = floor(random(150, 300));
	let h = floor(random(150, 300));

	let mask = createGraphics(w, h);
	mask.clear();

	mask.beginShape();
	const points = Math.floor(random(4,12))
	const startAngle = random(TWO_PI)
	for (let i = 0; i < points; i++) { // Create an 8-point random polygon
	  let angle = startAngle + TWO_PI / points * i + random(-1,1)*TWO_PI/(points*5);
	  let radius = random(w / 3, w / 2);
	  let px = w / 2 + cos(angle) * radius;
	  let py = h / 2 + sin(angle) * radius;
	  mask.vertex(px, py);
	}
	mask.endShape(CLOSE);
  

	let region = img.get(x, y, w, h);
	region.mask(mask)


	let avgColor = getAverageColor(region, 0, 0, w, h, 10); // 10% sampling
	return { img: region, avgColor: avgColor };
}

function isRegionEmpty(region) {
	region.loadPixels();
	for (let i = 0; i < region.pixels.length; i += 4) {
		if (region.pixels[i + 3] > 0) {
			// Found a non-transparent pixel
			return false;
		}
	}
	return true; // No non-transparent pixels found
}


function getAverageColor(image, x, y, w, h, sampleRate) {
	let r = 0, g = 0, b = 0, count = 0;
	let totalPixels = w * h;
	let targetSampleSize = totalPixels * (sampleRate / 100);
	let step = Math.floor(Math.sqrt(totalPixels / targetSampleSize)); // Calculate step size based on target sample size
	image.loadPixels()
  
	// Loop over each pixel in the region, sampling every 'step' pixels
	for (let i = x; i < x + w; i += step) {
	  for (let j = y; j < y + h; j += step) {
		let index = (j * image.width + i) * 4;
		
		let alpha = image.pixels[index + 3];
		if (alpha > 0) { 
		  r += image.pixels[index];
		  g += image.pixels[index + 1];
		  b += image.pixels[index + 2];
		  count++;
		}
	  }
	}
	// Avoid division by zero if no opaque pixels were found
	if (count === 0) return color(0, 0, 0, 0); 
  
	// Calculate average RGB values
	r = r / count;
	g = g / count;
	b = b / count;
	
	return color(r, g, b);
  }

  function groupByColor(regions, groups, threshold) {
	
	groups = groups.filter(group =>{return group.length>0})
	regions.forEach(region => {
	  let added = false;
  
	  // Try to place it in an existing group
	  for (let group of groups) {
		let colorDiff = colorDistance(region.avgColor, group[0].avgColor);
		if (colorDiff < threshold) {
		  group.push(region);
		  added = true;
		  break;
		}
	  }
  
	  // If it doesn't fit, create a new group
	  if (!added) {
		groups.push([region]);
	  }
	});
  
	return groups;
  }
  
  // Helper to calculate Euclidean distance in RGB space
  function colorDistance(c1, c2) {
	return dist(red(c1), green(c1), blue(c1), red(c2), green(c2), blue(c2));
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