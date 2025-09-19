import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Daily Revenue Chart Component
export const DailyRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Trend</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
          <Tooltip 
            formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'totalAmount' ? 'Total Revenue' : 'Paid Revenue']}
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="totalAmount" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Total Revenue"
          />
          <Line 
            type="monotone" 
            dataKey="paidAmount" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Paid Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Monthly Revenue Chart Component
export const MonthlyRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          />
          <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
          <Tooltip 
            formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'totalAmount' ? 'Total Revenue' : 'Paid Revenue']}
            labelFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          />
          <Legend />
          <Bar dataKey="totalAmount" fill="#8884d8" name="Total Revenue" />
          <Bar dataKey="paidAmount" fill="#82ca9d" name="Paid Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Center Performance Chart Component (for SuperAdmin)
export const CenterPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Center Performance</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Center Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
          <YAxis dataKey="centerName" type="category" width={120} />
          <Tooltip 
            formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'totalAmount' ? 'Total Revenue' : 'Paid Revenue']}
          />
          <Legend />
          <Bar dataKey="totalAmount" fill="#8884d8" name="Total Revenue" />
          <Bar dataKey="paidAmount" fill="#82ca9d" name="Paid Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Doctor Performance Chart Component (for CenterAdmin)
export const DoctorPerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Performance</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
          <YAxis dataKey="doctorName" type="category" width={120} />
          <Tooltip 
            formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'totalAmount' ? 'Total Revenue' : 'Paid Revenue']}
          />
          <Legend />
          <Bar dataKey="totalAmount" fill="#8884d8" name="Total Revenue" />
          <Bar dataKey="paidAmount" fill="#82ca9d" name="Paid Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Payment Status Pie Chart Component
export const PaymentStatusChart = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const data = [
    { name: 'Paid', value: stats.paidAmount, count: stats.paidBills, color: '#82ca9d' },
    { name: 'Pending', value: stats.pendingAmount, count: stats.pendingBills, color: '#ffc658' },
    { name: 'Payment Received', value: stats.paymentReceivedAmount || 0, count: stats.paymentReceivedBills || 0, color: '#8884d8' },
    { name: 'Cancelled', value: stats.cancelledAmount || 0, count: stats.cancelledBills || 0, color: '#ff7300' }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No payment data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, count }) => `${name}: ₹${value.toLocaleString()} (${count})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              `₹${value.toLocaleString()}`, 
              `${props.payload.name} (${props.payload.count} bills)`
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Revenue Summary Cards Component
export const RevenueSummaryCards = ({ stats, period }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: stats.totalAmount,
      count: stats.totalBills,
      color: 'blue',
      icon: '💰'
    },
    {
      title: 'Paid Revenue',
      value: stats.paidAmount,
      count: stats.paidBills,
      color: 'green',
      icon: '✅'
    },
    {
      title: 'Pending Revenue',
      value: stats.pendingAmount,
      count: stats.pendingBills,
      color: 'yellow',
      icon: '⏳'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 bg-${card.color}-100 rounded-lg`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">₹{card.value.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{card.count} bills</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
