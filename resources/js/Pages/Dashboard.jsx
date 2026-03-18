import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';
import LgaList from '@/Components/LgaList';
import WardList from '@/Components/WardList';
import PollingUnitList from '@/Components/PollingUnitList';
import UploadComponent from '@/Components/UploadComponent';

export default function Dashboard({ auth }) {
    // Use GuestLayout if no auth user, otherwise use AuthenticatedLayout
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Enumeration Data Management</h2>}
        >
            <Head title="Enumeration Data Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <UploadComponent />

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Local Government Areas (LGAs)</h3>
                            <LgaList />
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Wards</h3>
                            <WardList />
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Polling Units</h3>
                            <PollingUnitList />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
