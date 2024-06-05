const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'Book_Apps';

function isStorageExist(){
    if(typeof(Storage)===undefined){
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(event){
        event.preventDefault();
        addBook();
    });
    if(isStorageExist()){
        localDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, function(){
    console.log(localStorage.getItem(STORAGE_KEY));
});

function addBook(){
    const id = generateID();
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = parseInt(document.getElementById('inputBookYear').value);
    const completed = document.getElementById('inputBookIsComplete').checked;
    const bookObject = generateBookObject(id, title, author, year, completed);
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').checked = false;
}

document.addEventListener(RENDER_EVENT, function(){
    console.log(books);
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML='';
    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML='';
    for(const bookItem of books){
        const bookElement = createBook(bookItem);
        if(!bookItem.isComplete){
            uncompletedBookList.append(bookElement);
        }else{
            completedBookList.append(bookElement);
        }
    }
});

function generateID(){
    return + new Date();
}

function generateBookObject(id, title, author, year, isComplete){
    return{
        id,
        title,
        author,
        year,
        isComplete
    }
}

function saveData(){
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function localDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if(data !== null){
        for(const book of data){
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function createBook(bookObject){
    const textJudul = document.createElement('h3');
    textJudul.innerText = bookObject.title;
    const textPenulis = document.createElement('p');
    textPenulis.innerText = bookObject.author;
    const textDate = document.createElement('p');
    textDate.innerText = bookObject.year;
    const articleContainer = document.createElement('article');
    articleContainer.classList.add('book_item');
    articleContainer.append(textJudul, textPenulis, textDate);
    articleContainer.setAttribute('id', `book-${bookObject.id}`);
    
    const container = document.createElement('div');
    container.classList.add('action');
    if(bookObject.isComplete){
        const backButton = document.createElement('button');
        backButton.classList.add('green');
        backButton.textContent='Belum dibaca';
        backButton.addEventListener('click', function(){
            undoBookFromFinished(bookObject.id);
        });
        const trashButton = document.createElement('button'); 
        trashButton.classList.add('red');
        trashButton.textContent='Hapus buku';
        trashButton.addEventListener('click', function(){
            removeBook(bookObject.id);
        });
        container.append(backButton, trashButton);
        articleContainer.append(container); 
    }else{
        const finishButton = document.createElement('button');
        finishButton.classList.add('green');
        finishButton.textContent='Selesai dibaca';
        finishButton.addEventListener('click', function(){
            addBookFinished(bookObject.id);
        });
        const trashButton = document.createElement('button'); 
        trashButton.classList.add('red');
        trashButton.textContent='Hapus buku';
        trashButton.addEventListener('click', function(){
            removeBook(bookObject.id);
        });
        container.append(finishButton, trashButton);
        articleContainer.append(container); 
    }
    return articleContainer;
    
}

function addBookFinished(bookId){
    const bookTarget = findBook(bookId);
    if(bookTarget === null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId){
    for(const bookItem of books){
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId){
    for(const index in books){
        if(books[index].id === bookId){
            return index;
        }
    }
    return null;
}

function removeBook(bookId){
    const bookTargetIndex = findBookIndex(bookId); 
    if(bookTargetIndex === null) return;
    books.splice(bookTargetIndex, 1); 
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromFinished(bookId){
    const bookTarget = findBook(bookId);
    if(bookTarget === null) return;
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.getElementById('searchBook').addEventListener('input', function(event){
    event.preventDefault();
    searchBook();
});
document.getElementById('searchBook').addEventListener('submit', function(event){
    event.preventDefault();
    searchBook();
});

function searchBook() {
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const searchResultContainer = document.getElementById('searchResult');
    searchResultContainer.innerHTML = '';

    const searchResults = books.filter(book => book.title.toLowerCase().includes(searchTitle));
    if(searchTitle.trim()===''){
        return;
    }
    if (searchResults.length === 0) {
        const noResultMessage = document.createElement('p');
        noResultMessage.textContent = 'Tidak ada buku ditemukan';
        searchResultContainer.appendChild(noResultMessage);
    } else {
        for (const bookItem of searchResults) {
            const bookElement = createBook(bookItem);
            searchResultContainer.appendChild(bookElement);
        }
    }
}

