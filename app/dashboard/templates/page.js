"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Edit, Eye, Download, Star, Grid, List, Filter } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    setTemplates([
      {
        id: 1,
        name: 'Executive Professional',
        category: 'executive',
        description: 'Perfect for C-level executives and senior management',
        previewUrl: '/templates/executive-preview.jpg',
        downloads: 1250,
        rating: 4.9,
        tags: ['executive', 'leadership', 'corporate'],
        createdAt: '2024-01-15',
        isCustom: false
      },
      {
        id: 2,
        name: 'Creative Designer',
        category: 'creative',
        description: 'Designed for graphic designers, artists, and creative professionals',
        previewUrl: '/templates/creative-preview.jpg',
        downloads: 890,
        rating: 4.7,
        tags: ['creative', 'design', 'portfolio'],
        createdAt: '2024-01-20',
        isCustom: false
      },
      {
        id: 3,
        name: 'Tech Professional',
        category: 'technology',
        description: 'Optimized for software engineers and IT professionals',
        previewUrl: '/templates/tech-preview.jpg',
        downloads: 2100,
        rating: 4.8,
        tags: ['technology', 'engineering', 'coding'],
        createdAt: '2024-01-10',
        isCustom: false
      },
      {
        id: 4,
        name: 'Custom Client Template',
        category: 'custom',
        description: 'Tailored template for specific client requirements',
        previewUrl: '/templates/custom-preview.jpg',
        downloads: 45,
        rating: 5.0,
        tags: ['custom', 'personalized', 'bespoke'],
        createdAt: '2024-02-01',
        isCustom: true
      }
    ]);
  }, []);

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'executive', label: 'Executive' },
    { value: 'creative', label: 'Creative' },
    { value: 'technology', label: 'Technology' },
    { value: 'custom', label: 'Custom' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    // Handle create new template
    console.log('Create new template');
  };

  const handleEditTemplate = (templateId) => {
    // Handle edit template
    console.log('Edit template:', templateId);
  };

  const handlePreviewTemplate = (templateId) => {
    // Handle preview template
    console.log('Preview template:', templateId);
  };

  const handleDownloadTemplate = (templateId) => {
    // Handle download template
    console.log('Download template:', templateId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Templates</h1>
              <p className="text-gray-600">Professional resume templates for your clients</p>
            </div>
            <button
              onClick={handleCreateTemplate}
              className="flex items-center px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#071429] transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Template
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B] focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3B]"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-slate-100 text-[#0B1F3B]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-slate-100 text-[#0B1F3B]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Templates Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Template Preview */}
                  <div className="relative h-48 bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-16 w-16 text-gray-400" />
                    </div>
                    {template.isCustom && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-slate-100 text-[#0B1F3B] text-xs rounded-full">
                        Custom
                      </div>
                    )}
                  </div>
                  
                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {template.downloads}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {template.rating}
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 text-[#0B1F3B] text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{template.tags.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#071429] transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template.id)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              {template.downloads} downloads
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              {template.rating}
                            </div>
                            <span className="capitalize">{template.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreviewTemplate(template.id)}
                          className="px-4 py-2 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#071429] transition-colors"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template.id)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDownloadTemplate(template.id)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or create a new template.</p>
            <button
              onClick={handleCreateTemplate}
              className="px-6 py-3 bg-[#0B1F3B] text-white rounded-lg hover:bg-[#071429] transition-colors"
            >
              Create Your First Template
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
