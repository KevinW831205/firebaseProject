


// Initialize Firebase


var config = {
    apiKey: "AIzaSyAyvNl7v3sVbWiIFPQT0d7J-qN4oVzAYxQ",
    authDomain: "upenntrainschedule.firebaseapp.com",
    databaseURL: "https://upenntrainschedule.firebaseio.com",
    projectId: "upenntrainschedule",
    storageBucket: "upenntrainschedule.appspot.com",
    messagingSenderId: "1042932856480"
};
firebase.initializeApp(config);

var database = firebase.database();




var newMessageRef = firebase.database().ref()

$("#testBtn").on("click", function() {
    console.log(1)
    newMessageRef.set({
        
    });

});

