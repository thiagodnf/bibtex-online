var spinner,
    publications;

function showTheInputModal(){
    $("#modal-new-bibtex-file").modal('show');
}

function closeTheInputModal(){
    $("#modal-new-bibtex-file").modal('toggle');
}

function getDomain(url) {
    var $a = $('<a href="'+url+'">Demo</a>');
    var uri = $a.uri();
    return uri.domain();
}

function isUrlValid(url){
    var expression = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    var regex = new RegExp(expression, 'i');
    return url.match(regex);
}

function loadBibtextFileFromUrl(url){
    $.ajax({
        url: url,

        // Tell jQuery we're expecting JSONP
        dataType: "text",

        // Work with the response
        success: function( response ) {
            $("#source").html(response);

            // Create the object
			publications = new Publications("#source", "#table", "#chart");

            // Display the results on the screen
			publications.draw();

            if(publications.warnings.length !== 0){
                $("#number-warnings").removeClass("hide");
            }

            $("#number-warnings").text(publications.warnings.length);

            $("#warnings").html();

            $.each(publications.warnings, function(index, value){
                var warning = "<div class='alert alert-danger' role='alert'>";
                    warning += "<h4>" + value.warning + "</h4>";
                    warning += "<p>" + value.entry + "</p>";
                    warning += "</div>";

                $("#warnings").append(warning);
            });
        },
        error: function(response){
            alert(response);
        }
    });
}

function setUrl(url){
    localStorage.setItem("url", url);
}

function getUrl(){
    return localStorage.getItem("url");
}

function theUserDidNotSetTheUrl(){
    return getUrl() === null || getUrl() === "";
}

function showSpin(){
    var target = document.getElementById('spin');
    spinner = new Spinner().spin(target);
}

function hideSpin(){
    spinner.stop();
}

$(function(){

    if(typeof(Storage) === "undefined") {
        alert("You do not have access to local storage");
    }

    $(window).bind('keydown', function(event) {
        if (event.ctrlKey || event.metaKey) {
            if(String.fromCharCode(event.which).toLowerCase() == 'f'){
                event.preventDefault();
                // Put the cursor in the input
                $("#search").focus();
            }
        }
    });

    $( "#search" ).focusin(function() {
        // Change the tab when the search input get focus
        $('a[href="#tab-publications"]').trigger('click');
    });

    $("#search").bind("copy keyup", function() { //change # to the ID of your field
        var search = $(this).val();

        if(search === undefined){
            return;
        }

        publications.table.search(search).draw('true');
    });

    // Show spin when a ajax request be sent

    $(document).ajaxStart(function(){
        showSpin();
    }).ajaxStop(function(){
        hideSpin();
    });

    // Show the current url to user
    $('#modal-new-bibtex-file').on('show.bs.modal', function () {
        $("#url").val(getUrl());
    });

    // Set focus to input when the modal is shown
    $('#modal-new-bibtex-file').on('shown.bs.modal', function () {
        $("#url").focus();
    });

    $("#btn-menu-open").click(function(){
        showTheInputModal();
    });

    $("#btn-open").click(function (event) {
        var url = $("#url").val();

        if(url === undefined || url === ""){
            return alert("The URL cannot be undefined or empty");
        }

        if(getDomain(url) == "dropbox.com"){
            url = url.replace("https://www.dropbox.com/", "https://dl.dropbox.com/");
        }

        // Save the user's input
        setUrl(url);

        // Load the bibtex
        loadBibtextFileFromUrl(getUrl());

        // Close the modal window
        closeTheInputModal();
    });

    if( theUserDidNotSetTheUrl()){
        showTheInputModal();
    }else{
        loadBibtextFileFromUrl(getUrl());
    }

//    Examples using an animated GIF file:
//        https://www.dropbox.com/s/0skuwdlhg6q4fol/History%20of%20GIF.gif
//        https://dl.dropbox.com/s/0skuwdlhg6q4fol/History%20of%20GIF.gif
//        https://dl.dropbox.com/s/0skuwdlhg6q4fol/History%20of%20GIF.gif?dl=1

});
