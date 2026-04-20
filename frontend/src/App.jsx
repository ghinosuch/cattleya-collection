import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function App() {
  const [species, setSpecies] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSpecies()
  }, [])

  const fetchSpecies = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/species`, {
        params: { skip: 0, limit: 50 }
      })
      setSpecies(response.data.data || [])
    } catch (error) {
      console.error('Error fetching species:', error)
    }
    setLoading(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) {
      fetchSpecies()
      return
    }
    
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/species/search`, {
        params: { q: search }
      })
      setSpecies(response.data.results || [])
    } catch (error) {
      console.error('Error searching:', error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-green-900 text-white p-6 shadow-lg">
        <h1 className="text-4xl font-bold">🌺 Cattleya Collection</h1>
        <p className="text-green-100 mt-2">Gestor profesional de colección de orquídeas</p>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar especie, variante, origen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:shadow-lg transition"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold shadow-md"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        )}

        {/* Results table */}
        {!loading && (
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            {species.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p className="text-lg">No hay datos disponibles. Agrega especies en Supabase.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Nombre Completo</th>
                    <th className="px-6 py-4 text-left">Especie</th>
                    <th className="px-6 py-4 text-left">Origen</th>
                    <th className="px-6 py-4 text-left">Rareza</th>
                    <th className="px-6 py-4 text-right">Valor USD</th>
                  </tr>
                </thead>
                <tbody>
                  {species.map((sp, idx) => (
                    <tr 
                      key={sp.id || idx} 
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium">{sp.nombre_completo}</td>
                      <td className="px-6 py-4 text-gray-700">{sp.especie}</td>
                      <td className="px-6 py-4 text-gray-700">{sp.origen}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
                          sp.rareza === 'Élite' ? 'bg-yellow-600' :
                          sp.rareza === 'Muy Rara' ? 'bg-orange-500' :
                          sp.rareza === 'Rara' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}>
                          {sp.rareza}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-700">
                        ${sp.valor_usd || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center p-6 mt-12">
        <p>🌺 Cattleya Collection - Ejecutado en la nube | Netlify + Railway + Supabase</p>
      </footer>
    </div>
  )
}

export default App
