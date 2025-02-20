# Leaflet.heatpaths

A simple plugin to display overlaying paths as heatmaps, in order to visually highlight the most shared parts of these paths.

Standing on the shoulders of giants: largely inspired by [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) and [simpleheat](https://github.com/mourner/simpleheat), which are great for individual points, but require a lot of additional processing in order to display paths (such as filling in the blanks with intermediary points between a polyline's points).

## Demo

TODO

## Usage

```js
var paths = [
    [
        [42.5, -1.2],
        [42.6, -1.2],
        [42.5, -1.1],
    ],
    L.polyline([
        [42.5, -1.2],
        [42.6, -1.2],
        [42.7, -1.2]
    ]),
    L.circle([42.4, -1.3], {radius: 30}),
    ...
]

var heatpaths = L.heatpathsLayer(paths, {width: 3}).addTo(map);
```

To include the plugin, just use `leaflet-heatpaths.js` from the dist folder:

```html
<script src="leaflet-heatpaths.js"></script>
```

## Building

TODO

## Reference

#### L.heatpathsLayer(paths, options)

Construct a heatpaths layer given an array of paths and an object with the following options:
- **max** - maximum path intensity, `10`  by default
- **gradient** - color gradient config, e.g. `{0.4: 'blue', 0.65: 'lime', 1: 'red'}`
- **pane** - map pane where the heatpaths will be drawn, `overlayPane` by default

#### paths

The paths MUST be created with a Canvas renderer, with 0 padding, for instance:
```js
p = L.polyline([
        [42.5, -1.2],
        [42.6, -1.2],
        [42.7, -1.2]
    ],
    {
        renderer: L.canvas({padding: 0})
    })
```

A [solution](https://github.com/canvg/canvg) might exist to handle SVG-renderer paths, but is not implemented at this point.
