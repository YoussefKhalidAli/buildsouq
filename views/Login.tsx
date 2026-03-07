
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Role } from '../types';
import { Button } from '../components/ui/Button';
import { 
  Building2, 
  Truck, 
  UserCircle, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight,
  Info,
  Mail,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  IdCard,
  ClipboardCheck,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

export const Login = () => {
  const { login, register, currentUser, logout } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<Role>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  
  // Basic Info for All Models
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Role Specific
  const [businessName, setBusinessName] = useState('');
  const [attachments, setAttachments] = useState<Record<string, boolean>>({});

  const handleFileSimulate = (key: string) => {
    setAttachments(prev => ({ ...prev, [key]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        if (!name.trim()) return;
        await register(name, email, role, {
          phone,
          password,
          businessName,
          documents: attachments
        });
      } else if (mode === 'forgot') {
        // Simulate password reset request
        if (!email.trim()) return;
        setSuccess(`A password reset link has been sent to ${email}. Please check your inbox.`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (currentUser && !currentUser.verified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Verification Pending</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Thank you for joining BuildSouq. Your account is currently being reviewed by our administration team. You will receive an email once your account is active.
          </p>
          <Button onClick={logout} variant="outline" className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  const RoleCard = ({ value, label, sub, icon: Icon, colorClass, borderClass, bgClass }: any) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={`relative flex items-center p-4 border-2 rounded-xl text-left transition-all duration-300 ${
        role === value 
          ? `${borderClass} ${bgClass} shadow-md scale-[1.02]` 
          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className={`p-3 rounded-lg mr-4 ${role === value ? colorClass : 'bg-slate-100 text-slate-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className={`font-bold text-sm ${role === value ? 'text-slate-900' : 'text-slate-600'}`}>{label}</h4>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{sub}</p>
      </div>
    </button>
  );

  const FileUpload = ({ label, id, icon: Icon }: { label: string, id: string, icon: any }) => (
    <div className="relative group">
      <input 
        type="file" 
        id={id} 
        className="hidden" 
        onChange={() => handleFileSimulate(id)}
      />
      <label 
        htmlFor={id}
        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all h-28 ${
          attachments[id] 
            ? 'border-green-500 bg-green-50' 
            : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white shadow-inner'
        }`}
      >
        {attachments[id] ? (
          <div className="text-center animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <span className="text-[10px] font-black text-green-700 uppercase block tracking-tighter">Document Ready</span>
            <span className="text-[9px] text-green-600 opacity-70">Click to change</span>
          </div>
        ) : (
          <>
            <Icon className="w-6 h-6 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-blue-600 text-center px-2">{label}</span>
          </>
        )}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        
        {/* Left Visual Branding Panel */}
        <div className="lg:w-1/3 bg-slate-900 p-12 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-blue-500/20">B</div>
              <h1 className="text-2xl font-black tracking-tighter">BUILD<span className="text-blue-400">SOUQ</span></h1>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Empowering Middle East <span className="text-blue-400">Construction</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              Join the ecosystem where transparency meets efficiency. From raw material procurement to last-mile delivery.
            </p>

            <div className="space-y-6">
              {[
                { text: 'Verified Regional Partners', icon: ShieldCheck },
                { text: 'Secure Document Storage', icon: FileText },
                { text: 'Optimized Logistics Fleet', icon: Truck },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-xs font-bold text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                  <item.icon className="w-5 h-5 text-blue-500 shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 opacity-40 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 text-center lg:text-left">
            Dubai • Abu Dhabi • Riyadh
          </div>

          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Right Form Content Panel */}
        <div className="lg:w-2/3 p-6 md:p-14 overflow-y-auto max-h-[90vh]">
          {/* Mode Switcher */}
          <div className="flex justify-center mb-10">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full max-w-[320px] shadow-inner">
              <button 
                onClick={() => { setMode('login'); setSuccess(null); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${mode === 'login' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                SIGN IN
              </button>
              <button 
                onClick={() => { setMode('register'); setSuccess(null); setError(null); }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${mode === 'register' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                REGISTER
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <header className="mb-10 text-center lg:text-left">
              <h3 className="text-3xl font-black text-slate-900 mb-2">
                {mode === 'login' ? 'Access Portal' : mode === 'register' ? 'Partner Registration' : 'Reset Password'}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {mode === 'login' 
                  ? 'Welcome back. Manage your projects and logistics.' 
                  : mode === 'register'
                  ? 'Start your journey with verified trade credentials.'
                  : 'Enter your email to receive a recovery link.'}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-3">
                  <Info className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl text-xs font-bold flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4" />
                  {success}
                </div>
              )}

              {/* Role Selection - Only for Registration */}
              {mode === 'register' && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {isAdminPortal ? '⚠️ Restricted Registration' : '1. Account Type'}
                  </label>
                  {isAdminPortal ? (
                    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-center">
                      <ShieldCheck className="w-10 h-10 text-red-600 mx-auto mb-3" />
                      <div className="text-sm font-black text-red-900 uppercase tracking-tight">Administrator Application</div>
                      <p className="text-[10px] text-red-600 font-medium mt-1">This account will require manual verification by the board of directors.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'user' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                        <input 
                          type="radio" 
                          name="role" 
                          className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                          checked={role === 'user'}
                          onChange={() => setRole('user')}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">Customer Account</div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase">For ordering building materials</div>
                        </div>
                      </label>

                      <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'supplier' ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white'}`}>
                        <input 
                          type="radio" 
                          name="role" 
                          className="w-5 h-5 text-green-600 border-slate-300 focus:ring-green-500"
                          checked={role === 'supplier'}
                          onChange={() => setRole('supplier')}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">Supplier Account</div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase">For selling materials on the marketplace</div>
                        </div>
                      </label>

                      <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-white'}`}>
                        <input 
                          type="radio" 
                          name="role" 
                          className="w-5 h-5 text-orange-600 border-slate-300 focus:ring-orange-500"
                          checked={role === 'delivery'}
                          onChange={() => setRole('delivery')}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">Logistics Partner</div>
                          <div className="text-[10px] text-slate-500 font-medium uppercase">For fleet management and delivery services</div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Account Information */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {mode === 'login' ? 'Credentials' : mode === 'register' ? '2. Account Information' : 'Recovery Email'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {mode === 'register' && (
                    <div className="md:col-span-2">
                      <div className="relative group">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="text" required value={name} onChange={(e) => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300"
                          placeholder="Full Name (as per ID)"
                        />
                      </div>
                    </div>
                  )}

                  <div className={mode === 'login' || mode === 'forgot' ? 'md:col-span-2' : ''}>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300"
                          placeholder="Phone: +971..."
                        />
                      </div>
                    </div>
                  )}

                  {mode !== 'forgot' && (
                    <div className={mode === 'login' ? 'md:col-span-2' : ''}>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300"
                          placeholder="Password (min. 8 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {mode === 'login' && (
                        <div className="mt-2 text-right">
                          <button 
                            type="button"
                            onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Attachments - Specific to Supplier and Logistics */}
              {mode === 'register' && (role === 'supplier' || role === 'delivery') && (
                <div className="space-y-6 pt-4 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">3. Document Verification</label>
                    <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase">Required for onboarding</span>
                  </div>

                  {role === 'supplier' && (
                    <div className="space-y-6">
                      <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-green-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300"
                          placeholder="Registered Company Name"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FileUpload label="Trade License" id="trade_license" icon={FileText} />
                        <FileUpload label="VAT Certificate" id="vat_cert" icon={ShieldCheck} />
                        <FileUpload label="Trade Card" id="trade_card" icon={ClipboardCheck} />
                      </div>
                    </div>
                  )}

                  {role === 'delivery' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FileUpload label="Driving License" id="driver_license" icon={IdCard} />
                        <FileUpload label="Vehicle Mulkiya" id="mulkiya" icon={Truck} />
                        <FileUpload label="Company License" id="fleet_license" icon={Building2} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className={`w-full py-5 rounded-2xl text-xs font-black shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98] ${
                    mode === 'login' || mode === 'forgot' ? 'bg-slate-900 shadow-slate-200' :
                    role === 'user' ? 'bg-blue-600 shadow-blue-200' : 
                    role === 'supplier' ? 'bg-green-600 shadow-green-200' :
                    'bg-orange-600 shadow-orange-200'
                  }`}
                >
                  <span className="mr-3 uppercase tracking-[0.25em]">
                    {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Complete Verification' : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {mode === 'forgot' && (
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => { setMode('login'); setSuccess(null); setError(null); }}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* Footer Terms */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  By {mode === 'login' ? 'logging in' : 'registering'}, you confirm that the provided credentials and documents are valid and authorize BuildSouq to conduct a compliance check as per UAE Trade Regulation.
                </p>
              </div>

              {/* Secret Admin Portal Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminPortal(!isAdminPortal);
                    setRole('superadmin');
                    setError(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 opacity-20 hover:opacity-100 hover:text-red-600 hover:bg-red-50 group ${isAdminPortal ? 'opacity-100 text-red-600 bg-red-50' : 'text-slate-400'}`}
                >
                  <AlertTriangle className={`w-4 h-4 transition-transform group-hover:scale-125 ${isAdminPortal ? 'animate-pulse' : ''}`} />
                  {isAdminPortal ? 'Exit Restricted Area' : 'Admin Access Only'}
                  <AlertTriangle className={`w-4 h-4 transition-transform group-hover:scale-125 ${isAdminPortal ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
