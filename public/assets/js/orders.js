$(function () {
    $('#date').fdatepicker({
        initialDate: '<%= today %>',
        endDate: '<%= today %>',
        startDate: '<%= today %>',
        format: 'mm-dd-yyyy',
        disableDblClickSelection: true,
        leftArrow: '<<',
        rightArrow: '>>',
        closeIcon: 'X',
        closeButton: false
    });

    $('#shipping_date').fdatepicker({
        initialDate: '<%= today %>',
        startDate: '<%= today %>',
        format: 'mm-dd-yyyy, hh:ii',
        disableDblClickSelection: true,
        leftArrow: '<<',
        rightArrow: '>>',
        closeIcon: 'X',
        closeButton: false,
        language: 'vi',
        pickTime: true,
        minView: 0
    });
});

function getUnits() {
    let selected = $('#product').val();
    const endpoint = '/products/units/' + selected;
    fetch(endpoint, {method: 'GET'})
        .then(response => response.json())
        .then((result) => {
            let $dropdownUnits = $("#unit");
            $dropdownUnits.empty();
            $.each(result.units, function() {
                $dropdownUnits.append($("<option />")
                    .val(this.unit_id._id)
                    .text(this.unit_id.name));
                document.getElementById('unitPrice').innerHTML = 'Price: $' + this.price.toFixed(2);
            });
        })
        .catch(err => console.log(err));
}

const addButton = document.getElementById('addButton');
addButton.addEventListener('click', (e) => {
    const data = new URLSearchParams();
    for (const pair of new FormData(document.getElementById('addProductForm'))) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/orders/add-product';
    fetch(endpoint, {method: 'POST', body: data})
        .then(response => response.json())
        .then((result) => {
            addNewRow(result._id, result)
        })
        .catch(err => console.log(err));
    $('#addProductModal').foundation('close');
});

function addNewRow(id, data) {
    var newRow = document.getElementById('detailsTable').insertRow();
    newRow.id = id;
    newRow.innerHTML = "" +
        "<td>" + data.quantity + "</td>" +
        "<td>" + $('#unit option:selected').text() + "</td>" +
        "<td>" + $('#product option:selected').text() + "</td>" +
        "<td>" + data.unit_price + "</td>" +
        "<td>" + data.total + "</td>" +
        "<td>" +
        "<div class=\"grid-x grid-margin-x\">" +
        "<div class=\"cell small-1\">" +
        "<div class=\"fi-trash\" onclick=\"removeRow('" + id + "')\"></div>" +
        "</div>" +
        "</div>" +
        "</td>";
}

function removeRow(id) {
    const endpoint = '/orders/remove-product/' + id;
    fetch(endpoint, {method: 'DELETE'})
        .then(response => response.json())
        .then((result) => {
            $('#' + id).remove();
        })
        .catch(err => console.log(err));
}