import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Award, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Shield,
  Globe,
  User,
  Calendar,
  Upload
} from 'lucide-react'

const IssuerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Issue Certificate Form State
  const [issueFormData, setIssueFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    certificateTitle: '',
    description: '',
    issueDate: '',
    expiryDate: '',
    blockchain: 'polygon'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'issue', name: 'Issue Certificate', icon: Plus },
    { id: 'certificates', name: 'My Certificates', icon: FileText },
    { id: 'recipients', name: 'Recipients', icon: Users },
    { id: 'templates', name: 'Templates', icon: Award },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  const stats = [
    {
      title: 'Total Issued',
      value: '1,247',
      change: '+12%',
      icon: Award,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Recipients',
      value: '892',
      change: '+8%',
      icon: Users,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Pending Verification',
      value: '23',
      change: '-5%',
      icon: Clock,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Gas Saved',
      value: '$2,450',
      change: '+25%',
      icon: Zap,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const certificates = [
    {
      id: '0x1a2b3c...',
      title: 'Blockchain Development Certification',
      recipient: 'Alice Johnson',
      status: 'Verified',
      date: '2024-12-15',
      blockchain: 'Polygon',
      gasUsed: '0 ETH'
    },
    {
      id: '0x4d5e6f...',
      title: 'Smart Contract Security Audit',
      recipient: 'Bob Smith',
      status: 'Pending',
      date: '2024-12-14',
      blockchain: 'BSC',
      gasUsed: '0 ETH'
    },
    {
      id: '0x7g8h9i...',
      title: 'DeFi Protocol Development',
      recipient: 'Carol Davis',
      status: 'Verified',
      date: '2024-12-13',
      blockchain: 'Arbitrum',
      gasUsed: '0 ETH'
    },
    {
      id: '0xjk1l2m...',
      title: 'NFT Marketplace Creation',
      recipient: 'David Wilson',
      status: 'Verified',
      date: '2024-12-12',
      blockchain: 'Polygon',
      gasUsed: '0 ETH'
    }
  ]

  const blockchains = [
    { id: 'ethereum', name: 'Ethereum', gasPrice: 'High', color: 'text-blue-600' },
    { id: 'polygon', name: 'Polygon', gasPrice: 'Low', color: 'text-purple-600' },
    { id: 'bsc', name: 'BSC', gasPrice: 'Medium', color: 'text-yellow-600' },
    { id: 'arbitrum', name: 'Arbitrum', gasPrice: 'Low', color: 'text-green-600' }
  ]

  const quickIssueForm = {
    recipientName: '',
    recipientEmail: '',
    certificateTitle: '',
    blockchain: 'polygon'
  }

  const [formData, setFormData] = useState(quickIssueForm)

  const handleQuickIssue = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle quick certificate issuance
    console.log('Quick issue:', formData)
  }

  const handleIssueInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setIssueFormData({
      ...issueFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
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
      </div>

      {/* Quick Issue Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Quick Issue Certificate (Fee-Free)
        </h3>
        
        <form onSubmit={handleQuickIssue} className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Recipient Name"
            value={formData.recipientName}
            onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
            className="px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.recipientEmail}
            onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})}
            className="px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Certificate Title"
            value={formData.certificateTitle}
            onChange={(e) => setFormData({...formData, certificateTitle: e.target.value})}
            className="px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Issue Now
          </button>
        </form>
        
        <div className="mt-4 p-3 rounded-lg bg-green-100/20 border border-green-200/30">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">No gas fees required - Sponsored by issuer pool</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Recent Certificates</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {certificates.slice(0, 3).map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
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
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100/50 text-blue-700 border border-blue-200/50">
                      {cert.gasUsed}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{cert.title}</div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{cert.blockchain}</span>
                    <span>{cert.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-600 hover:text-blue-600 transition-all duration-200">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-600 hover:text-green-600 transition-all duration-200">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  const renderIssueCertificate = () => {
    if (submitted) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <div className="p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificate Issued!</h2>
              <p className="text-gray-600">Your certificate has been successfully issued on the blockchain.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-sm text-gray-600">Certificate ID</div>
                <div className="font-mono text-sm text-gray-800">0x1a2b3c4d5e6f7890abcdef</div>
              </div>
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-sm text-gray-600">Transaction Hash</div>
                <div className="font-mono text-sm text-gray-800">0xabcdef1234567890...</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSubmitted(false)
                setIssueFormData({
                  recipientName: '',
                  recipientEmail: '',
                  certificateTitle: '',
                  description: '',
                  issueDate: '',
                  expiryDate: '',
                  blockchain: 'polygon'
                })
              }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              Issue Another Certificate
            </button>
          </div>
        </motion.div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleIssueSubmit} className="space-y-6">
              <div className="p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Recipient Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={issueFormData.recipientName}
                      onChange={handleIssueInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter recipient's full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="recipientEmail"
                      value={issueFormData.recipientEmail}
                      onChange={handleIssueInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="recipient@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Certificate Details
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Title *
                    </label>
                    <input
                      type="text"
                      name="certificateTitle"
                      value={issueFormData.certificateTitle}
                      onChange={handleIssueInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Blockchain Development Certification"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={issueFormData.description}
                      onChange={handleIssueInputChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Describe the achievement or skills certified..."
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Date *
                      </label>
                      <input
                        type="date"
                        name="issueDate"
                        value={issueFormData.issueDate}
                        onChange={handleIssueInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date (Optional)
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={issueFormData.expiryDate}
                        onChange={handleIssueInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Blockchain Selection
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {blockchains.map((blockchain) => (
                    <label
                      key={blockchain.id}
                      className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        issueFormData.blockchain === blockchain.id
                          ? 'border-blue-500 bg-blue-50/20'
                          : 'border-white/30 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="blockchain"
                        value={blockchain.id}
                        checked={issueFormData.blockchain === blockchain.id}
                        onChange={handleIssueInputChange}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${blockchain.color}`}>{blockchain.name}</div>
                        <div className="text-sm text-gray-600">Gas: {blockchain.gasPrice}</div>
                      </div>
                      {issueFormData.blockchain === blockchain.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Issuing Certificate...
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5 mr-2" />
                    Issue Certificate
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Gas Tracker */}
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Gas Tracker
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ethereum</span>
                  <span className="text-sm font-medium text-red-600">45 Gwei</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Polygon</span>
                  <span className="text-sm font-medium text-green-600">2 Gwei</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">BSC</span>
                  <span className="text-sm font-medium text-yellow-600">5 Gwei</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-100/20 border border-green-200/30">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Polygon Recommended</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Double-check recipient information before issuing</li>
                <li>• Choose blockchain based on gas costs</li>
                <li>• Certificates are immutable once issued</li>
                <li>• Recipients will receive email notification</li>
              </ul>
            </div>

            {/* Upload Template */}
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Certificate Template
              </h3>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload custom template</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Browse Files
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCertificates = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Certificates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Certificate</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Recipient</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Blockchain</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Gas Used</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert, index) => (
                <motion.tr
                  key={cert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-800">{cert.title}</div>
                      <div className="text-sm text-gray-500">{cert.id}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{cert.recipient}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cert.status === 'Verified' 
                        ? 'bg-green-100/50 text-green-700 border border-green-200/50' 
                        : 'bg-orange-100/50 text-orange-700 border border-orange-200/50'
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100/50 text-blue-700 border border-blue-200/50">
                      {cert.blockchain}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100/50 text-green-700 border border-green-200/50">
                      {cert.gasUsed}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{cert.date}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-600 hover:text-blue-600 transition-all duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-600 hover:text-green-600 transition-all duration-200">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-600 hover:text-red-600 transition-all duration-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'issue':
        return renderIssueCertificate()
      case 'certificates':
        return renderCertificates()
      default:
        return (
          <div className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{sidebarItems.find(item => item.id === activeTab)?.name}</h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )
    }
  }

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-64 flex-shrink-0"
          >
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg sticky top-28">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Issuer Dashboard</h2>
                <p className="text-sm text-gray-600">Manage your certificates</p>
              </div>
              
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-white/20'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                ))}
              </nav>

              {/* Fee-Free Badge */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-100/20 to-emerald-100/20 border border-green-200/30">
                <div className="flex items-center text-green-700 mb-2">
                  <Zap className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Fee-Free Issuance</span>
                </div>
                <p className="text-xs text-green-600">All certificates issued without gas fees</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {sidebarItems.find(item => item.id === activeTab)?.name || 'Overview'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'overview' && 'Monitor your certificate issuance activities'}
                {activeTab === 'issue' && 'Create and issue new certificates to recipients'}
                {activeTab === 'certificates' && 'View and manage all your issued certificates'}
                {activeTab === 'recipients' && 'Manage your certificate recipients'}
                {activeTab === 'templates' && 'Create and customize certificate templates'}
                {activeTab === 'settings' && 'Configure your issuer preferences'}
              </p>
            </div>

            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default IssuerDashboard
