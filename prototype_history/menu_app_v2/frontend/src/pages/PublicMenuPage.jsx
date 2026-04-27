import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChefHat, Loader2, ImageOff, Search, X } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import { getPublicMenus, getOwnerPublicMenu } from '../api/menuApi.js';

function PublicItemCard({ item }) {
  return (
    <div
      className={`flex gap-4 p-4 rounded-xl border transition-colors
        ${item.is_available
          ? 'bg-white border-gray-200 hover:border-gray-300'
          : 'bg-gray-50 border-gray-100 opacity-60'
        }`}
    >
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 leading-tight">{item.name}</h4>
            {!item.is_available && (
              <span className="badge-unavailable mt-1">Unavailable</span>
            )}
          </div>
          <span className="font-bold text-brand-600 text-lg flex-shrink-0">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

function CategorySection({ category }) {
  return (
    <section id={`cat-${category.id}`} className="scroll-mt-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
        {category.description && (
          <p className="text-gray-500 mt-1">{category.description}</p>
        )}
      </div>
      {category.items.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No items in this category.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
          {category.items.map((item) => (
            <PublicItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function PublicMenuPage() {
  const { ownerId } = useParams();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState(0);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError('');
      try {
        if (ownerId) {
          const data = await getOwnerPublicMenu(ownerId);
          setMenus([data]);
        } else {
          const data = await getPublicMenus();
          setMenus(data);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Restaurant not found.');
        } else {
          setError('Failed to load menu. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [ownerId]);

  const currentMenu = menus[activeMenu];

  // Filter items by search
  const filteredCategories = currentMenu?.categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.description || '').toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0 || search === '');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">Loading menu…</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <Link to="/" className="btn-primary mt-4">Go Home</Link>
        </div>
      ) : menus.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No menus published yet</h2>
          <p className="text-gray-500 mb-6">Check back soon or create your own!</p>
          <Link to="/register" className="btn-primary">Create Your Menu</Link>
        </div>
      ) : (
        <div className="flex-1">
          {/* Hero banner */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
              <div className="flex items-center gap-3 mb-2">
                <ChefHat className="w-8 h-8 opacity-80" />
                <h1 className="text-3xl sm:text-4xl font-bold">
                  {currentMenu?.restaurant_name}
                </h1>
              </div>
              <p className="text-brand-100 text-sm">
                {currentMenu?.categories.length} categor
                {currentMenu?.categories.length !== 1 ? 'ies' : 'y'} ·{' '}
                {currentMenu?.categories.reduce((acc, c) => acc + c.items.length, 0)} items
              </p>

              {/* Multi-restaurant switcher */}
              {menus.length > 1 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {menus.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveMenu(idx); setSearch(''); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${activeMenu === idx
                          ? 'bg-white text-brand-700'
                          : 'bg-brand-500/50 text-white hover:bg-brand-500'
                        }`}
                    >
                      {m.restaurant_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* Search bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="input-field pl-9 pr-9"
                placeholder="Search menu items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category quick-nav */}
            {!search && currentMenu?.categories.length > 1 && (
              <div className="flex gap-2 flex-wrap mb-8">
                {currentMenu.categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#cat-${cat.id}`}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm
                               font-medium text-gray-700 hover:border-brand-400 hover:text-brand-600
                               transition-colors"
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            )}

            {/* Menu sections */}
            {filteredCategories && filteredCategories.length > 0 ? (
              <div className="space-y-10">
                {filteredCategories.map((cat) => (
                  <CategorySection key={cat.id} category={cat} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No items match "{search}"</p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ChefHat className="w-4 h-4 text-brand-500" />
            <span className="font-medium text-gray-600">MenuCraft</span>
          </div>
          <p>Powered by MenuCraft — Create your own menu at{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700">
              menucraft.app
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}