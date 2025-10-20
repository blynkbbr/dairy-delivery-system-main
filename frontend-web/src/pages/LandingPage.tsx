import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Truck,
  Clock,
  Shield,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle
} from 'lucide-react';

import actionTracker from '../utils/actionTracker';

const LandingPage: React.FC = () => {
  useEffect(() => {
    actionTracker.trackPageView('landing');
  }, []);

  const features = [
    {
      icon: <Truck className="h-8 w-8 text-primary-600" />,
      title: "Fresh Daily Delivery",
      description: "Get fresh milk and dairy products delivered to your doorstep every morning."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: "Flexible Scheduling",
      description: "Choose your delivery days and times that work best for your schedule."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Quality Guaranteed",
      description: "100% pure and fresh dairy products sourced directly from local farms."
    },
    {
      icon: <Star className="h-8 w-8 text-primary-600" />,
      title: "Premium Service",
      description: "Exceptional customer service with easy subscription management."
    }
  ];

  const products = [
    {
      name: "Fresh Cow Milk",
      price: "₹45/liter",
      image: "🥛",
      popular: true
    },
    {
      name: "Buffalo Milk",
      price: "₹55/liter", 
      image: "🥛",
      popular: false
    },
    {
      name: "Organic Curd",
      price: "₹35/500g",
      image: "🧈",
      popular: false
    },
    {
      name: "Fresh Paneer",
      price: "₹120/250g",
      image: "🧀",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🥛</div>
              <span className="text-xl font-bold text-gray-900">DairyFresh</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#products" className="text-gray-600 hover:text-gray-900 transition-colors">Products</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/admin-login" className="text-sm text-gray-600 hover:text-gray-900">
                Admin
              </Link>
              <Link to="/login" className="btn-primary" onClick={() => actionTracker.trackClick('get_started_button', 'landing')}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:pr-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh Dairy
                <span className="text-primary-600 block">Delivered Daily</span>
              </h1>
              
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Experience the convenience of having fresh, premium quality milk and dairy products delivered to your doorstep every morning.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link to="/login" className="btn-primary btn-lg" onClick={() => actionTracker.trackClick('start_subscription_button', 'landing')}>
                  Start Your Subscription
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="btn-secondary btn-lg" onClick={() => actionTracker.trackClick('call_us_button', 'landing')}>
                  <Phone className="mr-2 h-5 w-5" />
                  Call Us Now
                </button>
              </div>

              <div className="flex items-center gap-8 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">On-Time Delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 hero-pattern">
                <div className="text-center">
                  <div className="text-8xl mb-4 milk-splash">🥛</div>
                  <div className="text-white text-xl font-semibold">Fresh • Pure • Delivered</div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 glass"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Farm Fresh</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 glass"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium">Daily 6 AM</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose DairyFresh?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to bringing you the freshest dairy products with unmatched convenience and quality.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Premium Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fresh, pure, and delivered daily from trusted local farms.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">{product.image}</div>
                  {product.popular && (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-2">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-primary-600 mb-4">{product.price}</p>
                  <button className="w-full btn-primary group-hover:shadow-md" onClick={() => actionTracker.trackClick('add_to_cart_button', 'landing', { product: product.name })}>
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-primary hero-pattern">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied customers and enjoy fresh dairy products delivered daily.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="bg-white text-primary-600 hover:bg-gray-50 btn btn-lg font-semibold" onClick={() => actionTracker.trackClick('start_subscription_cta', 'landing')}>
                Start Your Subscription
              </Link>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 btn btn-lg" onClick={() => actionTracker.trackClick('download_app_button', 'landing')}>
                Download App
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl">🥛</div>
                <span className="text-xl font-bold">DairyFresh</span>
              </div>
              <p className="text-gray-400">
                Premium dairy products delivered fresh to your doorstep daily.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/login" className="block text-gray-400 hover:text-white">Get Started</Link>
                <a href="#features" className="block text-gray-400 hover:text-white">Features</a>
                <a href="#products" className="block text-gray-400 hover:text-white">Products</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white">Contact Us</a>
                <Link to="/admin-login" className="block text-gray-400 hover:text-white">Admin Portal</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-gray-400">+91 99999 99999</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-gray-400">hello@dairyfresh.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-gray-400">Coimbatore, Tamil Nadu</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DairyFresh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;