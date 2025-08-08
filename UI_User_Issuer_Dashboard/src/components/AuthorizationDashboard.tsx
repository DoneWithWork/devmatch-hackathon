import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  User,
  Calendar,
  Award,
  Settings,
  Bell,
  Lock,
  Unlock,
  ExternalLink,
  Globe
} from 'lucide-react'

interface AuthorizationRecord {
  id: string
  domain: string
  status: 'active' | 'pending' | 'suspended' | 'revoked'
  institution: {
    name: string
    logo?: string
    verified: boolean
  }
  createdTime: string
  permissions: {
    canMint: boolean
    canRevoke: boolean
    canTransfer: boolean
  }
  metadata: {
    blockchain: string
    certificateTypes: string[]
    lastActivity: string
  }
}

const AuthorizationDashboard = () => {
  const [activeTab, setActiveTab] = useState('authorizations')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState<AuthorizationRecord | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [authorizationRecords] = useState<AuthorizationRecord[]>([
    {
      id: 'AUTH-001',
      domain: 'techcorp-academy.edu',
      status: 'active',
      institution: {
        name: 'TechCorp Academy',
        logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
        verified: true
      },
      createdTime: '2024-12-15T10:30:00Z',
      permissions: {
        canMint: true,
        canRevoke: false,
        canTransfer: false
      },
      metadata: {
        blockchain: 'Ethereum',
        certificateTypes: ['Blockchain Development', 'Smart Contracts'],
        lastActivity: '2024-12-20T14:22:00Z'
      }
    },
    {
      id: 'AUTH-002',
      domain: 'cryptou.org',
      status: 'active',
      institution: {
        name: 'CryptoU',
        logo: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
        verified: true
      },
      createdTime: '2024-12-14T15:45:00Z',
      permissions: {
        canMint: true,
        canRevoke: true,
        canTransfer: false
      },
      metadata: {
        blockchain: 'Polygon',
        certificateTypes: ['DeFi Specialization', 'Yield Farming'],
        lastActivity: '2024-12-19T09:15:00Z'
      }
    },
    {
      id: 'AUTH-003',
      domain: 'web3institute.com',
      status: 'pending',
      institution: {
        name: 'Web3 Institute',
        logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
        verified: false
      },
      createdTime: '2024-12-13T09:15:00Z',
      permissions: {
        canMint: false,
        canRevoke: false,
        canTransfer: false
      },
      metadata: {
        blockchain: 'BSC',
        certificateTypes: ['Security Audit'],
        lastActivity: '2024-12-13T09:15:00Z'
      }
    },
    {
      id: 'AUTH-004',
      domain: 'blockchain-academy.net',
      status: 'suspended',
      institution: {
        name: 'Blockchain Academy',
        logo: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
        verified: true
      },
      createdTime: '2024-12-10T14:20:00Z',
      permissions: {
        canMint: true,
        canRevoke: false,
        canTransfer: true
      },
      metadata: {
        blockchain: 'Ethereum',
        certificateTypes: ['NFT Development', 'Marketplace Integration'],
        lastActivity: '2024-12-18T11:30:00Z'
      }
    },
    {
      id: 'AUTH-005',
      domain: 'defi-university.io',
      status: 'revoked',
      institution: {
        name: 'DeFi University',
        logo: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
        verified: false
      },
      createdTime: '2024-12-08T11:00:00Z',
      permissions: {
        canMint: false,
        canRevoke: false,
        canTransfer: false
      },
      metadata: {
        blockchain: 'Arbitrum',
        certificateTypes: ['DeFi Protocols'],
        lastActivity: '2024-12-16T16:45:00Z'
      }
    }
  ])

  const tabs = [
    { id: 'authorizations', name: 'Domain Authorizations', icon: Shield },
    { id: 'requests', name: 'Pending Requests', icon: Clock },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100/50 text-green-700 border-green-200/50'
      case 'pending': return 'bg-yellow-100/50 text-yellow-700 border-yellow-200/50'
      case 'suspended': return 'bg-orange-100/50 text-orange-700 border-orange-200/50'
      case 'revoked': return 'bg-red-100/50 text-red-700 border-red-200/50'
      default: return 'bg-gray-100/50 text-gray-700 border-gray-200/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'pending': return Clock
      case 'suspended': return AlertTriangle
      case 'revoked': return XCircle
      default: return Clock
    }
  }

  const filteredRecords = authorizationRecords.filter(record => {
    const matchesSearch = record.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleActivate = (recordId: string) => {
    console.log('Activating authorization:', recordId)
  }

  const handleSuspend = (recordId: string) => {
    console.log('Suspending authorization:', recordId)
  }

  const handleRevoke = (recordId: string) => {
    console.log('Revoking authorization:', recordId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Authorization Management</h1>
          <p className="text-gray-600">Manage domain authorizations for certificate minting</p>
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

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, domain, or institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </motion.div>

        {/* Authorization Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Domain</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Institution</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Created Time</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => {
                  const StatusIcon = getStatusIcon(record.status)
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className="border-b border-white/10 hover:bg-white/10 transition-all duration-200"
                    >
                      {/* ID */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-700">{record.id}</span>
                      </td>

                      {/* Domain */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">{record.domain}</span>
                          <button className="text-gray-400 hover:text-blue-600 transition-colors">
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>

                      {/* Institution */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={record.institution.logo}
                            alt={record.institution.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/30"
                          />
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-700 font-medium text-sm">{record.institution.name}</span>
                              {record.institution.verified && (
                                <CheckCircle className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.metadata.certificateTypes.length} certificate type{record.metadata.certificateTypes.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Created Time */}
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700">
                          {formatDate(record.createdTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.metadata.blockchain}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRecord(record)
                              setShowModal(true)
                            }}
                            className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-600 hover:text-blue-600 hover:bg-white/30 transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </button>

                          {record.status === 'pending' && (
                            <button
                              onClick={() => handleActivate(record.id)}
                              className="p-1.5 rounded-lg bg-green-500/20 text-green-700 border border-green-200/50 hover:bg-green-500/30 transition-all duration-200"
                              title="Activate"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                          )}

                          {record.status === 'active' && (
                            <button
                              onClick={() => handleSuspend(record.id)}
                              className="p-1.5 rounded-lg bg-orange-500/20 text-orange-700 border border-orange-200/50 hover:bg-orange-500/30 transition-all duration-200"
                              title="Suspend"
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </button>
                          )}

                          {(record.status === 'active' || record.status === 'suspended') && (
                            <button
                              onClick={() => handleRevoke(record.id)}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-700 border border-red-200/50 hover:bg-red-500/30 transition-all duration-200"
                              title="Revoke"
                            >
                              <XCircle className="h-3 w-3" />
                            </button>
                          )}

                          <button className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-600 hover:text-gray-800 hover:bg-white/30 transition-all duration-200">
                            <MoreVertical className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No authorizations found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </motion.div>

        {/* Detail Modal */}
        <AnimatePresence>
          {showModal && selectedRecord && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 backdrop-blur-lg rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Authorization Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Authorization ID</label>
                      <p className="font-mono text-gray-800">{selectedRecord.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Domain</label>
                      <p className="text-gray-800">{selectedRecord.domain}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRecord.status)}`}>
                        {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Blockchain</label>
                      <p className="text-gray-800">{selectedRecord.metadata.blockchain}</p>
                    </div>
                  </div>

                  {/* Institution Info */}
                  <div className="p-4 rounded-lg bg-gray-50/50">
                    <h4 className="font-semibold text-gray-800 mb-3">Institution Details</h4>
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedRecord.institution.logo}
                        alt={selectedRecord.institution.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-medium text-gray-800">{selectedRecord.institution.name}</h5>
                        <div className="flex items-center mt-1">
                          {selectedRecord.institution.verified ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Verified Institution</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <XCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Unverified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Types */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Authorized Certificate Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.metadata.certificateTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm border border-blue-200/50"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Permissions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Mint Certificates</span>
                        {selectedRecord.permissions.canMint ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Revoke Certificates</span>
                        {selectedRecord.permissions.canRevoke ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Transfer Certificates</span>
                        {selectedRecord.permissions.canTransfer ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-600">Created</label>
                      <p className="text-gray-800">{formatDate(selectedRecord.createdTime)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">Last Activity</label>
                      <p className="text-gray-800">{formatDate(selectedRecord.metadata.lastActivity)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AuthorizationDashboard
