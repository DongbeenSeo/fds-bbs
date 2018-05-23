import axios from 'axios'

const rootEl = document.querySelector('.root')

const templates = {
    postList: document.querySelector('#post-list').content,
    postItem: document.querySelector('#post-item').content,
    postContent: document.querySelector('#post-content').content
};

function render(fragment) {
    rootEl.textContent = '';
    rootEl.appendChild(fragment);
}
async function indexPage() {
    const res = await axios.get('http://localhost:3000/posts');
    const listFragment = document.importNode(templates.postList, true);
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
    const res = await axios.get(`http://localhost:3000/posts/${postID}`)
    const fragment = document.importNode(templates.postContent, true);

    fragment.querySelector('.post-content__title').textContent = `제목: ${res.data.title}`;
    fragment.querySelector('.post-content__body').textContent = `내용: ${res.data.body}`;
    fragment.querySelector('.post-content__btn-back').addEventListener('click', e => {
        indexPage();
    })
    render(fragment);
}

indexPage();