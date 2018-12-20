import React, { Component } from 'react';
import './Post.css';
import NewComment from './NewComment'
import { Avatar, Icon, Row, Col, Collapse, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { getAvatarColor } from '../util/Colors';
import { formatDateTime } from '../util/Helpers';

const Panel = Collapse.Panel;


class Post extends Component {
  constructor(props){
    super(props);
    this.state = {
      hiddeComment: true
    }
  }

  shouldHideDeletePostIcon() {
    if (!this.props.currentUser) {
      return true;
    }
    return this.props.post.createdBy.id !== this.props.currentUser.id;
  }

  shouldHideDeleteCommentIcon(comment) {
    if (!this.props.currentUser) {
      return true;
    }
    return comment.createBy.id !== this.props.currentUser.id;
  }

  render() {
    const commentViews = [];
    this.props.post.comments.forEach((comment, index) => {
      commentViews.push(
        <div className="post-comments-text" key={comment.id}>
          <Link className="creator-link" to={`/users/${comment.createBy.username}`}>
            {comment.createBy.username}:&nbsp;&nbsp;
          </Link>
          {comment.text}
            <a className="comment-delete-icon"
              onClick={(event) => this.props.handleCommentDelete(event, comment.id)}
              hidden={this.shouldHideDeleteCommentIcon(comment)}>
              -
            </a>
        </div>
      )
    });

    return (
      <div className="post-content">
        <div className="post-header">
          <Row>
            <Col span={22}>
            <div className="post-creator-info">
              <Link className="creator-link" to={`/users/${this.props.post.createdBy.username}`}>
                <Avatar className="post-creator-avatar"
                        style={{ backgroundColor: getAvatarColor(this.props.post.createdBy.name)}} >
                  {this.props.post.createdBy.name[0].toUpperCase()}
                </Avatar>
                <span className="post-creator-name">
                                  {this.props.post.createdBy.name}
                              </span>
                <span className="post-creator-username">
                                  @{this.props.post.createdBy.username}
                              </span>
                <span className="post-creation-date">
                                  {formatDateTime(this.props.post.creationDateTime)}
                              </span>
              </Link>
            </div>
            </Col>
            <Col span={2}>
              <div className="delete-post-icon" hidden={this.shouldHideDeletePostIcon()}>
                <Popconfirm
                  title="Are you sure delete this post?"
                  onConfirm={this.props.handlePostDelete}
                  okText="Yes"
                  cancelText="No">
                  <a href="#"><Icon type="close" /></a>
                </Popconfirm>
              </div>
            </Col>
          </Row>
          <div className="post-topic">
            <Collapse bordered={false} defaultActiveKey={['1']}>
              <Panel
                     header={this.props.post.topic}
                     showArrow={false}
              >
                {this.props.post.description}
              </Panel>
            </Collapse>

          </div>
        </div>
        <div className="post-comments">
          {commentViews}
        </div>
        <div className="post-footer">
            <NewComment
              commentNumber = {commentViews.length}
              currentComment={this.props.currentComment}
              handleCommentSubmit={this.props.handleCommentSubmit}
            />
        </div>
      </div>
    );
  }
}


export default Post;