import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Award, 
  Shield, 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    {
      title: 'Total Certificates',
      value: '1,247',
      change: '+12%',
      icon: Award,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Verified Today',
      value: '89',
      change: '+5%',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Pending Verification',
      value: '23',
      change: '-8%',
      icon: Clock,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Active Users',
      value: '456',
      change: '+18%',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const recentCertificates = [
    {
      id: '0x1a2b3c...',
      recipient: 'Alice Johnson',
      title: 'Blockchain Development',
      status: 'Verified',
      date: '2024-12-15',
      blockchain: 'Ethereum'
    },
    {
      id: '0x4d5e6f...',
      recipient: 'Bob Smith',
      title: 'Smart Contract Audit',
      status: 'Pending',
      date: '2024-12-14',
      blockchain: 'Polygon'
    },
    {
      id: '0x7g8h9i...',
      recipient: 'Carol Davis',
      title: 'DeFi Specialization',
      status: 'Verified',
      date: '2024-12-13',
      blockchain: 'BSC'
    },
    {
      id: '0xjk1l2m...',
      recipient: 'David Wilson',
      title: 'NFT Development',
      status: 'Verified',
      date: '2024-12-12',
      blockchain: 'Ethereum'
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'certificates', name: 'Certificates', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: PieChart },
    { id: 'activity', name: 'Activity', icon: Activity }
  ]

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor your certificate issuance and verification activities</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 p-1 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white/30 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -2 }}
              className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Certificates */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Recent Certificates</h3>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentCertificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="font-medium text-gray-800">{cert.recipient}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cert.status === 'Verified' 
                              ? 'bg-green-100/50 text-green-700 border border-green-200/50' 
                              : 'bg-orange-100/50 text-orange-700 border border-orange-200/50'
                          }`}>
                            {cert.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{cert.title}</div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>ID: {cert.id}</span>
                          <span>{cert.blockchain}</span>
                          <span>{cert.date}</span>
                        </div>
                      </div>
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Quick Actions Card */}
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center">
                  <Award className="h-4 w-4 mr-2" />
                  Issue New Certificate
                </button>
                <button className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 font-medium hover:bg-white/30 transition-all duration-200 flex items-center justify-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Certificate
                </button>
                <button className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 font-medium hover:bg-white/30 transition-all duration-200 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </button>
              </div>
            </div>

            {/* Network Status */}
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Network Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ethereum</span>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Polygon</span>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">BSC</span>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm text-yellow-600">Slow</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
