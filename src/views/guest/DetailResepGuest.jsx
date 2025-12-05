import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../axios-client";

export default function DetailResepGuest() {
  const { id } = useParams();
  const [resep, setResep] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- UPDATE FUNGSI INI ---
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (image.startsWith('http')) return image;
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');
    return `${rootUrl}/gambar/${encodeURIComponent(image)}`;
  };

  useEffect(() => {
    axiosClient.get(`/resep/${id}`)
      .then(({ data }) => {
        setResep(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);
    const shareBtnRef = useRef(null);
    const imageRef = useRef(null);
    const [shareTop, setShareTop] = useState(0);
    const [shareLeft, setShareLeft] = useState(null);

    const toggleShare = (ev) => {
        if (ev) ev.stopPropagation && ev.stopPropagation();
        if (!showShare && shareBtnRef.current) {
            const rectBtn = shareBtnRef.current.getBoundingClientRect();
            if (imageRef.current && typeof window !== 'undefined' && window.innerWidth >= 768) {
                const img = imageRef.current.getBoundingClientRect();
                const gap = 12; 
                const popupWidth = 224; 
                const left = Math.round(img.right + gap);
                const top = Math.round(img.top + window.scrollY + img.height * 0.12);
                if (left + popupWidth + 24 <= window.innerWidth) {
                    setShareLeft(left);
                    setShareTop(top);
                } else {
                    setShareLeft(null);
                    setShareTop(rectBtn.top + rectBtn.height + window.scrollY);
                }
            } else {
                const rect = rectBtn;
                setShareTop(rect.top + rect.height + window.scrollY);
                setShareLeft(null);
            }
        }
        setShowShare((s) => !s);
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (e) {
            setCopied(false);
        }
    };

  if (loading) return <div className="text-center py-20 text-gray-500">Memuat resep...</div>;
  if (!resep) return <div className="text-center py-20 text-gray-500">Resep tidak ditemukan.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-montserrat animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-[0_5px_30px_rgba(0,0,0,0.08)] p-10 border border-gray-100">
        
        <h1 className="text-4xl font-bold text-[#333] mb-6 font-serif">
            {resep.judul}
        </h1>

        <div className="bg-[#3a2e1c] text-white p-4 rounded-lg flex justify-between items-center mb-10 shadow-md">
            <div className="flex gap-8 font-bold text-sm md:text-base">
                <div className="flex items-center gap-2">
                    <i className="far fa-clock text-xl"></i>
                    <span>{resep.waktu}</span>
                </div>
                <div className="flex items-center gap-2">
                    <i className="fas fa-users text-xl"></i>
                    <span>{resep.porsi}</span>
                </div>
            </div>
            
            <div className="relative">
                <button
                    ref={shareBtnRef}
                    onClick={toggleShare}
                    className="text-white font-bold hover:text-[#e6a357] transition flex items-center gap-2"
                >
                    <span>Bagikan</span>
                    <i className="fas fa-share-alt"></i>
                </button>

                {showShare && (
                    <div>
                        <div className="fixed inset-0 z-40" onClick={() => setShowShare(false)} aria-hidden></div>
                        <div
                            id="share-popover"
                            onClick={(e) => e.stopPropagation()}
                            className="z-50 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-left text-sm transform"
                            style={(() => {
                                if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                                    if (shareLeft) {
                                        return { position: 'fixed', left: `${shareLeft}px`, top: `${shareTop || (window.scrollY + 120)}px` };
                                    }
                                    const rightOffset = window.innerWidth >= 1200 ? '96px' : window.innerWidth >= 1024 ? '72px' : '48px';
                                    return { position: 'fixed', right: rightOffset, top: `${shareTop || (window.scrollY + 120)}px` };
                                }
                                return { position: 'absolute', right: 0, transform: 'translateY(4px)' };
                            })()}
                        >
                            <div className="flex flex-col gap-3">
                                <button onClick={copyLink} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50 focus:outline-none">
                                    <i className="fas fa-link text-gray-600"></i>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">Salin Link</div>
                                        <div className="text-xs text-gray-400">Salin URL ke clipboard</div>
                                    </div>
                                    <div className={`text-xs font-semibold ${copied ? 'text-green-600' : 'text-gray-400'}`}>
                                        {copied ? 'Berhasil disalin' : ' '}
                                    </div>
                                </button>
                                <a href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50">
                                    <i className="fab fa-whatsapp text-green-500"></i>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">WhatsApp</div>
                                    </div>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50">
                                    <i className="fab fa-facebook text-[#1877F2]"></i>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">Facebook</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-[#333] mb-4 font-serif">Bahan-Bahan</h2>
                    <div 
                        className="text-gray-700 text-sm leading-8 font-medium [&>ul]:list-none [&>li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: resep.bahan }}
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#333] mb-4 font-serif">Cara Membuat</h2>
                    <div 
                        className="text-gray-700 text-sm leading-7 font-medium [&>ul]:list-decimal [&>ul]:pl-5 [&>li]:mb-3"
                        dangerouslySetInnerHTML={{ __html: resep.cara_membuat }}
                    />
                </div>
            </div>

            <div className="w-full md:w-[400px] flex-shrink-0">
                <div className="sticky top-24">
                    <img 
                        ref={imageRef}
                        src={getImageUrl(resep.gambar)} 
                        alt={resep.judul} 
                        className="w-full rounded-xl shadow-lg object-cover border-4 border-white"
                        style={{ aspectRatio: '4/3' }}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'}
                    />
                    <div className="text-center mt-2 opacity-20 text-3xl font-black text-gray-400 uppercase tracking-widest select-none">
                        {resep.judul}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
