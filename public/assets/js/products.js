const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', (e) => {
    $('#dashboard-tabs').foundation('selectTab', $('#generalPanel'));
    let validator = $( "#productForm" ).validate();
    if (validator.form() === false) {
        return false;
    }

    var prices = $('#unitsPanel :checkbox:checked').length;
    if (prices === 0) {
        $('#dashboard-tabs').foundation('selectTab', $('#unitsPanel'));
        alert("You have to enter a price for this product before save it.")
        return false;
    }

    const data = new URLSearchParams();
    const form = document.getElementById('productForm');
    for (const pair of new FormData(form)) {
        data.append(pair[0], pair[1]);
    }

    const endpoint = '/products/save';
    let method = 'PUT';
    if ((document.getElementById('idProduct').value) === "") {
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
                addNewProduct(result.data)
            } else {
                updateProduct(result.data)
            }
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
            $('#addProductModal').foundation('close');
            resetProductForm();
        })
        .catch(err => {
            document.getElementById('message').innerHTML = err.message;
            document.getElementById('alertContainer').style.display = 'block';
            alert(err.message)
        });
});

function addNewProduct(data) {
    let inactive = "&nbsp;"
    if ($('#inactive').val() === "true") {
        inactive = "<div class=\"fi-check\"></div>"
    }

    let newRow = document.getElementById('productTable').insertRow();
    newRow.id = data._id;

    newRow.innerHTML = "" +
        "<td>" + data.code + "</td>" +
        "<td>" + data.manufacturer_id + "</td>" +
        "<td>" + data.manufacturer_name + "</td>" +
        "<td>" + data.manufacturer_brand_name + "</td>" +
        "<td class=\"text-center\">" + inactive + "</td>" +
        "<td class=\"text-center\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addProductModal').foundation('open'); getProduct('" + data._id + "')\"></div>" +
        "<div class=\"fi-trash display-inline\" onclick=\"removeProduct('" + data._id + "')\"></div>" +
        "</td>";
}

function removeProduct(id) {
    const endpoint = '/products/remove/' + id;
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

function getProduct(id) {
    resetProductForm();
    const endpoint = '/products/get/' + id;
    fetch(endpoint, {method: 'post'})
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong.');
        })
        .then((result) => {
            document.getElementById('idProduct').value = result.data._id;
            document.getElementById('manufacturer_id').value = result.data.manufacturer_id;
            document.getElementById('manufacturer_name').value = result.data.manufacturer_name;
            document.getElementById('spanish_name').value = result.data.spanish_name;
            document.getElementById('manufacturer_brand_name').value = result.data.manufacturer_brand_name;
            document.getElementById('manufacturer_part_number').value = result.data.manufacturer_part_number;
            document.getElementById('upc').value = result.data.upc;
            document.getElementById('warning_text').value = result.data.warning_text;
            $('#warning').attr('checked', result.data.warning);
            document.getElementById('pack_size').value = result.data.pack_size;
            document.getElementById('gross_lbs').value = result.data.gross_lbs;
            document.getElementById('net_lbs').value = result.data.net_lbs;
            document.getElementById('equiv').value = result.data.equiv;
            document.getElementById('cube').value = result.data.cube;
            $('#expire_item').attr('checked', result.data.expire_item);
            document.getElementById('shelf_life').value = result.data.shelf_life;
            document.getElementById('max_temp').value = result.data.max_temp;
            document.getElementById('high').value = result.data.high;
            $('#cool').attr('checked', result.data.cool);
            document.getElementById('sales').value = result.data.sales;
            document.getElementById('cogs').value = result.data.cogs;
            document.getElementById('invt').value = result.data.invt;
            document.getElementById('buyer').value = result.data.buyer;
            document.getElementById('misc').value = result.data.misc;
            document.getElementById('group').value = result.data.group;
            document.getElementById('class').value = result.data.class;
            document.getElementById('misc_one').value = result.data.misc_one;
            document.getElementById('misc_two').value = result.data.misc_two;
            document.getElementById('other_pick').value = result.data.other_pick;
            document.getElementById('max_label_weight').value = result.data.max_label_weight;
            $('#inactive').val(_.toString(result.data.inactive));
            $('#exclusive_item').attr('checked', result.data.exclusive_item);
            $('#catch_wt_sgl').attr('checked', result.data.catch_wt_sgl);
            $('#catch_wt_mutli').attr('checked', result.data.catch_wt_mutli);
            $('#par_item').attr('checked', result.data.par_item);
            $('#adv_purchase').attr('checked', result.data.adv_purchase);
            $('#adv_purchase_days').attr('value', result.data.adv_purchase_days);
            $('#expense').attr('checked', result.data.expense);
            $('#misc_item').attr('checked', result.data.misc_item);
            $('#non_stock').attr('checked', result.data.non_stock);
            $('#prepack_item').attr('checked', result.data.prepack_item);
            $('#supply').attr('checked', result.data.supply);
            $('#web_exclude').attr('checked', result.data.web_exclude);
            $('#two_specian_inv').attr('checked', result.data.two_specian_inv);
            $('#non_produce').attr('checked', result.data.non_produce);
            $('#non_domestic').attr('checked', result.data.non_domestic);
            $('#organic').attr('checked', result.data.organic);
            $('#pesticide_free').attr('checked', result.data.pesticide_free);
            $('#pallet_tags').attr('checked', result.data.pallet_tags);
            $('#taxable').attr('checked', result.data.taxable);
            $('#quality_check').attr('checked', result.data.quality_check);
            $('#future_buying_guide').attr('checked', result.data.future_buying_guide);
            $('#daily_buying_guide').attr('checked', result.data.daily_buying_guide);
            $('#non_commission').attr('checked', result.data.non_commission);
            $('#totes').attr('checked', result.data.totes);
            $('#driver_load').attr('checked', result.data.driver_load);

            result.prices.forEach(val => {
                $('#checkbox_'+val.unit_id).attr('checked', true);
                document.getElementById('unit_'+val.unit_id).value = val.price;
                $('#unit_'+val.unit_id).attr('disabled', false);
            })
        })
        .catch(err => {
            alert('Something went wrong.');
        });
}

function updateProduct(data) {
    let inactive = "&nbsp;"
    if ($('#inactive').val() === "true") {
        inactive = "<div class=\"fi-check\"></div>"
    }

    let row = document.getElementById(data._id);
    row.innerHTML = "" +
        "<td>" + data.code + "</td>" +
        "<td>" + data.manufacturer_id + "</td>" +
        "<td>" + data.manufacturer_name + "</td>" +
        "<td>" + data.manufacturer_brand_name + "</td>" +
        "<td class=\"text-center\">" + inactive + "</td>" +
        "<td class=\"text-center\">" +
        "<div class=\"fi-page-edit display-inline padding-right-1\" onclick=\"$('#addProductModal').foundation('open'); getProduct('" + data._id + "')\"></div>" +
        "<div class=\"fi-trash display-inline\" onclick=\"removeProduct('" + data._id + "')\"></div>" +
        "</td>";
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('idProduct').value = '';
    $('#unitsPanel :input').attr('disabled', true);
    $('#unitsPanel :checkbox').attr('disabled', false);
    $('input:checkbox').removeAttr('checked');
    $('#dashboard-tabs').foundation('selectTab', $('#generalPanel'));
}

function checkPrice(price, id) {
    if (price < 0.001) {
        $("#checkbox_" + id).prop('checked', false);
        $("#unit_" + id).val("");
        $("#unit_" + id).prop('disabled', true);
    }
}