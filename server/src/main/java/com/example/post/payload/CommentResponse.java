package com.example.post.payload;

import java.time.Instant;

public class CommentResponse {
    private Long id;
    private String text;
    private Instant creationDateTime;
    private UserSummary createBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }


    public Instant getCreationDateTime() {
        return creationDateTime;
    }

    public void setCreationDateTime(Instant creationDateTime) {
        this.creationDateTime = creationDateTime;
    }

    public UserSummary getCreateBy() {
        return createBy;
    }

    public void setCreateBy(UserSummary createBy) {
        this.createBy = createBy;
    }
}
