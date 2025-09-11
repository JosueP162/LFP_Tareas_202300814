import React, { useState } from 'react';
import { Search, BookOpen, Award, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

// User Search Component
const UserSearch = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await apiService.getWithAuth(`/usuarios/buscar/${searchTerm}`, token);
      const data = await response.json();

      if (response.ok) {
        setSearchResult(data);
      } else {
        setError(data.message || 'Usuario no encontrado');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Buscar Usuario</h2>
        
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ingrese el registro académico del usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {searchResult && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">
              {searchResult.nombres} {searchResult.apellidos}
            </h3>
            <p className="text-gray-600">Registro: {searchResult.registro_academico}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{searchResult.totalCursosAprobados}</p>
                    <p className="text-blue-700 text-sm">Cursos Aprobados</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">{searchResult.totalCreditos}</p>
                    <p className="text-green-700 text-sm">Créditos Totales</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {new Date(searchResult.fecha_creacion).getFullYear()}
                    </p>
                    <p className="text-purple-700 text-sm">Año de Registro</p>
                  </div>
                </div>
              </div>
            </div>

            {searchResult.cursosAprobados && searchResult.cursosAprobados.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cursos Aprobados</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Curso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Créditos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Período
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchResult.cursosAprobados.map((curso, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {curso.codigo_curso}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {curso.nombre_curso}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {curso.creditos}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {curso.semestre_aprobacion}/{curso.anio_aprobacion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;