import axios from 'axios'

const postAPI = axios.create({})

const rootEl = document.querySelector('.root')

const templates = {
    postList: document.querySelector('#post-list').content,
    postItem: document.querySelector('#post-item').content,
    postContent: document.querySelector('#post-content').content,
    login: document.querySelector('#login').content
};

function render(fragment) {
    rootEl.textContent = '';
    rootEl.appendChild(fragment);
}
async function indexPage() {
    const res = await postAPI.get('http://localhost:3000/posts');
    const listFragment = document.importNode(templates.postList, true);

    listFragment.querySelector('.post-list__login-btn').addEventListener('click', e => {
        loginPage();
    })
    res.data.forEach(post => {
        const fragment = document.importNode(templates.postItem, true);
        const pEl = fragment.querySelector('.post-item__title');
        pEl.textContent = post.title;
        pEl.addEventListener('click', e => {
            postContentPage(post.id);
        })
        listFragment.querySelector('.post-list').appendChild(fragment);
    });

    render(listFragment);
}


async function postContentPage(postID) {
    const res = await postAPI.get(`http://localhost:3000/posts/${postID}`)
    const fragment = document.importNode(templates.postContent, true);

    fragment.querySelector('.post-content__title').textContent = `제목: ${res.data.title}`;
    fragment.querySelector('.post-content__body').textContent = `내용: ${res.data.body}`;
    fragment.querySelector('.post-content__btn-back').addEventListener('click', e => {
        indexPage();
    })
    render(fragment);
}


async function loginPage() {
    const fragment = document.importNode(templates.login, true);
    const formEl = fragment.querySelector('.login__form');

    formEl.addEventListener('submit', async e => {
        const payload = {
            //e.target에는 formEl이 포함
            //e.target.elements.username.value === fragment.querySelector('.login__username');
            username: e.target.elements.username.value,
            password: e.target.elements.password.value
        };
        e.preventDefault();
        const res = await postAPI.post('http://localhost:3000/users/login', payload)
        localStorage.setItem('token', res.data.token);
        postAPI.defaults.headers['Authorizaion'] = res.data.token;
        indexPage();
    })

    render(fragment);
}
indexPage();