const API_KEY = 'AIzaSyCVySc4qfLSCIelBrcqvdhoxGWWezmUd2g'; // Add your Google API key here
const SHEET_ID = '1uijP3XoxiWsZKv_HzzCJu9i4rqnt0qbkDMoFChSfxGM'; // Replace with your sheet ID
const USERS_SHEET = 'Users';
const POSTS_SHEET = 'Posts';

// Load Google API Client
gapi.load('client', initClient);

// Initialize the API client
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    });
}

// Register a new user
async function register(event) {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    try {
        await appendRowToSheet(USERS_SHEET, [email, password, role]);
        alert('Registration successful!');
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Failed to register.');
    }
}

// Login user
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const users = await getSheetData(USERS_SHEET);
        const user = users.find(row => row[0] === email && row[1] === password);
        if (user) {
            alert('Login successful');
            document.getElementById('post-section').style.display = 'block';
            document.getElementById('logout').style.display = 'block';
            loadPosts();
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed.');
    }
}

// Create a new post
async function createPost(event) {
    event.preventDefault();
    const content = document.getElementById('post-content').value;
    const label = document.getElementById('post-label').value;
    const author = 'author_email@example.com'; // Replace with actual author data
    const role = 'author_role'; // Replace with actual role data

    try {
        await appendRowToSheet(POSTS_SHEET, [author, role, content, label, new Date().toISOString()]);
        alert('Post created successfully!');
        loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post.');
    }
}

// Load posts
async function loadPosts(label = '') {
    try {
        const posts = await getSheetData(POSTS_SHEET);
        const filteredPosts = label ? posts.filter(post => post[3] === label) : posts;
        renderPosts(filteredPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Failed to load posts.');
    }
}

// Append a row to Google Sheets
async function appendRowToSheet(sheetName, row) {
    const response = await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [row]
        }
    });
    return response.result;
}

// Get data from Google Sheets
async function getSheetData(sheetName) {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A:Z`
    });
    return response.result.values || [];
}

// Render posts on the page
function renderPosts(posts) {
    const postList = document.getElementById('post-list');
    postList.innerHTML = '';

    posts.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${post[0]} (${post[1]})</strong><br>
            <p>${post[2]}</p>
            <small>Label: ${post[3]}</small><br>
            <small>Posted on: ${new Date(post[4]).toLocaleString()}</small>
        `;
        postList.appendChild(li);
    });
}

// Logout
function logout() {
    document.getElementById('post-section').style.display = 'none';
    document.getElementById('logout').style.display = 'none';
    alert('Logged out.');
}
