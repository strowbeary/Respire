export function Draw2D(context, width, height) {
  this.width = width;
  this.height = height;
  this.context = context;
  this.imgData = this.context.createImageData(width, height);
  this.pixData  = this.imgData.data;
};

Draw2D.prototype.getImageData = function() {
  return this.imgData.data;
};

Draw2D.prototype.clear = function() {
  //this.context.clearRect(0, 0, 300, 300);
  let i = 0;
  for(i; i < this.imgData.data.length; i++) {
    this.imgData.data[i+3] = 0;
  }
};

Draw2D.prototype.text = function(text, x, y) {
  this.context.font = "12px Verdana";
  this.context.fillText(text, x, y);
};

Draw2D.prototype.doneDraw = function() {
  this.context.putImageData(this.imgData, 0, 0 );
};

Draw2D.prototype.update = function(data) {
    for (let i = 0; i < this.pixData.length; i++) {
        this.pixData[i] = data[i];
    }
};
