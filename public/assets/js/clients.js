$('#phoneWarehouse').focusout(function() {
    function phoneFormat() {
        phone = phone.replace(/[^0-9]/g, '');
        phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
        return phone;
    }
    let phone = $(this).val();
    phone = phoneFormat(phone);
    $(this).val(phone);
});

$('#phone').focusout(function() {
    function phoneFormat() {
        phone = phone.replace(/[^0-9]/g, '');
        phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
        return phone;
    }
    let phone = $(this).val();
    phone = phoneFormat(phone);
    $(this).val(phone);
});

const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', (e) => {
    let validator = $("#clientForm").validate({
        rules: {
            code: "required",
            name: "required",
            commercial_name: "required",
            email: {
                required: true,
                email: true
            },
            contact: "required",
            phone: "required",
            street: "required",
            city: "required",
            state: "required",
            zipcode: "required"
        }
    });
    if (validator.form() === false) {
        return false;
    }

    let rowCount = $("#warehouseTable tbody tr").length;
    if (rowCount < 1) {
        alert("You must add at least one warehouse to this client.");
        return false;
    }

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
        "<td class=\"text-center actions\">" +
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
    $("#warehouseTable tbody>tr>td").remove();
    const endpoint = '/clients/get/' + id;
    fetch(endpoint, {method: 'post'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            document.getElementById('idClient').value = result.data.client._id;
            document.getElementById('code').value = result.data.client.code;
            document.getElementById('name').value = result.data.client.name;
            document.getElementById('commercial_name').value = result.data.client.commercial_name;
            document.getElementById('email').value = result.data.client.email;
            document.getElementById('phone').value = result.data.client.phone;
            document.getElementById('contact').value = result.data.client.contact;
            document.getElementById('idAddress').value = result.data.client.address._id;
            document.getElementById('street').value = result.data.client.address.street;
            document.getElementById('city').value = result.data.client.address.city;
            document.getElementById('state').value = result.data.client.address.state;
            document.getElementById('zipcode').value = result.data.client.address.zipcode;

            result.data.warehouses.forEach((warehouse) => {
                addWarehouseRow(warehouse);
            })
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
        "<td class=\"text-center actions\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addClientModal').foundation('open'); getClient('" + data._id + "')\"></div>" +
        "<div class=\"fi-trash display-inline\" onclick=\"removeClient('" + data._id + "')\"></div>" +
        "</td>";
}

const saveWarehouseButton = document.getElementById('saveWarehouseButton');
saveWarehouseButton.addEventListener('click', (e) => {
    let validator = $( "#clientForm" ).validate({
        rules: {
            nameWarehouse: "required",
            streetWarehouse: "required",
            cityWarehouse: "required",
            stateWarehouse: "required",
            zipcodeWarehouse: "required",
            contactWarehouse: "required",
            phoneWarehouse: "required",
            emailWarehouse: {
                required: true,
                email: true
            }
        }
    });
    if (validator.form() === false) {
        return false;
    }

    const dataWarehouse = new URLSearchParams();

    dataWarehouse.append('idClient', document.getElementById('idClient').value);
    dataWarehouse.append('idWarehouse', document.getElementById('idWarehouse').value);
    dataWarehouse.append('idAddressWarehouse', document.getElementById('idAddressWarehouse').value);
    dataWarehouse.append('street',  document.getElementById('streetWarehouse').value);
    dataWarehouse.append('city', document.getElementById('cityWarehouse').value);
    dataWarehouse.append('state', document.getElementById('stateWarehouse').value);
    dataWarehouse.append('zipcode', document.getElementById('zipcodeWarehouse').value);
    dataWarehouse.append('name', document.getElementById('nameWarehouse').value);
    dataWarehouse.append('contact', document.getElementById('contactWarehouse').value);
    dataWarehouse.append('phone', document.getElementById('phoneWarehouse').value);
    dataWarehouse.append('email', document.getElementById('emailWarehouse').value);
    dataWarehouse.append('listIdWarehouses', document.getElementById('idWarehousesList').value);

    const endpoint = '/clients/warehouse/save';
    let method = 'PUT';
    if ((document.getElementById('idWarehouse').value) == "") {
        method = 'POST';
    }

    fetch(endpoint, {method: method, body: dataWarehouse})
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Something went wrong.');
            }
        })
        .then(result => {
            let listIdWarehouses = (document.getElementById('idWarehousesList').value).split(',');
            listIdWarehouses.push(result.data._id);
            listIdWarehouses = listIdWarehouses.join(',').replace(/^(\,)/gim, '')
            document.getElementById('idWarehousesList').value = listIdWarehouses;

            if (method == 'POST') {
                addWarehouseRow(result.data)
            } else {
                updateWarehouse(result.data);
            }
        })
        .catch(err => {
            document.getElementById('message').innerHTML = err.message;
            document.getElementById('alertContainer').style.display = 'block';
            alert(err);
        });
});

function addWarehouseRow(warehouse) {
    let address = warehouse.address.street + ', ' +
        warehouse.address.city + ', ' +
        warehouse.address.state + ', ' +
        warehouse.address.zipcode;

    let row = "" +
        "<tr id='"+ warehouse._id + "'>" +
        "<td>" + warehouse.name + "</td>" +
        "<td>" + address + "</td>" +
        "<td>" + warehouse.contact + "</td>" +
        "<td>" + warehouse.phone + "</td>" +
        "<td class=\"text-center actions\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"getWarehouse('" + warehouse._id + "')\"></div>" +
        "<div class=\"fi-trash display-inline\" onclick=\"removeWarehouse('" + warehouse._id + "')\"></div>" +
        "</td>" +
        "</tr>";

    $('#warehouseTable tbody:last-child').append(row);
}

function removeWarehouse(id) {
    const endpoint = '/clients/warehouse/remove/' + id;
    fetch(endpoint, {method: 'DELETE'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            $('#' + id).remove();
        })
        .catch(err => {
            alert('Something went wrong.');
        });
}

function updateWarehouse(warehouse) {
    let row = document.getElementById(warehouse._id);
    let address = warehouse.address.street + ', ' +
        warehouse.address.city + ', ' +
        warehouse.address.state + ', ' +
        warehouse.address.zipcode;

    row.innerHTML = "" +
        "<td>" + warehouse.name + "</td>" +
        "<td>" + address + "</td>" +
        "<td>" + warehouse.contact + "</td>" +
        "<td>" + warehouse.phone + "</td>" +
        "<td class=\"text-center\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"getWarehouse('" + warehouse._id + "')\"></div>" +
        "<div class=\"fi-trash display-inline\" onclick=\"removeWarehouse('" + warehouse._id + "')\"></div>" +
        "</td>";
}

function getWarehouse(id) {
    const endpoint = '/clients/warehouse/get/' + id;
    fetch(endpoint, {method: 'post'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            document.getElementById('idWarehouse').value = result.data._id;
            document.getElementById('nameWarehouse').value = result.data.name;
            document.getElementById('idAddressWarehouse').value = result.data.address._id;
            document.getElementById('streetWarehouse').value = result.data.address.street;
            document.getElementById('cityWarehouse').value = result.data.address.city;
            document.getElementById('stateWarehouse').value = result.data.address.state;
            document.getElementById('zipcodeWarehouse').value = result.data.address.zipcode;
            document.getElementById('contactWarehouse').value = result.data.contact;
            document.getElementById('phoneWarehouse').value = result.data.phone;
            document.getElementById('emailWarehouse').value = result.data.email;
        })
        .catch(err => {
            alert('Something went wrong.');
        });
}

function resetClientForm() {
    document.getElementById('clientForm').reset();
    document.getElementById('idClient').value = '';
    document.getElementById('idAddress').value = '';
    document.getElementById('idWarehouse').value = '';
    document.getElementById('idWarehousesList').value = '';
    $("#warehouseTable > tbody").empty();
}