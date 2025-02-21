L.HeatpathsLayer = L.Layer.extend({

  options: {
    max: 10,
    gradient: {
      0.4: 'blue',
      0.6: 'cyan',
      0.7: 'lime',
      0.8: 'yellow',
      1.0: 'red'
    }
  },

  initialize: function(paths, options) {
    this._paths = paths;
    L.setOptions(this, options);
  },

  setPaths: function(paths) {
    this._paths = paths;
    return this.redraw();
  },

  addPath: function(path) {
    this._paths.push(path);
    return this.redraw();
  },

  setOptions: function(options) {
    L.setOptions(this, options);
    return this.redraw();
  },

  getBounds: function() {
    for (var i = 0, bound = L.latLngBounds(); i < this._paths.length; i++) {
      bounds = bounds.extend(_paths[i].getBounds());
    }
    return bounds;
  },

  redraw: function() {
    if (!this._frame && this._map && !this._map._animating) {
      this._paths.map((p) => p.addTo(this._map));
      this._frame = L.Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  },

  onAdd: function(map) {
    this._map = map;

    if (!this._canvas) {
      this._initCanvas();
    }

    if (!this._gradient) {
      this._initGradient(this.options.gradient);
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas);
    }
    else {
      map._panes.overlayPane.appendChild(this._canvas);
    }

    map.on('moveend', this.redraw, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
    }

    this.redraw();
  },

  onRemove: function(map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    }
    else {
      map._panes.overlayPane.removeChild(this._canvas);
    }

    map.off('moveend', this.redraw, this);

    if (map.options.zoomAnimation) {
        map.off('zoomanim', this._animateZoom, this);
    }
  },

  addTo: function(map) {
    map.addLayer(this);
    return this;
  },

  _initCanvas: function() {
    var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-heatpaths-layer leaflet-layer');

    var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
    canvas.style[originProp] = '50% 50%';

    var size = this._map.getSize();
    canvas.width  = size.x;
    canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

  },

  _initGradient: function(grad) {
    var canvas = this._createCanvas(),
      ctx = canvas.getContext('2d', {willReadFrequently: true}),
      gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;

    for (var i in grad) {
      gradient.addColorStop(+i, grad[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);

    this._grad = ctx.getImageData(0, 0, 1, 256).data;

    return this;
  },

  _reset: function() {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    var size = this._map.getSize();

    if (this._width !== size.x) {
      this._canvas.width = this._width  = size.x;
    }
    if (this._height !== size.y) {
      this._canvas.height = this._height = size.y;
    }
  },

  _redraw: function() {
    if (!this._map) {
      return;
    }

    this._reset();

    var i, len, j, len2, path, opacityImageData, opacitySumArray = [], coloredImageData;
    var opacitySumArray = new Array(this._width * this._height).fill(0);

    for (i = 0, len = this._paths.length; i < len; i++) {
      path = this._paths[i];
      pathImageData = path._renderer._ctx.getImageData(0, 0, this._width, this._height).data;

      for (j = 0, len2 = pathImageData.length / 4; j < len2; j++) {
        var opacity = pathImageData[4*j+3];
        opacitySumArray[j] += opacity;
      }
      path.remove();
    }

    coloredImageData = new ImageData(this._getColoredImageData(opacitySumArray), this._width, this._height);
    this._canvas.getContext('2d').putImageData(coloredImageData, 0, 0);

    this._frame = null;
  },

  _getColoredImageData(opacitySumArray) {
    var coloredImageData = new Uint8ClampedArray(opacitySumArray.length * 4);

    for (var i = 0, len = opacitySumArray.length, j; i < len; i++) {
      j = Math.min(opacitySumArray[i] * 4, 1023);

      coloredImageData[4*i] = this._grad[j];
      coloredImageData[4*i+1] = this._grad[j+1];
      coloredImageData[4*i+2] = this._grad[j+2];
      coloredImageData[4*i+3] = opacitySumArray[i];
      //coloredImageData[4*i+3] = 255
    }

    return coloredImageData;
  },

  _createCanvas: function() {
    if (typeof document !== 'undefined') {
      return document.createElement('canvas');
    } else {
      // create a new canvas instance in node.js
      // the canvas class needs to have a default constructor without any parameter
      return new this._canvas.constructor();
    }
  },


  _animateZoom: function(e) {
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

    if (L.DomUtil.setTransform) {
      L.DomUtil.setTransform(this._canvas, offset, scale);

    } else {
      this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
    }
  }

});

L.heatpathsLayer = function(paths, options) {
  return new L.HeatpathsLayer(paths, options);
};
