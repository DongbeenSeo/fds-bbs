import axios from 'axios'

//axios instance를 정의
const postAPI = axios.create({
    baseURL: process.env.API_URL
})
const rootEl = document.querySelector('.root')

//1. ID password가 입력되었을 때
//2. login 상태를 유지 시켜주는
function login(token) {
    localStorage.setItem('token', token);
    postAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
    rootEl.classList.add('root--authed');
}

function logout() {
    localStorage.removeItem('token');
    delete postAPI.defaults.headers['Authorization'];
    rootEl.classList.remove('root--authed');
}

const templates = {
    postList: document.querySelector('#post-list').content,
    postItem: document.querySelector('#post-item').content,
    postContent: document.querySelector('#post-content').content,
    login: document.querySelector('#login').content,
    postForm: document.querySelector('#post-form').content,
    comments: document.querySelector('#comments').content,
    commentItem: document.querySelector('#comment-item').content
};

function render(fragment) {
    rootEl.textContent = '';
    rootEl.appendChild(fragment);
}

//fragment안에는 template tag안의 element가 저장되어있다.
async function indexPage() {
    rootEl.classList.add('root--loading');
    const res = await postAPI.get('/posts?_expand=user');
    rootEl.classList.remove('root--loading');

    const listFragment = document.importNode(templates.postList, true);

    listFragment.querySelector('.post-list__login-btn').addEventListener('click', e => {
        loginPage();
    })
    listFragment.querySelector('.post-list__new-post-btn').addEventListener('click', e => {
        postFormPage();
    })
    listFragment.querySelector('.post-list__logout-btn').addEventListener('click', e => {
        logout();
        indexPage();
    });
    //logout 기능 localstorage있는 token을 지우고, axios instance의 Authorization을 제거

    res.data.forEach(post => {
        const fragment = document.importNode(templates.postItem, true);
        fragment.querySelector('.post-item__author').textContent = `작성자 ${post.user.username}`
        const pEl = fragment.querySelector('.post-item__title');


        pEl.textContent = post.title;
        pEl.addEventListener('click', e => {
            postContentPage(post.id);
        })
        listFragment.querySelector('.post-list').appendChild(fragment);
    });

    render(listFragment);
}

//제목 클릭하면 내용을 보여주는 함수
async function postContentPage(postID) {
    rootEl.classList.add('root--loading');
    const res = await postAPI.get(`/posts/${postID}`);
    rootEl.classList.remove('root--loading');
    const fragment = document.importNode(templates.postContent, true);

    fragment.querySelector('.post-content__title').textContent = res.data.title;
    fragment.querySelector('.post-content__body').textContent = res.data.body;
    fragment.querySelector('.post-content__btn-back').addEventListener('click', e => {
        indexPage();
    });
    //로그인을 하면 댓글이 보이고 로그아웃상태이면 댓글을 볼수 없도록
    if (localStorage.getItem('token')) {
        const commentsFragment = document.importNode(templates.comments, true);
        rootEl.classList.add('root--loading');
        const commentsRes = await postAPI.get(`/posts/${postID}/comments`);
        rootEl.classList.remove('root--loading');
        commentsRes.data.forEach(comment => {
            const itemFragment = document.importNode(templates.commentItem, true);
            const bodyEl = itemFragment.querySelector('.comment-item__body');
            const removeButtonEl = itemFragment.querySelector('.comment-item__remove-btn');
            bodyEl.textContent = comment.body;
            //낙관적 업데이트, 문서를 수정하고 통신을 추가
            removeButtonEl.addEventListener('click', async e => {
                //p tag와 btn tag 삭제
                bodyEl.remove();
                removeButtonEl.remove();
                //delete요청 보내기
                const res = await postAPI.delete(`/comments/${comment.id}`);
                //요청이 실패 했을 경우 복구(생략)
            })
            commentsFragment.querySelector('.comments__list').appendChild(itemFragment);
        })
        const formEl = commentsFragment.querySelector('.comments__form');
        rootEl.classList.add('root--loading');
        formEl.addEventListener('submit', async e => {
            e.preventDefault();
            const payload = {
                body: e.target.elements.body.value
            };
            rootEl.classList.add('root--loading');
            rootEl.classList.add('root--loading');
            const res = await postAPI.post(`/posts/${postID}/comments`, payload);
            rootEl.classList.remove('root--loading');
            rootEl.classList.remove('root--loading');
            postContentPage(postID);
        })
        fragment.appendChild(commentsFragment);
        rootEl.classList.remove('root--loading');
    }
    render(fragment);
}

//로그인 페이지 렌더링 함수
async function loginPage() {
    const fragment = document.importNode(templates.login, true);
    const formEl = fragment.querySelector('.login__form');
    rootEl.classList.add('root--loading');
    formEl.addEventListener('submit', async e => {
        const payload = {
            //e.target에는 formEl이 포함
            //e.target.elements.username.value === fragment.querySelector('.login__username');
            username: e.target.elements.username.value,
            password: e.target.elements.password.value
        };
        e.preventDefault();
        rootEl.classList.add('root--loading');
        const res = await postAPI.post('/users/login', payload)
        rootEl.classList.remove('root--loading');
        login(res.data.token);
        indexPage();
    })
    rootEl.classList.remove('root--loading');

    render(fragment);
}


//글쓰기 페이지 렌더링 함수 
async function postFormPage() {
    const fragment = document.importNode(templates.postForm, true);
    const formEl = fragment.querySelector('.post-form');

    fragment.querySelector('.post-form').addEventListener('submit', async e => {
        e.preventDefault();
        const payload = {
            title: e.target.elements.title.value,
            body: e.target.elements.body.value
        }
        const res = await postAPI.post('/posts', payload);
        // postContentPage(res.data.id);
        indexPage()
    })
    fragment.querySelector('.post-form__btn-back').addEventListener('click', e => {
        e.preventDefault();
        indexPage();
    })
    render(fragment);
}



//localStorage에 저장되어있는 token을 사용해서 로그인을 유지할 수 있도록(요청에 header가 포함되도록)
if (localStorage.getItem('token')) {
    //classList에는 . 사용 X
    login(localStorage.getItem('token'));
}
indexPage();