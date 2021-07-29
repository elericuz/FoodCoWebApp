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
            if (_.lowerCase(result.status) === _.lowerCase('failed')) {
                document.getElementById('message').innerHTML = result.message;
                document.getElementById('alertContainer').style.display = 'block';
            } else {
                location.assign('/orders');
            }
        })
        .catch(err => {
            document.getElementById('message').innerHTML = err.message;
            document.getElementById('alertContainer').style.display = 'block';
        });
});