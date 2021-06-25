const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', (e) => {
    console.log('aca');
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
            document.getElementById('message').innerHTML = result.message;
            document.getElementById('alertContainer').style.display = 'block';
            console.log(err)
            alert(err.message)
        });
});