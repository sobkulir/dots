let name = "steganosnapshot";

let exported;
(function() {
  'use strict';

  let config =  {
    prefix: "|Steganosnapshot|",
    versionString:"|version 0.1.2|",
      suffix: `|Steganosnapshot|`+`|end|`,
      possibleValuesPerPixelRGBAComponent: 2      //doesnt work yet with value other than 2
  };

  exported = (sketch) => {
    sketch.createSnapshot = (name="sketch") => {

      let thissrc = config.prefix+config.versionString + new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML + config.suffix;
      var uint8array = new TextEncoder("utf-8").encode(thissrc);
      sketch.loadPixels();
      //sketch.resizeCanvas(sketch.width,Math.ceil(sketch.width+uint8array.length/sketch.width));
      let digitLength = 255..toString(config.possibleValuesPerPixelRGBAComponent).length;
      uint8array.forEach((x, i) => {
        x.toString(config.possibleValuesPerPixelRGBAComponent)
          .padStart(digitLength, "0")
          .split("")
          .forEach((digit, index) => {
            let pixelIndex = index + i*digitLength;
            let rgbPixelIndex = Math.floor(pixelIndex/3)+1+pixelIndex;
            let value = sketch.pixels[sketch.pixels.length - 1 - rgbPixelIndex];
            value = value - value % config.possibleValuesPerPixelRGBAComponent + digit * 1;
            sketch.pixels[sketch.pixels.length - 1 - rgbPixelIndex] = value;
          })
      })
      sketch.updatePixels();
      sketch.save(name+".png");
    }
    sketch.loadCodeFromCanvas = (width, height) => {
      let digitLength = 255..toString(config.possibleValuesPerPixelRGBAComponent).length;
      var canvas = document.querySelector('#container canvas');
      var ctx = canvas.getContext('2d');
      console.log(width);
      let data = ctx.getImageData(0, 0,width||canvas.width,height||canvas.height).data;
      let remains = data.map(x => x % config.possibleValuesPerPixelRGBAComponent).reverse().filter((x,i) => i%4!==0);
      let result = new Uint8Array(Math.ceil(remains.length / digitLength));
      for (let i = 0; i <= result.length; i ++) {
        let slice = remains.slice(i*digitLength, (i+1)*digitLength);
        result[i] = parseInt(slice.join(""), config.possibleValuesPerPixelRGBAComponent);
      }

      let text = new TextDecoder("utf-8").decode(result);
      if(text.startsWith(config.prefix)){
        console.log("yes");
        return text.slice(0,text.indexOf(config.suffix));
      }
      return text;
    }
    sketch.loadCodeFromFile = (filename="./sketch.png") => {
      sketch.clear();
      sketch.loadImage(filename,(img) => sketch.image(img,0,0));
    }
  }



// amd
if (typeof define !== 'undefined' && define.amd) define(function() {return exported;});
// common js
if (typeof exports !== 'undefined') exports[name] = exported;
// browser
else if (typeof window !== 'undefined') window[name] = exported;
// nodejs
if (typeof module !== 'undefined') {
  module.exports = exported;
}

})();
