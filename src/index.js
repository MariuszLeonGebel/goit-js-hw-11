import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';

const axios = require('axios').default;
const URL = 'https://pixabay.com/api/';
const PIXABAY_KEY = '26513861-7ba7a860ef1b492cf85cf7d68';
const pageForm = document.querySelector('form.search-form');
const pageInput = document.querySelector('input[name="searchQuery"]');
const searchButton = document.querySelector('button[type="submit"]');
const loadMoreButton = document.querySelector('button.next');
const loadPreviousButton = document.querySelector('button.prev');
const counter = document.querySelector('.counter');
const imagesPerPage = 4;
let totalPages = 0;
let currentPage = 1;
let dispalyHooray = true;

const galleryPlace = document.querySelector('div.gallery');

async function searchPictures(valuesEntered) {
  try {
    const response = await axios.get(
      `${URL}?key=${PIXABAY_KEY}&q=${valuesEntered}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${imagesPerPage}&page=${currentPage}`,
    );
    return response;
  } catch (error) {
    return error;
  }
}

function createGalleryTags(backendObjects) {
  const markup = backendObjects
    .map(
      backendObj =>
      `<div class="photo-card">
          <a href="${backendObj.largeImageURL}"><img class="gallery__image"
          src = "${backendObj.webformatURL}"
          alt = "${backendObj.tags}"
          loading = "lazy" /></a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b>${backendObj.likes}
            </p>
            <p class="info-item">
              <b>Views</b>${backendObj.views}
            </p>
            <p class="info-item">
              <b>Comments</b>${backendObj.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>${backendObj.downloads}
            </p>
          </div>
        </div>`,
    )
    .join('');
  galleryPlace.innerHTML = markup;
}

const lightbox = new SimpleLightbox('.gallery a', {
  captionSelector: 'img',
  captionsData: 'alt',
  captionDelay: 250,
});

function hideShowButtons() {
  if (currentPage > 0 && currentPage < totalPages) {
    loadMoreButton.classList.replace('load-more--hidden', 'load-more--visible')
  } else {
    loadMoreButton.classList.replace('load-more--visible', 'load-more--hidden');
  }
  if (currentPage > 1) {
    loadPreviousButton.classList.replace('load-more--hidden', 'load-more--visible');
  } else {
    loadPreviousButton.classList.replace('load-more--visible', 'load-more--hidden');
  }
}

const galleryGenerator = (event) => {
  event.preventDefault();

  const inputValue = pageInput.value;
  const valuesEntered = inputValue.split(' ').join('+');
  searchPictures(valuesEntered)
    .then(response => {
      if (response.data.hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        );
        galleryPlace.innerHTML = '';
      } else {
        if (currentPage === 1 && dispalyHooray === true) {
          Notiflix.Notify.info(
            `Hooray! We found ${response.data.totalHits} images.`);
          dispalyHooray = false;
        }
        totalPages = Math.ceil(response.data.totalHits / imagesPerPage);
        counter.textContent = `${currentPage} / ${totalPages}`;
        createGalleryTags(response.data.hits);
        hideShowButtons();
      };
    })
    .catch(error => {
      console.log(error);
    });
};

function loadMoreImages(e) {
  currentPage++;
  galleryGenerator(e);
}

function loadPreviousImages(e) {
  currentPage--;
  galleryGenerator(e);
}

searchButton.addEventListener('click', galleryGenerator);
loadMoreButton.addEventListener('click', loadMoreImages);
loadPreviousButton.addEventListener('click', loadPreviousImages);