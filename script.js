const imageWrapper = document.querySelector(".images");
const searchInput = document.querySelector(".search input");
const loadMoreBtn = document.querySelector(".gallery .load-more");
const lightbox = document.querySelector(".lightbox");
const downloadImgBtn = lightbox.querySelector(".uil-import");
const closeImgBtn = lightbox.querySelector(".close-icon");
const historyList = document.querySelector(".history-list");
const clearHistoryBtn = document.querySelector(".clear-history");


// API key, paginations, searchTerm variables
const apiKey = "wA4K6dF9VT3quHeF1FlllVfw4bD2nPoP1wKXSohVYbiw5L8jkfrUZWaB";
const perPage = 15;
let currentPage = 1;
let searchTerm = null;
let searchHistory = [];

// Fungsi untuk menambahkan riwayat pencarian
const addToSearchHistory = (searchTerm) => {
    if (!searchHistory.includes(searchTerm)) {
        searchHistory.push(searchTerm);
      }
  };
  
  // Fungsi untuk menampilkan riwayat pencarian
  const updateSearchHistoryUI = () => {
    historyList.innerHTML = searchHistory.map((search, index) =>
    `<li>
      <span class="search-history-item" data-index="${index}">${search}</span>
      <button class="delete-history" data-index="${index}">Delete</button>
    </li>`
  ).join("");

  // Tambahkan event listener untuk melakukan pencarian ketika riwayat pencarian diklik
  const searchHistoryItems = document.querySelectorAll('.search-history-item');
  searchHistoryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const index = e.target.getAttribute("data-index");
      const selectedSearch = searchHistory[index];
      searchInput.value = selectedSearch;
      loadSearchImages({ key: "Enter", target: searchInput }); // Panggil fungsi loadSearchImages dengan key "Enter"
    });
  });
};

  
  // Fungsi untuk menghapus riwayat pencarian berdasarkan indeks
  const deleteSearchHistory = (index) => {
    searchHistory.splice(index, 1);
    updateSearchHistoryUI();
  };
  
  // Tambahkan event listener untuk menghapus riwayat pencarian
  historyList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-history")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      deleteSearchHistory(index);
    }
  });
  
  // Tambahkan event listener untuk membersihkan semua riwayat pencarian
  clearHistoryBtn.addEventListener("click", () => {
    searchHistory = [];
    updateSearchHistoryUI();
  });

const downloadImg = (imgUrl) => {
    // Converting received img to blob, creating its download link, & downloading it
    fetch(imgUrl).then(res => res.blob()).then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = new Date().getTime();
        a.click();
    }).catch(() => alert("Failed to download image!"));
}

const showLightbox = (name, img) => {
    // Showing lightbox and setting img source, name and button attribute
    lightbox.querySelector("img").src = img;
    lightbox.querySelector("span").innerText = name;
    downloadImgBtn.setAttribute("data-img", img);
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
}

const hideLightbox = () => {
    // Hiding lightbox on close icon click
    lightbox.classList.remove("show");
    document.body.style.overflow = "auto";
}

const generateHTML = (images) => {
    // Making li of all fetched images and adding them to the existing image wrapper
    imageWrapper.innerHTML += images.map(img =>
        `<li class="card">
            <img onclick="showLightbox('${img.photographer}', '${img.src.large2x}')" src="${img.src.large2x}" alt="img">
            <div class="details">
                <div class="photographer">
                    <i class="uil uil-camera"></i>
                    <span>${img.photographer}</span>
                </div>
                <div class="button">
                    <button onclick="downloadImg('${img.src.large2x}');">
                        <i class="uil uil-import"></i>
                    </button>
                    <button onclick="addbookmarkImg('${img.src.large2x}');">
                        <i class="uil uil-bookmark"></i>
                    </button>
                </div>
            </div>
        </li>`
    ).join("");
}

const getImages = (apiURL) => {
    // Fetching images by API call with authorization header
    searchInput.blur();
    loadMoreBtn.innerText = "Loading...";
    loadMoreBtn.classList.add("disabled");
    fetch(apiURL, {
        headers: { Authorization: apiKey }
    }).then(res => res.json()).then(data => {
        generateHTML(data.photos);
        loadMoreBtn.innerText = "Load More";
        loadMoreBtn.classList.remove("disabled");
    }).catch(() => alert("Failed to load images!"));
}

const loadMoreImages = () => {
    currentPage++; // Increment currentPage by 1
    // If searchTerm has some value then call API with search term else call default API
    let apiUrl = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
    apiUrl = searchTerm ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}` : apiUrl;
    getImages(apiUrl);
}


const loadSearchImages = (e) => {
    // If the search input is empty, set the search term to null and return from here
    if (e.target.value === "") return searchTerm = null;
    // If pressed key is Enter, update the current page, search term & call the getImages
    if (e.key === "Enter") {
        currentPage = 1;
        searchTerm = e.target.value;
        imageWrapper.innerHTML = "";
        getImages(`https://api.pexels.com/v1/search?query=${searchTerm}&page=1&per_page=${perPage}`);
        addToSearchHistory(searchTerm);

        // Memanggil fungsi untuk mengupdate tampilan riwayat pencarian awal
        updateSearchHistoryUI();

    }
}



getImages(`https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`);
loadMoreBtn.addEventListener("click", loadMoreImages);
searchInput.addEventListener("keyup", loadSearchImages);
closeImgBtn.addEventListener("click", hideLightbox);
downloadImgBtn.addEventListener("click", (e) => downloadImg(e.target.dataset.img));
document.addEventListener("DOMContentLoaded", function() {
    // Tempatkan seluruh kode JavaScript Anda di sini

    // Memuat riwayat pencarian dari localStorage saat halaman dimuat
    const savedSearchHistory = localStorage.getItem('searchHistory');
    if (savedSearchHistory) {
        searchHistory = JSON.parse(savedSearchHistory);
        updateSearchHistoryUI();
    }
});