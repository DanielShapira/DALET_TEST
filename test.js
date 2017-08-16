$("document").ready(function () {
    var returnData;

    var dataView = $("#dataView");
    var sortChoise = $("#sortChoise");
    var payOrnotPay = $("#payNoPay");
    sortChoise.css("display","none");
    payOrnotPay.css("display","none");

    //Set number of result dropdown.
    var maxResult = $("#maxResult");
    for(var i = 1; i <= 200; i++){
        var resultOption = $("<option></option>");
        resultOption.html(i);
        maxResult.append(resultOption);
    }

    $("#resetButton").on('click', function (e) {
        $(this).blur();
        $("#search_text").val("");
        $('#maxResult').prop("selectedIndex",0);
        $('#categoryDropBoxBtn').prop("selectedIndex",0);
        $("#foundItmes").html("");
        dataView.empty();
        $("#sortChoise").css("display","none");
    });

    //Make a json request from iTunes
    $("#searchForm").on('submit', function (e) {
        startStopLoading(true);
        $.getJSON("https://itunes.apple.com/search?term=" + $("#search_text").val() + "&media=" + $('#categoryDropBoxBtn').find(':selected').text() + "&limit=" + $('#maxResult').find(':selected').text(), function (data) {
            returnData = data;
            setTimeout(function (){
                sortChoise.css("display","");
                sortChoise.prop("selectedIndex",0);
                payOrnotPay.css("display","");
                payOrnotPay.prop("selectedIndex",0);
                builtLayOut();
            }, 100);
            console.log(returnData); // this will show the info it in console
        }).fail(function() { alert('getJSON request failed! '); });

        e.preventDefault();
    });

    payOrnotPay.on("change",function (e) {
        startStopLoading(true);

        setTimeout(function (){
            var chosenSort = payOrnotPay.find(':selected').text();
            var liElements = dataView.children("li");

            for(var i = 0; i < liElements.length; i++){
                var iElements = liElements[i].lastChild;

                if (chosenSort === 'FREE' && Number($(iElements).html()) === 0) {
                    liElements[i].style.display = "";
                } else if (chosenSort === 'PAY' && Number($(iElements).html()) > 0) {
                    liElements[i].style.display = "";
                }else if (chosenSort === 'FREE & PAY') {
                    liElements[i].style.display = "";
                } else {
                    liElements[i].style.display = "none";
                }
            }

            startStopLoading(false);
        }, 100);
    });

    sortChoise.on("change",function (e) {
        startStopLoading(true);
        setTimeout(function (){
            var chosenSort = sortChoise.find(':selected').text();
            var name;
            var price;

            if(returnData.results[0].hasOwnProperty("trackName")){
                name = "trackName";
            }else{
                name = "collectionName";
            }

            if(returnData.results[0].hasOwnProperty("trackPrice")){
                price = "trackPrice";
            }else{
                price = "price";
            }

            if(chosenSort === "Sort by name(acs)"){
                sortJson(name, true);
            }else if(chosenSort === "Sort by name(desc)"){
                sortJson(name, false);
            }else if(chosenSort === "Sort by price(acs)"){
                sortJson(price, true);
            }else{
                sortJson(price, false);
            }
        }, 100);
    });

    //Built the thumbnail
    function builtLayOut() {
        dataView.empty();

        $("#foundItmes").html("Found " + returnData.resultCount + " Items");

        for(var i = 0; i < returnData.resultCount; i++){
            var thumbnail = $("<li></li>");
            var thumbnailImg = $("<img/>");
            var thumbnailTrackName = $("<i/>");
            var thumbnailArtistName = $("<i/>");
            var thumbnailTrackPrice = $("<i/>");

            if(returnData.results[i].hasOwnProperty("artworkUrl100")){
                var newUrl = returnData.results[i].artworkUrl100.slice(0, -13);
                newUrl += "250x250bb.jpg";
                thumbnailImg.attr('src', newUrl);
                thumbnailImg.attr('alt', newUrl);
            }else{
                thumbnailImg.html("-");
            }

            if(returnData.results[i].hasOwnProperty("trackName")) {
                thumbnailTrackName.html(returnData.results[i].trackName);
            }else if(returnData.results[i].hasOwnProperty("collectionName")){
                thumbnailTrackName.html(returnData.results[i].collectionName);
            }else{
                thumbnailTrackName.html("-");
            }

            if(returnData.results[i].hasOwnProperty("artistName")){
                thumbnailArtistName.html(returnData.results[i].artistName);
            }else{
                thumbnailArtistName.html("-");
            }

            if(returnData.results[i].hasOwnProperty("trackPrice") && returnData.results[i].trackPrice > 0) {
                thumbnailTrackPrice.html(returnData.results[i].trackPrice);
            }else if(returnData.results[i].hasOwnProperty("price") && returnData.results[i].price > 0){
                thumbnailTrackPrice.html(returnData.results[i].price);
            }else if(returnData.results[i].hasOwnProperty("collectionPrice") && returnData.results[i].collectionPrice > 0){
                thumbnailTrackPrice.html(returnData.results[i].collectionPrice);
            }else{
                thumbnailTrackPrice.html("0");
            }

            thumbnail.append(thumbnailImg);
            thumbnail.append(thumbnailTrackName);
            thumbnail.append(thumbnailArtistName);
            thumbnail.append(thumbnailTrackPrice);

            thumbnail.on("click",function (e) {
                var item = JSON.stringify(returnData.results[$(this).index()]);
                item = item = btoa(encodeURIComponent(item));

                window.open("showItem.html?a=" + item, "ITEM Description");
            });

            dataView.append(thumbnail);
        }

        startStopLoading(false);
    }

    //Start and stop loading image.
    function startStopLoading(start) {
        if(start){
            this.$(".loader").css("display", "block");
        }else{
            $(".loader").css("display", "none");
        }
    }

    //Sort json by property (price/name).
    function sortJson(prop, asc) {
        returnData.results = returnData.results.sort(function(a, b) {
            if(prop === "trackName" || prop === "collectionName") {
                if (asc) {
                    return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : ((a[prop].toLowerCase() < b[prop].toLowerCase()) ? -1 : 0);
                } else {
                    return (b[prop].toLowerCase() > a[prop].toLowerCase()) ? 1 : ((b[prop].toLowerCase() < a[prop].toLowerCase()) ? -1 : 0);
                }
            }else if(prop === "trackPrice" || prop === "price"){
                if (asc) {
                    return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
                } else {
                    return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
                }
            }
        });
        builtLayOut();
        payOrnotPay.click();
    }

    startStopLoading(false);
});