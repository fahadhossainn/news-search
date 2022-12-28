// "use strict";
const API_KEY = "93fd81fb24a8051d9ecb7f3250e75e28";
const cors = "https://cors-anywhere.herokuapp.com/";
const containerOverlay = document.querySelector(".overlay");
const contentOverlay = document.querySelector(".content--overlay");
const errorOverlay = document.querySelector(".error--overlay");

const menuIcon = document.querySelector(".sidebar__top--icon");
const searchIcon = document.querySelector(".search__icon");
const form = document.querySelector(".search__form");
const inputBox = document.querySelector(".search__input");
const navigation = document.querySelector(".mobile-menu");
const contentContainer = document.querySelector(".content");
const articleContainer = document.querySelector(".content__article--container");
const contentHeading = document.querySelector(".content__heading");
const prevBtn = document.querySelector(".content__pagination--left");
const nextBtn = document.querySelector(".content__pagination--right");
const items = document.querySelectorAll(".item");
const scrollBtn = document.querySelector(".scroll");
const itemPerPage = 6;
let currentDomain = "latest";

const urlLatest = `${cors}http://api.mediastack.com/v1/news?access_key=${API_KEY}&languages=en`;
const urlBusiness = `${cors}http://api.mediastack.com/v1/news?access_key=${API_KEY}&categories=business&languages=en`;
const urlHealth = `${cors}http://api.mediastack.com/v1/news?access_key=${API_KEY}&categories=health&languages=en`;
const urlScience = `${cors}http://api.mediastack.com/v1/news?access_key=${API_KEY}&categories=science&languages=en`;
const urlSports = `${cors}http://api.mediastack.com/v1/news?access_key=${API_KEY}&categories=sports&languages=en`;

let dataContainer = {
  latest: [],
  currLatest: 1,
  business: [],
  currBusiness: 1,
  health: [],
  currHealth: 1,
  sports: [],
  currSports: 1,
  science: [],
  currScience: 1,
};

const generateData = async () => {
  try {
    let latest, science, business, sports, health;
    [latest, science, business, sports, health] = await Promise.all([
      fetch(urlLatest),
      fetch(urlScience),
      fetch(urlBusiness),
      fetch(urlSports),
      fetch(urlHealth),
    ]);
    [latest, science, business, sports, health] = await Promise.all([
      latest.json(),
      science.json(),
      business.json(),
      sports.json(),
      health.json(),
    ]);
    (dataContainer.latest = latest.data),
      (dataContainer.science = science.data),
      (dataContainer.business = business.data),
      (dataContainer.sports = sports.data),
      (dataContainer.health = health.data);
    renderData(dataContainer.latest, 1);
  } catch (err) {
    renderError();
  }
};

const generateMarkup = (item) => {
  let imageUrl, sourceName, publishedDate, title, description, link;
  title = item.title;
  link = item.url;
  sourceName = item.source;
  imageUrl = !item.image ? "./src/img/fallbackImage.jpg" : item.image;
  description = item.description;
  const date = new Date(item.publishedAt);
  const months = [
    "Jan",
    "Feb",
    "March",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  publishedDate = ` ${
    months[date.getMonth()]
  } ${date.getDate()}  ${date.getFullYear()}`;
  return `
    <div class="article">
    <div class="article__figure">
      <img
        src='${imageUrl}'
        alt="No Image Found"
        class="article__image"
      />
    </div>
    <p class="article__source">source : ${sourceName} </p>
    <p class="article__date">Published At : ${publishedDate}</p>
    <p class="article__title">
      ${title}
    </p>
    <p class="article__description">
      ${description}
    </p>
    <a href="${link}" target="_blank" class="article__button">read more</a>
  </div>
    `;
};
const renderData = (data, currPage) => {
  currPage--;
  const startingPos = currPage * itemPerPage;
  const endingPos = startingPos + itemPerPage;
  data = data.slice(startingPos, endingPos);

  articleContainer.innerHTML = "";
  if (currentDomain === "latest")
    contentHeading.textContent = "Trending news right now";
  else contentHeading.textContent = `trending ${currentDomain} news `;

  data.forEach((item) => {
    const html = generateMarkup(item);
    articleContainer.insertAdjacentHTML("beforeend", html);
  });
};

const renderSearchResults = async (query) => {
  contentHeading.textContent = `Search results for ${query}`;
  let results = await fetch(
    `${cors}http://api.mediastack.com/v1/news?access_key=${API_KEY}&keywords=${query}&languages=en`
  );
  results = await results.json();
  results = results.data;
  if (!results.length) {
    renderSearchError();
  }
  results.forEach((item) => {
    const html = generateMarkup(item);
    articleContainer.insertAdjacentHTML("afterbegin", html);
  });
};
const renderError = () => {
  errorOverlay.classList.remove("hidden");
};
const renderSearchError = () => {
  contentHeading.textContent = "No results found for given keyword....";
};

//////////Event Listeners/////////////////////////////////////////////////////////////////////////

////////Navigation/////////////////////////////////////////
menuIcon.addEventListener("click", (e) => {
  if (navigation.classList.contains("navigation-hidden")) {
    navigation.classList.remove("navigation-hidden");
  } else {
    navigation.classList.add("navigation-hidden");
  }
});
searchIcon.addEventListener("click", (e) => {
  if (inputBox.classList.contains("input-hidden")) {
    inputBox.classList.remove("input-hidden");
  } else {
    inputBox.classList.add("input-hidden");
  }
});

////////rendering Homepage/////////////////////////////////////////

generateData();
window.addEventListener("load", () => {
  items[0].classList.add("item-active");
  prevBtn.classList.add("hidden");
  setTimeout(() => {
    containerOverlay.classList.add("hide-overlay");
  }, 1200);
  setTimeout(() => {
    contentOverlay.classList.add("hidden");
  }, 2500);
});

////////rendering individual Page/////////////////////////////////////////

items.forEach((item) => {
  item.addEventListener("click", (e) => {
    prevBtn.classList.add("hidden");
    nextBtn.classList.remove("hidden");
    inputBox.classList.add("input-hidden");
    contentOverlay.classList.remove("hidden");
    setTimeout(() => {
      contentOverlay.classList.add("hidden");
    }, 1500);
    items.forEach((item) => item.classList.remove("item-active"));
    e.target.classList.add("item-active");
    let target = e.target.textContent.toLowerCase();
    if (target === "home") target = "latest";
    currentDomain = target;
    const data = dataContainer[target];
    renderData(data, 1);
  });
});

////////navigating between different pages/////////////////////////////////////////
[nextBtn, prevBtn].forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const btnName = e.target.textContent.toLowerCase();

    const data = dataContainer[currentDomain];
    const currPage =
      dataContainer[
        "curr" + currentDomain.charAt(0).toUpperCase() + currentDomain.slice(1)
      ];
    let maxPage = Math.floor(data.length / itemPerPage);
    if (maxPage * itemPerPage !== data.length) maxPage++;

    if (btnName === "next") {
      prevBtn.classList.remove("hidden");

      if (currPage === maxPage - 1) {
        nextBtn.classList.add("hidden");
      }
      renderData(data, currPage + 1);
      dataContainer[
        "curr" + currentDomain.charAt(0).toUpperCase() + currentDomain.slice(1)
      ] += 1;
    }
    if (btnName === "prev") {
      nextBtn.classList.remove("hidden");
      if (currPage === 2) {
        prevBtn.classList.add("hidden");
      }
      renderData(data, currPage - 1);
      dataContainer[
        "curr" + currentDomain.charAt(0).toUpperCase() + currentDomain.slice(1)
      ] -= 1;
    }
  });
});

////////searching for specfic news/////////////////////////////////////////

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = inputBox.value;
  if (!query) return;
  inputBox.classList.add("input-hidden");
  contentOverlay.classList.remove("hidden");

  inputBox.value = "";
  articleContainer.innerHTML = "";
  nextBtn.classList.add("hidden");
  prevBtn.classList.add("hidden");
  renderSearchResults(query);
  setTimeout(() => {
    contentOverlay.classList.add("hidden");
  }, 1500);
});

window.addEventListener("scroll", (event) => {
  let scrollTop = this.scrollY;
  if (scrollTop > 200) scrollBtn.classList.remove("hidden");
  else {
    scrollBtn.classList.add("hidden");
  }
});
scrollBtn.addEventListener("click", () => {
  window.scrollTo(0, 0);
});
