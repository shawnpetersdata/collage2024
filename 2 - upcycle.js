let sources = []
let bg
let base
let overlay
let groups = []

function preload() {
    for (let i = 0; i<14;i++) {
        sources.push(loadImage(`resources/red/${i}.png`))
    }
    base = loadImage('resources/carcutout.png')
    bg = loadImage('resources/backdrop.jpg')
}

function setup() {
    const dim = min(windowWidth, windowHeight)
    createCanvas(dim,dim)
    let scl = min(width / base.width, height / base.height);

    base.resize(base.width * scl, base.height * scl)
    bg.resize(bg.width*scl,bg.height*scl)
    overlay = createGraphics(base.width,base.height)

    cutSections(5000, [])
    overlay.imageMode(CENTER)
    base.pixelDensity(1)
    base.loadPixels()
    let pieces = []
    for (let i = 0; i < overlay.width; i +=30) {
        for (let j = 0; j < overlay.height; j +=30) {
            let index = (j * overlay.width + i) * 4;
            if (base.pixels[index+3] == 0) {
                continue
            }
            let pixelColor = color(base.pixels[index],base.pixels[index+1],base.pixels[index+2])    
            
            let img = getSimilarImage(pixelColor)
            pieces.push({img:img, x:i, y:j})
        }
    }
    for (let i = 0; i<500; i++) {
        let x = Math.floor(random(overlay.width))
        let y = Math.floor(random(overlay.height))
        let index = (y * overlay.width + x) * 4;
        if (base.pixels[index+3] == 0) {
            continue
        }
        let pixelColor = color(base.pixels[index],base.pixels[index+1],base.pixels[index+2])    
            
            let img = getSimilarImage(pixelColor)
            pieces.push({img:img, x:x, y:y})
    }

    shuffle(pieces, true)

    for (const {img,x,y} of pieces) {
        overlay.push()
        overlay.translate(x,y)
        overlay.rotate(random(TWO_PI))
        overlay.image(img,0,0)
        overlay.pop()
    }

}

function getSimilarImage(colour) {
    let closest = Infinity;
    let img = null;
    let selectedGroupIndex = -1;
    let selectedImageIndex = -1;

    // Iterate over each group and their images
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        let group = groups[groupIndex];
        for (let imageIndex = 0; imageIndex < group.length; imageIndex++) {
            let dist = colorDistance(colour, group[imageIndex].avgColor);
            if (dist < closest) {
                closest = dist;
                img = group[imageIndex].img;
                selectedGroupIndex = groupIndex;
                selectedImageIndex = imageIndex;
            }
        }
    }

    // Remove the selected image from the group if found
    if (selectedGroupIndex !== -1 && selectedImageIndex !== -1) {
        groups[selectedGroupIndex].splice(selectedImageIndex, 1);
        
        // Check if the group is empty after removing the image
        if (groups[selectedGroupIndex].length === 0) {
            groups.splice(selectedGroupIndex, 1); // Remove the empty group
        }
    }

    return img;
}

function draw() {
    noLoop()
    imageMode(CENTER)
    image(bg,width/2,height/2)
    image(overlay,width/2,0.57*height)    
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
	groups = groupByColor(pieces, group, 5)
}

function getRandomRegion(img) {
	let x = floor(random(img.width - 50));
	let y = floor(random(img.height - 50));
	let w = floor(random(30, 100));
	let h = floor(random(30, 100));

	let mask = createGraphics(w, h);
	mask.clear();

	mask.beginShape();
	const points = Math.floor(random(3,8))
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