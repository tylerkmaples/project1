// Initalize Firebase
var config = {
    apiKey: "AIzaSyAylVXntb7fwfDE1qianf8r6f_jr2Xrd_A",
    authDomain: "proj-1-eeee7.firebaseapp.com",
    databaseURL: "https://proj-1-eeee7.firebaseio.com",
    projectId: "proj-1-eeee7",
    storageBucket: "proj-1-eeee7.appspot.com",
    messagingSenderId: "592938209987"
};
var app = firebase.initializeApp(config);
var auth = app.auth();
var ui = new firebaseui.auth.AuthUI(auth);

var userUID = '';

/**
 * init for search/movie page firebase funcs
 * gets user data if user is signed in
 */
function profileInit() {
    // add logout functionality
    var btn = $('#login-logout');
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log('user signed in');
            console.log(user);
            console.log('user uuid ' + user.uid);
            userUID = user.uid;
            var navBar = $('#navList');
            var li = `
                <li class="nav-item">
                    <button type="button" id="signOut" class="btn btn-outline-light">Sign Out</button>
                </li>
            `;
            navBar.append(li);
            // check db for user data and display it
            checkDB(user);

        } else {
            // No user is signed in.
            console.log('no user is signed in');
        }
    });
}

var database = firebase.database();
/**
 * checks the database for the current users data
 * gets data if it exists
 * creates data if it doesn't
 * @param {object} user - the user data object
 */
function checkDB(user) {
    console.log('checking db');
    database.ref('/users/' + user.uid).on('value', function(snapshot) {
            var data = snapshot.val();
            console.log('user data');
            console.log(data);
            displayProfile(data);
        },
        function(errorObject) {
            // If any errors are experienced, log them to console.
            console.error("The read failed: " + errorObject.code);
        });
}

/**
 * displays current user info on page
 * @param {object} user - the user data object 
 */
function displayProfile(user) {
    console.log('email: ' + user.email);
    console.log('name: ' + user.name);
    console.log('imageURL: ' + user.imageUrl);
    console.log('favoriteGenre: ' + user.favoriteGenre);
    console.log('favoriteMovie: ' + user.favoriteMovie);
    // lists
    console.log('favorites: ' + user.favoritesList.movieID);



    var profileImg = user.imageUrl;
    if (profileImg === 'n/a') {
        profileImg = '//localhost/coding-bootcamp-projects/pick-a-flick/assets/images/dummy-data/default-profile-img.jpg';
        console.log('use default photo');
    }
    var name = user.name;
    if (name === 'n/a') {
        name = 'n/a';
    }
    var email = user.email;
    if (email === null) {
        email = 'n/a';
    }
    var favoriteGenre = user.favoriteGenre;
    if (favoriteGenre === 'n/a') {
        favoriteGenre === 'n/a';
    }
    var favoriteMovie = user.favoriteMovie;
    if (favoriteMovie === 'n/a') {
        favoriteMovie === 'n/a';
    } else {
        updateMoviePoster(favoriteMovie);
    }
    // update modal
    $('#updateName').val(name);
    $('#setProfilePic').val(profileImg);
    $('#favoriteGenre').val(favoriteGenre);
    $('#favoriteMovie').val(favoriteMovie);
    // update page
    var usersPhoto = $('#profilePic');
    var usersName = $('#name');
    var usersEmail = $('#email');
    var favGenre = $('#favGenre');
    var favMovie = $('#favMovie');
    usersPhoto.attr('src', profileImg);
    usersName.text(name);
    usersEmail.text(email);
    favGenre.text(favoriteGenre);
    favMovie.text(favoriteMovie);
    // check if movies loaded
    if (!$('#profileCard').hasClass('loaded')) {
        getMovies(user);
    }
}

var api_key = '564b2e11aa606d7083773b2abc3fb126';

function getMovies(user) {
    var favoriteMovies = $('#favoritedMovies');
    var moviesToWatch = $('#moviesToWatch');
    var watchedMovies = $('#watchedMovies');
    if (!$.isEmptyObject(user.favoritesList)) {
        favoriteMovies.empty();
        Object.keys(user.favoritesList).forEach(function(key) {
            getMovie(user.favoritesList[key].movieID, favoriteMovies);
        });
    }
    if (!$.isEmptyObject(user.toWatchList)) {
        moviesToWatch.empty();
        Object.keys(user.toWatchList).forEach(function(key) {
            getMovie(user.toWatchList[key].movieID, moviesToWatch);
        });
    }
    if (!$.isEmptyObject(user.watchedList)) {
        watchedMovies.empty();
        Object.keys(user.watchedList).forEach(function(key) {
            getMovie(user.watchedList[key].movieID, watchedMovies);
        });
    }

    $('#profileCard').addClass('loaded');
}


function movies() {
    // movies
    var favMovies = [
        '293452',
        '46096',
        '424319',
        '13020'
    ];
    favMovies.forEach(movie => {
        getMovie(movie, $('#favoritedMovies'));
    });
    var watchedMovies = [
        '428078',
        '507569',
        '383498',
        '507569'
    ];
    watchedMovies.forEach(movie => {
        getMovie(movie, $('#watchedMovies'));
    });
    // checks for loaded images
    $('#movies').waitForImages().done(function() {
        // All descendant images have loaded, now slide up.
        console.log('All images have loaded');
        removeLoader();
    });
    $('#profileCard').addClass('loaded');
}

/**
 * gets movie and puts it in the selected container
 * @param {string} id - id of movie
 * @param {selector} container - selector in which to display the movie
 */
function getMovie(id, container) {
    var queryURL = 'https://api.themoviedb.org/3/movie/' + id + '?api_key=' + api_key;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        displayMovie(response, container);
    });
}

/**
 * updates the users data
 * @param {string} user - the user uid 
 */
function updateUserInfo(user) {
    user.updateProfile({
        displayName: "Jose A. Rivera",
        photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(function() {
        // Update successful.
    }).catch(function(error) {
        // An error happened.
        console.error('update user info: ' + error);
    });
}

// update profile
$('#updateProfileBtn').on('click', function() {
    event.preventDefault();
    var updatedName = $('#updateName').val().trim();
    var updatedPhoto = $('#setProfilePic').val().trim();
    var favoriteGenre = $('#favoriteGenre').val().trim();
    var favoriteMovie = $('#favoriteMovie').val().trim();
    database.ref('/users/' + userUID).update({
        name: updatedName,
        imageUrl: updatedPhoto,
        favoriteGenre: favoriteGenre,
        favoriteMovie: favoriteMovie
    });
});

function updateMoviePoster(fm) {
    var query = 'https://api.themoviedb.org/3/search/movie?api_key=' + api_key + '&query=' + encodeURI(fm) + '&sort_by=popularity.desc';
    $.ajax({
        url: query,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        var poster = 'http://image.tmdb.org/t/p/original' + response.results[0].poster_path;
        $('#favMoviePoster').attr('src', poster);
    });
}

// init
profileInit();