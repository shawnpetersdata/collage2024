let flyers = []
let groups = []
let contents = []
let content
let bg
let fridge, door

function preload() {
	for (let i = 0; i<=54;i++) {
		flyers.push(loadImage(`resources/grocery flyers/${i}.jpg`))
	}
	for (let i =0; i<5;i++) {
		contents.push(loadImage(`resources/fridgeContents/${i}.jpg`))
	}
	fridge = loadImage("resources/fridge/fridge1.png")
	door = loadImage("resources/fridge/fridgedoor1.png")
}

function setup() {
	let dim = min(windowWidth,windowHeight)
	createCanvas(dim, dim, { willReadFrequently: true });
	bg = createGraphics(dim,dim)
	bg.background(0)
	bg.imageMode(CENTER)
	
	cutSections(2000, [])

	for (let x = 0; x<width;x+=30) {
		for (let y = 0; y<height; y+=30) {

			
			let choice = Math.floor(map(Math.abs(0.5-noise(x/100,y/100)),0,0.5,0,groups.length))
			
			if (groups[choice].length ==0) {
					
				groups.splice(choice, 1);
				
				continue
			}
			let temp = groups[choice].pop()

			bg.push()
			bg.translate(x,y)
			bg.rotate(random(TWO_PI))
			bg.image(temp.img,0,0)
			bg.pop()
		}
	}

	for (let i = 0; i<100;i++) {
		let x = random(width)
		let y = random(height)
		let choice = Math.floor(map(Math.abs(0.5-noise(x/100,y/100)),0,0.5,0,groups.length))
			
		if (groups[choice].length ==0) {
				
			groups.splice(choice, 1);
			
			continue
		}

		let temp = groups[choice].pop()
		
		bg.push()
		bg.translate(x,y)
		bg.rotate(random(TWO_PI))
		bg.image(temp.img,0,0)
		bg.pop()
	}

	
	
	

	const fridgeH = 0.9 * height;
	const fridgeW = fridge.width * (fridgeH / fridge.height); 
	fridge.resize(fridgeW, fridgeH);

	bg.image(fridge,width/2,height/2)
	door.resize(0.93*fridge.width,0.67*fridge.height)
	
	image(bg,0,0)
	content = random(contents)

	
}
function draw()
{
	//noLoop()
	frameRate(5)
	const imgW = 0.93*fridge.width
	const imgH = 0.67*fridge.height
	imageMode(CENTER)
	rectMode(CENTER)
	fill(255,100)
	push()
	beginClip()
	rect(width/2,0.63*height,imgW,imgH)
	endClip()
	let wRatio = imgW / content.width
	let hRatio = imgH / content.height
	let scl = max(wRatio, hRatio)
	image(content,width/2,0.63*height,content.width*scl,content.height*scl)
	pop()
	push()
	translate(width/2,0.63*height)
	beginClip()
	
	beginShape()
	let open = Math.abs(sin(frameCount/10))
	if (open < 0.05) {
		content = random(contents)
	}
	vertex(map(open,0.25,0.5,-door.width/2,door.width/2,true),map(open,0.25,0.5,-door.height/2,door.height/2,true))
	vertex(map(open,0.25,0.5,-door.width/2,door.width/2,true),door.height/2)
	vertex(door.width/2,door.height/2)
	vertex(door.width/2,-door.height/2)
	endShape(CLOSE)
	endClip()
	image(door,0,0)	
	pop()
}

function cutSections(amount, group) {
	let pieces = []
	for (let i = 0; i<amount;i++) {
		let temp = getRandomRegion(random(flyers))
		if (!isRegionEmpty(temp.img)) {
			pieces.push(temp)
		}
	}
	groups = groupByColor(pieces, group, 75)

	//shuffle(groups,true)
	/*
	groups.sort((a, b) => {
		// Calculate hue for the first color in each group
		let hueA = hue(a[0].avgColor);
		let hueB = hue(b[0].avgColor);
		return hueA - hueB; // Ascending order by hue
	  });
	  //let splitIndex = Math.floor(random(groups.length/2))
	  //groups = groups.splice(splitIndex,splitIndex+Math.floor(groups.length/2))
*/

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
	let w = floor(random(30, 200));
	let h = floor(random(30, 200));

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
	//return region
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