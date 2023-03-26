// import axios from 'axios';
// // Збереження ключа API в окремому файлі змінних
// import { KEY } from './api-key.js';

// // Перевірка помилок під час виконання запиту до серверу
// axios.defaults.baseURL = 'https://pixabay.com/api/';
// axios.interceptors.response.use(
//   response => {
//     return response;
//   },
//   error => {
//     Notiflix.Notify.failure('Something went wrong. Please try again later.');
//     return Promise.reject(error);
//   },
// );

// async function fetchImages(query, page, perPage) {
//   const response = await axios.get(
//     `?key=${KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
//   );
//   return response.data;
// }

// export { fetchImages };
export function createMarkup(photos) {
    return photos
      .map(
        ({
          tags,
          webformatURL,
          largeImageURL,
          likes,
          views,
          comments,
          downloads,
        }) => {
          return /*html*/ `
              <a href='${largeImageURL}' class="card-link js-card-link">
              <div class="photo-card">
                <img class="photo" src="${webformatURL}" alt="${tags}" loading="lazy" />
                <div class="info">
                  <div class="info-item info-item-likes">
                    <button type="button" class="circle" onclick="style.boxShadow='inset -1px -1px 3px white, inset 1px 1px 3px rgba(0, 0, 0, 0.1)'">
                      <i class="bi bi-heart-fill" onclick="style.color='#ff0000'"></i>
                    </button>
                    <div class="box-likes"><b>Likes</b>
                    <span id="value">${likes}</span>
                    </div>
                    
                  </div>
                  <p class="info-item">
                    <b>Views</b>
                    ${views}
                  </p>
                  <p class="info-item">
                    <b>Comments</b>
                    ${comments}
                  </p>
                  <p class="info-item">
                    <b>Downloads</b>
                    ${downloads}
                  </p>
                </div>
              </div>
              </a>`;
        }
      )
      .join('');
  }