import React, { useState, useEffect } from 'react';

export default function PollingUnitList() {
    const [pollingUnits, setPollingUnits] = useState([]);
    const [wards, setWards] = useState([]);
    const [lgas, setLgas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedLga, setSelectedLga] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        ward_id: '',
        registered_voters: '',
        description: ''
    });

    useEffect(() => {
        fetchPollingUnits();
        fetchWards();
        fetchLgas();
    }, []);

    const fetchPollingUnits = async () => {
        try {
            const response = await fetch('/api/polling-units');
            const data = await response.json();
            setPollingUnits(data);
        } catch (error) {
            console.error('Error fetching polling units:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWards = async () => {
        try {
            const response = await fetch('/api/wards');
            const data = await response.json();
            setWards(data);
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const fetchLgas = async () => {
        try {
            const response = await fetch('/api/lgas');
            const data = await response.json();
            setLgas(data);
        } catch (error) {
            console.error('Error fetching LGAs:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/polling-units', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    registered_voters: parseInt(formData.registered_voters) || 0
                }),
            });
            
            if (response.ok) {
                setFormData({ name: '', code: '', ward_id: '', registered_voters: '', description: '' });
                setShowForm(false);
                fetchPollingUnits();
            }
        } catch (error) {
            console.error('Error creating polling unit:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this polling unit?')) {
            try {
                await fetch(`/api/polling-units/${id}`, {
                    method: 'DELETE',
                });
                fetchPollingUnits();
            } catch (error) {
                console.error('Error deleting polling unit:', error);
            }
        }
    };

    const filteredPollingUnits = pollingUnits.filter(unit => {
        if (selectedLga && unit.lga_name != lgas.find(l => l.id == selectedLga)?.name) return false;
        if (selectedWard && unit.ward_name != wards.find(w => w.id == selectedWard)?.name) return false;
        return true;
    });

    const filteredWards = selectedLga ? wards.filter(ward => ward.lga_id == selectedLga) : wards;

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h4 className="text-md font-medium text-gray-700">
                        {filteredPollingUnits.length} polling units found
                    </h4>
                    <select
                        value={selectedLga}
                        onChange={(e) => {
                            setSelectedLga(e.target.value);
                            setSelectedWard('');
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">All LGAs</option>
                        {lgas.map((lga) => (
                            <option key={lga.id} value={lga.id}>
                                {lga.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        disabled={!selectedLga}
                    >
                        <option value="">All Wards</option>
                        {filteredWards.map((ward) => (
                            <option key={ward.id} value={ward.id}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add Polling Unit
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                Code *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ward *
                            </label>
                            <select
                                required
                                value={formData.ward_id}
                                onChange={(e) => setFormData({...formData, ward_id: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="">Select Ward</option>
                                {wards.map((ward) => (
                                    <option key={ward.id} value={ward.id}>
                                        {ward.name} ({ward.lga_name})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Registered Voters
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.registered_voters}
                                onChange={(e) => setFormData({...formData, registered_voters: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
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
                                Ward
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                LGA
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Registered Voters
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPollingUnits.map((unit) => (
                            <tr key={unit.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {unit.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {unit.code}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {unit.ward_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {unit.lga_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {unit.registered_voters?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(unit.id)}
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
