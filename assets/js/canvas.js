var imageLoader = document.getElementById('image_loader');
    imageLoader.addEventListener('change', handleImage, false);
var slider = document.getElementById('slice');
    slider.addEventListener('input', getPixels);
var gradientName = document.getElementById("grad_name");
    gradientName.addEventListener('input', getPixels);
var colorInput = document.getElementById("num_colors");
    colorInput.addEventListener('input', getPixels);
var horizontalRadio = document.getElementById("horizontal_radio");
    horizontalRadio.addEventListener('input', getPixels);
var verticalRadio = document.getElementById("vertical_radio");
    verticalRadio.addEventListener('input', getPixels);
var outputText = document.getElementById("output_text");
var canvas = document.getElementById('image_canvas');
var ctx = canvas.getContext('2d');

var bg = new Image();
bg.src = "assets/img/boats.jpg";
bg.onload = function(){
    ctx.drawImage(bg,0,0,512,512);
    ctx.drawImage(bg,0,0,32,32);
    getPixels();
}

function scaleValue(value, from, to) {
	var scale = (to[1] - to[0]) / (from[1] - from[0]);
	var capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
	return ~~(capped * scale + to[0]);
}

function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        tempArray.push("rgba(" + myChunk.toString() + ")");
    }

    return tempArray;
}

function getPixels(){
  var horizontal = horizontalRadio.checked;
  var sliderVal = parseInt(slider.value, 10);
  var numColors = parseInt(colorInput.value, 10);
  // Deal with out of bounds/empty inputs
  if(!Number.isInteger(numColors)){
    numColors = 1;
  }
  if(numColors > 32){
    numColors = 32;
  }
  else if(numColors < 1){
    numColors = 1;
  }
  // Used to get correct pixels from source image and generate gradient preview
  sliderValScaled = scaleValue(sliderVal, [1, 100], [0, numColors - 1]);
  // Redraw Background Image
  ctx.drawImage(bg,0,0,512,512);
  // Draw location indicator
  sliderValScaled512 = scaleValue(sliderVal, [1, 100], [0, 511]);
  ctx.fillStyle = "rgb(255,0,0)";
  if(horizontal){
    ctx.fillRect(0, sliderValScaled512, 512, 1);
  }
  else{
    ctx.fillRect(sliderValScaled512, 0, 1, 512);
  }
  // Draw source image
  ctx.drawImage(bg,0,0,numColors,numColors);
  var pixelData;
  // Get pixels from canvas at top left corner.
  if(horizontal){
    pixelData = canvas.getContext('2d').getImageData(0, sliderValScaled, 32, 1).data;
  }
  else{
    pixelData = canvas.getContext('2d').getImageData(sliderValScaled, 0, 1, 32).data;
  }
  // Split array of pixels into string formatted for gradient preview.
  var pixelsSplit = chunkArray(pixelData, 4);
  outString = "DEFINE_GRADIENT_PALETTE(";
  outString += gradientName.value;
  outString += ") {\n";
  var grd = ctx.createLinearGradient(0, 0, 512, 0);
  for(color = 0; color < numColors; color++){
    if(color == numColors - 1){
      grd.addColorStop(1, pixelsSplit[color]);
    }
    else{
      grd.addColorStop(color*(512/numColors)/512, pixelsSplit[color]);
    }
    outString += scaleValue(color, [0, numColors - 1], [0, 255]).toString();
    outString += ",";
    // Strip the prefix used for the gradient preview and alpha channel
    outString += (pixelsSplit[color].slice(5,-5));
    outString += "\n";
  }

  outString += "};";
  outputText.innerHTML = outString;

  // Draw Gradient Preview
  ctx.fillStyle = grd;
  ctx.fillRect(0, 512, 512, 32);
}

function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        bg = new Image();
        bg.onload = function(){
            ctx.drawImage(bg,0,0,512,512);
            ctx.drawImage(bg,0,0,32,32);
            getPixels();
        }
        bg.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);

}
