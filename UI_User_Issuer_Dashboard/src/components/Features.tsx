import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Lock, Users, TrendingUp } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Certificates are stored on immutable blockchain networks, ensuring they cannot be tampered with or forged.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'Verify any certificate in seconds using our GraphQL-powered verification system.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Globe,
      title: 'Multi-Chain Support',
      description: 'Automatically selects the most cost-effective blockchain using Chainbase Gas Tracker API.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Lock,
      title: 'ZkLogin Authentication',
      description: 'Secure zero-knowledge authentication ensures privacy while maintaining verification integrity.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Users,
      title: 'Multi-User Platform',
      description: 'Support for issuers, verifiers, and certificate holders with role-based access control.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Track certificate issuance, verification rates, and blockchain network performance.',
      color: 'from-teal-500 to-blue-500'
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose CertifyChain?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our platform combines cutting-edge blockchain technology with user-friendly design 
            to create the most secure and efficient certificate verification system.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="h-full p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Icon */}
                <div className="mb-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100/50 to-purple-100/50 backdrop-blur-sm border border-white/30 mb-6">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium">Trusted by 500+ Organizations</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to secure your certificates?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of organizations already using CertifyChain to issue and verify 
            certificates with blockchain technology.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
