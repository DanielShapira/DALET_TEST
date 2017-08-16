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
                builtLayOut();
            }, 100);

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

            if(chosenSort === "Sort by name(acs)"){
                sortJson("string", true);
            }else if(chosenSort === "Sort by name(desc)"){
                sortJson("string", false);
            }else if(chosenSort === "Sort by price(acs)"){
                sortJson("number", true);
            }else{
                sortJson("number", false);
            }
        }, 100);
    });

    //Built the thumbnail
    function builtLayOut() {
        dataView.empty();
        payOrnotPay.prop("selectedIndex",0);
        $("#foundItmes").html("Found " + returnData.resultCount + " Items");

        for(var i = 0; i < returnData.resultCount; i++){
            var thumbnail = $("<li></li>");
            var thumbnailImg = $("<img/>");
            var thumbnailTrackName = $("<i/>");
            var thumbnailArtistName = $("<i/>");
            var thumbnailTrackPrice = $("<i/>");

            if(returnData.results[i].hasOwnProperty("artworkUrl100")){
                var newUrl = returnData.results[i]["artworkUrl100"].slice(0, -13);
                newUrl += "250x250bb.jpg";
                thumbnailImg.attr('src', newUrl);
                thumbnailImg.attr('alt', newUrl);
            }else{
                thumbnailImg.html("-");
            }

            if(returnData.results[i].hasOwnProperty("trackName")) {
                thumbnailTrackName.html(returnData.results[i]["trackName"]);
            }else if(returnData.results[i].hasOwnProperty("collectionName")){
                thumbnailTrackName.html(returnData.results[i]["collectionName"]);
            }else{
                thumbnailTrackName.html("-");
            }

            if(returnData.results[i].hasOwnProperty("artistName")){
                thumbnailArtistName.html(returnData.results[i]["artistName"]);
            }else{
                thumbnailArtistName.html("-");
            }

            if(returnData.results[i].hasOwnProperty("trackPrice") && returnData.results[i]["trackPrice"] > 0) {
                thumbnailTrackPrice.html(returnData.results[i]["trackPrice"]);
            }else if(returnData.results[i].hasOwnProperty("price") && returnData.results[i]["price"] > 0){
                thumbnailTrackPrice.html(returnData.results[i]["price"]);
            }else if(returnData.results[i].hasOwnProperty("collectionPrice") && returnData.results[i]["collectionPrice"] > 0){
                thumbnailTrackPrice.html(returnData.results[i]["collectionPrice"]);
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
        var name, name1, price, price1;
        returnData.results = returnData.results.sort(function(a, b) {
            if(prop === "string") {
                if(a.hasOwnProperty("trackName")){
                    name = "trackName";
                }else{
                    name = "collectionName";
                }

                if(b.hasOwnProperty("trackName")){
                    name1 = "trackName";
                }else{
                    name1 = "collectionName";
                }

                if (asc) {
                    return (a[name].toLowerCase() > b[name1].toLowerCase()) ? 1 : ((a[name].toLowerCase() < b[name1].toLowerCase()) ? -1 : 0);
                } else {
                    return (b[name1].toLowerCase() > a[name].toLowerCase()) ? 1 : ((b[name1].toLowerCase() < a[name].toLowerCase()) ? -1 : 0);
                }
            }else if(prop === "number"){
                if(a.hasOwnProperty("trackPrice") && a["trackPrice"] > 0) {
                    price = "trackPrice";
                }else if(a.hasOwnProperty("price") && a["price"] > 0){
                    price = "price";
                }else if(a.hasOwnProperty("collectionPrice") && a["collectionPrice"] > 0){
                    price = "collectionPrice";
                }

                if(b.hasOwnProperty("trackPrice") && b["trackPrice"] > 0) {
                    price1 = "trackPrice";
                }else if(b.hasOwnProperty("price") && b["price"] > 0){
                    price1 = "price";
                }else if(b.hasOwnProperty("collectionPrice") && b["collectionPrice"] > 0){
                    price1 = "collectionPrice";
                }

                if (asc) {
                    return (Number(a[price]) > Number(b[price1])) ? 1 : ((Number(a[price]) < Number(b[price1])) ? -1 : 0);
                } else {
                    return (Number(b[price1]) > Number(a[price])) ? 1 : ((Number(b[price1]) < Number(a[price])) ? -1 : 0);
                }
            }
        });
        builtLayOut();
    }

    startStopLoading(false);
});