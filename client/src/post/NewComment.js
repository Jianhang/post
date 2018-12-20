import React, { Component } from 'react';
import { POST_COMMENT_MAX_LENGTH } from '../constants'
import { Form, Input, Button, Icon } from 'antd';
import './NewComment.css'
const FormItem = Form.Item;
const { TextArea } = Input;

class NewComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hiddeComment:true,
      comment: {
        text: ''
      }
    };
    this.hiddeCommentForm = this.hiddeCommentForm.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.isFormInvalid = this.isFormInvalid.bind(this);

  }

  validateComment = (commentText) => {
    if(commentText.length === 0) {
      return {
        validateStatus: 'error',
        errorMsg: 'Enter your comment!'
      }
    } else if (commentText.length > POST_COMMENT_MAX_LENGTH) {
      return {
        validateStatus: 'error',
        errorMsg: `Comment is too long (Maximum ${POST_COMMENT_MAX_LENGTH} characters allowed)`
      }
    } else {
      return {
        validateStatus: 'success',
        errorMsg: null
      }
    }
  };

  hiddeCommentForm() {
    this.setState({
      hiddeComment: !this.state.hiddeComment
      }
    )
  }


  handleCommentChange(event) {
    const value = event.target.value;
    this.setState({
      comment: {
        text: value,
        ...this.validateComment(value)
      }
    });
  }

  isFormInvalid() {
    if(this.state.comment.validateStatus !== 'success') {
      return true;
    }
  }

  render() {
    return (
      <div className="new-comment-container">
        <div className="new-comment-content">
          <span className="total-comments">{this.props.commentNumber} comments</span>
          <span className="separator">|</span>
          <span className="time-left"><a className="show-comment-form" onClick={this.hiddeCommentForm}><Icon type="edit" /></a></span>
          <div className="new-comment-form" hidden={this.state.hiddeComment}>
            <Form onSubmit={this.props.handleCommentSubmit} className="create-comment-form">
              <FormItem validateStatus={this.state.comment.validateStatus}
                        className="create-comment-form-Item">
                <TextArea
                  placeholder="Enter your comment"
                  style = {{ fontSize: '16px' }}
                  autosize={{ minRows: 3, maxRows: 6 }}
                  name = "Comment"
                  value={this.state.comment.text}
                  onChange = {this.handleCommentChange} />
              </FormItem>
              <FormItem create-comment-form-Item>
                  <Button onClick={this.hiddeCommentForm}
                    htmlType="submit"
                    type="primary"
                    size="small"
                    disabled={this.isFormInvalid()}>
                    Sumbmit
                  </Button>
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
    )
  }

}

export default NewComment;
