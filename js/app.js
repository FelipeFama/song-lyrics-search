const form = document.querySelector("#form");
const searchInput = document.querySelector("#search");
const songsContainer = document.querySelector("#songs-container");
const prevAndNextContainer = document.querySelector("#prev-and-next-container");

const apiUrl = `https://api.lyrics.ovh`;

const fetchData = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

const getMoreSongs = async (url) => {
  const data = await fetchData(`https://cors-anywhere.herokuapp.com/${url}`);
  insertSongsIntoPage(data);
};

const insertNextAndPrevButtons = ({ prev, next }) => {
  prevAndNextContainer.innerHTML = `
    ${
      prev
        ? `<button class="btn" onclick="getMoreSongs('${prev}')">Previous</button>`
        : ""
    }
    ${
      next
        ? `<button class="btn" onclick="getMoreSongs('${next}')">Upcoming</button>`
        : ""
    }
  `;
};
const insertSongsIntoPage = ({ data, prev, next }) => {
  songsContainer.innerHTML = data
    .map(
      ({ artist: { name }, title, album: { cover } }) => `
   <li class="song">
     <img src=${cover} alt=${title} />
     <span class="song-artist">
       <strong>${name}</strong> - ${title}
     </span>
     <button class="btn" 
      data-artist="${name}" 
      data-song-title="${title}"
      >
       See lyrics
     </button>
   </li>
  `
    )
    .join("");

  if (prev || next) {
    insertNextAndPrevButtons({ prev, next });
    return;
  }

  prevAndNextContainer.innerHTML = "";
};

const fetchSongs = async (term) => {
  const data = await fetchData(`${apiUrl}/suggest/${term}`);
  insertSongsIntoPage(data);
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  const searchTerm = searchInput.value.trim();
  searchInput.value = "";
  searchInput.focus();

  if (!searchTerm) {
    songsContainer.innerHTML = `<li class="warning-message" >Please enter a valid term.</li>`;
    return;
  }

  fetchSongs(searchTerm);
};

form.addEventListener("submit", handleFormSubmit);

const insertLyricsIntoPage = ({ artist, lyrics, songTitle }) => {
  songsContainer.innerHTML = `
   <li class="lyrics-container">
     <h2><strong>${songTitle}</strong> - ${artist}</h2>
     <p class="lyrics">${lyrics}</p>
   </li>
  `;
};

const fetchLyrics = async (artist, songTitle) => {
  const data = await fetchData(`${apiUrl}/v1/${artist}/${songTitle}`);
  const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "</br>");
  insertLyricsIntoPage({ lyrics, artist, songTitle });
};

const handleSongsContainerClick = (event) => {
  const clickedElement = event.target;

  if (clickedElement.tagName === "BUTTON") {
    const artist = clickedElement.getAttribute("data-artist");
    const songTitle = clickedElement.getAttribute("data-song-title");

    prevAndNextContainer.innerHTML = "";
    fetchLyrics(artist, songTitle);
  }
};

songsContainer.addEventListener("click", handleSongsContainerClick);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then((res) => console.log("service worker registered", res.scope))
      .catch((err) => console.log("service worker not registered", err));
  });
}
