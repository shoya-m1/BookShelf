document.addEventListener("DOMContentLoaded", function () {
  document.forms["inputBook"].onsubmit = function (event) {
    event.preventDefault();
    addTodo();
    document.forms["inputBook"].reset();
  };

  if (isStorageExist()) {
    loadDataFromStorage();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
});

const books = [];
const SAVED_EVENT = "Saved-Todo-Books";
const STORAGE_KEY = "Todo_Books";
const RENDER_EVENT = "render-todo";
const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
const completeBookshelfList = document.getElementById("completeBookshelfList");
let isEditBook = false;
let editBookId = null;

function saveData() {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("browser Kamu Tidak Mendukung Local Storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      books.push(todo);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  bookShelft(books);
}

function addTodo() {
  const inputBookTitle = document.forms["inputBook"]["inputBookTitle"].value;
  const inputBookAuthor = document.forms["inputBook"]["inputBookAuthor"].value;
  const inputBookYear = Number(document.forms["inputBook"]["inputBookYear"].value);
  const inputBookIsComplete = document.forms["inputBook"]["inputBookIsComplete"].checked;

  if (isEditBook) {
    const editedBook = books.find((book) => book.id === editBookId);
    if (editedBook) {
      editedBook.title = inputBookTitle;
      editedBook.author = inputBookAuthor;
      editedBook.year = inputBookYear;
      editedBook.isComplete = inputBookIsComplete;

      isEditBook = false;
      editBookId = null;
    }
  } else {
    if (books.some((book) => book.title === inputBookTitle)) {
      alert("Judul Buku Sudah Terdaftar");
    } else {
      const book = {
        id: new Date().getTime(),
        title: inputBookTitle,
        author: inputBookAuthor,
        year: inputBookYear,
        isComplete: inputBookIsComplete,
      };

      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  bookShelft(inputSearchBook());
  document.forms["inputBook"].reset();
}

document.forms["searchBook"].onsubmit = (e) => {
  e.preventDefault();
  inputSearchBook();
};

function inputSearchBook() {
  const inputSearch = document.getElementById("searchBookTitle").value.toLowerCase();

  const search = books.filter((book) => {
    return book.title.toLowerCase().includes(inputSearch) || book.author.toLowerCase().includes(inputSearch) || book.year.toString().includes(inputSearch);
  });
  bookShelft(search);

  return search;
}

function bookShelft(result) {
  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  for (const book of result) {
    const bookItem = createBook(book);
    if (book.isComplete) {
      completeBookshelfList.appendChild(bookItem);
    } else {
      incompleteBookshelfList.appendChild(bookItem);
    }
  }
}

function createBook(book) {
  const bookItem = document.createElement("article");
  bookItem.className = "book_item";

  const title = document.createElement("h3");
  title.textContent = book.title;
  bookItem.appendChild(title);

  const author = document.createElement("p");
  author.textContent = book.author;
  bookItem.appendChild(author);

  const year = document.createElement("p");
  year.textContent = book.year;
  bookItem.appendChild(year);

  const buttonAction = document.createElement("div");
  buttonAction.className = "action";
  bookItem.appendChild(buttonAction);

  let buttonProgres;
  if (book.isComplete) {
    buttonProgres = createButton("Belum Selesai Di Baca", "green", () => buttonComplate(book.id));
  } else {
    buttonProgres = createButton("Selesai Dibaca", "green", () => buttonComplate(book.id));
  }
  buttonAction.appendChild(buttonProgres);

  const buttonEdit = createButton("Edit", "blue", () => editBook(book.id));
  buttonAction.appendChild(buttonEdit);

  const buttonRemove = createButton("Hapus Buku", "red", () => removeBook(book.id));
  buttonAction.appendChild(buttonRemove);
  return bookItem;
}

function createButton(text, className, clickHandler) {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add(className);
  button.addEventListener("click", clickHandler);
  return button;
}

function buttonComplate(id) {
  const bookTarget = books.findIndex((book) => book.id === id);
  if (bookTarget !== -1) {
    books[bookTarget].isComplete = !books[bookTarget].isComplete;
    saveData();
    bookShelft(inputSearchBook());
    console.log(bookTarget);
  }
}

function editBook(id) {
  const bookToEdit = books.find((book) => book.id === id);
  if (bookToEdit) {
    isEditBook = true;
    editBookId = id;

    document.forms["inputBook"]["inputBookTitle"].value = bookToEdit.title;
    document.forms["inputBook"]["inputBookAuthor"].value = bookToEdit.author;
    document.forms["inputBook"]["inputBookYear"].value = bookToEdit.year;
    document.forms["inputBook"]["inputBookIsComplete"].checked = bookToEdit.isComplete;
  }
}

function removeBook(id) {
  const bookTarget = books.findIndex((book) => book.id === id);
  if (bookTarget !== -1) {
    alert("Apakah anda yakin akan menghapus buku ini");
    books.splice(bookTarget, 1);
    saveData();
    bookShelft(inputSearchBook());
  }
}
