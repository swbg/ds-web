import { privacyText } from "../../assets/about";
import { AboutState } from "../../const";
import { dec } from "../../utils";
import { CloseButton } from "../Buttons";

const ic = (import.meta.env.VITE_IC as string).split(",").map((c, i) => (
  <span key={i} style={{ display: "block" }}>
    {dec(c)}
  </span>
));

function InfoContent() {
  return (
    <>
      <h3>Die kurze Durststrecke</h3>
      <div className="about-content">
        <p>
          Mit der kurzen Durststrecke findest du schnell und unkompliziert die besten Durstlöscher
          in deiner Nähe - ob Trinkwasserbrunnen, Spätis, Bars, Kioske oder andere Anlaufstellen.
        </p>
        <p>
          Bitte beachte: Da sich Standorte, Angebote und Öffnungszeiten schnell ändern können, sind
          manche Angaben eventuell nicht immer auf dem neuesten Stand. Wir arbeiten kontinuierlich
          daran, die Daten aktuell zu halten und freuen uns über jeden Hinweis aus der Community.
        </p>
      </div>
    </>
  );
}

function ImprintContent() {
  return (
    <>
      <h3>Impressum</h3>
      <div className="about-content">
        <p>{ic}</p>
      </div>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <h3>Datenschutzerklärung</h3>
      <div className="about-content">
        {privacyText.map((c, i) => (
          <p key={i}>{i === 2 ? ic : c}</p>
        ))}
      </div>
    </>
  );
}

export default function AboutPanel({
  showAbout,
  setShowAbout,
}: {
  showAbout: AboutState;
  setShowAbout: React.Dispatch<React.SetStateAction<AboutState>>;
}) {
  return (
    <div className="info-panel">
      <CloseButton onClick={() => setShowAbout(AboutState.None)} />
      {showAbout === AboutState.Info ? (
        <InfoContent />
      ) : showAbout === AboutState.Imprint ? (
        <ImprintContent />
      ) : (
        <PrivacyContent />
      )}
    </div>
  );
}
