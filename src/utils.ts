import { Place, PlaceFeature } from "./types";

export function getSource(place: Omit<Place, "source">) {
  if (place.placeType === "Trinkbrunnen") return "drop";
  if (place.placeType === "Tankstelle" || place.placeType === "Späti") return "bag";
  return "circle";
}

export function getLocationState(places: Map<number, Place>): PlaceFeature | undefined {
  const pname = window.location.pathname.split("/");
  if (pname.length !== 3 || pname[1] !== "place") return undefined;

  const place = places.get(parseInt(pname[2]));
  if (!place) return undefined;
  return { source: place.source, id: place.placeId };
}

export function normalizeString(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function rot13(s: string) {
  return s.replace(/[a-zA-Z0-9]/g, (c) => {
    // console.log(c);
    if (!isNaN(+c)) {
      return "" + ((5 + +c) % 10);
    }
    return String.fromCharCode(c.charCodeAt(0) + (c.toUpperCase() <= "M" ? 13 : -13));
  });
}

export function enc(s: string) {
  return btoa(rot13(s));
}

export function dec(s: string) {
  return rot13(atob(s));
}
