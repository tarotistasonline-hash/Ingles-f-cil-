import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Lightbulb,
  Heart,
  Send,
  PlusCircle,
  X,
  Filter,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Search,
  MessageCircle,
  ThumbsUp,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Globe,
} from 'lucide-react';
import {
  BlogPost,
  BlogComment,
  PostType,
  fetchBlogPosts,
  createBlogPost,
  addBlogComment,
  likePostOrComment,
} from '../services/blogService';
import { isCreatorMode } from '../services/visitorTracker';

interface CommunityBlogProps {
  currentSpeed?: number;
}

export const CommunityBlog: React.FC<CommunityBlogProps> = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Form states for creating post
  const [formType, setFormType] = useState<PostType>('sugerencia');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formLevel, setFormLevel] = useState('Principiante');
  const [formIsCreator, setFormIsCreator] = useState(() => isCreatorMode());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Comment draft states: postId -> string
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentAuthors, setCommentAuthors] = useState<Record<string, string>>({});
  const [submittingCommentPostId, setSubmittingCommentPostId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set(['post-1']));

  // Share feature states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTargetPost, setShareTargetPost] = useState<BlogPost | null>(null);
  const [customShareNote, setCustomShareNote] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

  const creatorActive = isCreatorMode();

  useEffect(() => {
    loadPosts();
  }, []);

  // Handle URL query parameter for shared post: ?tab=blog&post=post-1#blog
  useEffect(() => {
    if (posts.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const postParam = params.get('post');
      if (postParam) {
        setHighlightedPostId(postParam);
        setExpandedComments((prev) => new Set(prev).add(postParam));
        setTimeout(() => {
          const el = document.getElementById(`post-${postParam}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }
  }, [posts]);

  const loadPosts = async () => {
    setLoading(true);
    const data = await fetchBlogPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !formAuthor.trim()) return;

    setIsSubmitting(true);
    const newPost = await createBlogPost({
      title: formTitle,
      content: formContent,
      author: formAuthor,
      authorLevel: formLevel,
      type: formType,
      isCreator: creatorActive && formIsCreator,
    });

    setIsSubmitting(false);

    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
      setFormTitle('');
      setFormContent('');
      setShowCreateModal(false);
      setSuccessMessage('¡Muchas gracias! Tu opinión/sugerencia ha sido publicada con éxito.');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleLike = async (postId: string, commentId?: string) => {
    const key = commentId ? `${postId}-${commentId}` : postId;
    if (likedPosts.has(key)) return;

    const newLikes = await likePostOrComment(postId, commentId);
    if (newLikes !== null) {
      setLikedPosts((prev) => new Set(prev).add(key));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            if (commentId) {
              return {
                ...post,
                comments: post.comments.map((c) =>
                  c.id === commentId ? { ...c, likes: newLikes } : c
                ),
              };
            } else {
              return { ...post, likes: newLikes };
            }
          }
          return post;
        })
      );
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentDrafts[postId]?.trim();
    const author =
      commentAuthors[postId]?.trim() || (creatorActive ? 'Equipo Creador' : 'Visitante');
    if (!content) return;

    setSubmittingCommentPostId(postId);
    const newComment = await addBlogComment({
      postId,
      content,
      author,
      isCreator: creatorActive,
    });
    setSubmittingCommentPostId(null);

    if (newComment) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      // Ensure comments section is expanded
      setExpandedComments((prev) => new Set(prev).add(postId));
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // --- Sharing Helpers ---
  const handleOpenShare = (post?: BlogPost | null) => {
    setShareTargetPost(post || null);
    setCustomShareNote('');
    setCopiedLink(false);
    setShowShareModal(true);
  };

  const handleCloseShare = () => {
    setShowShareModal(false);
    setShareTargetPost(null);
    setCopiedLink(false);
  };

  const getShareUrl = (post: BlogPost | null): string => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    if (post) {
      return `${origin}${pathname}?tab=blog&post=${encodeURIComponent(post.id)}#blog`;
    }
    return `${origin}${pathname}?tab=blog#blog`;
  };

  const getShareText = (post: BlogPost | null, note: string): string => {
    const prefix = note.trim() ? `"${note.trim()}"\n\n` : '';
    if (post) {
      const snippet = post.content.length > 130 ? `${post.content.slice(0, 130)}...` : post.content;
      return `${prefix}💬 "${post.title}"\nPor ${post.author} (${post.authorLevel}):\n"${snippet}"\n\nLeé más y sumate a la comunidad en Inglés Real:`;
    }
    return `${prefix}☕ ¡Te recomiendo 'Inglés Real'! Una forma sencilla y relajada de aprender el idioma sin rodeos gramaticales ni vergüenza.\nMirá las opiniones y sugerencias de la comunidad:`;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl(shareTargetPost);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      triggerToast('¡Enlace copiado al portapapeles! Listo para pegar y compartir.');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      triggerToast('Error al copiar el enlace. Por favor selecciónalo manualmente.');
    }
  };

  const handleNativeShare = async () => {
    const url = getShareUrl(shareTargetPost);
    const title = shareTargetPost
      ? `${shareTargetPost.title} - Inglés Real`
      : 'Inglés Real - Blog y Comunidad';
    const text = getShareText(shareTargetPost, customShareNote);

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        triggerToast('¡Gracias por compartir con tu gente!');
        handleCloseShare();
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const openSocialWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    triggerToast('¡Abriendo ventana para compartir!');
  };

  const triggerToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => {
      setShareToast((current) => (current === msg ? null : current));
    }, 3800);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesFilter = filterType === 'all' || post.type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPostTypeBadge = (type: PostType) => {
    switch (type) {
      case 'sugerencia':
        return {
          label: '💡 Sugerencia para la App',
          color: 'bg-amber-400/15 text-amber-300 border-amber-400/40',
        };
      case 'opinion':
        return {
          label: '💬 Opinión & Experiencia',
          color: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40',
        };
      case 'experiencia':
        return {
          label: '🌱 Mi Historia con el Inglés',
          color: 'bg-sky-400/15 text-sky-300 border-sky-400/40',
        };
      case 'debate':
        return {
          label: '☕ Charla de Entrecasa',
          color: 'bg-violet-400/15 text-violet-300 border-violet-400/40',
        };
      default:
        return {
          label: 'Opinión',
          color: 'bg-slate-700 text-slate-300 border-slate-600',
        };
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'implementado') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Implementado en la app
        </span>
      );
    }
    if (status === 'en_progreso') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          En desarrollo por el creador
        </span>
      );
    }
    if (status === 'abierto') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-sky-400" />
          Buzón abierto a debate
        </span>
      );
    }
    return null;
  };

  // Quick testimonial chips for sharing
  const quickTestimonialPills = [
    '🌟 ¡Me ayudó a soltarme sin miedo a equivocarme!',
    '☕ Un método relajado, de entrecasa y sin gramática pesada',
    '🌱 Ideal si querés arrancar desde cero sin frustrarte',
    '🗣️ Mucho más práctico y coloquial que los cursos comunes',
  ];

  const currentShareUrl = getShareUrl(shareTargetPost);
  const currentShareText = getShareText(shareTargetPost, customShareNote);
  const fullWhatsAppMessage = `${currentShareText}\n${currentShareUrl}`;

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#0C0A1D] via-[#100D26] to-[#0A0819] text-slate-100 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center sm:text-left space-y-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <span className="p-1 rounded bg-amber-400/20 text-amber-300">
              <MessageSquare className="w-4 h-4" />
            </span>
            <span>Comunidad & Buzón Abierto</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Escucha Activa del Creador</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Blog de Opiniones & Sugerencias
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                El rincón de entrecasa para contar tu experiencia, proponer nuevas situaciones de conversación y compartir con otros cómo aprender sin trabas ni vergüenza.
              </p>
            </div>

            {/* Action buttons in Header */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0 self-center sm:self-auto">
              {/* Primary Share button for the community */}
              <button
                onClick={() => handleOpenShare(null)}
                className="px-4 py-3 rounded-xl bg-[#17123A] hover:bg-[#231A56] text-slate-200 hover:text-white border border-[#2B215E] hover:border-sky-400/50 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-sky-500/10"
                title="Compartir enlace o invitar a amigos a la comunidad"
              >
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>Compartir Comunidad</span>
              </button>

              {/* Create new post button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-bold shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Dejar mi Opinión / Sugerencia</span>
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#14102E]/90 border border-[#2B215E] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Todos ({posts.length})
            </button>
            <button
              onClick={() => setFilterType('sugerencia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'sugerencia'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-900/80 text-amber-300/80 hover:text-amber-200 hover:bg-slate-800'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Sugerencias ({posts.filter((p) => p.type === 'sugerencia').length})</span>
            </button>
            <button
              onClick={() => setFilterType('opinion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'opinion'
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-900/80 text-emerald-300/80 hover:text-emerald-200 hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Opiniones ({posts.filter((p) => p.type === 'opinion').length})</span>
            </button>
            <button
              onClick={() => setFilterType('debate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'debate'
                  ? 'bg-violet-400 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-900/80 text-violet-300/80 hover:text-violet-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Charlas ({posts.filter((p) => p.type === 'debate').length})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar opinión o tema..."
              className="w-full bg-[#0C0A1D] border border-[#2B215E] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modal: Create Post */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-[#14102E] border border-[#352972] rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#281F54]">
                <div className="space-y-0.5">
                  <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-amber-400" />
                    <span>Publicar Opinión o Sugerencia</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tu mensaje quedará guardado y visible para el creador y toda la comunidad.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    ¿Qué quieres compartir?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType('sugerencia')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        formType === 'sugerencia'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>💡 Sugerencia</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('opinion')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        formType === 'opinion'
                          ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>💬 Opinión</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('experiencia')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        formType === 'experiencia'
                          ? 'bg-sky-400/20 border-sky-400 text-sky-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>🌱 Experiencia</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título o Asunto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej: Me gustaría una situación para pedir comida rápida..."
                    className="w-full bg-[#0C0A1D] border border-[#2B215E] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Message Content */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tu Mensaje o Sugerencia en Detalle *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Explica qué opinas del método, qué te gustaría que sumemos o qué te resultó útil..."
                    className="w-full bg-[#0C0A1D] border border-[#2B215E] rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                {/* Author Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tu Nombre o Apodo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="Ej: Marcelo de Mendoza"
                      className="w-full bg-[#0C0A1D] border border-[#2B215E] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tu Nivel de Partida
                    </label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full bg-[#0C0A1D] border border-[#2B215E] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value="Desde Cero">🌱 Desde Cero Absoluto</option>
                      <option value="Principiante">☕ Principiante (A1-A2)</option>
                      <option value="Avanzado">⚡ Avanzado / Busco Modismos</option>
                      <option value="Curioso / Visitante">🌍 Curioso / Visitante</option>
                    </select>
                  </div>
                </div>

                {creatorActive && (
                  <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Modo Creador Activo</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsCreator}
                        onChange={(e) => setFormIsCreator(e.target.checked)}
                        className="rounded text-amber-400 focus:ring-amber-400 cursor-pointer"
                      />
                      <span>Firmar como Creador ⭐</span>
                    </label>
                  </div>
                )}

                <div className="pt-3 border-t border-[#281F54] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-400/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Publicando...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publicar Aporte</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Share Component (for Community or Specific Post) */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-[#14102E] border border-[#3A2C7C] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-5 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#281F54]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <Share2 className="w-4 h-4" />
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                      {shareTargetPost
                        ? 'Compartir Opinión o Experiencia'
                        : 'Compartir la Comunidad'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    {shareTargetPost
                      ? `Comparte este aporte de ${shareTargetPost.author} en tus redes o envía el enlace directo.`
                      : 'Invita a tus amigos, familiares o compañeros a aprender inglés de entrecasa sin trabas.'}
                  </p>
                </div>
                <button
                  onClick={handleCloseShare}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-[#0C0A1D] border border-[#2B215E] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {shareTargetPost ? 'Aporte de la comunidad' : 'Inglés Real'}
                  </span>
                  {shareTargetPost && (
                    <span className="text-slate-400">Por {shareTargetPost.author}</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {shareTargetPost
                    ? shareTargetPost.title
                    : 'Aprende inglés sencillo y coloquial, sin reglas que confundan'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-amber-400/50 pl-2.5">
                  {shareTargetPost
                    ? shareTargetPost.content.length > 150
                      ? `"${shareTargetPost.content.slice(0, 150)}..."`
                      : `"${shareTargetPost.content}"`
                    : '"Una forma cotidiana y sin filtro para empezar a hablar desde cero o pulir tus modismos con confianza."'}
                </p>
              </div>

              {/* Quick positive experience tags to add */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  💡 ¿Quieres sumar un mensaje de tu experiencia? (Opcional):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickTestimonialPills.map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomShareNote(pill)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-colors cursor-pointer ${
                        customShareNote === pill
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                          : 'bg-[#100D27] text-slate-300 border-[#2D2361] hover:border-slate-500'
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                <div className="pt-1.5">
                  <input
                    type="text"
                    value={customShareNote}
                    onChange={(e) => setCustomShareNote(e.target.value)}
                    placeholder="Escribe tu propia nota o recomendación personal..."
                    className="w-full bg-[#0C0A1D] border border-[#2B215E] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Direct Link Copy Bar */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Enlace directo para compartir:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentShareUrl}
                    className="w-full bg-[#0C0A1D] border border-[#2B215E] rounded-xl px-3 py-2 text-xs text-slate-300 select-all font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md ${
                      copiedLink
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-emerald-500/20'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Platforms Grid */}
              <div className="space-y-2 pt-2 border-t border-[#231A4E]">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Compartir en plataformas:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* WhatsApp */}
                  <button
                    onClick={() =>
                      openSocialWindow(
                        `https://api.whatsapp.com/send?text=${encodeURIComponent(
                          fullWhatsAppMessage
                        )}`
                      )
                    }
                    className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shadow-xs"
                    title="Compartir por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                    <span className="text-xs font-semibold">WhatsApp</span>
                  </button>

                  {/* X / Twitter */}
                  <button
                    onClick={() =>
                      openSocialWindow(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          currentShareText
                        )}&url=${encodeURIComponent(currentShareUrl)}`
                      )
                    }
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shadow-xs"
                    title="Compartir en X (Twitter)"
                  >
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white">𝕏</span>
                    <span className="text-xs font-semibold">X (Twitter)</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() =>
                      openSocialWindow(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          currentShareUrl
                        )}`
                      )
                    }
                    className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shadow-xs"
                    title="Compartir en Facebook"
                  >
                    <Globe className="w-4 h-4 text-blue-400 group-hover:text-white" />
                    <span className="text-xs font-semibold">Facebook</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() =>
                      openSocialWindow(
                        `https://t.me/share/url?url=${encodeURIComponent(
                          currentShareUrl
                        )}&text=${encodeURIComponent(currentShareText)}`
                      )
                    }
                    className="p-2.5 rounded-xl bg-sky-950/40 hover:bg-sky-500 border border-sky-400/40 text-sky-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shadow-xs"
                    title="Compartir en Telegram"
                  >
                    <Send className="w-4 h-4 text-sky-400 group-hover:text-white" />
                    <span className="text-xs font-semibold">Telegram</span>
                  </button>
                </div>

                {/* Native Share button for Mobile / Web Share */}
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-[#1E1748] hover:bg-[#2B2165] border border-[#3C2D7E] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Compartir en otras aplicaciones del dispositivo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {shareToast && (
          <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 max-w-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{shareToast}</span>
          </div>
        )}

        {/* Posts Stream */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Cargando opiniones y sugerencias de la comunidad...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-[#14102E]/70 border border-[#2B215E] rounded-2xl space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No se encontraron publicaciones</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Sé la primera persona en dejar una opinión o sugerencia para esta categoría.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold"
            >
              Publicar ahora
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post, index) => {
              const typeBadge = getPostTypeBadge(post.type);
              const statusBadge = getStatusBadge(post.status);
              const isLiked = likedPosts.has(post.id);
              const areCommentsOpen = expandedComments.has(post.id);
              const isHighlighted = highlightedPostId === post.id;

              return (
                <article
                  key={`${post.id}-${filterType}`}
                  id={`post-${post.id}`}
                  style={{
                    animationDelay: `${Math.min(index * 65, 390)}ms`,
                  }}
                  className={`animate-post-card bg-[#14102E]/95 border rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-md space-y-5 transition-all ${
                    isHighlighted
                      ? 'border-amber-400 ring-2 ring-amber-400/30 bg-[#17123A]'
                      : 'border-[#2B215E] hover:border-[#3A2D7D]'
                  }`}
                >
                  {/* Post Header: Type Badge & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}
                      >
                        {typeBadge.label}
                      </span>
                      {statusBadge}
                      {isHighlighted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          📌 Enlace Compartido
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.date}</span>
                    </span>
                  </div>

                  {/* Title & Content */}
                  <div className="space-y-2">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Author & Footer Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#231A4E]">
                    {/* Author badge */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                          post.isCreator
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {post.author.slice(0, 2)}
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span>{post.author}</span>
                          {post.isCreator && (
                            <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                              ⭐ Creador
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{post.authorLevel}</span>
                      </div>
                    </div>

                    {/* Actions: Likes, Comments Counter & Share */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      {/* Like button */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs'
                            : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                        title="Me sirvió / Apoyar esta opinión"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isLiked ? 'fill-rose-400 text-rose-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{post.likes}</span>
                      </button>

                      {/* Comments toggle */}
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          areCommentsOpen
                            ? 'bg-[#1E1747] text-amber-300 border-[#392C78]'
                            : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>{post.comments.length} Respuestas</span>
                      </button>

                      {/* Share post button */}
                      <button
                        onClick={() => handleOpenShare(post)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-sky-500/50 hover:bg-sky-500/10 transition-all cursor-pointer shadow-xs"
                        title="Compartir esta opinión en redes o copiar enlace directo"
                      >
                        <Share2 className="w-3.5 h-3.5 text-sky-400" />
                        <span className="hidden xs:inline">Compartir</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Accordion */}
                  {areCommentsOpen && (
                    <div className="pt-4 border-t border-[#231A4E] space-y-4 animate-in fade-in">
                      {post.comments.length > 0 && (
                        <div className="space-y-2.5">
                          {post.comments.map((comment) => {
                            return (
                              <div
                                key={comment.id}
                                className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                                  comment.isCreator
                                    ? 'bg-amber-950/25 border border-amber-500/40'
                                    : 'bg-[#0E0B22] border border-[#251D50]'
                                }`}
                              >
                                <div className="flex items-center justify-between text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-200">
                                      {comment.author}
                                    </span>
                                    {comment.isCreator && (
                                      <span className="text-[9px] font-extrabold bg-amber-400 text-slate-950 px-1 py-0.2 rounded-full uppercase">
                                        ⭐ Creador
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px]">
                                    <span>{comment.date}</span>
                                    <button
                                      onClick={() => handleLike(post.id, comment.id)}
                                      className="flex items-center gap-1 hover:text-rose-400 cursor-pointer"
                                      title="Dar like"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>{comment.likes}</span>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add comment input */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={commentAuthors[post.id] || ''}
                          onChange={(e) =>
                            setCommentAuthors((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Tu nombre (opcional)"
                          className="w-full sm:w-44 bg-[#0C0A1D] border border-[#2D2361] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <input
                          type="text"
                          value={commentDrafts[post.id] || ''}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Escribe tu opinión o comentario para este tema..."
                          className="w-full flex-1 bg-[#0C0A1D] border border-[#2D2361] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={
                            !commentDrafts[post.id]?.trim() ||
                            submittingCommentPostId === post.id
                          }
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Comentar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
