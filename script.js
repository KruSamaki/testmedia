const scriptURL = 'https://script.google.com/macros/s/AKfycbxuu4wCrr_R-0QoNvjVUKhfNXtQdi9eQ37tuuRKjyE509tzKrIYyR1FSE1eSQu4As-B/exec'; // Replace with your Web App URL

// Show loading spinner
function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Show login form
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

// Show registration form
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Register user
async function register(event) {
    event.preventDefault();
    showLoading();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    const payload = { action: 'registerUser', email, password, role };

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        hideLoading();
        alert(data.message);
    } catch (error) {
        console.error('Error registering user:', error);
        hideLoading();
        alert('Failed to register.');
    }
}

// Login user
// Login user and store session
async function login(event) {
    event.preventDefault();
    showLoading();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const payload = { action: 'loginUser', email, password };

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        hideLoading();
        if (data.success) {
            alert('Login successful');
            
            // Store user session data
            sessionStorage.setItem('authorEmail', email);
            sessionStorage.setItem('authorRole', data.role);

            document.getElementById('login-form').style.display = 'none';
            document.getElementById('post-section').style.display = 'block';
            document.getElementById('logout').style.display = 'block';
            loadPosts();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        hideLoading();
        alert('Failed to log in.');
    }
}


// Create a post
// Create a post with dynamic author and role
async function createPost(event) {
    event.preventDefault();
    showLoading();
    const content = document.getElementById('post-content').value;
    const label = document.getElementById('post-label').value;
    
    // Assuming `authorEmail` and `authorRole` are stored after login
    const author = sessionStorage.getItem('authorEmail');  
    const role = sessionStorage.getItem('authorRole');

    if (!author || !role) {
        alert('You need to be logged in to post.');
        hideLoading();
        return;
    }

    const payload = { action: 'postContent', author, role, content, label };

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        hideLoading();
        alert(data.message);
        loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        hideLoading();
        alert('Failed to create post.');
    }
}


// Load posts with optional label filter
async function loadPosts(label = '') {
    showLoading();
    try {
        const res = await fetch(`${scriptURL}?action=getPosts&label=${label}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        const posts = await res.json();
        if (res.ok) {
            renderPosts(posts);
        } else {
            Swal.fire('Error', 'Failed to load posts', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Network error, please try again later', 'error');
    } finally {
        hideLoading();
    }
}

// Display posts
// Render posts dynamically
function renderPosts(posts) {
    const postList = document.getElementById('post-list');
    postList.innerHTML = '';  // Clear existing posts

    posts.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${post.author} (${post.role})</strong><br>
            <p>${post.content}</p>
            <small>Label: ${post.label}</small><br>
            <small>Posted on: ${new Date(post.timestamp).toLocaleString()}</small><br>
            <small>Comments: ${post.comments ? post.comments : 'No comments yet'}</small>
        `;
        postList.appendChild(li);
    });
}


// Filter posts by label
function filterPosts(label) {
    loadPosts(label);
}

// Logout user
function logout() {
    document.getElementById('post-section').style.display = 'none';
    document.getElementById('logout').style.display = 'none';
    alert('Logged out.');
}
