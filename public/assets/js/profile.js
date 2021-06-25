const personalFormButton = document.getElementById('personalFormButton');
personalFormButton.addEventListener('click', (e) => {
    const data = new URLSearchParams();
    const form = document.getElementById('personalForm');
    for (const pair of new FormData(form)) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/user/update-personal-info';
    fetch(endpoint, {method: 'POST', body: data})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
        })
        .catch(err => {
            console.log(err)
            alert(err.message)
        });
});

const addAddressButton = document.getElementById('addAddressButton');
addAddressButton.addEventListener('click', (e) => {
    const data = new URLSearchParams();
    for (const pair of new FormData(document.getElementById('addAddressForm'))) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/user/add-address';
    fetch(endpoint, {method: 'POST', body: data})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then(result => {
            addNewAddress(result.data._id)
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
            document.getElementById('addAddressForm').reset();
        })
        .catch(err => {
            alert(err);
        });
    $('#addAddressModal').foundation('close');
});

function addNewAddress(id) {
    let newRow = document.getElementById('addressTable').insertRow();
    let address = document.getElementById('street').value + ', ' +
        document.getElementById('city').value + ', ' +
        document.getElementById('state').value + ', ' +
        document.getElementById('zipcode').value;
    newRow.id = id;
    newRow.innerHTML = "" +
        "<td>" + $('#type option:selected').text() + "</td>" +
        "<td>" + address + "</td>" +
        "<td><div class=\"fi-trash\" onclick=\"removeAddress('" + id + "')\"></div></td>";
}

function removeAddress(id) {
    const endpoint = '/user/remove-address/' + id;
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

const changePasswordFormButton = document.getElementById('changePasswordFormButton');
changePasswordFormButton.addEventListener('click', (e) => {
    $("#changePasswordForm").on("formvalid.zf.abide", function(ev,frm) {
        changePassword();
    });
});

function changePassword() {
    const data = new URLSearchParams();
    for (const pair of new FormData(document.getElementById('changePasswordForm'))) {
        data.append(pair[0], pair[1]);
    }
    const endpoint = '/user/change-password';
    fetch(endpoint, {method: 'POST', body: data})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            document.getElementById('changePasswordForm').reset();
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
        })
        .catch(err => {
            alert('Something went wrong.');
        });
}

const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', (e) => {
    const data = new URLSearchParams();
    const form = document.getElementById('loginForm');
    for (const pair of new FormData(form)) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/user/login';
    fetch(endpoint, {method: 'POST', body: data})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            location.assign('/orders');
        })
        .catch(err => {
            document.getElementById('message').innerHTML = err.message;
            document.getElementById('alertContainer').style.display = 'block';
            console.log(err)
            alert(err.message)
        });
});