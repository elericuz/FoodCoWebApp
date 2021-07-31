function showResult() {
    const container = document.getElementById("search-results-container");
    let text = $("#search").val();
    if (text.trim().length > 3) {
        const endpoint = '/products/search/' + text.trim();
        fetch(endpoint, {method: 'GET'})
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Something went wrong.');
            })
            .then((result) => {
                container.innerHTML = "";
                if (result.status === "success") {
                    for (const item of result.data) {
                        createContainer(item.manufacturer_name);
                    }
                } else {
                    createContainer(result.message);
                }
            })
            .catch(err => console.log(err));
        $('#search-results-container').css("visibility", "visible");
    } else {
        hideResults();
    }
}

function createContainer(text) {
    const container = document.getElementById("search-results-container");
    let itemContainer = document.createElement('div');
    itemContainer.setAttribute("class", "grid-x search-result-item-container result-item");
    let aContainer = document.createElement('a');
    let childContainer = document.createElement('div');
    childContainer.setAttribute("class", "cell small-12 padding-1");
    childContainer.innerHTML = text;
    itemContainer.appendChild(childContainer);
    aContainer.appendChild(itemContainer)
    container.appendChild(aContainer);
}

function hideResults() {
    const container = document.getElementById("search-results-container");
    container.innerHTML = "";
    $('#search-results-container').css('visibility', 'hidden');
}