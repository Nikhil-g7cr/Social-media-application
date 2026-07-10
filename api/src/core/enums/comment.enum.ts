export const enum CommentsColumns {
    ID = "ID",
    PostID = "PostID",
    UserID = "UserID",
    ParentCommentID = "ParentCommentID",
    Content = "Content",
    CreatedAt = "CreatedAt",
    ModifiedAt = "ModifiedAt"
}

export enum CommentMessage {
    // Success messages
    S1 = 'Comment created successfully.',
    S2 = 'Comment updated successfully.',
    S3 = 'Comment deleted successfully.',
    S4 = 'User comments retrieved successfully.',

    // Error messages
    E1 = 'Comment not found.',
    E2 = 'Failed to create comment.',
    E3 = 'Failed to update comment.',
    E4 = 'Failed to delete comment.',
    E5 = 'Failed to retrieve user comments.',
    E6='Failed to add comment to the post.',
}

