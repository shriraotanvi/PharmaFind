import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PharmaDashboard() {
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [customersModalOpen, setCustomersModalOpen] = useState(false);
  const [addMedicineModalOpen, setAddMedicineModalOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('Loading...');
  const [userId, setUserId] = useState('Loading...');
  
  // Form states for Add Medicine
  const [medicineName, setMedicineName] = useState('');
  const [medicineDescription, setMedicineDescription] = useState('');
  const [medicineDosage, setMedicineDosage] = useState('');
  const [medicineManufacturer, setMedicineManufacturer] = useState('');
  const [medicinePrice, setMedicinePrice] = useState('');
  const [medicineQuantity, setMedicineQuantity] = useState('');
  
  // Form states for Customer Registration
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerMedHistory, setCustomerMedHistory] = useState('');
  
  // Mock API functions (would connect to your actual API)
  const fetchUserData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/user', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserName(data.user.name);
      setUserId(data.user.pharmId || 'N/A');
    } catch (err) {
      setError('Failed to load user data: ' + err.message);
    }
  };
  
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/medicines', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      const inventoryData = await response.json();
      setInventory(inventoryData);
    } catch (err) {
      setError('Failed to load inventory data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/customers', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const customers = await response.json();
      setCustomers(customers);
    } catch (err) {
      setError('Failed to load customer data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const addMedicine = async () => {
    if (!medicineName || !medicineDescription || !medicineDosage || 
        !medicineManufacturer || !medicinePrice || !medicineQuantity) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/medicines', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: medicineName,
          description: medicineDescription,
          dosage: medicineDosage,
          manufacturer: medicineManufacturer,
          price: parseFloat(medicinePrice),
          quantity: parseInt(medicineQuantity)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add medicine');
      }
      
      const newMedicine = await response.json();
      setInventory([...inventory, newMedicine]);
      
      // Reset form
      setMedicineName('');
      setMedicineDescription('');
      setMedicineDosage('');
      setMedicineManufacturer('');
      setMedicinePrice('');
      setMedicineQuantity('');
      
      // Close modal
      setAddMedicineModalOpen(false);
      
      // Success message
      alert('Medicine added successfully!');
    } catch (err) {
      setError(err.message);
    }
  };
  
  const registerCustomer = async () => {
    if (!customerName || !customerPhone || !customerAddress) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
          medicalHistory: customerMedHistory
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const newCustomer = await response.json();
      setCustomers([...customers, newCustomer]);
      
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerMedHistory('');
      
      // Close modal & show success
      setCustomersModalOpen(false);
      alert('Customer registered successfully!');
    } catch (err) {
      setError(err.message);
    }
  };
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  useEffect(() => {
    if (inventoryModalOpen) {
      fetchInventory();
    }
  }, [inventoryModalOpen]);
  
  useEffect(() => {
    if (customersModalOpen) {
      fetchCustomers();
    }
  }, [customersModalOpen]);

  return (
    <div className="bg-green-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white p-4 shadow mb-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              <span className="text-teal-700">Pharma</span>
              <span className="text-emerald-500">Find</span>
            </h1>
            <div className="text-sm text-teal-600">Your Pharmacy Management Solution</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-semibold text-teal-700">{userName}</div>
              <div className="text-xs text-emerald-500">ID: {userId}</div>
            </div>
            <button className="border border-teal-700 text-teal-700 px-3 py-1 rounded-full text-sm hover:bg-teal-700 hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <p className="italic text-teal-700">Effective inventory management leads to better patient care.</p>
        </div>
        
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg hover:-translate-y-2 transition-all cursor-pointer text-center"
            onClick={() => setCustomersModalOpen(true)}
          >
            <h2 className="text-xl font-semibold text-teal-700 mb-3">Customer Registration</h2>
            <p className="text-gray-600 mb-4">Register new customers and manage customer profiles with contact information and medical history.</p>
            <button className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors">
              Register Customer
            </button>
          </div>
          
          <div 
            className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-300 hover:-translate-y-2 transition-all cursor-pointer text-center"
            onClick={() => setInventoryModalOpen(true)}
          >
            <h2 className="text-xl font-semibold text-teal-700 mb-3">Check Stock Status</h2>
            <p className="text-gray-600 mb-4">Monitor inventory levels, get alerts for low stock, and generate reorder reports.</p>
            <button className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors">
              View Inventory
            </button>
          </div>
          
          <div 
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg hover:-translate-y-2 transition-all cursor-pointer text-center"
            onClick={() => setAddMedicineModalOpen(true)}
          >
            <h2 className="text-xl font-semibold text-teal-700 mb-3">Add Medicine</h2>
            <p className="text-gray-600 mb-4">Add new medications to inventory with details including dosage, manufacturer, and pricing.</p>
            <button className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors">
              Add Medicine
            </button>
          </div>
        </div>
      </div>
      
      {/* Inventory Modal */}
      {inventoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-teal-700">Medication Inventory</h2>
              <button 
                className="text-2xl text-teal-700" 
                onClick={() => setInventoryModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            {loading ? (
              <p className="text-center py-4">Loading inventory data...</p>
            ) : error ? (
              <p className="text-center py-4 text-red-500">{error}</p>
            ) : inventory.length === 0 ? (
              <p className="text-center py-4">No medicines in inventory yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="p-3 text-left text-teal-700 font-semibold">Name</th>
                      <th className="p-3 text-left text-teal-700 font-semibold">Description</th>
                      <th className="p-3 text-left text-teal-700 font-semibold">Dosage</th>
                      <th className="p-3 text-left text-teal-700 font-semibold">Manufacturer</th>
                      <th className="p-3 text-left text-teal-700 font-semibold">Price</th>
                      <th className="p-3 text-left text-teal-700 font-semibold">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(medicine => (
                      <tr key={medicine.id} className="border-b border-green-50">
                        <td className="p-3">{medicine.name}</td>
                        <td className="p-3">{medicine.description}</td>
                        <td className="p-3">{medicine.dosage}</td>
                        <td className="p-3">{medicine.manufacturer}</td>
                        <td className="p-3">${medicine.price.toFixed(2)}</td>
                        <td className="p-3">{medicine.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Customers Modal */}
      {customersModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-teal-700">Customer List</h2>
              <button 
                className="text-2xl text-teal-700" 
                onClick={() => setCustomersModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            {loading ? (
              <p className="text-center py-4">Loading customer data...</p>
            ) : error ? (
              <p className="text-center py-4 text-red-500">{error}</p>
            ) : customers.length === 0 ? (
              <p className="text-center py-4">No customers registered yet.</p>
            ) : (
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="p-3 text-left text-teal-700 font-semibold">Name</th>
                      <th className="p-3 text-left text-teal-700 font-semibold">Email</th>
                      <th className="p-3 text-left text-teal-700 font-semibold">Phone</th>
                      <th className="p-3 text-left text-teal-700 font-semibold">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => (
                      <tr key={customer.id} className="border-b border-green-50">
                        <td className="p-3">{customer.name}</td>
                        <td className="p-3">{customer.email}</td>
                        <td className="p-3">{customer.phone}</td>
                        <td className="p-3">{customer.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Add New Customer Form */}
            <div className="mt-6 p-4 border-t border-green-100">
              <h3 className="text-lg font-semibold text-teal-700 mb-4">Add New Customer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-2 border-green-100 rounded-lg"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-2 border-2 border-green-100 rounded-lg"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full p-2 border-2 border-green-100 rounded-lg"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-1">Address</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-2 border-green-100 rounded-lg"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-teal-700 mb-1">Medical History</label>
                <textarea 
                  className="w-full p-2 border-2 border-green-100 rounded-lg"
                  rows="3"
                  value={customerMedHistory}
                  onChange={(e) => setCustomerMedHistory(e.target.value)}
                  placeholder="Enter any relevant medical history"
                ></textarea>
              </div>
              <div className="text-center">
                <button 
                  className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors"
                  onClick={registerCustomer}
                >
                  Register Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Medicine Modal */}
      {addMedicineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-teal-700">Add New Medicine</h2>
              <button 
                className="text-2xl text-teal-700" 
                onClick={() => setAddMedicineModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Medicine Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border-2 border-green-100 rounded-lg"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Enter medicine name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Description</label>
                <input 
                  type="text" 
                  className="w-full p-2 border-2 border-green-100 rounded-lg"
                  value={medicineDescription}
                  onChange={(e) => setMedicineDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Dosage</label>
                <input 
                  type="text" 
                  className="w-full p-2 border-2 border-green-100 rounded-lg"
                  value={medicineDosage}
                  onChange={(e) => setMedicineDosage(e.target.value)}
                  placeholder="Enter dosage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Manufacturer</label>
                <input 
                  type="text" 
                  className="w-full p-2 border-2 border-green-100 rounded-lg"
                  value={medicineManufacturer}
                  onChange={(e) => setMedicineManufacturer(e.target.value)}
                  placeholder="Enter manufacturer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Price</label>
                <input 
                  type="number" 
                  className="w-full p-2 border-2 border-green-100 rounded-lg"
                  value={medicinePrice}
                  onChange={(e) => setMedicinePrice(e.target.value)}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  className="w-full p-2 border-2 border-green-100 rounded-lg"
                  value={medicineQuantity}
                  onChange={(e) => setMedicineQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  min="0"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <div className="text-center">
              <button 
                className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors"
                onClick={addMedicine}
              >
                Add Medicine
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="mt-12 p-4 text-center">
        <p className="font-semibold text-teal-700">MAKE YOUR PHARMACY MANAGEMENT A PRIORITY.</p>
      </footer>
    </div>
  );
}