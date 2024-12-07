/**
 * Javascript function for Shortcode listmarker.
 *
 * @package Extensions for Leaflet Map
 */

/**
 * Create Javascript code for listmarker.
 */

function leafext_listmarker_js(overiconurl,collapse,update,hover,maxheight,maxwidth) {
	var map          = window.WPLeafletMapPlugin.getCurrentMap();
	let markerlength = WPLeafletMapPlugin.markers.length;
	if ( markerlength > 0 ) {
		map.on(
			"update-end",
			function (e) {
				//console.log("update-end", map.options._collapse);
				if (leafext_map_popups( map ) ) {
					for (var i = 0; i < markerlength; i++) {
						let thismarker = WPLeafletMapPlugin.markers[i];
						if (thismarker.getPopup()) {
							if (thismarker.getPopup().isOpen()) {
								let thistitle = thismarker.options.listtitle + " ";
								//console.log("map update",thistitle);
								leafext_set_list_background( map, thistitle, "rgba(255, 255, 255, 0.8)", false );
							} else {
								leafext_set_origicon( thismarker );
							}
						}
					}
				}
			}
		);

		// marker with popup open don't get into cluster sometimes
		map.on(
			"zoomstart",
			function (e) {
				// console.log("zoomstart");
				map.eachLayer(
					(l) =>
					{
						if ( l instanceof L.Marker ) {
							if (l.__parent) {
								// console.log("cluster");
								leafext_close_popups( map );
								// } else {
								// 	console.log("no cluster");
							}
						}
					}
				);
			}
		);

		var markersLayer = new L.LayerGroup();	//layer contain searched elements
		for (var i = 0; i < markerlength; i++) {
			let thismarker = WPLeafletMapPlugin.markers[i];
			//console.log("thismarker",thismarker);
			thismarker.options.riseOnHover = true;
			thismarker._origicon           = thismarker.getIcon();
			let markeroptions              = thismarker.getIcon().options;
			if (overiconurl == "") {
				thismarker._overicon = thismarker.getIcon();
			} else {
				var markericon       = L.Icon.extend(
					{
						options: markeroptions,
					}
				);
				overicon             = new markericon(
					{
						iconUrl: overiconurl,
					}
				);
				thismarker._overicon = overicon;
			}
			thismarker.options.listtitle = thismarker.options.title;

			// hide default tooltip
			leafext_unbind_title( thismarker );

			thismarker.on(
				"mouseover",
				function (e) {
					if (leafext_map_popups( map ) == false) {
						let thistitle = e.sourceTarget.options.listtitle + " ";
						// console.log("mouseover: "+thistitle);
						if (hover == true) {
							leafext_set_list_background( map, thistitle, "rgba(255, 255, 255, 0.8)", true );
						}
						leafext_set_overicon( e.sourceTarget, false, true );
					}
				}
			);
			thismarker.on(
				"mouseout",
				function (e) {
					if (leafext_map_popups( map ) == false) {
						let thistitle = e.sourceTarget.options.listtitle + " ";
						// console.log("marker mouseout: "+thistitle);
						if (hover == true) {
							leafext_set_list_background( map, thistitle, "", false );
						}
						leafext_set_origicon( e.sourceTarget );
					}
				}
			);
			thismarker.on(
				"click",
				function (e) {
					let thistitle = e.sourceTarget.options.listtitle + " ";
					//console.log("marker click",thistitle);
					leafext_set_overicon( e.sourceTarget, true, false );
					leafext_set_list_background( map, thistitle, "rgba(255, 255, 255, 0.8)", true, map );
				}
			);
			thismarker.on(
				"popupopen",
				function (e) {
					let thistitle = e.sourceTarget.options.listtitle;
					//console.log("popupopen",thistitle);
					leafext_unbind_all_tooltips();
				}
			);
			thismarker.on(
				"popupclose",
				function (e) {
					let thistitle = e.sourceTarget.options.listtitle + " ";
					//console.log("popupclose",thistitle);
					leafext_set_list_background( map, thistitle, "", false );
					leafext_set_origicon( e.sourceTarget );
				}
			);

			markersLayer.addLayer( thismarker );
			map.removeLayer( thismarker );
		}
		// console.log(markersLayer);
		map.addLayer( markersLayer );

		//inizialize Leaflet List Markers
		var list = new L.Control.ListMarkers(
			{
				layer: markersLayer,
				itemIcon: null,
				collapsed: collapse,
				label: 'listtitle',
				update: update,
				maxheight: maxheight,
				maxwidth: maxwidth,
				maxItems: markerlength + 1
			}
		);
		list.on(
			"item-mouseover",
			function (e) {
				if (leafext_map_popups( map ) == false) {
					e.layer.fire( "mouseover" );
				}
			}
		);
		list.on(
			"item-mouseout",
			function (e) {
				if (leafext_map_popups( map ) == false) {
					e.layer.fire( "mouseout" );
				}
			}
		);
		list.on(
			"item-click",
			function (e) {
				leafext_close_popups( map );
				let thistitle = e.layer.options.listtitle + " ";
				//console.log("item-click",thistitle);
				leafext_set_list_background( "rgba(255, 255, 255, 0.8)", thistitle, false, map );
				//leafext_set_list_background (map, thistitle, "yellow", true, "item-click");
				leafext_set_overicon( e.layer, false, false );
				thismapbounds = [];
				leafext_target_latlng_marker_do( map,e.layer.getLatLng().lat,e.layer.getLatLng().lng,e.layer.getPopup(),map.getZoom(),false );
			}
		);
		map.addControl( list );
	}
}

function leafext_close_tooltip(map) {
	map.eachLayer(
		function (layer) {
			if (layer.options.pane === "tooltipPane") {
				layer.removeFrom( map );
				//console.log("removed");
			}
		}
	);
}

function leafext_unbind_title(thismarker) {
	thismarker.unbindTooltip();
	thismarker.bindTooltip( "", {visibility: 'hidden', opacity: 0} ).closeTooltip();
	thismarker.options.title = "";
}

function leafext_close_popups(map) {
	map.eachLayer(
		function (layer) {
			if (layer.options.pane === "popupPane") {
				layer.removeFrom( map );
				// console.log("leafext_close_tooltips");
			}
		}
	);
}

function leafext_unbind_all_tooltips() {
	let markerlength = WPLeafletMapPlugin.markers.length;
	for (var i = 0; i < markerlength; i++) {
		let thismarker = WPLeafletMapPlugin.markers[i];
		leafext_unbind_title( thismarker );
	}
}

function leafext_set_list_background( map, thistitle, farbe, scroll ) {
	let lis       = document.querySelectorAll( "a" );
	let lislength = lis.length;
	for (let i = 0; i < lislength; i++) {
		let a = lis[i];
		if (a.text.includes( thistitle )) {
			if ( scroll ) {
				//a.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
				a.scrollIntoView( { behavior: 'smooth', block: 'nearest', inline: 'end' } );
			}
			a.style.backgroundColor = farbe;
		}
	}
}

function leafext_set_origicon( thismarker ) {
	thismarker.setIcon( thismarker._origicon );
	thismarker.closeTooltip();
}

function leafext_set_overicon( thismarker, popup, tooltip ) {
	thismarker.setIcon( thismarker._overicon );
	if ( popup ) {
		thismarker.openPopup();
	}
	if (tooltip) {
		thismarker.bindTooltip( thismarker.options.listtitle ,{className: 'leafext-tooltip'} );
		thismarker.openTooltip();
	}
}
