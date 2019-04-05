var warpedmap;
var warped_wmslayer;
var maxOpacity = 1;
var minOpacity = 0.1;

function get_map_layer(layerid){
  var newlayer_url = layer_baseurl + "/" + layerid;
  var title = I18n['warped']['warped_layer']+" " + layerid;
  var map_layer =   new ol.layer.Tile({
    visible: false,
    title: title,
    source: new ol.source.TileWMS({
      url: newlayer_url,
      projection:  'epsg:3857',
      params: {'FORMAT': 'image/png',TRANSPARENT: 'true', reproject: 'true', 'STATUS': 'warped', 'SRS': 'epsg:3857', units: "m"}
    })
  })
  map_layer.setVisible(false);

  return map_layer;
}



function warpedinit() {

  //use_tiles usually set when logged out. (quicker and easier to cache these tiles than wms calls)
  if (use_tiles === true){
    warped_wmslayer = new ol.layer.Tile({
      visible: true,
      title: I18n['warped']['warped_map'],
      source: new ol.source.XYZ({
        url: tile_url_templ
      })
    });
  }else{
    warped_wmslayer = new ol.layer.Tile({
      title: I18n['warped']['warped_map'],
      visible: true,
      source: new ol.source.TileWMS({
         url: warpedwms_url,
          projection:  'epsg:3857',
          params: {'FORMAT': 'image/png', 'STATUS': 'warped', 'SRS':'epsg:3857'}
      })
    })
  }
  var opacity = .7;
  warped_wmslayer.setOpacity(opacity);

  var base_layers = [ new ol.layer.Group({
    title: 'Base Layer',
    layers: [ new ol.layer.Tile({ 
      title: 'OpenStreetMap',
      type: 'base',
      visible: true,
      source: new ol.source.OSM() 
    }) ]
    })
  ] ;

  var overlays = [warped_wmslayer]

  // any mosaics if there are any that the map belongs to
  for (var i = 0; i < layers_array.length; i++) {
    overlays.push(get_map_layer(layers_array[i]));
  }

  var overlay_layers = [
    new ol.layer.Group({
      title: 'Overlays',
      layers:  overlays 
    })
  ];

  var layers = base_layers.concat(overlay_layers); 

  warpedmap = new ol.Map({
    layers: layers,
    target: 'warpedmap',
    view: new ol.View({
      center: ol.extent.getCenter(warped_extent),
      minZoom: 2,
      maxZoom: 20,
      zoom: 4
    })
  });

  var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel: 'Layers' 
  });
  warpedmap.addControl(layerSwitcher);

  // if (typeof (G_SATELLITE_MAP) != 'undefined') {
  //   var gms1 = new OpenLayers.Layer.Google( "Google Satellite", {type: G_SATELLITE_MAP, 'sphericalMercator': true, numZoomLevels: 20}); 
  //   warpedmap.addLayers([gms1]);
  // }

  var extent;
  if (mask_geojson) {
    var vectorSource = new ol.source.Vector({
      features: (new ol.format.GeoJSON()).readFeatures(mask_geojson)
    });
    extent = vectorSource.getExtent();
  } else {
    extent = ol.proj.transformExtent(warped_extent, 'EPSG:4326', 'EPSG:3857');
  }
  warpedmap.getView().fit(extent, warpedmap.getSize()); 
  

  //set up slider
  jQuery("#slider").slider({
      value: 100 * opacity,
      range: "min",
      slide: function(e, ui) {
          warped_wmslayer.setOpacity(ui.value / 100);
          OpenLayers.Util.getElement('opacity').value = ui.value;
      }
  });


}


