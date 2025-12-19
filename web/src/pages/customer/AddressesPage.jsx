import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';

const AddressesPage = () => {
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            type: 'Home',
            name: 'John Doe',
            phone: '+977 9800000000',
            address: '123 Main Street',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            isDefault: true
        },
        {
            id: 2,
            type: 'Work',
            name: 'John Doe',
            phone: '+977 9811111111',
            address: '456 Office Complex',
            city: 'Lalitpur',
            state: 'Bagmati',
            zipCode: '44700',
            isDefault: false
        }
    ]);

    const handleSetDefault = (id) => {
        setAddresses(addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        })));
        toast.success('Default address updated');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            setAddresses(addresses.filter(addr => addr.id !== id));
            toast.success('Address deleted');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
                        <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        <FiPlus className="w-5 h-5" />
                        Add Address
                    </button>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${address.isDefault ? 'border-primary-500' : 'border-gray-200'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary-100 p-2 rounded-lg">
                                        <FiMapPin className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{address.type}</h3>
                                        {address.isDefault && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full mt-1">
                                                <FiCheck className="w-3 h-3" />
                                                Default
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <FiEdit2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Address Details */}
                            <div className="space-y-2 mb-4">
                                <p className="font-semibold text-gray-900">{address.name}</p>
                                <p className="text-gray-600">{address.address}</p>
                                <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                                <p className="text-gray-600">{address.phone}</p>
                            </div>

                            {/* Set Default Button */}
                            {!address.isDefault && (
                                <button
                                    onClick={() => handleSetDefault(address.id)}
                                    className="w-full py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                                >
                                    Set as Default
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {addresses.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
                        <p className="text-gray-600 mb-6">Add your first delivery address</p>
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all">
                            <FiPlus className="w-5 h-5" />
                            Add Address
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AddressesPage;
