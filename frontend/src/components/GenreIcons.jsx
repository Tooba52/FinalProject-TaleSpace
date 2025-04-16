import React from "react";
import Action from "../images/action.png";
import Adventure from "../images/adventure.png";
import Animal from "../images/animal.png";
import Apocalypse from "../images/apocalypse.png";
import Comedy from "../images/crime.png";
import Crime from "../images/crime.png";
import Cyberpunk from "../images/cyberpunk.png";
import Drama from "../images/drama.png";
import Dystopian from "../images/dystopian.png";
import Fairytale from "../images/fairytale.png";
import Fantasy from "../images/fantasy.png";
import Fiction from "../images/fiction.png";
import Gothic from "../images/gothic.png";
import Heartbreak from "../images/heartbreak.png";
import Historical from "../images/historical.png";
import Horror from "../images/horror.png";
import Musical from "../images/musical.png";
import Mystery from "../images/mystery.png";
import Mythology from "../images/mythology.png";
import Paranormal from "../images/paranormal.png";
import Romance from "../images/romance.png";
import SciFi from "../images/scifi.png";
import SliceOfLife from "../images/sliceoflife.png";
import Sports from "../images/sports.png";
import Steampunk from "../images/steampunk.png";
import Supernatural from "../images/supernatural.png";
import Thriller from "../images/thriller.png";
import "../styles/GenreIcons.css";

const genreImages = {
  Action: Action,
  Adventure: Adventure,
  Animal: Animal,
  Comedy: Comedy,
  Crime: Crime,
  Cyberpunk: Cyberpunk,
  Drama: Drama,
  Dystopian: Dystopian,
  "Fairy Tale": Fairytale,
  Fiction: Fiction,
  Fantasy: Fantasy,
  Gothic: Gothic,
  Heartbreak: Heartbreak,
  Horror: Horror,
  Historical: Historical,
  Musical: Musical,
  Mythology: Mythology,
  Mystery: Mystery,
  Paranormal: Paranormal,
  "Post-Apocalyptic": Apocalypse,
  Romance: Romance,
  "Sci-Fi": SciFi,
  "Slice of Life": SliceOfLife,
  Sports: Sports,
  Steampunk: Steampunk,
  Supernatural: Supernatural,
  Thriller: Thriller,
};

const GenreIcon = ({ genre, onClick }) => {
  const imageSrc = genreImages[genre];

  return (
    <div className="genre-container">
      <div className={`genre-card`} onClick={onClick}>
        <div className="genre-icon-container">
          {imageSrc ? (
            <img src={imageSrc} alt={genre} className="genre-image" />
          ) : (
            <div className="genre-emoji">🎭</div>
          )}
        </div>
      </div>
      <p className="genre-name">{genre}</p>
    </div>
  );
};
export default GenreIcon;
