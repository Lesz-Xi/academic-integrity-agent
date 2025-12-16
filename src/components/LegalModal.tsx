import React from 'react';
import { X, Shield, Lock, FileText, Gavel } from 'lucide-react';

export type LegalType = 'privacy' | 'terms' | 'ethics' | 'security' | null;

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LegalType;
  theme: 'light' | 'dark';
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type, theme }) => {
  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: Lock,
          content: (
            <div className="space-y-4">
              <p>At Academic Integrity Agent, we take your privacy seriously. This policy outlines how we handle your data.</p>
              <h4 className="font-bold mt-4">Data Collection</h4>
              <p>We only collect data necessary to provide our services, such as your input text for processing. We do not sell your personal data to third parties.</p>
              <h4 className="font-bold mt-4">Data Persistence</h4>
              <p>Your generated content is stored securely using Supabase. You have full control to delete your history at any time.</p>
              <h4 className="font-bold mt-4">AI Processing</h4>
              <p>Text sent to our AI providers (Anthropic, Google) is processed solely for the purpose of generating your request and is not used to train their models.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: 'Terms of Use',
          icon: Gavel,
          content: (
            <div className="space-y-4">
              <p>By using our services, you agree to these terms.</p>
              <h4 className="font-bold mt-4">Acceptable Use</h4>
              <p>You agree to use this tool responsibly and for educational purposes. You must not use it to generate academic dishonesty or plagiarized content.</p>
              <h4 className="font-bold mt-4">Disclaimer</h4>
              <p>We provide this tool "as is" and make no guarantees about the acceptance of generated content by specific institutions or detection tools.</p>
            </div>
          )
        };
      case 'ethics':
        return {
          title: 'Ethics Policy',
          icon: Shield,
          content: (
            <div className="space-y-4">
              <p>Our commitment to academic integrity is paramount.</p>
              <h4 className="font-bold mt-4">Our Stance</h4>
              <p>We believe AI should assist, not replace, critical thinking. Our tools are designed to help students articulate their original ideas more effectively.</p>
              <h4 className="font-bold mt-4">User Responsibility</h4>
              <p>Users are responsible for ensuring that their use of our tools complies with their institution's academic integrity policies. Transparency about AI use is encouraged.</p>
            </div>
          )
        };
      case 'security':
        return {
          title: 'Security',
          icon: FileText,
          content: (
            <div className="space-y-4">
              <p>We implement industry-standard security measures.</p>
              <h4 className="font-bold mt-4">Encryption</h4>
              <p>All data in transit is encrypted via SSL/TLS. Data at rest is secured within our Supabase infrastructure.</p>
              <h4 className="font-bold mt-4">Access Control</h4>
              <p>Strict access controls are in place to ensure only authorized personnel can access system internals for maintenance purposes.</p>
            </div>
          )
        };
      default:
        return { title: '', icon: FileText, content: null };
    }
  };

  const { title, icon: Icon, content } = getContent();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 ${
        theme === 'dark' ? 'bg-[#1a1a1a] text-white border border-[#333]' : 'bg-white text-gray-900 border border-gray-100'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-[#333] bg-[#222]' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
               theme === 'dark' ? 'bg-[#333]' : 'bg-white shadow-sm'
            }`}>
              <Icon className="w-6 h-6 text-[#D2B48C]" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-[#333] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-8 max-h-[70vh] overflow-y-auto leading-loose ${
           theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {content}
        </div>


      </div>
    </div>
  );
};

export default LegalModal;
