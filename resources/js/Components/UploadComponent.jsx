import React, { useState } from 'react';

export default function UploadComponent() {
    const [uploadType, setUploadType] = useState('all');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setError(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            let endpoint = '/api/upload';
            if (uploadType === 'wards') {
                endpoint = '/api/upload-wards';
            } else if (uploadType === 'polling-units') {
                endpoint = '/api/upload-polling-units';
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                setFile(null);
                document.getElementById('file-input').value = '';
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Upload Excel File</h3>
                
                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Type
                        </label>
                        <select
                            value={uploadType}
                            onChange={(e) => setUploadType(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Data (LGAs, Wards & Polling Units)</option>
                            <option value="wards">Wards Only</option>
                            <option value="polling-units">Polling Units Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Excel File (.xlsx, .xls)
                        </label>
                        <input
                            id="file-input"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded"
                        >
                            {uploading ? 'Uploading...' : 'Upload & Process'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <h4 className="text-red-800 font-medium">Error</h4>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                        <h4 className="text-green-800 font-medium mb-2">Upload Successful!</h4>
                        <p className="text-green-600 mb-4">{result.message}</p>
                        
                        <div className="bg-white p-4 rounded border border-green-300">
                            <h5 className="font-medium text-gray-900 mb-2">Summary:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">LGAs:</span> {result.data.lgas || 0}
                                </div>
                                <div>
                                    <span className="font-medium">Wards:</span> {result.data.wards || 0}
                                </div>
                                <div>
                                    <span className="font-medium">Polling Units:</span> {result.data.pollingUnits || result.data.inserted || 0}
                                </div>
                            </div>
                            
                            {result.data.totalInFile && (
                                <div className="mt-2 text-sm">
                                    <span className="font-medium">Total in file:</span> {result.data.totalInFile}
                                    {result.data.skipped > 0 && (
                                        <span className="ml-4 text-orange-600">
                                            <span className="font-medium">Skipped:</span> {result.data.skipped}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {result.data.details && result.data.details.lgaList && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                    View LGAs ({result.data.details.lgaList.length})
                                </summary>
                                <div className="mt-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                                    {result.data.details.lgaList.map((lga, index) => (
                                        <div key={index} className="py-1">• {lga}</div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="text-blue-800 font-medium mb-2">Expected Excel Columns:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                        <p><strong>Required:</strong> LGA, RA/Ward, PU/Polling Unit Name</p>
                        <p><strong>Optional:</strong> Polling Unit Code, Registered Voters/REGD VOTERS</p>
                        <p className="text-xs mt-2">The system will automatically detect various column name variations.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
