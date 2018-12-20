import { API_BASE_URL, POST_LIST_SIZE, ACCESS_TOKEN } from '../constants';

const request = (options) => {
    const headers = new Headers({
        'Content-Type': 'application/json',
    });

    if(localStorage.getItem(ACCESS_TOKEN)) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
    }

    const defaults = {headers: headers};
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
        .then(response =>
            response.json().then(json => {
                if(!response.ok) {
                    return Promise.reject(json);
                }
                return json;
            })
        );
};

export function getAllPosts(page, size) {
    page = page || 0;
    size = size || POST_LIST_SIZE;
    return request({
        url: API_BASE_URL + "/posts?page=" + page + "&size=" + size,
        method: 'GET'
    });
}

export function createPost(postData) {
    return request({
        url: API_BASE_URL + "/posts",
        method: 'POST',
        body: JSON.stringify(postData)
    });
}

export function createComment(commentData) {
    return request({
        url: API_BASE_URL + "/posts/" + commentData.postId + "/comments",
        method: 'POST',
        body: JSON.stringify(commentData)
    });
}

export function login(loginRequest) {
    return request({
        url: API_BASE_URL + "/auth/signin",
        method: 'POST',
        body: JSON.stringify(loginRequest)
    });
}

export function signup(signupRequest) {
    return request({
        url: API_BASE_URL + "/auth/signup",
        method: 'POST',
        body: JSON.stringify(signupRequest)
    });
}

export function checkUsernameAvailability(username) {
    return request({
        url: API_BASE_URL + "/user/checkUsernameAvailability?username=" + username,
        method: 'GET'
    });
}

export function checkEmailAvailability(email) {
    return request({
        url: API_BASE_URL + "/user/checkEmailAvailability?email=" + email,
        method: 'GET'
    });
}


export function getCurrentUser() {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/user/me",
        method: 'GET'
    });
}

export function getUserProfile(username) {
    return request({
        url: API_BASE_URL + "/users/" + username,
        method: 'GET'
    });
}

export function getUserCreatedPosts(username, page, size) {
    page = page || 0;
    size = size || POST_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/" + username + "/posts?page=" + page + "&size=" + size,
        method: 'GET'
    });
}

export function getUserCommentedPosts(username, page, size) {
    page = page || 0;
    size = size || POST_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/" + username + "/comments?page=" + page + "&size=" + size,
        method: 'GET'
    });
}

export function deleteUserComment(postId, commentId) {
    return request({
      url: API_BASE_URL + "/posts/" + postId + "/comments/" + commentId,
      method: 'DELETE'
    })
}

export function deleteUserPost(postId) {
  return request({
    url: API_BASE_URL + "/posts/" + postId,
    method: "DELETE"
  })

}