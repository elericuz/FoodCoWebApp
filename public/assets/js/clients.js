const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', (e) => {
    const data = new URLSearchParams();
    const form = document.getElementById('clientForm');
    for (const pair of new FormData(form)) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/clients/save';
    let method = 'PUT';
    if ((document.getElementById('idClient').value) == "") {
        method = 'POST';
    }

    fetch(endpoint, {method: method, body: data})
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Something went wrong.');
            }
        })
        .then(result => {
            if (method == 'POST') {
                addNewClient(result.data)
            } else {
                updateClient(result.data)
            }
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
            $('#addClientModal').foundation('close');
            resetClientForm();
        })
        .catch(err => {
            document.getElementById('message').innerHTML = err.message;
            document.getElementById('alertContainer').style.display = 'block';
            alert(err);
        });
});

function addNewClient(data) {
    let newRow = document.getElementById('clientTable').insertRow();
    newRow.id = data._id;

    newRow.innerHTML = "" +
        "<td>" + data.code + "</td>" +
        "<td>" + data.name + "</td>" +
        "<td>" + data.commercial_name + "</td>" +
        "<td>" + data.email + "</td>" +
        "<td>" + data.phone + "</td>" +
        "<td class=\"text-center\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addClientModal').foundation('open'); getClient('" + data._id + "')\"></div>" +
        "<div class=\"fi-trash display-inline\" onclick=\"removeClient('" + data._id + "')\"></div>" +
        "</td>";
}

function removeClient(id) {
    const endpoint = '/clients/remove/' + id;
    fetch(endpoint, {method: 'DELETE'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            $('#' + id).remove();
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
        })
        .catch(err => {
            alert('Something went wrong.');
        });
}

function getClient(id) {
    resetClientForm();
    const endpoint = '/clients/get/' + id;
    fetch(endpoint, {method: 'post'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            document.getElementById('idClient').value = result.data._id;
            document.getElementById('code').value = result.data.code;
            document.getElementById('name').value = result.data.name;
            document.getElementById('commercial_name').value = result.data.commercial_name;
            document.getElementById('email').value = result.data.email;
            document.getElementById('phone').value = result.data.phone;
            document.getElementById('contact').value = result.data.contact;
            document.getElementById('idAddress').value = result.data.address._id;
            document.getElementById('street').value = result.data.address.street;
            document.getElementById('city').value = result.data.address.city;
            document.getElementById('state').value = result.data.address.state;
            document.getElementById('zipcode').value = result.data.address.zipcode;
        })
        .catch(err => {
            alert('Something went wrong.');
        });
}

function updateClient(data) {
    let row = document.getElementById(data._id);
    row.innerHTML = "" +
        "<td>" + document.getElementById('code').value + "</td>" +
        "<td>" + document.getElementById('name').value + "</td>" +
        "<td>" + document.getElementById('commercial_name').value + "</td>" +
        "<td>" + document.getElementById('email').value + "</td>" +
        "<td>" + document.getElementById('phone').value + "</td>" +
        "<td class=\"text-center\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addClientModal').foundation('open'); getClient('" + data._id + "')\"></div>" +
        "<div class=\"fi-trash display-inline\" onclick=\"removeClient('" + data._id + "')\"></div>" +
        "</td>";
}

function resetClientForm() {
    document.getElementById('clientForm').reset();
    document.getElementById('idClient').value = '';
    document.getElementById('idAddress').value = '';
}