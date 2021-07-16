$('#phonenumber').focusout(function() {
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
saveButton.addEventListener('click', async (e) => {
    const data = new URLSearchParams();
    for (const pair of new FormData(document.getElementById('userForm'))) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/user/save';
    let method = 'PUT';
    if ((document.getElementById('idUser').value) == "") {
        method = 'POST';
    }

    await fetch(endpoint, {method: method, body: data})
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Something went wrong.');
            }
        })
        .then(result => {
            if (method == 'POST') {
                addNewUser(result.data);
            } else {
                updateUser(result.data);
            }
            resetUserForm();
            $('#userModal').foundation('close');
        })
        .catch(err => {
            console.log(err);
        });
});

function addNewUser(data) {
    let newRow = document.getElementById('userTable').insertRow();
    newRow.id = data._id;

    newRow.innerHTML = "" +
        "<td>" + data.name + "</td>" +
        "<td>" + data.lastname + "</td>" +
        "<td>" + data.email_address + "</td>" +
        "<td>" + data.type_id.name + "</td>" +
        "<td><a href=\"#\" class=\"fi-page-edit\" " +
        "       style=\"margin-top: 10px\"" +
        "       onclick=\"$('#userModal').foundation('open'); getUser('" + data._id + "')\">" +
        "   <a href=\"#\" class=\"fi-trash\" style=\"margin-top: 10px\" onclick=\"deleteUser('" + data._id + "')\">" +
        "</td>" +
        "</td>";
}

function deleteUser(id) {
    const endpoint = '/user/delete/' + id;
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

function getUser(id) {
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
    let row = document.getElementById(data._id);
    let client = '&nbsp;'
    if (data.client_id.name) {
        client = data.client_id.name;
    }

    row.innerHTML = "" +
        "<td>" + data.name + "</td>" +
        "<td>" + data.lastname + "</td>" +
        "<td>" + data.email_address + "</td>" +
        "<td>" + data.type_id.name + "</td>" +
        "<td>" + client + "</td>" +
        "<td><a href=\"#\" class=\"fi-page-edit\" " +
        "       style=\"margin-top: 10px\"" +
        "       onclick=\"$('#userModal').foundation('open'); getUser('" + data._id + "')\">" +
        "   <a href=\"#\" class=\"fi-trash\" style=\"margin-top: 10px\" onclick=\"deleteUser('" + data._id + "')\">" +
        "</td>" +
        "</td>";
}

function resetUserForm() {
    $('input:hidden').val('');
    $('select').val('');
    $('input:text').val('');
}