import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import api from '../services/api';
import {
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Layers,
  Zap,
  Maximize2,
  Trash2,
  ExternalLink,
  Loader2,
  Eye
} from 'lucide-react';

const STYLES = [
  { id: 'photorealistic', name: 'Photorealistic', desc: '8K Octane, 35mm sharp lens', icon: '📸', color: 'from-blue-500 to-cyan-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon reflections, dark sci-fi', icon: '🌆', color: 'from-fuchsia-500 to-pink-500' },
  { id: 'anime', name: 'Anime Masterpiece', desc: 'Studio Ghibli & Makoto Shinkai', icon: '✨', color: 'from-amber-400 to-rose-500' },
  { id: '3d-render', name: '3D Pixar', desc: 'Smooth volumetric raytracing', icon: '🧸', color: 'from-indigo-500 to-purple-500' },
  { id: 'cinematic', name: 'Cinematic Movie', desc: 'Anamorphic film, moody tone', icon: '🎬', color: 'from-emerald-500 to-teal-500' },
  { id: 'digital-art', name: 'Digital Concept', desc: 'Trending on ArtStation', icon: '🎨', color: 'from-violet-500 to-indigo-500' },
  { id: 'surrealism', name: 'Surreal Dream', desc: 'Salvador Dali mind-bending', icon: '🌌', color: 'from-purple-500 to-pink-500' },
  { id: 'fantasy', name: 'High Fantasy', desc: 'Mythical magic & glowing runes', icon: '🐉', color: 'from-amber-500 to-orange-500' },
  { id: 'watercolor', name: 'Watercolor Art', desc: 'Pastel ink bleeds & paper grain', icon: '🖌️', color: 'from-teal-400 to-cyan-500' },
  { id: 'minimalist', name: 'Minimalist Vector', desc: 'Clean Bauhaus geometry', icon: '📐', color: 'from-slate-400 to-slate-200' }
];

const RATIOS = [
  { id: '1:1', label: '1:1 Square', desc: '1024x1024 (Instagram / Avatar)', width: 'w-12 h-12' },
  { id: '16:9', label: '16:9 Landscape', desc: '1280x720 (YouTube / Wallpaper)', width: 'w-16 h-9' },
  { id: '9:16', label: '9:16 Story/Reel', desc: '720x1280 (TikTok / Mobile)', width: 'w-9 h-16' },
  { id: '4:3', label: '4:3 Classic', desc: '1024x768 (Desktop)', width: 'w-14 h-10' }
];

const PROMPT_INSPIRATIONS = [
  'A neon-lit cybernetic samurai warrior meditating in a futuristic Tokyo temple garden with cherry blossoms',
  'Hyperrealistic macro photograph of an ethereal crystal butterfly resting on a bioluminescent glowing mushroom',
  'An ancient mystical library with floating books and warm magical golden light rays penetrating stained glass',
  'A cute baby dragon wrapped in a cozy sweater sipping hot chocolate in a snowy mountain cabin, 3D Pixar render',
  'A breathtaking panoramic view of a floating solar city nestled above planet Jupiter, cinematic IMAX film still'
];

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [enhanceWithGemini, setEnhanceWithGemini] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [copied, setCopied] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const fetchGallery = async () => {
    try {
      const res = await api.get('/images/gallery');
      if (res.data?.success) {
        setGallery(res.data.images);
      }
    } catch (err) {
      console.error('Failed to load image gallery:', err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    try {
      setIsEnhancing(true);
      const res = await api.post('/images/enhance', {
        prompt: prompt.trim(),
        style: selectedStyle
      });
      if (res.data?.success && res.data.enhanced) {
        setPrompt(res.data.enhanced);
      }
    } catch (err) {
      console.error('Failed to enhance prompt:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      const res = await api.post('/images/generate', {
        prompt: prompt.trim(),
        style: selectedStyle,
        aspectRatio: selectedRatio,
        enhancePrompt: enhanceWithGemini
      });

      if (res.data?.success) {
        setCurrentImage(res.data.image);
        fetchGallery();
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteImage = async (id) => {
    try {
      await api.delete(`/images/${id}`);
      setGallery((prev) => prev.filter((img) => img._id !== id));
      if (currentImage?._id === id) {
        setCurrentImage(null);
      }
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="AI Image Creation Studio">
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-glow-cyan">
                  <ImageIcon className="w-6 h-6 text-white" />
                </span>
                <span>AI Image Creation Studio</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Text-to-Image creation powered by Flux.1 Ultra & Google Gemini prompt engineering.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-1.5 font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>FLUX.1 ULTRA + GEMINI 2.5</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Control Panel: Prompt, Style, Dimensions */}
            <div className="lg:col-span-5 space-y-6">
              <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Image Description / Prompt</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || !prompt.trim()}
                      className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3 text-indigo-400" />
                      )}
                      <span>✨ Enhance with Gemini</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Describe what you want to create in rich detail..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition resize-none"
                  />

                  {/* Inspirations */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Quick Inspirations:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PROMPT_INSPIRATIONS.map((insp, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPrompt(insp)}
                          className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800 transition truncate max-w-[200px]"
                          title={insp}
                        >
                          {insp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Style Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Artistic Style Preset</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {STYLES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStyle(st.id)}
                        className={`p-2.5 rounded-2xl text-left border transition flex items-start gap-2 ${
                          selectedStyle === st.id
                            ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border-cyan-500/60 shadow-glow-cyan'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-lg">{st.icon}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate">{st.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{st.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Aspect Ratio</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {RATIOS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRatio(r.id)}
                        className={`p-2 rounded-xl text-left border transition text-xs ${
                          selectedRatio === r.id
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{r.label}</span>
                          <span className="text-[10px] font-mono opacity-60">{r.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-glow-cyan transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Ultra HD Image...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Image (⚡ Instant HD)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Display: Live Output & Stage */}
            <div className="lg:col-span-7 space-y-6">
              {/* Active Generation Canvas */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-sm text-white">Live Generation Stage</h3>
                  </div>

                  {currentImage && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPrompt(currentImage.enhancedPrompt || currentImage.prompt)}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition flex items-center gap-1"
                        title="Copy Prompt"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Prompt'}</span>
                      </button>

                      <a
                        href={currentImage.imageUrl}
                        download={`sagar-ai-${currentImage._id}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-glow-cyan"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download HD</span>
                      </a>
                    </div>
                  )}
                </div>

                {isGenerating ? (
                  <div className="aspect-square w-full rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center gap-4 text-center p-8 relative overflow-hidden">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-white animate-pulse">Rendering Ultra-High Definition Artwork</p>
                      <p className="text-xs text-slate-400">Applying neural diffusion filters, raytracing, and style modifiers...</p>
                    </div>
                  </div>
                ) : currentImage ? (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                      <img
                        src={currentImage.imageUrl}
                        alt={currentImage.prompt}
                        className="w-full h-auto max-h-[520px] object-contain mx-auto rounded-xl transition duration-300 group-hover:scale-[1.01]"
                      />
                      <button
                        onClick={() => setPreviewModalImg(currentImage)}
                        className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition"
                        title="Fullscreen Preview"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Style: <strong className="text-cyan-400 font-bold">{currentImage.style}</strong></span>
                        <span>Dimensions: <strong className="text-slate-200">{currentImage.width}x{currentImage.height}</strong></span>
                        <span>Model: <strong className="text-indigo-400">{currentImage.model}</strong></span>
                      </div>
                      <p className="text-slate-300 italic text-[11px]">
                        "{currentImage.enhancedPrompt || currentImage.prompt}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square w-full rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 text-center p-8">
                    <ImageIcon className="w-12 h-12 text-slate-700" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-slate-300">No Image Generated Yet</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Enter your prompt on the left, pick a style preset, and click Generate to create stunning 8K AI artwork.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Creation History Gallery */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">Creation Gallery ({gallery.length})</h3>
                  </div>
                  <button
                    onClick={fetchGallery}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                    title="Refresh Gallery"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {gallery.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">Your generated image collection will appear here.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((img) => (
                      <div
                        key={img._id}
                        className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group aspect-square cursor-pointer"
                        onClick={() => setCurrentImage(img)}
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-between">
                          <div className="flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(img._id);
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[10px] text-white line-clamp-2">{img.prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fullscreen Preview Modal */}
          {previewModalImg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => setPreviewModalImg(null)} />
              <div className="relative z-10 max-w-4xl max-h-[90vh] flex flex-col items-center gap-4">
                <img
                  src={previewModalImg.imageUrl}
                  alt={previewModalImg.prompt}
                  className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border border-slate-700"
                />
                <div className="flex items-center gap-4">
                  <a
                    href={previewModalImg.imageUrl}
                    download="artwork.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-glow-cyan"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Resolution</span>
                  </a>
                  <button
                    onClick={() => setPreviewModalImg(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
