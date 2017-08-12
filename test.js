$("document").ready(function () {
    var returnData;
    var price;

    //Set number of result dropdown.
    var maxResult = $("#maxResult");
    for(var i = 1; i <= 200; i++){
        var resultOption = document.createElement("option");
        resultOption.innerHTML = i;
        maxResult.append(resultOption);
    }

    $("#resetButton").on('click', function (e) {
        $(this).blur();
        $("#search_text").val("");
        $('#maxResult').prop("selectedIndex",0);
        $('#categoryDropBoxBtn').prop("selectedIndex",0);
        $("#foundItmes").html("");
        $("#dataView").empty();
    });

    //Make a json request from iTunes
    $("#searchForm").on('submit', function (e) {
        startStopLoading(true);
        $.getJSON("https://itunes.apple.com/search?term=" + $("#search_text").val() + "&entity=" + $('#categoryDropBoxBtn').find(':selected').text() + "&limit=" + $('#maxResult').find(':selected').text(), function (data) {
            returnData = data;
            price = '';
            setTimeout(function (){
                buildTable();
            }, 100);
            console.log(returnData); // this will show the info it in console
        }).fail(function() { alert('getJSON request failed! '); });

        e.preventDefault();
    });

    //Build table from return data(json).
    function buildTable() {
        var dataView = $("#dataView");
        dataView.empty();

        if (returnData.resultCount > 0) {
            tbody = document.createElement("tbody");

            for (var i = 0; i < returnData.resultCount; i++) {
                var trbody = document.createElement("tr");
                trbody.id = i;

                trbody.addEventListener('click', function () {
                    var item = JSON.stringify(returnData.results[this.id]);
                    console.log(item);
                    item = item = btoa(encodeURIComponent(item));

                    window.open("showItem.html?a=" + item, "ITEM Description");
                });

                tbody.append(returnRow(i, trbody));
            }

            $("#foundItmes").html("Found " + returnData.resultCount + " items");
            dataView.append("<thead> <tr> <th>Track Name</th> <th id='artistName'> Artist Name <i class = 'sortArrowOrFreePaid'>&#9650 &#9660</i></th> <th>Type</th> <th>ReleaseDate</th> <th>Country</th> <th id = 'itemPrice'><i id = 'sortByPay' class = 'sortArrowOrFreePaid'> &#9650 &#9660 </i>Price<i id = 'pay' class = 'sortArrowOrFreePaid'> P/F </i></th> </tr> </thead>").append(tbody);

            dataView.find("thead #artistName").on("click", function (event) {
                startStopLoading(true);
                setTimeout(function (){
                    sortTable(1, false);
                }, 100);
                //sortTable(1, false);
            });
            dataView.find("thead #itemPrice #sortByPay").on("click", function (event) {
                startStopLoading(true);
                setTimeout(function (){
                    sortTable(5, true);
                }, 100);
            });

            dataView.find("thead #itemPrice #pay").on("click", function (event) {
                startStopLoading(true);

                setTimeout(function (){
                    if (price === '') {
                        dataView.find("thead #itemPrice #pay").attr('class', 'arrowDownOrPaid');
                        dataView.find("thead #itemPrice #pay").html(" PAY");
                        price = '$';
                    } else if (price === '$') {
                        dataView.find("thead #itemPrice #pay").attr('class', 'arrowUpOrFree');
                        dataView.find("thead #itemPrice #pay").html(" FREE");
                        price = '0';
                    } else {
                        dataView.find("thead #itemPrice #pay").attr('class', 'sortArrowOrFreePaid');
                        dataView.find("thead #itemPrice #pay").html(" P/F");
                        price = '';
                    }

                    filterTable();
                }, 100);
            });
        } else {
            $("#foundItmes").html("Item not found");
        }

        startStopLoading(false);
    }

    //Filter table by price.
    function filterTable() {
        var input, filter, table, tr, th, i;
        table = document.getElementById("dataView");
        tr = table.getElementsByTagName("tr");

        for (i = 1; i < tr.length; i++) {
            th = tr[i].getElementsByTagName("th")[5];

            if (th) {
                if (price === '0' && th.innerHTML.toUpperCase().indexOf(price) > -1 && th.innerHTML.length === 1) {
                    tr[i].style.display = "";
                } else if (price === '$' && Number(th.innerHTML) > 0) {
                    tr[i].style.display = "";
                }else if (price === '' && th.innerHTML.toUpperCase().indexOf(price) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
        startStopLoading(false);
    }

    //Return a row of data in a table.
    function returnRow(i, trbody) {
        for (var j = 1; j < 7; j++) {
            var thbody = document.createElement("th");

            switch (j) {
                case 1:
                    if (returnData.results[i].hasOwnProperty("collectionName"))
                        thbody.append(returnData.results[i].collectionName);
                    else if (returnData.results[i].hasOwnProperty("trackName"))
                        thbody.append(returnData.results[i].trackName);
                    else
                        thbody.append("-");
                    break;
                case 2:
                    if (returnData.results[i].hasOwnProperty("artistName"))
                        thbody.append(returnData.results[i].artistName);
                    else
                        thbody.append("-");
                    break;
                case 3:
                    if (returnData.results[i].hasOwnProperty("kind"))
                        thbody.append(returnData.results[i].kind);
                    else
                        thbody.append($('#categoryDropBoxBtn').find(':selected').text());
                    break;
                case 4:
                    if (returnData.results[i].hasOwnProperty("releaseDate"))
                        thbody.append(returnData.results[i].releaseDate.slice(0, 10));
                    else
                        thbody.append("-");
                    break;
                case 5:
                    if (returnData.results[i].hasOwnProperty("country"))
                        thbody.append(returnData.results[i].country);
                    else
                        thbody.append("-");
                    break;
                case 6:
                    if (returnData.results[i].hasOwnProperty("price") && returnData.results[i].price > 0)
                        thbody.append(returnData.results[i].price);
                    else if (returnData.results[i].hasOwnProperty("collectionPrice") && returnData.results[i].collectionPrice > 0)
                        thbody.append(returnData.results[i].collectionPrice);
                    else
                        thbody.append("0");
                    break;
            }

            trbody.append(thbody);
        }

        return trbody;
    }

    //Sort table by col.
    function sortTable(n, sortByPrice) {
        var table, rows, switching, i, x, y, shouldSwitch, switchcount = 0, order;
        table = document.getElementById("dataView");
        switching = true;
        order = "asc";

        //Make a loop that will continue until no switching has been done.
        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("tr");

            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("th")[n];
                y = rows[i + 1].getElementsByTagName("th")[n];

                //check if the two rows should switch place,based on the direction, asc or desc
                if (order === "asc") {
                    if ((sortByPrice && Number(x.innerHTML) > Number(y.innerHTML)) || (!sortByPrice && x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase())) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (order === "desc") {
                    if ((sortByPrice && Number(x.innerHTML) < Number(y.innerHTML)) || (!sortByPrice && x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase())) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }

            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchcount++;
            } else {
                if (switchcount === 0 && order === "asc") {
                    order = "desc";
                    switching = true;
                }
            }
        }
        setArrowClass(order, sortByPrice);
    }

    //Change arrow class according to sort direction.
    function setArrowClass(order, sortByPrice) {
        var dataView = $("#dataView");

        if (!sortByPrice) {
            if (order === 'asc') {
                dataView.find("thead #artistName i").attr('class', 'arrowUpOrFree');
                dataView.find("thead #artistName i").html("&#9660");
            } else if (order === 'desc') {
                dataView.find("thead #artistName i").attr('class', 'arrowDownOrPaid');
                dataView.find("thead #artistName i").html("&#9650");
            }

            dataView.find("thead #itemPrice #sortByPay").attr('class', 'sortArrowOrFreePaid');
            dataView.find("thead #itemPrice #sortByPay").html("&#9650 &#9660");
        }else {
            if (order === 'asc' && sortByPrice){
                dataView.find("thead #itemPrice #sortByPay").attr('class', 'arrowUpOrFree');
                dataView.find("thead #itemPrice #sortByPay").html("&#9660");
            }else if (order === 'desc' && sortByPrice) {
                dataView.find("thead #itemPrice #sortByPay").attr('class', 'arrowDownOrPaid');
                dataView.find("thead #itemPrice #sortByPay").html("&#9650");
            }

            dataView.find("thead #artistName i").attr('class', 'sortArrowOrFreePaid');
            dataView.find("thead #artistName i").html("&#9650 &#9660");
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

    startStopLoading(false);
});