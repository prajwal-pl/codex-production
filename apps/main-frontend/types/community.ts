// Community Types for Posts and Comments

export interface PostAuthor {
    id: string;
    name: string;
    email: string;
}

export interface Comment {
    id: string;
    content: string;
    postId: string;
    authorId: string;
    createdAt: string;
    author: PostAuthor;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    isFlagged: boolean;
    author: PostAuthor;
    _count: {
        comments: number;
    };
}

export interface PostWithComments extends Omit<Post, "_count"> {
    comments: Comment[];
}

export interface GetAllPostsResponse {
    success: boolean;
    message: string;
    data: Post[];
}

export interface GetPostByIdResponse {
    success: boolean;
    message: string;
    data: PostWithComments;
}

export interface CreatePostRequest {
    title: string;
    content: string;
    imageUrl?: string;
}

export interface CreatePostResponse {
    success: boolean;
    message: string;
    data: Post;
}

export interface CreateCommentRequest {
    content: string;
}

export interface CreateCommentResponse {
    success: boolean;
    message: string;
    data: Post;
}

export interface DeletePostResponse {
    success: boolean;
    message: string;
}

export interface DeleteCommentResponse {
    success: boolean;
    message: string;
}
