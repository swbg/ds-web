import Clock from "../../assets/clock.svg";
import Globe from "../../assets/globe.svg";
import Location from "../../assets/location.svg";
import Phone from "../../assets/phone.svg";
import { OpeningLabels, OpeningStatus, Weekdays } from "../../const";

export function formatPlaceType(placeType: string | undefined) {
  if (!placeType) return "";

  return <p className="info-subtitle">{placeType}</p>;
}

export function googlifyAddress(address: string | undefined) {
  if (!address) return "";

  return (
    <div className="info-element">
      <img src={Location} />
      <a target="_blank" href={`https://www.google.com/maps/place/${encodeURIComponent(address)}/`}>
        {address}
      </a>
    </div>
  );
}

export function formatPhone(phone: string | undefined) {
  if (!phone) return "";

  let p;
  if (phone.slice(0, 3) === "089") {
    p = "089 " + phone.slice(3);
  }
  if (phone.slice(0, 2) === "01") {
    p = phone.slice(0, 4) + " " + phone.slice(4);
  }
  return (
    <div className="info-element">
      <img src={Phone} />
      <a className="a-phone" href={`tel:${phone}`}>
        {p}
      </a>
    </div>
  );
}

export function formatWebsite(website: string | undefined) {
  if (!website) return "";

  return (
    <div className="info-element">
      <img src={Globe} />
      <a target="_blank" href={website}>
        {website}
      </a>
    </div>
  );
}

function getOpeningStatus(hours: string): OpeningStatus {
  const now = new Date();
  const berlinNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const currentDay = Weekdays[berlinNow.getDay()];
  const currentMinutes = berlinNow.getHours() * 60 + berlinNow.getMinutes();

  const dayRegex = new RegExp(`${currentDay}:\\s*(\\d{1,2}:\\d{2})-(\\d{1,2}:\\d{2})`);
  const match = hours.match(dayRegex);
  if (!match) return OpeningStatus.Unknown;

  const [_, startStr, endStr] = match;
  const [startMins, endMins] = [startStr, endStr].map((t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  });

  const isOpen =
    endMins < startMins
      ? currentMinutes >= startMins || currentMinutes <= endMins
      : currentMinutes >= startMins && currentMinutes <= endMins;

  return isOpen ? OpeningStatus.Open : OpeningStatus.Closed;
}

export function formatHours(hours: string | undefined) {
  if (!hours) return "";

  const openingStatus = getOpeningStatus(hours);

  const breakify = (s: string) => {
    const l = s.trim().split("Uhr ");
    if (l.length == 1) {
      return <span>{l[0]}</span>;
    }
    return (
      <table>
        <tbody>
          {l.map((e, i) => {
            const [day, hours] = e.split(": ");
            return (
              <tr key={i}>
                <td>{day}</td>
                <td>{i < l.length - 1 ? hours + "Uhr" : hours}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="info-element">
      <img src={Clock} />
      <div>
        {openingStatus === OpeningStatus.Unknown ? (
          // Fallback if 24/7 open
          <div className="opening-hours open">{breakify(hours)}</div>
        ) : (
          <>
            <div className={`opening-hours ${openingStatus}`}>{OpeningLabels[openingStatus]}</div>
            {breakify(hours)}
          </>
        )}
      </div>
    </div>
  );
}
