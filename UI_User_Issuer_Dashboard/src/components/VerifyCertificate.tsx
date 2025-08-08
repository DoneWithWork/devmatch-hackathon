import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Search, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Calendar,
  User,
  FileText,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certificateId.trim()) return

    setIsVerifying(true)
    setError('')
    setVerificationResult(null)

    // Simulate GraphQL query
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock verification result
    if (certificateId.toLowerCase().includes('invalid')) {
      setError('Certificate not found or invalid')
    } else {
      setVerificationResult({
        id: certificateId,
        recipient: 'Alice Johnson',
        title: 'Blockchain Development Certification',
        description: 'This certificate validates the completion of advanced blockchain development course including smart contracts, DeFi protocols, and Web3 integration.',
        issuer: 'TechCorp Academy',
        issueDate: '2024-12-15',
        expiryDate: '2026-12-15',
        blockchain: 'Ethereum',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        blockNumber: '18,945,123',
        status: 'Valid',
        verifiedAt: new Date().toISOString()
      })
    }

    setIsVerifying(false)
  }

  const sampleCertificates = [
    '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    '0x9876543210fedcba0987654321fedcba09876543',
    '0xabcdef1234567890abcdef1234567890abcdef12'
  ]

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100/50 to-blue-100/50 backdrop-blur-sm border border-white/30 mb-6">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">Certificate Verification</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Verify Certificate</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter a certificate ID to verify its authenticity on the blockchain
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <form onSubmit={handleVerify} className="p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID or Transaction Hash
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    placeholder="0x1a2b3c4d5e6f7890abcdef1234567890abcdef12"
                    className="w-full px-4 py-4 pl-12 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <motion.button
                type="submit"
                disabled={isVerifying || !certificateId.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Verify Certificate
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Sample Certificates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Try Sample Certificates</h3>
            <div className="grid gap-2">
              {sampleCertificates.map((id, index) => (
                <button
                  key={index}
                  onClick={() => setCertificateId(id)}
                  className="text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 font-mono text-sm text-gray-700 hover:text-blue-600"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="p-6 rounded-xl bg-red-100/20 backdrop-blur-sm border border-red-200/30 shadow-lg">
              <div className="flex items-center">
                <XCircle className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-700">Verification Failed</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Status Header */}
            <div className="p-6 rounded-xl bg-green-100/20 backdrop-blur-sm border border-green-200/30 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold text-green-700">Certificate Verified</h3>
                    <p className="text-green-600">This certificate is authentic and valid</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Verified on</div>
                  <div className="font-medium text-gray-800">
                    {new Date(verificationResult.verifiedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Main Details */}
              <div className="p-8 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Certificate Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Title</div>
                    <div className="font-semibold text-gray-800">{verificationResult.title}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Recipient</div>
                    <div className="font-semibold text-gray-800 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {verificationResult.recipient}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Issuer</div>
                    <div className="font-semibold text-gray-800">{verificationResult.issuer}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Description</div>
                    <div className="text-gray-700 text-sm leading-relaxed">{verificationResult.description}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Issue Date</div>
                      <div className="font-medium text-gray-800 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {verificationResult.issueDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Expiry Date</div>
                      <div className="font-medium text-gray-800">{verificationResult.expiryDate}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Details */}
              <div className="p-8 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Blockchain Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Network</div>
                    <div className="font-semibold text-blue-600">{verificationResult.blockchain}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Certificate ID</div>
                    <div className="font-mono text-sm text-gray-800 break-all bg-white/10 p-2 rounded">
                      {verificationResult.id}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Transaction Hash</div>
                    <div className="font-mono text-sm text-gray-800 break-all bg-white/10 p-2 rounded flex items-center justify-between">
                      <span>{verificationResult.transactionHash}</span>
                      <button className="ml-2 text-blue-600 hover:text-blue-700">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Block Number</div>
                    <div className="font-medium text-gray-800">{verificationResult.blockNumber}</div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-green-600">{verificationResult.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Blockchain
              </button>
              <button className="flex-1 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center">
                <FileText className="h-4 w-4 mr-2" />
                Download Report
              </button>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <div className="p-6 rounded-xl bg-blue-100/20 backdrop-blur-sm border border-blue-200/30">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How Verification Works</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• We query The Graph GraphQL endpoint for certificate data</li>
                  <li>• Certificate authenticity is verified against blockchain records</li>
                  <li>• All verification results are cryptographically validated</li>
                  <li>• Invalid or tampered certificates will be immediately detected</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default VerifyCertificate
