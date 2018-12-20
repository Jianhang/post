package com.example.post.controller;

import com.example.post.model.*;
import com.example.post.payload.*;
import com.example.post.repository.PostRepository;
import com.example.post.repository.UserRepository;
import com.example.post.repository.CommentRepository;
import com.example.post.security.CurrentUser;
import com.example.post.security.UserPrincipal;
import com.example.post.service.PostService;
import com.example.post.util.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import javax.validation.Valid;
import java.net.URI;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostService postService;

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @GetMapping
    public PagedResponse<PostResponse> getPosts(@CurrentUser UserPrincipal currentUser,
                                                @RequestParam(value = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
                                                @RequestParam(value = "size", defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        return postService.getAllPosts(currentUser, page, size);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createPost(@Valid @RequestBody PostRequest postRequest) {
        Post post = postService.createPost(postRequest);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{postId}")
                .buildAndExpand(post.getId()).toUri();

        return ResponseEntity.created(location)
                .body(new ApiResponse(true, "Post Created Successfully"));
    }

    @GetMapping("/{postId}")
    public PostResponse getPostById(@CurrentUser UserPrincipal currentUser,
                                    @PathVariable Long postId) {
        return postService.getPostById(postId, currentUser);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePostById(@CurrentUser UserPrincipal currentUser,
                                                    @PathVariable Long postId) {
        return postService.deletePost(postId, currentUser);
    }

    @PostMapping("/{postId}/comments")
    @PreAuthorize("hasRole('USER')")
    public PostResponse comments(@CurrentUser UserPrincipal currentUser,
                                 @PathVariable Long postId,
                                 @Valid @RequestBody CommentRequest commentRequest) {
        return postService.commentAndGetUpdatedPost(postId, commentRequest, currentUser);
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    @PreAuthorize("hasRole('USER')")
    public PostResponse deleteComment(@CurrentUser UserPrincipal currentUser,
                                      @PathVariable Long postId,
                                      @PathVariable Long commentId) {
        return postService.deleteCommentAndGetUpdatedPost(postId, commentId, currentUser);
    }

}
