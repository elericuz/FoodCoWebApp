const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', (e) => {
    const data = new URLSearchParams();
    const form = document.getElementById('providerForm');
    for (const pair of new FormData(form)) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/providers/save';
    let method = 'PUT';
    if ((document.getElementById('idProvider').value) == "") {
        method = 'POST';
    }

    fetch(endpoint, {method: method, body: data})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then(result => {
            if (method == 'POST') {
                addNewProvider(result.data._id)
            } else {
                updateProvider(result.data._id)
            }
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
            $('#addProviderModal').foundation('close');
            resetProvidersForm();
        })
        .catch(err => {
            document.getElementById('message').innerHTML = err.message;
            document.getElementById('alertContainer').style.display = 'block';
            alert(err.message)
        });
});

function addNewProvider(id) {
    let newRow = document.getElementById('providerTable').insertRow();
    let address = document.getElementById('street').value + ', ' +
        document.getElementById('city').value + ', ' +
        document.getElementById('state').value + ', ' +
        document.getElementById('zipcode').value;
    newRow.id = id;
    newRow.innerHTML = "" +
        "<td>" + document.getElementById('name').value + "</td>" +
        "<td>" + address + "</td>" +
        "<td>" + document.getElementById('contact').value + "</td>" +
        "<td>" + document.getElementById('phone').value + "</td>" +
        "<td class=\"text-center\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addProviderModal').foundation('open'); getProvider('" + id + "')\"></div>" +
        "<div class=\"fi-page-edit display-inline\" onclick=\"removeProvider('" + id + "')\"></div>" +
        "</td>";
}

function updateProvider(id) {
    let row = document.getElementById(id);
    let address = document.getElementById('street').value + ', ' +
        document.getElementById('city').value + ', ' +
        document.getElementById('state').value + ', ' +
        document.getElementById('zipcode').value;
    row.innerHTML = "" +
        "<td>" + document.getElementById('name').value + "</td>" +
        "<td>" + address + "</td>" +
        "<td>" + document.getElementById('contact').value + "</td>" +
        "<td>" + document.getElementById('phone').value + "</td>" +
        "<td class=\"text-center\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addProviderModal').foundation('open'); getProvider('" + id + "')\"></div>" +
        "<div class=\"fi-page-edit display-inline\" onclick=\"removeProvider('" + id + "')\"></div>" +
        "</td>";
}

function removeProvider(id) {
    const endpoint = '/providers/remove/' + id;
    fetch(endpoint, {method: 'DELETE'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong 2.');
        })
        .then((result) => {
            $('#' + id).remove();
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
        })
        .catch(err => {
            alert('Something went wrong 1.');
        });
}

function getProvider(id) {
    resetProvidersForm();
    const endpoint = '/providers/get/' + id;
    fetch(endpoint, {method: 'post'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong 2.');
        })
        .then((result) => {
            document.getElementById('idProvider').value = result.provider._id;
            document.getElementById('idAddress').value = result.provider.address_id._id;
            document.getElementById('name').value = result.provider.name;
            document.getElementById('contact').value = result.provider.contact;
            document.getElementById('phone').value = result.provider.phone;
            document.getElementById('street').value = result.provider.address_id.street;
            document.getElementById('city').value = result.provider.address_id.city;
            document.getElementById('state').value = result.provider.address_id.state;
            document.getElementById('zipcode').value = result.provider.address_id.zipcode;
        })
        .catch(err => {
            alert('Something went wrong 1.');
        });
}

function resetProvidersForm() {
    document.getElementById('providerForm').reset();
    document.getElementById('idProvider').value = '';
    document.getElementById('idAddress').value = '';
}