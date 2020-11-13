console.log('hereeeeee')
// importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-firestore.js');
// importScripts('https://maps.googleapis.com/maps/api/js?key=AIzaSyA3n47b9Kgdiy4l4ubnRMh6XGPGTJzod8c&amp;libraries=places&amp;language=en');

// // Initialize the Firebase app in the service worker by passing in the
// // messagingSenderId.
// firebase.initializeApp({
//     apiKey: "AIzaSyA3n47b9Kgdiy4l4ubnRMh6XGPGTJzod8c",
//     authDomain: "prontoappl.firebaseapp.com",
//     databaseURL: "https://prontoappl.firebaseio.com",
//     projectId: "prontoappl",
//     storageBucket: "prontoappl.appspot.com",
//     messagingSenderId: "494375460942",
//     appId: "1:494375460942:web:f55aa2ab2ca80946fbe31f",
//     measurementId: "G-MB5SYLV0WJ",
// });

function handlePermission() {
    navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
        if (result.state == 'granted') {
            report(result.state);
            getLocation();
        } else if (result.state == 'prompt') {
            report(result.state);
            getLocation();
        } else if (result.state == 'denied') {
            report(result.state);
        }
        result.onchange = function () {
            report(result.state);
        }
    });
}

function report(state) {
    console.log('Permission ' + state);
}


function getLocation() {
    console.log('here 1')
    navigator.geolocation.watchPosition(showPosition);
    // if (navigator.geolocation) {
    //     navigator.geolocation.watchPosition(showPosition);
    // } else {
    //     console.log("Geolocation is not supported by this browser.");
    // }
}

function showPosition(position) {
    console.log('here 2')
    //   x.innerHTML = "Latitude: " + position.coords.latitude +
    //   "<br>Longitude: " + position.coords.longitude;
    postMessage({ "type": "location", "result": position });
}

function listenForJobs() {
    console.log('here 3')
    const email = localStorage.getItem('email')
    firebase.firestore().collection('jobs').where('assigned_to.email', '==', email).where('back_end_status', '==', 'active').onSnapshot(query => {
        // query.forEach(data => {
        //   const job = <Jobs>data.data()
        // })
        if (query.size === 0) {
            return
        }
        const selectedJob = query.docs[0].data()
        if (selectedJob.status === "Pending") {
            // this.playAudio()
            postMessage({ "type": "job" });
        }
    })
}

handlePermission();
// listenForJobs();