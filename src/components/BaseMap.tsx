import maplibregl, { FilterSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useReducer, useRef, useState } from "react";
import { AboutState, Colors, Sources, defaultCenter, defaultZoom } from "../const";
import { fetchData, parseEntries, parsePlaces, parseProducts } from "../data";
import { getMarkerLayout, getMarkerPaint } from "../layout";
import { addPlacesSource, makeClickable, makeHoverable } from "../map";
import { Entry, FilterAction, FilterState, Place, PlaceFeature, Product } from "../types";
import { getLocationState } from "../utils";
import { dec } from "../utils";
import AttribControl from "./AttribControl";
import ControlBar from "./ControlBar";
import AboutPanel from "./panels/AboutPanel";
import InfoPanel from "./panels/InfoPanel";

export default function BaseMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [hideAttrib, setHideAttrib] = useState(false);
  const [showAbout, setShowAbout] = useState<AboutState>(AboutState.None);

  const [places, setPlaces] = useState<Map<number, Place> | null>(null);
  const [entries, setEntries] = useState<Map<number, Entry[]> | null>(null);
  const [products, setProducts] = useState<Map<number, Product> | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const [hoveredPlace, setHoveredPlace] = useState<PlaceFeature | null>(null);
  const [activePlace, setActivePlace_] = useState<PlaceFeature | undefined>(undefined);

  const defaultFilter = {
    source: Sources.reduce((acc, k) => ({ ...acc, [k]: true }), {}),
    // brandName: BrandNames.reduce((acc, k) => ({ ...acc, [k]: true }), {}),
    brandName: [] as string[],
  } as FilterState;
  const filterReducer = (state: FilterState, action: FilterAction) => {
    if (!map.current) return state;
    if (action.group == "source") {
      const newState = {
        ...state,
        [action.group]: { ...state[action.group], [action.key]: action.visible },
      };
      map.current.setLayoutProperty(
        `${action.key}-markers`,
        "visibility",
        action.visible ? "visible" : "none",
      );
      return newState;
    }
    if (action.group == "brandName") {
      const newList = action.visible
        ? [...state[action.group], action.key]
        : state[action.group].filter((key) => key !== action.key);
      const newState = {
        ...state,
        [action.group]: newList,
      };

      const mapFilter = newList.length
        ? ["any", ...newList.map((brandName) => ["in", brandName, ["get", "brandNames"]])]
        : null;
      map.current.setFilter("circle-markers", mapFilter as FilterSpecification);

      return newState;
    }
    return state;
  };
  const [filterState, dispatchFilter] = useReducer(filterReducer, defaultFilter);

  const setActivePlace = (newPlace: PlaceFeature | undefined) => {
    setActivePlace_((activePlace) => {
      if (!map.current) return newPlace;

      if (activePlace) {
        map.current.setFeatureState(activePlace, { selected: false });
        if (!newPlace) history.replaceState(null, "", "/");
      }
      if (newPlace && places?.has(newPlace.id)) {
        const place = places.get(newPlace.id)!;
        map.current.setFeatureState(newPlace, { selected: true });
        history.replaceState(null, "", `/place/${newPlace.id}`);
        dispatchFilter({ group: "source", key: newPlace.source, visible: true });
        map.current.flyTo({
          center: [place.lon, place.lat],
          zoom: Math.max(map.current.getZoom(), 15),
          easing: (t) => 1 - Math.pow(1 - t, 5),
        });
      }
      return newPlace;
    });
  };

  useEffect(() => {
    if (!map.current) return;
    if (hoveredPlace !== null) {
      map.current.setFeatureState(hoveredPlace, { hover: true });
      return () => {
        if (!map.current) return;
        map.current.setFeatureState(hoveredPlace, { hover: false });
      };
    }
  }, [map.current, hoveredPlace]);

  useEffect(() => {
    (async () => {
      // Fetch entries
      const csvString = await fetchData("/entries.txt");
      if (!csvString) return;
      // console.log(enc(csvString));
      setEntries(parseEntries(dec(csvString)));
    })();
    (async () => {
      // Fetch products
      const csvString = await fetchData("/products.txt");
      if (!csvString) return;
      setProducts(parseProducts(dec(csvString)));
    })();
    (async () => {
      // Fetch places
      const csvString = await fetchData("/places.txt");
      if (!csvString) return;
      setPlaces(parsePlaces(dec(csvString)));
      // console.log("setPlaces", places);
    })();
  }, []);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "/osm_clean.json",
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom: 10,
      maxZoom: 19,
      pitchWithRotate: false,
      dragRotate: false,
      touchZoomRotate: true,
      attributionControl: false,
    })
      .addControl(
        new maplibregl.NavigationControl({
          visualizePitch: false,
          showZoom: true,
          showCompass: false,
        }),
      )
      .on("drag", () => setHideAttrib(true));

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.current.addControl(geolocate);
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    map.current.on("load", () => {
      geolocate.trigger();
      // Make sure style has loaded before any data is added
      Promise.all(
        ["marker-circle", "marker-drop", "marker-bag"].map((markerName) => {
          const img = new Image(100, 115);
          img.src = `/${markerName}.png`;
          return new Promise((resolve) => {
            img.onload = () => {
              if (!map.current) return;
              map.current.addImage(markerName, img, { sdf: true });
              resolve(0);
            };
          });
        }),
      ).then(() => setIsMapLoaded(true));
    });
  }, [mapContainer.current]);

  useEffect(() => {
    if (!map.current) return;
    if (!isMapLoaded) return;
    if (!places) return;
    if (!entries) return;
    if (!products) return;

    addPlacesSource(map, "circle", entries, places, products);
    addPlacesSource(map, "drop", null, places, null);
    addPlacesSource(map, "bag", null, places, null);

    map.current.addLayer({
      id: "circle-markers",
      source: "circle",
      type: "symbol",
      layout: {
        ...getMarkerLayout("marker-circle"),
        //
        "text-field": ["get", "placeName"],
        "text-font": ["Open Sans Regular"],
        "text-offset": [0, 0],
        "text-anchor": "top",
        "text-line-height": 1.05,
        "text-optional": true,
      },
      paint: {
        ...getMarkerPaint(),
        "icon-color": [
          // TypeScript makes it hard to generate this dynamically
          "case",
          [
            "any",
            ["to-boolean", ["feature-state", "hover"]],
            ["to-boolean", ["feature-state", "selected"]],
          ],
          Colors.MarkerActive,
          ["!", ["to-boolean", ["get", "priceRating"]]],
          Colors.MarkerGrey,
          ["<", ["get", "priceRating"], 0.38],
          Colors.Marker0,
          ["<", ["get", "priceRating"], 0.45],
          Colors.Marker1,
          ["<", ["get", "priceRating"], 0.48],
          Colors.Marker2,
          ["<", ["get", "priceRating"], 0.56],
          Colors.Marker3,
          Colors.Marker4,
        ],
        //
        "text-halo-width": 1.5,
        "text-halo-color": Colors.Halo,
      },
    });
    map.current.addLayer({
      id: "drop-markers",
      source: "drop",
      type: "symbol",
      layout: getMarkerLayout("marker-drop"),
      paint: {
        ...getMarkerPaint(),
        "icon-color": [
          "case",
          [
            "any",
            ["to-boolean", ["feature-state", "hover"]],
            ["to-boolean", ["feature-state", "selected"]],
          ],
          Colors.MarkerActive,
          Colors.MarkerDrop,
        ],
      },
    });
    map.current.addLayer({
      id: "bag-markers",
      source: "bag",
      type: "symbol",
      layout: getMarkerLayout("marker-bag"),
      paint: {
        ...getMarkerPaint(),
        "icon-color": [
          "case",
          [
            "any",
            ["to-boolean", ["feature-state", "hover"]],
            ["to-boolean", ["feature-state", "selected"]],
          ],
          Colors.MarkerActive,
          Colors.MarkerBag,
        ],
      },
    });

    for (const source of Sources) {
      makeHoverable(map, source, `${source}-markers`, setHoveredPlace);
      makeClickable(map, source, `${source}-markers`, setActivePlace);
    }

    // Parse window location
    setActivePlace(getLocationState(places));

    return () => {
      if (!map.current) return;
      for (const source of Sources) {
        if (map.current.getLayer(`${source}-markers`)) {
          map.current.removeLayer(`${source}-markers`);
        }
        if (map.current.getSource(source)) {
          map.current.removeSource(source);
        }
      }
    };
  }, [map.current, isMapLoaded, places, entries, products]);

  if (!(places && entries && products)) {
    return (
      <div className="map">
        <div className="map-container" ref={mapContainer} />
      </div>
    );
  }

  return (
    <div className="map">
      <div className="map-container" ref={mapContainer} />
      {showAbout !== AboutState.None ? (
        <AboutPanel showAbout={showAbout} setShowAbout={setShowAbout} />
      ) : activePlace ? (
        <InfoPanel
          activePlace={places.get(activePlace.id)!}
          activeEntries={entries.get(activePlace.id)}
          products={products}
          unsetActivePlace={() => setActivePlace(undefined)}
        />
      ) : (
        <ControlBar
          places={places}
          products={products}
          filterState={filterState}
          setActivePlace={setActivePlace}
          dispatchFilter={dispatchFilter}
        />
      )}
      <AttribControl
        hideAttrib={hideAttrib}
        setHideAttrib={setHideAttrib}
        setShowAbout={setShowAbout}
      />
    </div>
  );
}
