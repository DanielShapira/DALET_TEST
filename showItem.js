$("document").ready(function () {
    var item;
    getData();

    function getData() {
        item = location.search;
        item = item.substr(1);

        //gets the 'a' parameter from querystring
        var a = (/^a=/);

        item = item.split("&").filter(function(item) {
            return a.test(item);
        });

        if (!item.length) {
            $("#error").html("ERROR : ITEM NOT FOUND..");
            return false;
        }

        //gets the first element 'a' matched
        item = item[0].replace("a=", "");
        item = decodeURIComponent(window.atob(item));
        item = JSON.parse(item);
        fillPage();
    }

    function fillPage(){
        var body = $("body");

        for(var key in item) {
            var keyOfdata = $("<p></p>");
            var data;

            if(item.hasOwnProperty(key)) {
                if (key === "artworkUrl100") {
                    data = $("<img/>");
                    data.attr('src', item[key]);
                    data.attr('alt', item[key]);
                    data.attr('width', 100);
                    data.attr('height', 100);
                } else {
                    if (isUrl(item[key])) {
                        data = $("<a></a>");
                        data.attr('href', item[key]);
                        data.html(item[key]);
                    } else {
                        data = $("<i></i>");
                        data.append(item[key]);
                    }
                }

                keyOfdata.append(key);
                keyOfdata.append($("<br>"));
                keyOfdata.append(data);
                body.append(keyOfdata);
            }
        }
    }

    function isUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (err) {
            return false;
        }
    }
});