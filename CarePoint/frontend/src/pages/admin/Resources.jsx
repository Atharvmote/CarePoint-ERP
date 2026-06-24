import MainLayout from '../../layout/MainLayout';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-toastify';


function Resources() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
  const fetchResources = async () => {
    try {
      const data = await api.getResources();
      const formatted = data.map(resource => {
        let status = "in-stock";
        if(resource.available === 0)
          status = "critical";
        else if(resource.available < 5)
          status = "low-stock";
        return {
          id: resource._id,
          name: resource.name,
          category: resource.type || "Medical Resource",
          quantity: resource.available,
          minStock: resource.total || 10,
          status: status
        };
      });
      setResources(formatted);
    } catch(error) {
      console.error("Resource fetch error:", error);
      toast.error("Failed to load resources");
    }
  };
  fetchResources();
}, []);


  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Resource Management</h1>
          <p className="text-slate-600">Track medical supplies and equipment</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-lg">
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} hover>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{resource.name}</h3>
                  <p className="text-sm text-slate-600">{resource.category}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Stock Level</span>
                    <span className="text-sm font-semibold">{resource.quantity} units</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${resource.status === 'in-stock' ? 'bg-green-500' : resource.status === 'low-stock' ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: `${(resource.quantity/resource.minStock)*50}%`}}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Status</span>
                  <StatusBadge status={resource.status} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
}

export default Resources;
