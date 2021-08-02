async function downloadInvoice(id) {
    const method = 'GET';
    const endpoint = '/invoices/download/' + id;
    await fetch(endpoint, {method: method})
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Something went wrong.');
            }
        })
        .then(result => {
            downloadFile(result.path);
        })
        .catch(err => console.log(err));
}

function downloadFile(filePath){
    var link=document.createElement('a');
    link.href = filePath;
    link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
    link.click();
}