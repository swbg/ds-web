import { Place } from "../../types";
import { CloseButton } from "../Buttons";
import { formatPlaceType } from "./format";

export default function FountainPanel({
  activePlace,
  unsetActivePlace,
}: {
  activePlace: Place;
  unsetActivePlace: () => void;
}) {
  let source = "";

  if (activePlace.placeType == "Trinkbrunnen") {
    source = "dl-de/by-2-0: Landeshauptstadt München - opendata.muenchen.de";
  }

  return (
    <div className="info-panel">
      <CloseButton onClick={unsetActivePlace} />
      <h3>{activePlace.placeName}</h3>
      {formatPlaceType(activePlace.placeType)}
      <div className="info-divider" />
      {activePlace.note && <div className="info-element">{activePlace.note}</div>}
      <div className="info-element">{source}</div>
    </div>
  );
}
