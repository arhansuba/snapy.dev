// frontend/src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Zap, FileCode, Box } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      title: 'AI-Powered Generation',
      description: 'Generate complete applications and components using natural language prompts.',
    },
    {
      icon: <Code className="h-6 w-6 text-green-500" />,
      title: 'Multiple Frameworks',
      description: 'Support for React, Vue, and Angular with TypeScript integration.',
    },
    {
      icon: <FileCode className="h-6 w-6 text-purple-500" />,
      title: 'Real-time Preview',
      description: 'Instant preview of your generated components with live updates.',
    },
    {
      icon: <Box className="h-6 w-6 text-orange-500" />,
      title: 'Component Library',
      description: 'Save and organize your generated components for future use.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Build Applications with{' '}
              <span className="text-primary">AI-Powered</span> Code Generation
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transform your ideas into production-ready code using natural language. 
              Build faster and smarter with our AI app builder.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? '/builder' : '/register')}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/pricing')}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Build Faster
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                See It in Action
              </h2>
              <p className="text-gray-600 mb-8">
                Watch how easily you can generate complete components and applications
                using simple text prompts. Our AI understands your requirements and
                generates production-ready code instantly.
              </p>
              <Button onClick={() => navigate('/demo')}>
                Watch Demo
              </Button>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
              <img
                src="/demo-preview.png"
                alt="Demo Preview"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/demo')}
                  className="rounded-full"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers using AI to build applications faster.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(isAuthenticated ? '/builder' : '/register')}
          >
            Start Building Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;