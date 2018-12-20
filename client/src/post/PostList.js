import React, { Component } from 'react';
import { getAllPosts, getUserCreatedPosts, getUserCommentedPosts, deleteUserPost, deleteUserComment} from '../util/APIUtils';
import Post from './Post';
import { createComment } from '../util/APIUtils';
import LoadingIndicator  from '../common/LoadingIndicator';
import { Button, Icon, notification } from 'antd';
import { POST_LIST_SIZE } from '../constants';
import { withRouter } from 'react-router-dom';
import './PostList.css';

class PostList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      last: true,
      currentComments: [],
      isLoading: false
    };
    this.loadPostList = this.loadPostList.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  loadPostList(page = 0, size = POST_LIST_SIZE) {
    let promise;
    if(this.props.username) {
      if(this.props.type === 'USER_CREATED_POSTS') {
        promise = getUserCreatedPosts(this.props.username, page, size);
      } else if (this.props.type === 'USER_COMMENTED_POSTS') {
        promise = getUserCommentedPosts(this.props.username, page, size);
      }
    } else {
      promise = getAllPosts(page, size);
    }

    if(!promise) {
      return;
    }

    this.setState({
      isLoading: true
    });

    promise
      .then(response => {
        const posts = this.state.posts.slice();
        const currentComments = this.state.currentComments.slice();

        this.setState({
          posts: posts.concat(response.content),
          page: response.page,
          size: response.size,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          last: response.last,
          currentComments: currentComments.concat(Array(response.content.length).fill(null)),
          isLoading: false
        });
      }).catch(error => {
      this.setState({
        isLoading: false
      })
    });

  }

  componentDidMount() {
    this.loadPostList();
  }

  componentDidUpdate(nextProps) {
    if(this.props.isAuthenticated !== nextProps.isAuthenticated) {
      this.setState({
        posts: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
        currentComments: [],
        isLoading: false
      });
      this.loadPostList();
    }
  }

  handleLoadMore() {
    this.loadPostList(this.state.page + 1);
  }

  handlePostDelete(event, postIndex) {
    event.preventDefault();
    if(!this.props.isAuthenticated) {
      this.props.history.push("/login");
      notification.info({
        message: 'Posting App',
        description: "Please login to comment.",
      });
      return;
    }
    const postId = this.state.posts[postIndex].id;
    deleteUserPost(postId)
      .then(response=> {
        let posts = this.state.posts.slice(0, postIndex);
        posts = posts.concat(this.state.posts.slice(postIndex + 1));
        this.setState({
          posts: posts
        })
      }).catch(error => {
      if(error.status === 401) {
        this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to comment');
      } else {
        notification.error({
          message: 'Posting App',
          description: error.message || 'Sorry! Something went wrong. Please try again!'
        });
      }
    });
  }


  handleCommentSubmit(event, postIndex) {
    event.preventDefault();
    if(!this.props.isAuthenticated) {
      this.props.history.push("/login");
      notification.info({
        message: 'Posting App',
        description: "Please login to comment.",
      });
      return;
    }

    const post = this.state.posts[postIndex];
    const target = event.target;
    const comment = target.Comment.value;

    const commentData = {
      postId: post.id,
      text: comment
    };

    createComment(commentData)
      .then(response => {
        console.log(response);
        const posts = this.state.posts.slice();
        posts[postIndex] = response;
        this.setState({
          posts: posts
        });
      }).catch(error => {
      if(error.status === 401) {
        this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to comment');
      } else {
        notification.error({
          message: 'Posting App',
          description: error.message || 'Sorry! Something went wrong. Please try again!'
        });
      }
    });
  }

  handleCommentDelete(event, postIndex, commentId) {
    event.preventDefault();
    if (!this.props.isAuthenticated) {
      this.props.history.push("/login");
      notification.info({
        message: 'Posting App',
        description: "Please login to comment.",
      });
      return;
    }

    const post = this.state.posts[postIndex];
    deleteUserComment(post.id, commentId)
      .then(response => {
        const posts = this.state.posts.slice();
        posts[postIndex] = response;
        this.setState({
          posts: posts
        });
      }).catch(error => {
      if(error.status === 401) {
        this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to comment');
      } else {
        notification.error({
          message: 'Posting App',
          description: error.message || 'Sorry! Something went wrong. Please try again!'
        });
      }
    });
  }

  render() {
    const postViews = [];
    this.state.posts.forEach((post, postIndex) => {
      postViews.push(<Post
        key={post.id}
        post={post}
        currentUser={this.props.currentUser}
        handleCommentSubmit={(event) => this.handleCommentSubmit(event, postIndex)}
        handlePostDelete={(event) => this.handlePostDelete(event, postIndex)}
        handleCommentDelete={(event, commentId) => this.handleCommentDelete(event, postIndex, commentId)}
        />)
    });

    return (
      <div className="posts-container">
        {postViews}
        {
          !this.state.isLoading && this.state.posts.length === 0 ? (
            <div className="no-posts-found">
              <span>No Posts Found.</span>
            </div>
          ): null
        }
        {
          !this.state.isLoading && !this.state.last ? (
            <div className="load-more-posts">
              <Button type="dashed" onClick={this.handleLoadMore} disabled={this.state.isLoading}>
                <Icon type="plus" /> Load more
              </Button>
            </div>): null
        }
        {
          this.state.isLoading ?
            <LoadingIndicator />: null
        }
      </div>
    );
  }
}

export default withRouter(PostList);