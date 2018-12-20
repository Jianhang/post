import React, { Component } from 'react';
import { createPost } from '../util/APIUtils';
import {POST_TOPIC_MAX_LENGTH, POST_DESCRIPTION_MAX_LENGTH } from '../constants';
import './NewPost.css';
import { Form, Input, Button, notification } from 'antd';
const FormItem = Form.Item;
const { TextArea } = Input;

class NewPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topic: {
        text: ''
      },
      description: {
        text: ''
      }
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.isFormInvalid = this.isFormInvalid.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const postData = {
      topic: this.state.topic.text,
      description: this.state.description.text
    };

    createPost(postData)
      .then(response => {
        this.props.history.push("/");
      }).catch(error => {
      if(error.status === 401) {
        this.props.handleLogout('/login', 'error', 'You have been logged out. Please login create post.');
      } else {
        notification.error({
          message: 'posting App',
          description: error.message || 'Sorry! Something went wrong. Please try again!'
        });
      }
    });
  }

  validateTopic = (topicText) => {
    if(topicText.length === 0) {
      return {
        validateStatus: 'error',
        errorMsg: 'Please enter your topic!'
      }
    } else if (topicText.length > POST_TOPIC_MAX_LENGTH) {
      return {
        validateStatus: 'error',
        errorMsg: `Topic is too long (Maximum ${POST_TOPIC_MAX_LENGTH} characters allowed)`
      }
    } else {
      return {
        validateStatus: 'success',
        errorMsg: null
      }
    }
  };

  handleTopicChange(event) {
    const value = event.target.value;
    this.setState({
      topic: {
        text: value,
        ...this.validateTopic(value)
      }
    });
  }

  validateDescription = (descriptionText) => {
    if (descriptionText.length > POST_DESCRIPTION_MAX_LENGTH) {
      return {
        validateStatus: 'error',
        errorMsg: `Description is too long (Maximum ${POST_DESCRIPTION_MAX_LENGTH} characters allowed)`
      }
    } else {
      return {
        validateStatus: 'success',
        errorMsg: null
      }
    }
  };

  handleDescriptionChange(event) {
    const value = event.target.value;
    this.setState({
      description: {
        text: value,
        ...this.validateDescription(value)
      }
    });
  }

  isFormInvalid() {
    if(this.state.topic.validateStatus !== 'success') {
      return true;
    }
  }

  render() {
    return (
      <div className="new-post-container">
        <h1 className="page-title">Create post</h1>
        <div className="new-post-content">
          <Form onSubmit={this.handleSubmit} className="create-post-form">
            <FormItem validateStatus={this.state.topic.validateStatus}
            help={this.state.topic.errorMsg} className="post-form-row">
              <Input
                placeholder="Enter your topic"
                style = {{ fontSize: '16px' }}
                size = "large"
                name = "topic"
                value={this.state.topic.text}
                onChange={this.handleTopicChange}
              />
            </FormItem>
            <FormItem validateStatus={this.state.description.validateStatus}
                      help={this.state.description.errorMsg} className="post-form-row">
                        <TextArea
                          placeholder="Enter your description"
                          style = {{ fontSize: '16px' }}
                          autosize={{ minRows: 5, maxRows: 8 }}
                          name = "description"
                          value = {this.state.description.text}
                          onChange = {this.handleDescriptionChange} />
            </FormItem>
            <FormItem className="post-form-row">
              <Button type="primary"
                      htmlType="submit"
                      size="large"
                      disabled={this.isFormInvalid()}
                      className="create-post-form-button">Create post</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}


export default NewPost;