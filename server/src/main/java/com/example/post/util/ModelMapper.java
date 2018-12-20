package com.example.post.util;

import com.example.post.model.Post;
import com.example.post.model.User;
import com.example.post.payload.CommentResponse;
import com.example.post.payload.PostResponse;
import com.example.post.payload.UserSummary;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ModelMapper {
    public static PostResponse mapPostToPostResponse(Post post, User creator, Map<Long, User> creatorMap) {
        PostResponse postResponse = new PostResponse();
        postResponse.setId(post.getId());
        postResponse.setTopic(post.getTopic());
        postResponse.setDescription(post.getDescription());
        postResponse.setCreationDateTime(post.getCreatedAt());

        List<CommentResponse> commentResponses = post.getComments().stream().map(comment -> {
            CommentResponse commentResponse = new CommentResponse();
            commentResponse.setId(comment.getId());
            commentResponse.setText(comment.getBody());
            commentResponse.setCreationDateTime(comment.getCreatedAt());
            User user = creatorMap.get(comment.getCreatedBy());
            UserSummary creatorSummary = new UserSummary(user.getId(), user.getUsername(), user.getName());
            commentResponse.setCreateBy(creatorSummary);
            return commentResponse;
        }).collect(Collectors.toList());

        postResponse.setComments(commentResponses);
        UserSummary creatorSummary = new UserSummary(creator.getId(), creator.getUsername(), creator.getName());
        postResponse.setCreatedBy(creatorSummary);

        postResponse.setTotalComment(post.getComments().size());

        return postResponse;
    }
}
