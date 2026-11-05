import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import {
  User,
  Mail,
  School,
  GraduationCap,
  BookOpen,
  Calendar,
  Github,
  Linkedin,
  Globe,
  Upload,
  FileText,
  Trash2,
  Lock,
  Plus,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'skills', 'links', 'resume', 'security'
  const [loading, setLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Profile Form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    college: '',
    degree: '',
    branch: '',
    graduationYear: 2026,
    bio: '',
  });

  // Skills
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // External Links
  const [links, setLinks] = useState({
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });

  // Resume
  const [resume, setResume] = useState(null);

  // Security Form
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        college: user.college || '',
        degree: user.degree || '',
        branch: user.branch || '',
        graduationYear: user.graduationYear || 2026,
        bio: user.bio || '',
      });
      setSkills(user.skills || []);
      setLinks({
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        portfolioUrl: user.portfolioUrl || '',
      });
      setResume(user.resume || null);
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await profileAPI.update({
        ...profileData,
        skills,
        ...links,
      });
      if (res.data.success) {
        updateUser(res.data.data);
        toast.success('Profile details saved successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const trimmed = newSkill.trim();
    if (!skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveSkills = async () => {
    try {
      setLoading(true);
      const res = await profileAPI.update({ skills });
      if (res.data.success) {
        updateUser(res.data.data);
        toast.success('Technical skills updated!');
      }
    } catch (err) {
      toast.error('Failed to update skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLinks = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await profileAPI.update(links);
      if (res.data.success) {
        updateUser(res.data.data);
        toast.success('Portfolio and social links updated!');
      }
    } catch (err) {
      toast.error('Failed to save links');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setResumeUploading(true);
      const res = await profileAPI.uploadResume(formData);
      if (res.data.success) {
        setResume(res.data.data);
        updateUser({ ...user, resume: res.data.data });
        toast.success('Resume uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume upload failed');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      setLoading(true);
      await profileAPI.deleteResume();
      setResume(null);
      updateUser({ ...user, resume: null });
      toast.info('Resume file removed');
    } catch (err) {
      toast.error('Failed to delete resume');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await profileAPI.updatePassword(securityData);
      toast.success('Password changed successfully!');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Profile & Resume
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal information, technical skills, portfolio links, and resume document.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200/80 overflow-x-auto gap-2">
        {[
          { id: 'profile', label: 'Academic & Personal', icon: User },
          { id: 'skills', label: 'Technical Skills', icon: Sparkles },
          { id: 'links', label: 'Online Presence', icon: Globe },
          { id: 'resume', label: 'Resume Document', icon: FileText },
          { id: 'security', label: 'Security & Password', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile Information */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  value={profileData.college}
                  onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={profileData.graduationYear}
                  onChange={(e) =>
                    setProfileData({ ...profileData, graduationYear: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={profileData.degree}
                  onChange={(e) => setProfileData({ ...profileData, degree: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch / Major
                </label>
                <input
                  type="text"
                  value={profileData.branch}
                  onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Profile Summary & Career Objective
              </label>
              <textarea
                rows="3"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Write a brief professional summary about your interests, key project experiences, and the types of internship opportunities you are pursuing..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" loading={loading}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Technical Skills */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Your Technical Skills</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add programming languages, frameworks, developer tools, and cloud platforms you are proficient in.
            </p>
          </div>

          {/* Add Skill Input */}
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Docker, TypeScript, GraphQL, PyTorch"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button type="submit" variant="primary" size="md" icon={Plus}>
              Add Skill
            </Button>
          </form>

          {/* Skills Chips Cloud */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Active Skills ({skills.length})
            </label>
            <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-24 items-center">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400">No skills added yet</span>
              ) : (
                skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-indigo-700 shadow-xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <Button variant="primary" onClick={handleSaveSkills} loading={loading}>
              Save Skills Cloud
            </Button>
          </div>
        </div>
      )}

      {/* Tab 3: Online Presence */}
      {activeTab === 'links' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <form onSubmit={handleSaveLinks} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Profile URL
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={links.githubUrl}
                  onChange={(e) => setLinks({ ...links, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={links.linkedinUrl}
                  onChange={(e) => setLinks({ ...links, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Personal Portfolio or Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={links.portfolioUrl}
                  onChange={(e) => setLinks({ ...links, portfolioUrl: e.target.value })}
                  placeholder="https://yourname.dev"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" loading={loading}>
                Save Online Links
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Resume Document Upload & Preview */}
      {activeTab === 'resume' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Student Resume</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload your latest resume (PDF, DOC, DOCX up to 5MB). Files are securely stored in server uploads.
            </p>
          </div>

          {/* Current Resume Display */}
          {resume && resume.filename ? (
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-sm">
                    {resume.originalName || resume.filename}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Uploaded{' '}
                    {resume.uploadedAt
                      ? new Date(resume.uploadedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently'}{' '}
                    • {Math.round((resume.size || 0) / 1024)} KB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/uploads/resumes/${resume.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition-colors"
                >
                  View / Download
                </a>
                <button
                  onClick={handleDeleteResume}
                  title="Remove Resume"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No resume currently on file</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Upload your resume so it can be quickly accessed for applications.
              </p>
            </div>
          )}

          {/* Upload Drop Zone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors bg-indigo-50/20 text-center relative">
            <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">
              {resumeUploading ? 'Uploading file...' : 'Choose or replace resume file'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Accepted formats: PDF, DOC, DOCX • Max size: 5 MB
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeFileChange}
              disabled={resumeUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 5: Security & Password */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={securityData.currentPassword}
                onChange={(e) =>
                  setSecurityData({ ...securityData, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={securityData.newPassword}
                onChange={(e) =>
                  setSecurityData({ ...securityData, newPassword: e.target.value })
                }
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={securityData.confirmNewPassword}
                onChange={(e) =>
                  setSecurityData({ ...securityData, confirmNewPassword: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" loading={loading}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
