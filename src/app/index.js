// import Notiflix from 'notiflix';
// // import SimpleLightbox from 'simplelightbox';
// // import 'simplelightbox/dist/simple-lightbox.min.css';
// import { fetchImages } from './fetchImages';

// const searchForm = document.getElementById('search-form');
// const gallery = document.querySelector('.gallery');

// let query = '';
// let page = 1;
// let simpleLightBox;
// const perPage = 40;

// searchForm.addEventListener('submit', onSearchForm);

// function renderGallery(images) {
//   // Перевірка чи існує галерея перед вставкою даних
//   if (!gallery) {
//     return;
//   }

//   const markup = images
//     .map(image => {
//       const {
//         id,
//         largeImageURL,
//         webformatURL,
//         tags,
//         likes,
//         views,
//         comments,
//         downloads,
//       } = image;
//       return `
//         <a class="gallery__link" href="${largeImageURL}">
//           <div class="gallery-item" id="${id}">
//             <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
//             <div class="info">
//               <p class="info-item"><b>Likes</b>${likes}</p>
//               <p class="info-item"><b>Views</b>${views}</p>
//               <p class="info-item"><b>Comments</b>${comments}</p>
//               <p class="info-item"><b>Downloads</b>${downloads}</p>
//             </div>
//           </div>
//         </a>
//       `;
//     })
//     .join('');

//   gallery.insertAdjacentHTML('beforeend', markup);
//    // Цей код дозволяє автоматично прокручувати сторінку на висоту 2 карток галереї, коли вона завантажується
//    const { height: cardHeight } = document
//      .querySelector('.gallery')
//      .firstElementChild.getBoundingClientRect();

//    window.scrollBy({
//      top: cardHeight * 2,
//      behavior: 'smooth',
//    });
//  }

// function onSearchForm(e) {
//   e.preventDefault();
//   page = 1;
//   query = e.currentTarget.elements.searchQuery.value.trim();
//   gallery.innerHTML = '';

//   if (query === '') {
//     Notiflix.Notify.failure(
//       'The search string cannot be empty. Please specify your search query.',
//     );
//     return;
//   }

//   fetchImages(query, page, perPage)
//     .then(data => {
//       if (data.totalHits === 0) {
//         Notiflix.Notify.failure(
//           'Sorry, there are no images matching your search query. Please try again.',
//         );
//       } else {
//         renderGallery(data.hits);
//         simpleLightBox = new SimpleLightbox('.gallery a').refresh();
//         Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
//       }
//     })
//     .catch(error => console.log(error))
//     .finally(() => {
//       searchForm.reset();
//     });
// }

// function onloadMore() {
//   page += 1;
//   simpleLightBox.destroy();
//   // simpleLightBox.refresh();

//   fetchImages(query, page, perPage)
//     .then(data => {
//       renderGallery(data.hits);
//       simpleLightBox = new SimpleLightbox('.gallery a').refresh();

//       const totalPages = Math.ceil(data.totalHits / perPage);

//       if (page > totalPages) {
//         Notiflix.Notify.failure(
//           "We're sorry, but you've reached the end of search results.",
//         );
//       }
//     })
//     .catch(error => console.log(error));
// }

// function checkIfEndOfPage() {
//   return (
//     window.innerHeight + window.pageYOffset >=
//     document.documentElement.scrollHeight
//   );
// }

// // Функція, яка виконуеться, якщо користувач дійшов до кінця сторінки
// function showLoadMorePage() {
//   if (checkIfEndOfPage()) {
//     onloadMore();
//   }
// }

// // Додати подію на прокручування сторінки, яка викликає функцію showLoadMorePage
// window.addEventListener('scroll', showLoadMorePage);

// // кнопка “вгору”->
// arrowTop.onclick = function () {
//   window.scrollTo({ top: 0, behavior: 'smooth' });
//   // після scrollTo відбудеться подія "scroll", тому стрілка автоматично сховається
// };

// window.addEventListener('scroll', function () {
//   arrowTop.hidden = scrollY < document.documentElement.clientHeight;
// })
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './createMarkup';
import { PixabayAPI } from './PixabayAPI';
import { refs } from './refs';
import { notifyInit } from './notifyInit';
import { spinnerPlay, spinnerStop } from './spinner';

const modalLightboxGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

spinnerPlay();

window.addEventListener('load', () => {
  console.log('All resources finished loading!');

  spinnerStop();
});

refs.btnLoadMore.classList.add('is-hidden');

const pixaby = new PixabayAPI();

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

const loadMorePhotos = async function (entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      pixaby.incrementPage();

      spinnerPlay();

      try {
        spinnerPlay();

        const { hits } = await pixaby.getPhotos();
        const markup = createMarkup(hits);
        refs.gallery.insertAdjacentHTML('beforeend', markup);

        // const showMore = pixaby.hasMorePhotos();
        if (pixaby.hasMorePhotos) {
          const lastItem = document.querySelector('.gallery a:last-child');
          observer.observe(lastItem);
        } else
          Notify.info(
            "We're sorry, but you've reached the end of search results.",
            notifyInit
          );

        modalLightboxGallery.refresh();
        scrollPage();
      } catch (error) {
        Notify.failure(error.message, 'Something went wrong!', notifyInit);
        clearPage();
      } finally {
        spinnerStop();
      }
    }
  });
};

const observer = new IntersectionObserver(loadMorePhotos, options);

const onSubmitClick = async event => {
  event.preventDefault();

  const {
    elements: { searchQuery },
  } = event.target;

  const search_query = searchQuery.value.trim().toLowerCase();

  if (!search_query) {
    clearPage();
    Notify.info('Enter data to search!', notifyInit);

    refs.searchInput.placeholder = 'What`re we looking for?';
    return;
  }

  pixaby.query = search_query;

  clearPage();

  try {
    spinnerPlay();
    const { hits, total } = await pixaby.getPhotos();

    if (hits.length === 0) {
      Notify.failure(
        `Sorry, there are no images matching your ${search_query}. Please try again.`,
        notifyInit
      );

      return;
    }

    const markup = createMarkup(hits);
    refs.gallery.insertAdjacentHTML('beforeend', markup);

    pixaby.setTotal(total);
    Notify.success(`Hooray! We found ${total} images.`, notifyInit);

    if (pixaby.hasMorePhotos) {
      //refs.btnLoadMore.classList.remove('is-hidden');

      const lastItem = document.querySelector('.gallery a:last-child');
      observer.observe(lastItem);
    }

    modalLightboxGallery.refresh();
    // scrollPage();
  } catch (error) {
    Notify.failure(error.message, 'Something went wrong!', notifyInit);

    clearPage();
  } finally {
    spinnerStop();
  }
};

const onLoadMore = async () => {
  pixaby.incrementPage();

  if (!pixaby.hasMorePhotos) {
    refs.btnLoadMore.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
    notifyInit;
  }
  try {
    const { hits } = await pixaby.getPhotos();
    const markup = createMarkup(hits);
    refs.gallery.insertAdjacentHTML('beforeend', markup);

    modalLightboxGallery.refresh();
  } catch (error) {
    Notify.failure(error.message, 'Something went wrong!', notifyInit);

    clearPage();
  }
};

function clearPage() {
  pixaby.resetPage();
  refs.gallery.innerHTML = '';
  refs.btnLoadMore.classList.add('is-hidden');
}

refs.form.addEventListener('submit', onSubmitClick);
refs.btnLoadMore.addEventListener('click', onLoadMore);

//  smooth scrolling
function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.photo-gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

//Button smooth scroll up

window.addEventListener('scroll', scrollFunction);

function scrollFunction() {
  if (document.body.scrollTop > 30 || document.documentElement.scrollTop > 30) {
    refs.btnUpWrapper.style.display = 'flex';
  } else {
    refs.btnUpWrapper.style.display = 'none';
  }
}
refs.btnUp.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});