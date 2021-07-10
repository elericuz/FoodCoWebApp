const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', (e) => {
    const data = new URLSearchParams();
    for (const pair of new FormData(document.getElementById('userForm'))) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/user/save';
    let method = 'PUT';
    if ((document.getElementById('idUser').value) == "") {
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
//                 addNewClient(result.data)
            } else {
                updateUser(result.data)
            }
//             document.getElementById('message').innerHTML = result.message;
//             document.getElementById('alertContainer').style.display = 'block';
//             $('#addClientModal').foundation('close');
//             resetClientForm();
        })
        .catch(err => {
            console.log(err);
            // document.getElementById('message').innerHTML = err.message;
            // document.getElementById('alertContainer').style.display = 'block';
        });
});

// function addNewClient(data) {
//     let newRow = document.getElementById('clientTable').insertRow();
//     newRow.id = data._id;
//
//     newRow.innerHTML = "" +
//         "<td>" + data.code + "</td>" +
//         "<td>" + data.name + "</td>" +
//         "<td>" + data.commercial_name + "</td>" +
//         "<td>" + data.email + "</td>" +
//         "<td>" + data.phone + "</td>" +
//         "<td class=\"text-center\">" +
//         "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addClientModal').foundation('open'); getClient('" + data._id + "')\"></div>" +
//         "<div class=\"fi-trash display-inline\" onclick=\"removeClient('" + data._id + "')\"></div>" +
//         "</td>";
// }

// function removeClient(id) {
//     const endpoint = '/clients/remove/' + id;
//     fetch(endpoint, {method: 'DELETE'})
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             }
//             throw new Error('Something went wrong.');
//         })
//         .then((result) => {
//             $('#' + id).remove();
//             document.getElementById('message').innerHTML = result.message;
//             document.getElementById('alertContainer').style.display = 'block';
//         })
//         .catch(err => {
//             alert('Something went wrong.');
//         });
// }

function getUser(id) {
//     resetClientForm();
    const endpoint = '/user/get/' + id;
    fetch(endpoint, {method: 'get'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            document.getElementById('idUser').value = result.data._id;
            document.getElementById('name').value = result.data.name;
            document.getElementById('lastname').value = result.data.lastname;
            document.getElementById('email_address').value = result.data.email_address;
            if (result.data.phonenumber != null) {
                document.getElementById('phonenumber').value = result.data.phonenumber;
            }
            document.getElementById('type_id').value = result.data.type_id._id;
            if (result.data.client_id == null) {
                document.getElementById('client_id').value = "";
            } else {
                document.getElementById('client_id').value = result.data.client_id._id;
            }
            document.getElementById('status').value = result.data.status;
        })
        .catch(err => {
            console.log(err);
            alert('Something went wrong.');
        });
}

function updateUser(data) {
    console.log(data);
    // let row = document.getElementById(data._id);
    // row.innerHTML = "" +
    //     "<td>" + document.getElementById('code').value + "</td>" +
    //     "<td>" + document.getElementById('name').value + "</td>" +
    //     "<td>" + document.getElementById('commercial_name').value + "</td>" +
    //     "<td>" + document.getElementById('email').value + "</td>" +
    //     "<td>" + document.getElementById('phone').value + "</td>" +
    //     "<td class=\"text-center\">" +
    //     "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addClientModal').foundation('open'); getClient('" + data._id + "')\"></div>" +
    //     "<div class=\"fi-trash display-inline\" onclick=\"removeClient('" + data._id + "')\"></div>" +
    //     "</td>";
}

// const saveWarehouseButton = document.getElementById('saveWarehouseButton');
// saveWarehouseButton.addEventListener('click', (e) => {
//     const dataWarehouse = new URLSearchParams();
//     dataWarehouse.append('idClient', document.getElementById('idClient').value);
//     dataWarehouse.append('idWarehouse', document.getElementById('idWarehouse').value);
//     dataWarehouse.append('idAddressWarehouse', document.getElementById('idAddressWarehouse').value);
//     dataWarehouse.append('street',  document.getElementById('streetWarehouse').value);
//     dataWarehouse.append('city', document.getElementById('cityWarehouse').value);
//     dataWarehouse.append('state', document.getElementById('stateWarehouse').value);
//     dataWarehouse.append('zipcode', document.getElementById('zipcodeWarehouse').value);
//     dataWarehouse.append('name', document.getElementById('nameWarehouse').value);
//     dataWarehouse.append('contact', document.getElementById('contactWarehouse').value);
//     dataWarehouse.append('phone', document.getElementById('phoneWarehouse').value);
//     dataWarehouse.append('email', document.getElementById('emailWarehouse').value);
//     dataWarehouse.append('listIdWarehouses', document.getElementById('idWarehousesList').value);
//
//     const endpoint = '/clients/warehouse/save';
//     let method = 'PUT';
//     if ((document.getElementById('idWarehouse').value) == "") {
//         method = 'POST';
//     }
//
//     fetch(endpoint, {method: method, body: dataWarehouse})
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             } else {
//                 throw new Error('Something went wrong.');
//             }
//         })
//         .then(result => {
//             console.log(result);
//             let listIdWarehouses = (document.getElementById('idWarehousesList').value).split(',');
//             listIdWarehouses.push(result.data._id);
//             listIdWarehouses = listIdWarehouses.join(',').replace(/^(\,)/gim, '')
//             document.getElementById('idWarehousesList').value = listIdWarehouses;
//
//             if (method == 'POST') {
//                 // addNewClient(result.data)
//             } else {
//                 updateWarehouse();
//             }
//         })
//         .catch(err => {
//             document.getElementById('message').innerHTML = err.message;
//             document.getElementById('alertContainer').style.display = 'block';
//             alert(err);
//         });
// });

// function addWarehouseRow(warehouse) {
//     let newRow = document.getElementById('warehouseTable').insertRow();
//     newRow.id = warehouse._id;
//     let address = warehouse.address.street + ', ' +
//         warehouse.address.city + ', ' +
//         warehouse.address.state + ', ' +
//         warehouse.address.zipcode;
//
//     newRow.innerHTML = "" +
//         "<td>" + warehouse.name + "</td>" +
//         "<td>" + address + "</td>" +
//         "<td>" + warehouse.contact + "</td>" +
//         "<td>" + warehouse.phone + "</td>" +
//         "<td class=\"text-center\">" +
//         "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"getWarehouse('" + warehouse._id + "')\"></div>" +
//         "<div class=\"fi-trash display-inline\" onclick=\"removeWarehouse('" + warehouse._id + "')\"></div>" +
//         "</td>";
// }

// function removeWarehouse(id) {
//     const endpoint = '/clients/warehouse/remove/' + id;
//     fetch(endpoint, {method: 'DELETE'})
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             }
//             throw new Error('Something went wrong.');
//         })
//         .then((result) => {
//             $('#' + id).remove();
//         })
//         .catch(err => {
//             alert('Something went wrong.');
//         });
// }

// function updateWarehouse() {
//     let row = document.getElementById('idWarehouse');
//     let address = document.getElementById('streetWarehouse').value + ', ' +
//         document.getElementById('cityWarehouse').value + ', ' +
//         document.getElementById('stateWarehouse').value + ', ' +
//         document.getElementById('zipcodeWarehouse').value;
//
//     row.innerHTML = "" +
//         "<td>" + document.getElementById('nameWarehouse').value + "</td>" +
//         "<td>" + address + "</td>" +
//         "<td>" + document.getElementById('contactWarehouse').value + "</td>" +
//         "<td>" + document.getElementById('phoneWarehouse').value + "</td>" +
//         "<td class=\"text-center\">" +
//         "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"getWarehouse('" + document.getElementById('idWarehouse') + "')\"></div>" +
//         "<div class=\"fi-trash display-inline\" onclick=\"removeWarehouse('" + document.getElementById('idWarehouse') + "')\"></div>" +
//         "</td>";
//
//     console.log(address);
// }

// function getWarehouse(id) {
//     const endpoint = '/clients/warehouse/get/' + id;
//     fetch(endpoint, {method: 'post'})
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             }
//             throw new Error('Something went wrong.');
//         })
//         .then((result) => {
//             document.getElementById('idWarehouse').value = result.data._id;
//             document.getElementById('nameWarehouse').value = result.data.name;
//             document.getElementById('idAddressWarehouse').value = result.data.address._id;
//             document.getElementById('streetWarehouse').value = result.data.address.street;
//             document.getElementById('cityWarehouse').value = result.data.address.city;
//             document.getElementById('stateWarehouse').value = result.data.address.state;
//             document.getElementById('zipcodeWarehouse').value = result.data.address.zipcode;
//             document.getElementById('contactWarehouse').value = result.data.contact;
//             document.getElementById('phoneWarehouse').value = result.data.phone;
//             document.getElementById('emailWarehouse').value = result.data.email;
//         })
//         .catch(err => {
//             alert('Something went wrong.');
//         });
// }

// function resetClientForm() {
//     document.getElementById('clientForm').reset();
//     document.getElementById('idClient').value = '';
//     document.getElementById('idAddress').value = '';
//     document.getElementById('idWarehouse').value = '';
//     document.getElementById('idWarehousesList').value = '';
// }