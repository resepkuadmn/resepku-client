import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../axios-client";
import ConfirmModal from '../../components/ConfirmModal';

export default function ListResep() {
  const [reseps, setReseps] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useStateContext();
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    getReseps();
  }, []);

  useEffect(() => {
    if (location && location.state && location.state.toast) {
      const t = location.state.toast;
      if (typeof showToast === 'function') {
        showToast(t.message, { type: t.type || 'success' });
      } else {
        setSuccessMsg(t.message || 'Berhasil');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
      navigate(location.pathname, { replace: true, state: {} });
      getReseps();
    }
  }, [location, navigate, showToast]);

  const getReseps = () => {
    setLoading(true);
    axiosClient.get('/resep')
      .then(({ data }) => {
        const sorted = (data.data || []).sort((a, b) => {
          const categoryOrder = { dessert: 0, makanan: 1, minuman: 2 };
          const aOrder = categoryOrder[a.jenis] ?? 999;
          const bOrder = categoryOrder[b.jenis] ?? 999;
          return aOrder - bOrder;
        });
        setReseps(sorted);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // --- FUNGSI HELPER UNTUK URL ---
  const getImageUrl = (filename) => {
    if (!filename) return 'https://via.placeholder.com/150?text=No+Image';
    if (filename.startsWith('http')) return filename;
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const rootUrl = baseUrl.replace('/api', ''); 
    return `${rootUrl}/gambar/${filename}`;
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState(null);

  const openDeleteConfirm = (resep) => {
    setTarget(resep);
    setConfirmOpen(true);
  }

  const handleConfirmDelete = () => {
    if (!target) return;
    axiosClient.delete(`/resep/${target.id}`)
      .then(() => {
        setSuccessMsg('Resep berhasil dihapus');
        setConfirmOpen(false);
        setTarget(null);
        getReseps();
        setTimeout(() => setSuccessMsg(null), 2500);
      })
      .catch(() => {
        setConfirmOpen(false);
        setTarget(null);
      });
  };

  return (
    <div className="p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-resepku-dark font-serif">Daftar Menu Resep</h1>
          <Link to="/admin/resep/create" className="bg-resepku-brown text-white px-4 py-2 rounded-md font-bold hover:bg-black transition">
            + Tambah Resep
          </Link>
      </div>

      <div className="bg-resepku-orange rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-resepku-orange text-resepku-dark border-b-2 border-white">
                    <th className="p-4 font-bold">No</th>
                    <th className="p-4 font-bold">Gambar</th>
                    <th className="p-4 font-bold">Judul Resep</th>
                    <th className="p-4 font-bold">Kategori</th>
                    <th className="p-4 font-bold">Aksi</th>
                </tr>
            </thead>
            <tbody className="bg-white">
                {loading && (
                    <tr><td colSpan="5" className="text-center p-8">Memuat data...</td></tr>
                )}
                {!loading && reseps.length === 0 && (
                    <tr><td colSpan="5" className="text-center p-8">Belum ada resep.</td></tr>
                )}
                {!loading && reseps.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">{index + 1}</td>
                        <td className="p-4">
                            <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden shadow-sm">
                                <img 
                                    src={getImageUrl(item.gambar)} 
                                    alt={item.judul} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=No+Image'}} 
                                />
                            </div>
                        </td>
                        <td className="p-4 font-bold text-resepku-dark">{item.judul}</td>
                        <td className="p-4 capitalize">
                            <span className="px-3 py-1 bg-orange-100 text-resepku-brown rounded-full text-xs font-bold">
                                {item.jenis}
                            </span>
                        </td>
                        <td className="p-4 flex gap-2">
                            <Link to={`/admin/resep/edit/${item.id}`} className="bg-resepku-orange text-white px-3 py-1 rounded font-bold text-sm hover:opacity-80 transition">
                                Edit
                            </Link>
                            <button onClick={() => openDeleteConfirm(item)} className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm hover:bg-red-700 transition">
                                Hapus
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-green-100 text-green-800 px-4 py-2 rounded shadow">
          {successMsg}
        </div>
      )}
      <ConfirmModal open={confirmOpen} title="Yakin ingin menghapus resep ini?" message={target ? `Anda akan menghapus: ${target.judul}` : 'Anda akan menghapus data ini.'} confirmLabel="Hapus" cancelLabel="Batal" onConfirm={handleConfirmDelete} onCancel={() => { setConfirmOpen(false); setTarget(null); }} />
    </div>
  );
}