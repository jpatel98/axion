'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Clock, 
  TrendingUp, 
  Shield, 
  Zap, 
  Factory, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  Star,
  ChevronDown,
  Play,
  Quote,
  DollarSign
} from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: FileText,
    title: "Quote & Order Management",
    description: "Streamline your sales process from initial quote to final delivery with automated workflows and real-time tracking.",
    benefits: ["Faster quote generation", "Automated follow-ups", "Order status visibility"]
  },
  {
    icon: Factory,
    title: "Production Scheduling",
    description: "Optimize your shop floor with intelligent scheduling that considers machine capacity, operator availability, and job priorities.",
    benefits: ["Reduced downtime", "Better resource utilization", "On-time delivery"]
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Get instant insights into your operations with customizable dashboards and automated reporting.",
    benefits: ["Data-driven decisions", "Performance tracking", "Profit optimization"]
  },
  {
    icon: Users,
    title: "Customer Management",
    description: "Maintain comprehensive customer profiles with order history, preferences, and communication logs.",
    benefits: ["Improved relationships", "Repeat business", "Better service"]
  },
  {
    icon: Settings,
    title: "Work Center Management",
    description: "Track your machines, stations, and production capabilities with capacity planning and scheduling optimization.",
    benefits: ["Capacity tracking", "Schedule optimization", "Resource planning"]
  },
  {
    icon: TrendingUp,
    title: "Business Intelligence",
    description: "Transform your data into actionable insights with advanced analytics and forecasting capabilities.",
    benefits: ["Market trends", "Capacity planning", "Revenue optimization"]
  }
]

const testimonials = [
  {
    name: "Development Team",
    company: "Axion Manufacturing ERP",
    content: "We're building Axion to solve the real problems we've seen in manufacturing shops - replacing spreadsheets and whiteboards with a unified system.",
    rating: 5
  },
  {
    name: "Alpha Testing",
    company: "In Progress",
    content: "Currently working with early adopters to refine the platform and ensure it meets the real needs of CNC and VMC job shops.",
    rating: 5
  },
  {
    name: "Your Shop Here",
    company: "Future Customer",
    content: "Ready to help you move from chaos to clarity? Contact us to learn how Axion can streamline your manufacturing operations.",
    rating: 5
  }
]

const faqs = [
  {
    question: "How quickly can we get up and running?",
    answer: "We work with you to get set up at a pace that works for your shop. Since we're in early development, we provide hands-on support to ensure everything works well for your specific needs."
  },
  {
    question: "Can Axion integrate with our existing machines?",
    answer: "Currently, Axion focuses on job tracking, scheduling, and workflow management. Machine integration is something we're exploring for future versions based on customer needs."
  },
  {
    question: "What if we're currently using spreadsheets?",
    answer: "We understand the transition from spreadsheets! We can work with you to help move your critical data into Axion in a way that makes sense for your workflow."
  },
  {
    question: "Is there a mobile app?",
    answer: "Axion is fully responsive and works perfectly on mobile devices. Shop floor teams can access real-time information from any smartphone or tablet."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer comprehensive support including phone, email, and live chat. Plus dedicated customer success managers for enterprise accounts."
  },
  {
    question: "Can we try before we buy?",
    answer: "Absolutely! We offer a 14-day free trial with full access to all features. No credit card required to get started."
  }
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Factory className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Axion
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Simplified & Focused */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Simplified, focused headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
              Stop Fighting Spreadsheets.
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Start Shipping Jobs On Time.
              </span>
            </h1>
            
            {/* Clear value proposition */}
            <p className="text-lg text-slate-800 mb-8 max-w-2xl mx-auto">
              The only manufacturing ERP built specifically for CNC/VMC job shops. 
              Track jobs from quote to delivery in one simple system.
            </p>
            
            {/* Single primary CTA */}
            <div className="mb-8">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Start Free 14-Day Trial
                    <ArrowRight className="inline ml-2 h-5 w-5" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </SignedIn>
              <p className="mt-3 text-sm text-slate-600">No credit card required • Setup in hours, not weeks</p>
            </div>
            
            {/* Clear, concise benefits */}
            <div className="inline-flex items-center justify-center space-x-6 text-base font-medium">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-slate-800">Streamline operations</span>
              </div>
              <div className="hidden sm:flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-slate-800">Real-time tracking</span>
              </div>
              <div className="hidden md:flex items-center">
                <DollarSign className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-slate-800">Reduce chaos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                Stop Fighting Your Systems
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-800">Spreadsheets scattered across different computers</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-800">Whiteboards that get erased and lost</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-800">No real-time visibility into job status</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-800">Manual scheduling leading to bottlenecks</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-slate-800">Disconnected systems causing data chaos</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                One System, Complete Control
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-800">Single source of truth for all manufacturing data</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-800">Real-time visibility from quote to delivery</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-800">Automated scheduling and resource optimization</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-800">Integrated workflow connecting all departments</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-800">Data-driven insights for better decisions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Everything You Need to Run Your Shop
            </h2>
            <p className="text-xl text-slate-800 max-w-3xl mx-auto">
              From initial quote to final delivery, Axion provides comprehensive tools designed specifically for manufacturing job shops.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-800 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-800">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Built for Manufacturing
            </h2>
            <p className="text-xl text-slate-800">
              Developing a solution based on real manufacturing challenges and feedback
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Early</div>
              <div className="text-slate-800">Development Stage</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Real</div>
              <div className="text-slate-800">Manufacturing Problems</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Modern</div>
              <div className="text-slate-800">Technology Stack</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">Your</div>
              <div className="text-slate-800">Input Matters</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-slate-800 mb-4 italic">
                  <Quote className="h-4 w-4 text-slate-800 mb-2" />
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>
                <div>
                  <div className="font-semibold text-slate-800">{testimonial.name}</div>
                  <div className="text-slate-800 text-sm">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Let&apos;s Discuss Your Needs
            </h2>
            <p className="text-xl text-slate-800 mb-8">
              Every manufacturing shop is different. We&apos;d rather understand your specific challenges and build a solution that works for you.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Get In Touch</h3>
              <p className="text-slate-600 mb-6">
                Contact us to discuss your manufacturing challenges and see how Axion can help streamline your operations.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-slate-800 font-medium">Email Us</span>
              </div>
              <a 
                href="mailto:axiontechinquiry@gmail.com" 
                className="text-blue-600 font-semibold text-lg hover:text-blue-700 transition-colors"
              >
                axiontechinquiry@gmail.com
              </a>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No sales pressure
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Honest conversation
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Custom solutions
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Fair pricing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-800">
              Get answers to common questions about Axion ERP
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-slate-800">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-800 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-800">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start the Conversation?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let&apos;s discuss your manufacturing challenges and see if Axion might be a good fit for your shop. 
            No pressure, just an honest conversation about what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:axiontechinquiry@gmail.com"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Email Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <SignInButton mode="modal">
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                Try the Demo
              </button>
            </SignInButton>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Honest Approach
            </div>
            <div className="flex items-center">
              <Factory className="h-5 w-5 mr-2" />
              Real Problems
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Your Timeline
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Factory className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Axion</span>
              <span className="text-slate-400 text-sm">Manufacturing ERP</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a 
                href="mailto:axiontechinquiry@gmail.com" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                Contact
              </a>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    Demo
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-6 text-center">
            <p className="text-slate-500 text-sm">
              &copy; 2025 Axion. Built for manufacturing shops by people who understand the challenges.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}