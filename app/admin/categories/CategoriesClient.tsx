'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { Category } from '@/lib/adminApi'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Dialog from '@/components/ui/Dialog'

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-generate slug when name changes
  useEffect(() => {
    if (formData.name && !editingCategory) {
      const generatedSlug = formData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .trim()
      
      if (generatedSlug) {
        const uniqueSlug = generateUniqueSlug(generatedSlug)
        setFormData(prev => ({ ...prev, slug: uniqueSlug }))
      }
    }
  }, [formData.name, editingCategory])

  // Check if slug already exists
  const checkSlugExists = (slug: string) => {
    return categories.some(cat => cat.slug === slug && cat.id !== editingCategory?.id)
  }

  // Generate unique slug
  const generateUniqueSlug = (baseSlug: string) => {
    let uniqueSlug = baseSlug
    let counter = 1
    
    while (checkSlugExists(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }
    
    return uniqueSlug
  }

  // Handle slug change with validation
  const handleSlugChange = (newSlug: string) => {
    setFormData(prev => ({ ...prev, slug: newSlug }))
    setError(null) // Clear any previous errors when slug changes
    
    // If slug is cleared and we have a name, regenerate it
    if (!newSlug && formData.name && !editingCategory) {
      const generatedSlug = formData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim()
      
      if (generatedSlug) {
        const uniqueSlug = generateUniqueSlug(generatedSlug)
        setFormData(prev => ({ ...prev, slug: uniqueSlug }))
      }
    }
  }

  // Get suggested slugs
  const getSuggestedSlugs = (baseSlug: string) => {
    const suggestions = []
    for (let i = 1; i <= 3; i++) {
      const suggestion = `${baseSlug}-${i}`
      if (!checkSlugExists(suggestion)) {
        suggestions.push(suggestion)
      }
    }
    return suggestions
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    
    // Validate slug
    if (formData.slug && checkSlugExists(formData.slug)) {
      setError('A category with this slug already exists. Please choose a different slug.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('slug', formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'))
      
      // Add image file if selected
      if (selectedFile) {
        formDataToSend.append('image', selectedFile)
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        setShowAddModal(false)
        setEditingCategory(null)
        setFormData({ name: '', description: '', slug: '' })
        setSelectedFile(null)
        setError(null)
        setIsSubmitting(false)
        setSuccessMessage(null)
        fetchCategories()
        setSuccessMessage(editingCategory ? 'Category updated successfully!' : 'Category created successfully!')
        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        const errorData = await response.json()
        if (errorData.message && errorData.message.includes('Duplicate entry')) {
          setError('A category with this slug already exists. Please choose a different slug.')
        } else {
          setError(errorData.message || 'Failed to save category')
        }
      }
    } catch (error) {
      console.error('Error saving category:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        fetchCategories()
        toast.success('Category deleted successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to delete category.')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category.')
    } finally {
      setShowDeleteDialog(false)
      setCategoryToDelete(null)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug
    })
    setSelectedFile(null)
    setError(null)
    setIsSubmitting(false)
    setSuccessMessage(null)
    setShowAddModal(true)
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', description: '', slug: '' })
            setError(null)
            setSelectedFile(null)
            setIsSubmitting(false)
            setSuccessMessage(null)
            setShowAddModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {category.image_url && (
                  <div className="mb-3">
                    <img
                      src={category.image_url.startsWith('http') ? category.image_url : `http://localhost:3001${category.image_url}`}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Status: {category.active ? 'Active' : 'Inactive'}</span>
                  <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No categories found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="auto-generated from name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      formData.slug && checkSlugExists(formData.slug)
                        ? 'border-red-300 focus:ring-red-500'
                        : formData.slug && !checkSlugExists(formData.slug)
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formData.slug && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {checkSlugExists(formData.slug) ? (
                        <span className="text-red-500 text-sm">✗</span>
                      ) : (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    The slug will be used in URLs. It's auto-generated from the name but you can customize it.
                  </p>
                  {formData.name && (
                    <button
                      type="button"
                      onClick={() => {
                        const generatedSlug = formData.name.toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, '')
                          .replace(/\s+/g, '-')
                          .replace(/-+/g, '-')
                          .replace(/^-+|-+$/g, '')
                          .trim()
                        
                        if (generatedSlug) {
                          const uniqueSlug = generateUniqueSlug(generatedSlug)
                          setFormData(prev => ({ ...prev, slug: uniqueSlug }))
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      Regenerate from name
                    </button>
                  )}
                </div>
                {formData.slug && checkSlugExists(formData.slug) && (
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-red-500">
                        This slug is already in use by another category.
                      </p>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, slug: generateUniqueSlug(prev.slug) }))}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        Generate unique slug
                      </button>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span>Suggested alternatives: </span>
                      {getSuggestedSlugs(formData.slug).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, slug: suggestion }))}
                          className="text-blue-600 hover:text-blue-700 underline ml-1"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">Selected: {selectedFile.name}</p>
                )}
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-green-600 text-sm">{successMessage}</p>
                    {successMessage.includes('saved successfully') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null)
                          setFormData({ name: '', description: '', slug: '' })
                          setError(null)
                          setSelectedFile(null)
                          setIsSubmitting(false)
                          setSuccessMessage(null)
                          setShowAddModal(true)
                        }}
                        className="text-xs text-green-600 hover:text-green-700 underline"
                      >
                        {editingCategory ? 'Add New Category' : 'Add Another'}
                      </button>
                    )}
                    {successMessage.includes('updated successfully') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null)
                          setFormData({ name: '', description: '', slug: '' })
                          setError(null)
                          setSelectedFile(null)
                          setIsSubmitting(false)
                          setSuccessMessage(null)
                          setShowAddModal(true)
                        }}
                        className="text-xs text-green-600 hover:text-green-700 underline"
                      >
                        Add New Category
                      </button>
                    )}
                    {successMessage.includes('deleted successfully') && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null)
                          setFormData({ name: '', description: '', slug: '' })
                          setError(null)
                          setSelectedFile(null)
                          setIsSubmitting(false)
                          setSuccessMessage(null)
                          setShowAddModal(true)
                        }}
                        className="text-xs text-green-600 hover:text-green-700 underline"
                      >
                        Add New Category
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                                     onClick={() => {
                     setShowAddModal(false)
                     setEditingCategory(null)
                     setFormData({ name: '', description: '', slug: '' })
                     setError(null)
                     setSelectedFile(null)
                     setIsSubmitting(false)
                     setSuccessMessage(null)
                   }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        type="warning"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
