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
const bookmarkImages = [];

// Perbarui tampilan Bookmark dan event listener setelah menambahkan gambar ke bookmark
const addToBookmark = (photographer, imgSrc) => {
    // Tambahkan gambar ke daftar Bookmark
    bookmarkImages.push({ photographer, imgSrc });
    // Tampilkan gambar yang ditambahkan ke Bookmark
    const bookmarkList = document.querySelector(".bookmark-list");
    bookmarkList.innerHTML = bookmarkImages.map((img, index) =>
        `<li>
            <img src="${img.imgSrc}" alt="bookmarked-img">
            <span>${img.photographer}</span>
            <button class="remove-bookmark" data-index="${index}">Remove</button>
        </li>`
    ).join("");
    // Tambahkan event listener untuk menghapus gambar dari bookmark
    const removeBookmarkButtons = document.querySelectorAll('.remove-bookmark');
    removeBookmarkButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            removeFromBookmark(index);
        });
    });
}

// Fungsi untuk menghapus gambar dari Bookmark berdasarkan indeks
const removeFromBookmark = (index) => {
    bookmarkImages.splice(index, 1);
    // Perbarui tampilan Bookmark
    const bookmarkList = document.querySelector(".bookmark-list");
    bookmarkList.innerHTML = bookmarkImages.map((img, index) =>
        `<li>
            <img src="${img.imgSrc}" alt="bookmarked-img">
            <span>${img.photographer}</span>
            <button class="remove-bookmark" data-index="${index}">Remove</button>
        </li>`
    ).join("");
    // Tambahkan event listener untuk menghapus gambar dari bookmark
    const removeBookmarkButtons = document.querySelectorAll('.remove-bookmark');
    removeBookmarkButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            removeFromBookmark(index);
        });
    });
}
// Tambahkan event listener untuk menghapus gambar dari bookmark
const removeBookmarkButtons = document.querySelectorAll('.remove-bookmark');
removeBookmarkButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        removeFromBookmark(index);
    });
});

// Fungsi untuk menambahkan pencarian ke riwayat di awal array
const addToSearchHistory = (searchTerm) => {
    if (searchTerm && !searchHistory.includes(searchTerm)) {
        searchHistory.unshift(searchTerm); // Menambahkan item baru di awal array
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
    //Mengkonversi gambar yang diterima menjadi blob, membuat tautan untuk mendownload dan mendownload gambar
    fetch(imgUrl).then(res => res.blob()).then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = new Date().getTime();
        a.click();
    }).catch(() => alert("Failed to download image!"));
}

const showLightbox = (name, img) => {
    // Menampilkan lightbox dan mengatur sumber img, nama dan atribut tombol
    lightbox.querySelector("img").src = img;
    lightbox.querySelector("span").innerText = name;
    downloadImgBtn.setAttribute("data-img", img);
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
}

const hideLightbox = () => {
    // Menyembunyikan lightbox saat ikon tutup diklik
    lightbox.classList.remove("show");
    document.body.style.overflow = "auto";
}

const generateHTML = (images) => {
    // Membuat li dari semua gambar yang diambil dan menambahkannya ke pembungkus gambar yang ada
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
                <button onclick="addToBookmark('${img.photographer}', '${img.src.large2x}');">
                    <i class="uil uil-bookmark"></i>
                </button>
            </div>
        </div>
    </li>`
    ).join("")
    const bookmarkButtons = document.querySelectorAll('.uil-bookmark');
    bookmarkButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const imgSrc = e.target.parentElement.parentElement.parentElement.querySelector('img').src;
            const photographer = e.target.parentElement.parentElement.querySelector('.photographer span').textContent;
            addToBookmark(photographer, imgSrc);
        });
    });
}

const getImages = (apiURL) => {
    // Mengambil gambar melalui panggilan API dengan header otorisasi
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
    currentPage++; // Menambah Halaman saat ini sebesar 1
    // Jika SearchTerm mempunyai nilai tertentu maka panggil API dengan istilah pencarian jika tidak, panggil API default
    let apiUrl = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
    apiUrl = searchTerm ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}` : apiUrl;
    getImages(apiUrl);
}

const loadSearchImages = (e) => {
    // Jika input pencarian kosong, setel istilah pencarian ke null dan kembali dari sini
    if (e.target.value === "") return searchTerm = null;
    // Jika tombol yang ditekan adalah Enter, perbarui halaman saat ini, istilah pencarian & panggil getImages
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
document.addEventListener("DOMContentLoaded", function () {
    // Memuat riwayat pencarian dari localStorage saat halaman dimuat
    const savedSearchHistory = localStorage.getItem('searchHistory');
    if (savedSearchHistory) {
        searchHistory = JSON.parse(savedSearchHistory);
        updateSearchHistoryUI();
    }
});