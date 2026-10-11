export interface BlogComment {
  id: string;
  author: string;
  isCreator: boolean;
  content: string;
  date: string;
  likes: number;
}

export type PostType = 'sugerencia' | 'opinion' | 'experiencia' | 'debate';

export interface BlogPost {
  id: string;
  type: PostType;
  title: string;
  content: string;
  author: string;
  authorLevel: string;
  isCreator: boolean;
  date: string;
  likes: number;
  comments: BlogComment[];
  status?: 'abierto' | 'implementado' | 'en_progreso';
}

export interface CreatePostData {
  title: string;
  content: string;
  author: string;
  authorLevel: string;
  type: PostType;
  isCreator: boolean;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  author: string;
  isCreator: boolean;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch('/api/blog/posts');
    if (!res.ok) throw new Error('Error al cargar posts');
    const data = await res.json();
    return data.posts || [];
  } catch (err) {
    console.warn('Fallback loading blog posts:', err);
    return [];
  }
}

export async function createBlogPost(data: CreatePostData): Promise<BlogPost | null> {
  try {
    const res = await fetch('/api/blog/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al publicar');
    const result = await res.json();
    return result.post;
  } catch (err) {
    console.error('Error creating blog post:', err);
    return null;
  }
}

export async function addBlogComment(data: CreateCommentData): Promise<BlogComment | null> {
  try {
    const res = await fetch('/api/blog/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al comentar');
    const result = await res.json();
    return result.comment;
  } catch (err) {
    console.error('Error adding comment:', err);
    return null;
  }
}

export async function likePostOrComment(
  postId: string,
  commentId?: string
): Promise<number | null> {
  try {
    const res = await fetch('/api/blog/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, commentId }),
    });
    if (!res.ok) throw new Error('Error al dar like');
    const result = await res.json();
    return result.likes;
  } catch (err) {
    console.error('Error liking:', err);
    return null;
  }
}
