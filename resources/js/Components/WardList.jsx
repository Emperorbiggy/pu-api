import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export default function WardList() {
    const [wards, setWards] = useState([]);
    const [lgas, setLgas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedLga, setSelectedLga] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        lga_id: '',
        description: ''
    });

    useEffect(() => {
        fetchWards();
        fetchLgas();
    }, []);

    const fetchWards = async () => {
        try {
            const data = await apiRequest('/api/wards');
            setWards(data);
        } catch (error) {
            console.error('Error fetching wards:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLgas = async () => {
        try {
            const data = await apiRequest('/api/lgas');
            setLgas(data);
        } catch (error) {
            console.error('Error fetching LGAs:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/api/wards', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            
            setFormData({ name: '', code: '', lga_id: '', description: '' });
            setShowForm(false);
            fetchWards();
        } catch (error) {
            console.error('Error creating ward:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this ward?')) {
            try {
                await apiRequest(`/api/wards/${id}`, {
                    method: 'DELETE',
                });
                fetchWards();
            } catch (error) {
                console.error('Error deleting ward:', error);
            }
        }
    };

    const filteredWards = selectedLga ? wards.filter(ward => ward.lga_id == selectedLga) : wards;

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h4 className="text-md font-medium text-gray-700">
                        {filteredWards.length} wards found
                    </h4>
                    <select
                        value={selectedLga}
                        onChange={(e) => setSelectedLga(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All LGAs</option>
                        {lgas.map((lga) => (
                            <option key={lga.id} value={lga.id}>
                                {lga.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add Ward
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Code
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                LGA *
                            </label>
                            <select
                                required
                                value={formData.lga_id}
                                onChange={(e) => setFormData({...formData, lga_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select LGA</option>
                                {lgas.map((lga) => (
                                    <option key={lga.id} value={lga.id}>
                                        {lga.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                LGA
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredWards.map((ward) => (
                            <tr key={ward.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {ward.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {ward.code || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {ward.lga_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {ward.description || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(ward.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
