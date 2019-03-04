


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




var provider = new firebase.auth.GoogleAuthProvider();

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            main.signin=true
            $("#buttonCol").children().attr("disabled",false)
            $("#submitForm").show();
            $("#signinText").hide();
            return false;
        },
        uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        //   firebase.auth.EmailAuthProvider.PROVIDER_ID,
        //   firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '<your-tos-ur>',
    // Privacy policy url.
    privacyPolicyUrl: '<your-privacy-policy-url>'
};








var main = {
    arrivalTime: 0,
    minutesRemain: 0,
    editing: false,
    signin: false,

    nextArrivalGet: function (initialTime, frequency) {
        //take currentTime in formatn HH:mm, outputs next train time and minutes away
        var finitialTime = moment(initialTime, "HH:mm").subtract(1, "days");
        var fdiffTime = moment().diff(finitialTime, "minutes");
        var fremainder = fdiffTime % frequency;
        var fminutesRemain = frequency - fremainder;
        var farrival = moment().add(fminutesRemain, "minutes");

        main.minutesRemain = fminutesRemain;
        main.arrivalTime = farrival.format("HH:mm");
    },

    timeUpdate: function () {
        console.log(1);
        $(".trainInfoRow").each(function () {
            main.nextArrivalGet($(this).attr("data-initialTime"), $(this).children("#frequency").text());
            $("#clockTime").text(moment().format("HH:mm:ss"));
            $(this).children("#nextTrain").text(main.arrivalTime);
            $(this).children("#minutesAway").text(main.minutesRemain);
        })
    },


    deleteInfo: function (info) {
        //info is the row of train information, deletes the row and remove from database
        var infokey = info.parent().parent().attr("data-key")
        info.parent().parent().remove();
        database.ref("/trainInfo").child(infokey).remove();
    },

    editInfo: function (info) {
        //info is this of event lister on edit button, allows editing of the row information by getting a resubmission of form and then make updates to DOM and database
        var infoRow = info.parent().parent()
        infoRow.addClass("editing")
        $("#formTitle").addClass("editing")
        var infokey = infoRow.attr("data-key")
        $("#submitButton").off()
        $("#submitButton").text("Complete Edit");
        $("#trainNameInput").val(infoRow.children("#trainName").text())
        $("#destinationInput").val(infoRow.children("#destination").text())
        $("#initialTimeInput").val(infoRow.attr("data-initialTime"))
        $("#frequencyInput").val(infoRow.children("#frequency").text())

        $("#submitButton").on("click", function () {

            event.preventDefault();
            var trainName = $("#trainNameInput").val().trim();
            var destination = $("#destinationInput").val().trim();
            var initialTime = $("#initialTimeInput").val().trim();
            var frequency = $("#frequencyInput").val().trim();

            database.ref("/trainInfo").child(infokey).set({
                trainName: trainName,
                destination: destination,
                initialTime: initialTime,
                frequency: frequency,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            })

            $("#trainNameInput").val("")
            $("#destinationInput").val("")
            $("#initialTimeInput").val("")
            $("#frequencyInput").val("")


            database.ref("/trainInfo").child(infokey).on("value", function (snapshot) {
                infoRow.children("#trainName").text(snapshot.val().trainName);
                infoRow.children("#destination").text(snapshot.val().destination);
                infoRow.children("#frequency").text(snapshot.val().frequency);
                infoRow.attr("data-initialTime", snapshot.val().initialTime);
                main.nextArrivalGet(snapshot.val().initialTime, snapshot.val().frequency);
                infoRow.children("#nextTrain").text(main.arrivalTime);
                infoRow.children("#minutesAway").text(main.minutesRemain);

            });
            main.editing = false;
            $("#submitButton").text("Submit");
            infoRow.removeClass("editing")
            $("#formTitle").removeClass("editing")
            $("#submitButton").off()
            $("#submitButton").on("click", function (event) {
                event.preventDefault();
                main.submitInfo();
            });
        });


    },



    trainInfoUpdate: function (trainInfo) {
        //grabs info from database append necessary information to table and create delete and edit button
        //create table jquery
        var newRow = $("<tr>");
        var trainNameCol = $("<td>").attr("id", "trainName");
        var destinationCol = $("<td>").attr("id", "destination");
        var frequencyCol = $("<td>").attr("id", "frequency");
        var nextTrainCol = $("<td>").attr("id", "nextTrain");
        var minutesAwayCol = $("<td>").attr("id", "minutesAway");
        var buttonCol = $("<td>").attr("id","buttonCol")
        //create buttons and assingn classes
        var deleteButton = $("<button>");
        var editButton = $("<button>").text("edit");
        if(main.signin){
        editButton.addClass("btn btn-warning editButton")
        deleteButton.addClass("btn btn-danger deleteButton")
        }else{
            editButton.addClass("btn btn-warning editButton")
            deleteButton.addClass("btn btn-danger deleteButton")    
            editButton.attr("disabled",true)
            deleteButton.attr("disabled",true)
        }
        deleteButton.text("X");
        buttonCol.append(editButton)
        buttonCol.append(deleteButton)
        //move database info to table
        trainNameCol.text(trainInfo.val().trainName);
        destinationCol.text(trainInfo.val().destination);
        frequencyCol.text(trainInfo.val().frequency);


        main.nextArrivalGet(trainInfo.val().initialTime, trainInfo.val().frequency)
        nextTrainCol.text(main.arrivalTime);
        minutesAwayCol.text(main.minutesRemain);



        newRow.attr("data-key", trainInfo.key)
        newRow.attr("data-initialTime", trainInfo.val().initialTime);
        newRow.addClass("trainInfoRow")


        newRow.append(trainNameCol, destinationCol, frequencyCol, nextTrainCol, minutesAwayCol, buttonCol);
        $("#trainInfo").append(newRow)
    },

    submitInfo: function () {
        //grabs form information and update database
        var trainName = $("#trainNameInput").val().trim();
        var destination = $("#destinationInput").val().trim();
        var initialTime = $("#initialTimeInput").val().trim();
        var frequency = $("#frequencyInput").val().trim();
        $("#trainNameInput").val("")
        $("#destinationInput").val("")
        $("#initialTimeInput").val("")
        $("#frequencyInput").val("")
        database.ref("/trainInfo").push({
            trainName: trainName,
            destination: destination,
            initialTime: initialTime,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        })
    },
}

// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

$(document).ready(function () {
    setInterval(main.timeUpdate, 1000);

    database.ref("/trainInfo").on("child_added", function (snapshot) {
        main.trainInfoUpdate(snapshot);     
    });

    $("#submitButton").on("click", function (event) {
        event.preventDefault();
        main.submitInfo("/trainInfo");

    });

    $(document).on("click", ".deleteButton", function () {
        if (!main.editing) {
            event.preventDefault();
            main.deleteInfo($(this))
        }
    })

    $(document).on("click", ".editButton", function () {
        if (!main.editing) {
            main.editing = true;
            main.editInfo($(this));
        }
    });
});


