package com.example.post.service;

import com.example.post.exception.BadRequestException;
import com.example.post.exception.ResourceNotFoundException;
import com.example.post.model.*;
import com.example.post.payload.*;
import com.example.post.repository.PostRepository;
import com.example.post.repository.UserRepository;
import com.example.post.repository.CommentRepository;
import com.example.post.security.UserPrincipal;
import com.example.post.util.AppConstants;
import com.example.post.util.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private  UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    public PagedResponse<PostResponse> getAllPosts(UserPrincipal currentUser, int page, int size) {
        validatePageNumberAndSize(page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        Page<Post> posts = postRepository.findAll(pageable);

        if(posts.getNumberOfElements() == 0) {
            return new PagedResponse<>(Collections.emptyList(), posts.getNumber(),
                    posts.getSize(), posts.getTotalElements(), posts.getTotalPages(), posts.isLast());
        }

        Map<Long, User> creatorMap = getCreatorMap(posts.getContent());

        List<PostResponse> postResponses = posts.map(post -> {
            return ModelMapper.mapPostToPostResponse(post,
                    creatorMap.get(post.getCreatedBy()),
                    creatorMap);
        }).getContent();

        return new PagedResponse<>(postResponses, posts.getNumber(),
                posts.getSize(), posts.getTotalElements(), posts.getTotalPages(), posts.isLast());

    }

    public PagedResponse<PostResponse> getPostsCreatedBy(String username, UserPrincipal currentUser, int page, int size) {
        validatePageNumberAndSize(page, size);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        Page<Post> posts = postRepository.findByCreatedBy(user.getId(), pageable);

        if(posts.getNumberOfElements() == 0) {
            return new PagedResponse<>(Collections.emptyList(), posts.getNumber(),
                    posts.getSize(), posts.getTotalElements(), posts.getTotalPages(), posts.isLast());
        }


        Map<Long, User> creatorMap = getCreatorMap(posts.getContent());

        List<PostResponse> postResponses = posts.map(post -> {
            return ModelMapper.mapPostToPostResponse(post,
                    creatorMap.get(post.getCreatedBy()),
                    creatorMap);
        }).getContent();

        return new PagedResponse<>(postResponses, posts.getNumber(),
                posts.getSize(), posts.getTotalElements(), posts.getTotalPages(), posts.isLast());

    }

    public PagedResponse<PostResponse> getPostsCommenteddBy(String username, UserPrincipal currentUser, int page, int size) {
        validatePageNumberAndSize(page, size);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        Page<Long> userCommentedPostIds = commentRepository.findCommentedPostIdsByUserId(user.getId(), pageable);

        if(userCommentedPostIds.getNumberOfElements() == 0) {
            return new PagedResponse<>(Collections.emptyList(), userCommentedPostIds.getNumber(),
                    userCommentedPostIds.getSize(), userCommentedPostIds.getTotalElements(),
                    userCommentedPostIds.getTotalPages(), userCommentedPostIds.isLast());
        }

        List<Long> postIds = userCommentedPostIds.getContent();
        Sort sort = new Sort(Sort.Direction.DESC, "createdAt");
        List<Post> posts = postRepository.findByIdIn(postIds, sort);

        Map<Long, User> creatorMap = getCreatorMap(posts);

        List<PostResponse> postResponses = posts.stream().map(post -> {
            return ModelMapper.mapPostToPostResponse(post,
                    creatorMap.get(post.getCreatedBy()),
                    creatorMap);
        }).collect(Collectors.toList());

        return new PagedResponse<>(postResponses, userCommentedPostIds.getNumber(),
                userCommentedPostIds.getSize(), userCommentedPostIds.getTotalElements(),
                userCommentedPostIds.getTotalPages(), userCommentedPostIds.isLast());
    }

    public Post createPost(PostRequest postRequest) {
        Post post = new Post();
        post.setTopic(postRequest.getTopic());
        post.setDescription(postRequest.getDescription());
        return postRepository.save(post);
    }

    public PostResponse getPostById(Long postId, UserPrincipal currentUser) {
        Post post = postRepository.findById(postId).orElseThrow(
                () -> new ResourceNotFoundException("Post", "id", postId));

        List<Post> posts = new ArrayList<>();
        posts.add(post);

        Map<Long, User> creatorMap = getCreatorMap(posts);
        return ModelMapper.mapPostToPostResponse(post,
                creatorMap.get(post.getCreatedBy()),
                creatorMap);

    }

    public PostResponse commentAndGetUpdatedPost(Long postId, CommentRequest commentRequest, UserPrincipal currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setBody(commentRequest.getText());
        commentRepository.save(comment);

        post.addComment(comment);
        List<Post> posts = new ArrayList<>();
        posts.add(post);

        Map<Long, User> creatorMap = getCreatorMap(posts);
        return ModelMapper.mapPostToPostResponse(post,
                creatorMap.get(post.getCreatedBy()),
                creatorMap);

    }

    public PostResponse deleteCommentAndGetUpdatedPost(Long postId, Long commentId, UserPrincipal currentUser) {
        Optional<Comment> optionalComment = commentRepository.findById(commentId);
        if (optionalComment.isPresent()) {
            Comment comment = optionalComment.get();
            if (comment.getCreatedBy().equals(currentUser.getId())) {
                commentRepository.delete(comment);
                Post post = postRepository.findById(postId)
                        .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
                post.removeComment(comment);
                List<Post> posts = new ArrayList<>();
                posts.add(post);

                Map<Long, User> creatorMap = getCreatorMap(posts);
                return ModelMapper.mapPostToPostResponse(post,
                        creatorMap.get(post.getCreatedBy()),
                        creatorMap);
            }
        }
        throw new BadRequestException("Comment doesn't exit.");
    }

    public ResponseEntity<?> deletePost(Long postId, UserPrincipal currentUser) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            if (post.getCreatedBy().equals(currentUser.getId())) {
                postRepository.delete(post);
                URI location = ServletUriComponentsBuilder
                        .fromCurrentContextPath().path("/")
                        .buildAndExpand().toUri();
                return ResponseEntity.created(location).body(new ApiResponse(true, "Post delete successfully"));
            }
        }
        return new ResponseEntity<>(new ApiResponse(false, "Post doesn't exist."),
                HttpStatus.BAD_REQUEST);
    }

    private void validatePageNumberAndSize(int page, int size) {
        if(page < 0) {
            throw new BadRequestException("Page number cannot be less than zero.");
        }

        if(size > AppConstants.MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must not be greater than " + AppConstants.MAX_PAGE_SIZE);
        }
    }

    private Map<Long, User> getCreatorMap(List<Post> posts) {
        List<Long> postCreatorIds = posts.stream()
                .map(Post::getCreatedBy)
                .collect(Collectors.toList());

        List<List<Long>> commentCreatorIdList = posts.stream()
                .map(post -> {
                    List<Comment> comments = post.getComments();
                    return comments.stream()
                            .map(Comment::getCreatedBy)
                            .collect(Collectors.toList());

                }).collect(Collectors.toList());

        List<Long> commentCreatorIds = new ArrayList<>();
        for (List<Long> ids : commentCreatorIdList) {
            commentCreatorIds.addAll(ids);
        }

        postCreatorIds.addAll(commentCreatorIds);

        List<Long> creatorIds = postCreatorIds.stream()
                .distinct().collect(Collectors.toList());

        List<User> creators = userRepository.findByIdIn(creatorIds);

        return creators.stream().collect(Collectors.toMap(User::getId, Function.identity()));
    }

}
