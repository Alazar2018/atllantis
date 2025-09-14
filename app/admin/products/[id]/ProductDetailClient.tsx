'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Save, X } from 'lucide-react'
import { Product, Category } from '@/lib/adminApi'
import Image from 'next/image'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ProductDetailClient({ productId }: { productId: string }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageDialogData, setImageDialogData] = useState<{
    type: 'remove' | 'primary' | 'info'
    title: string
    message: string
    imageId?: number
    imageIndex?: number
    imageName?: string
  } | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        const productData = data.data || data
        
        // Convert integer booleans to proper booleans
        const processedProduct = {
          ...productData,
          is_on_sale: Boolean(productData.is_on_sale),
          active: Boolean(productData.active),
          is_featured: Boolean(productData.is_featured),
          price: parseFloat(productData.price) || 0,
          original_price: parseFloat(productData.original_price) || 0,
          sale_price: parseFloat(productData.sale_price) || 0,
          stock_quantity: parseInt(productData.stock_quantity) || 0,
          // Transform image URLs to include backend URL
          images: (productData.images || []).map((img: any) => ({
            ...img,
            image_url: img.image_url.startsWith('http') ? img.image_url : `http://localhost:3001${img.image_url}`
          }))
        }
        
        setProduct(processedProduct)
        setEditForm({
          title: processedProduct.title || '',
          description: processedProduct.description || '',
          price: processedProduct.price || 0,
          original_price: processedProduct.original_price || 0,
          sale_price: processedProduct.sale_price || 0,
          stock_quantity: processedProduct.stock_quantity || 0,
          category_id: processedProduct.category_id || '',
          is_on_sale: processedProduct.is_on_sale || false,
          active: processedProduct.active || true,
          is_featured: processedProduct.is_featured || false
        })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!product) return
    
    setSaving(true)
    try {
      let response;
      
      if (selectedFiles.length > 0) {
        // If there are new images, use FormData for file upload
        const formData = new FormData()
        
        // Add product data
        Object.keys(editForm).forEach(key => {
          if (key === 'colors' || key === 'sizes' || key === 'features') {
            formData.append(key, JSON.stringify(editForm[key]))
          } else {
            formData.append(key, String(editForm[key]))
          }
        })
        
        // Add primary image index
        formData.append('primary_image_index', String(primaryImageIndex))
        
        // Add image files
        selectedFiles.forEach((file, index) => {
          formData.append('images', file)
        })
        
        console.log('Sending FormData with files:', selectedFiles.length)
        console.log('FormData contents:')
        formData.forEach((value, key) => {
          console.log(key, ':', value)
        })
        
        response = await fetch(`/api/admin/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        })
      } else {
        // No new images, just update product data
        response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(editForm)
      })
      }

      if (response.ok) {
        await fetchProduct() // Refresh the product data
        setEditing(false)
        setSelectedFiles([])
        setPrimaryImageIndex(0)
        toast.success('Product updated successfully!')
      } else {
        const errorData = await response.json()
        toast.error(`Error updating product: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Error updating product')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    // Reset form to original values
    if (product) {
      setEditForm({
        title: product.title || '',
        description: product.description || '',
        price: product.price || 0,
        original_price: product.original_price || 0,
        sale_price: product.sale_price || 0,
        stock_quantity: product.stock_quantity || 0,
        category_id: product.category_id || '',
        is_on_sale: product.is_on_sale || false,
        active: product.active || true
      })
      // Reset image editing state
      setSelectedFiles([])
      setPrimaryImageIndex(0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      // Adjust primary image index if needed
      if (newFiles.length > 0 && primaryImageIndex >= newFiles.length) {
        setPrimaryImageIndex(newFiles.length - 1)
      } else if (newFiles.length === 0) {
        setPrimaryImageIndex(0)
      }
      return newFiles
    })
  }

  const setPrimaryImage = async (index: number) => {
    console.log('setPrimaryImage called with index:', index)
    console.log('selectedFiles.length:', selectedFiles.length)
    console.log('product?.images:', product?.images)
    
    if (selectedFiles.length === 0 && product?.images && product.images[index]) {
      // Setting existing image as primary - show confirmation dialog
      console.log('Showing primary image dialog for existing image')
      showPrimaryImageDialog(index, true)
    } else {
      // Setting new image as primary - show confirmation dialog
      console.log('Showing primary image dialog for new image')
      showPrimaryImageDialog(index, false)
    }
  }

  const confirmSetPrimaryImage = async () => {
    console.log('confirmSetPrimaryImage called')
    console.log('imageDialogData:', imageDialogData)
    
    if (imageDialogData?.type !== 'primary' || imageDialogData?.imageIndex === undefined) {
      console.log('Invalid dialog data, returning')
      return
    }
    
    const index = imageDialogData.imageIndex
    console.log('Processing index:', index)
    
    if (selectedFiles.length === 0 && product?.images && product.images[index]) {
      // Setting existing image as primary
      try {
        const imageToSet = product.images[index]
        console.log('Setting image as primary:', imageToSet.id, imageToSet.alt_text)
        
        const url = `/api/admin/products/${productId}/primary-image`
        console.log('Making request to:', url)
        console.log('Request body:', { image_id: imageToSet.id })
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ image_id: imageToSet.id })
        })
        
        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)
        
        if (response.ok) {
          const responseData = await response.json()
          console.log('Response data:', responseData)
          
          setPrimaryImageIndex(index)
          toast.success(`"${imageToSet.alt_text || 'Image'}" set as primary successfully!`)
          await fetchProduct() // Refresh to get updated primary image status
          setShowImageDialog(false)
          setImageDialogData(null)
        } else {
          const errorData = await response.json()
          console.log('Error response:', errorData)
          toast.error(`Failed to update primary image: ${errorData.message || 'Unknown error'}`)
          setShowImageDialog(false)
          setImageDialogData(null)
        }
      } catch (error) {
        console.error('Error updating primary image:', error)
        toast.error('Failed to update primary image. Please try again.')
        setShowImageDialog(false)
        setImageDialogData(null)
      }
    } else {
      // Setting new image as primary
      console.log('Setting new image as primary')
      setPrimaryImageIndex(index)
      toast.success('New image set as primary!')
      setShowImageDialog(false)
      setImageDialogData(null)
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      
      // Adjust primary image index
      if (primaryImageIndex === fromIndex) {
        setPrimaryImageIndex(toIndex)
      } else if (primaryImageIndex > fromIndex && primaryImageIndex <= toIndex) {
        setPrimaryImageIndex(primaryImageIndex - 1)
      } else if (primaryImageIndex < fromIndex && primaryImageIndex >= toIndex) {
        setPrimaryImageIndex(primaryImageIndex + 1)
      }
      
      return newFiles
    })
  }

  const removeExistingImage = async (imageId: number) => {
    if (!product) return
    
    const image = product.images?.find(img => img.id === imageId)
    setImageDialogData({
      type: 'remove',
      title: 'Remove Image',
      message: `Are you sure you want to remove "${image?.alt_text || 'this image'}"? This action cannot be undone.`,
      imageId: imageId,
      imageName: image?.alt_text || 'Product image'
    })
    setShowImageDialog(true)
  }

  const confirmRemoveImage = async () => {
    console.log('confirmRemoveImage called')
    console.log('imageDialogData:', imageDialogData)
    
    if (!imageDialogData?.imageId) {
      console.log('No image ID, returning')
      return
    }
    
    try {
      const url = `/api/admin/products/${productId}/images/${imageDialogData.imageId}`
      console.log('Making DELETE request to:', url)
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('Response data:', responseData)
        
        await fetchProduct() // Refresh to get updated image list
        setShowImageDialog(false)
        setImageDialogData(null)
        toast.success(`"${imageDialogData.imageName}" removed successfully!`)
      } else {
        const errorData = await response.json()
        console.log('Error response:', errorData)
        toast.error(`Failed to remove image: ${errorData.message || 'Unknown error'}`)
        setShowImageDialog(false)
        setImageDialogData(null)
      }
    } catch (error) {
      console.error('Error removing image:', error)
      toast.error('Failed to remove image. Please try again.')
      setShowImageDialog(false)
      setImageDialogData(null)
    }
  }

  const showPrimaryImageDialog = (index: number, isExisting: boolean = false) => {
    console.log('showPrimaryImageDialog called with index:', index, 'isExisting:', isExisting)
    
    if (isExisting && product?.images && product.images[index]) {
      const image = product.images[index]
      console.log('Setting dialog data for existing image:', image)
      setImageDialogData({
        type: 'primary',
        title: 'Set as Primary Image',
        message: `Are you sure you want to set "${image.alt_text || `Image ${index + 1}`}" as the primary image? This will be the main image shown in product listings.`,
        imageIndex: index,
        imageName: image.alt_text || `Image ${index + 1}`
      })
    } else {
      console.log('Setting dialog data for new image')
      setImageDialogData({
        type: 'primary',
        title: 'Set as Primary Image',
        message: `Set this image as the primary image? This will be the main image shown in product listings.`,
        imageIndex: index
      })
    }
    setShowImageDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="text-gray-600 mt-1">Product details and management</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Title</label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 mt-1">{product.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Category</label>
              <p className="text-lg font-medium text-gray-900 mt-1">{product.category_name}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Description</label>
              {editing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 mt-1">{product.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>
          
          {editing ? (
            // Image editing mode
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Show existing images + new selected files */}
              {(product.images && product.images.length > 0) || selectedFiles.length > 0 ? (
                <div className="space-y-4">
                  {/* Primary Image Display */}
                  <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Primary Image</h4>
                    <div className="relative">
                      {selectedFiles.length > 0 ? (
                        <img
                          src={URL.createObjectURL(selectedFiles[primaryImageIndex])}
                          alt="Primary product image"
                          className="w-full h-32 object-cover rounded-lg border border-blue-200"
                        />
                                             ) : product.images && product.images.length > 0 ? (
                         <img
                           src={product.images[primaryImageIndex]?.image_url.startsWith('http') ? product.images[primaryImageIndex].image_url : `http://localhost:3001${product.images[primaryImageIndex].image_url}`}
                           alt="Primary product image"
                           className="w-full h-32 object-cover rounded-lg border border-blue-200"
                           crossOrigin="anonymous"
                         />
                       ) : null}
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                      {product.images && product.images.length > 0 && selectedFiles.length === 0 && (
                        <div className="absolute bottom-2 right-2">
                          <button
                            onClick={() => showPrimaryImageDialog(primaryImageIndex, true)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            Change Primary
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* All Images Grid */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">All Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                             {/* Existing images */}
                       {product.images && product.images.map((image: any, index: number) => (
                         <div key={`existing-${image.id}`} className="relative group">
                           <img
                             src={image.image_url.startsWith('http') ? image.image_url : `http://localhost:3001${image.image_url}`}
                             alt={image.alt_text || `Product image ${index + 1}`}
                             className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                               index === primaryImageIndex && selectedFiles.length === 0
                                 ? 'border-blue-500 bg-blue-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}
                             crossOrigin="anonymous"
                           />
                          
                          {/* Primary indicator */}
                          {index === primaryImageIndex && selectedFiles.length === 0 && (
                            <div className="absolute top-1 left-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                              Primary
                            </div>
                          )}
                          
                          {/* Action buttons */}
                          <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {index !== primaryImageIndex && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                title="Set as Primary"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(image.id)}
                              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              title="Remove Image"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M0 4a2 2 0 012-2h.586a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-6.414 6.414a1 1 0 01-1.414 0l-6.414-6.414a1 1 0 010-1.414L9.586 2H7a2 2 0 00-2 2v.586a1 1 0 01-.293.707L.293 7.414a1 1 0 010-1.414L1.586 5H3a2 2 0 002-2V4z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* New selected files */}
                      {selectedFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New image ${index + 1}`}
                            className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                              index === primaryImageIndex 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          />
                          
                          {/* Primary indicator */}
                          {index === primaryImageIndex && (
                            <div className="absolute top-1 left-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                              Primary
                            </div>
                          )}
                          
                          {/* Action buttons */}
                          <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {index !== primaryImageIndex && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                title="Set as Primary"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              title="Remove Image"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M0 4a2 2 0 012-2h.586a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-6.414 6.414a1 1 0 01-1.414 0l-6.414-6.414a1 1 0 010-1.414L9.586 2H7a2 2 0 00-2 2v.586a1 1 0 01-.293.707L.293 7.414a1 1 0 010-1.414L1.586 5H3a2 2 0 002-2V4z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Reorder buttons */}
                          <div className="absolute bottom-1 left-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index - 1)}
                                className="p-1 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                                title="Move Left"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            {index < selectedFiles.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index + 1)}
                                className="p-1 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                                title="Move Right"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 0 0 2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No images uploaded for this product</p>
                </div>
              )}
            </div>
          ) : (
            // View mode
            product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.images.map((image: any, index: number) => (
                <div key={image.id} className="relative group">
                  <div className="w-full h-48 bg-gray-200 rounded-lg border border-gray-200 overflow-hidden">
                    <Image
                      src={image.image_url.startsWith('http') ? image.image_url : `http://localhost:3001${image.image_url}`}
                      alt={image.alt_text || `Product image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    {image.is_primary && (
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      {image.is_primary ? 'Primary Image' : `Image ${index + 1}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 0 0 2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No images uploaded for this product</p>
            </div>
            )
          )}
        </div>

        {/* Product Variants */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Colors</h3>
              {product.colors && product.colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: any) => (
                    <span
                      key={color.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {color.color_name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No colors specified</p>
              )}
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sizes</h3>
              {product.sizes && product.sizes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: any) => (
                    <span
                      key={size.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {size.size_name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sizes specified</p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Features</h3>
            {product.features && product.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.features.map((feature: any) => (
                  <span
                    key={feature.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {feature.feature_name}
                    {feature.feature_value && `: ${feature.feature_value}`}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No features specified</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Current Price</label>
              {editing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">ETB {product.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Stock Quantity</label>
              {editing ? (
                <input
                  type="number"
                  value={editForm.stock_quantity}
                  onChange={(e) => setEditForm({...editForm, stock_quantity: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 mt-1">{product.stock_quantity} units</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Status</label>
              {editing ? (
                <select
                  value={editForm.active ? 'true' : 'false'}
                  onChange={(e) => setEditForm({...editForm, active: e.target.value === 'true'})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full mt-1 ${
                  product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">Featured</label>
              {editing ? (
                <select
                  value={editForm.is_featured ? 'true' : 'false'}
                  onChange={(e) => setEditForm({...editForm, is_featured: e.target.value === 'true'})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full mt-1 ${
                  product.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.is_featured ? 'Featured' : 'Not Featured'}
                </span>
              )}
            </div>
          </div>
          
          {editing && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Original Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.original_price}
                  onChange={(e) => setEditForm({...editForm, original_price: parseFloat(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Sale Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.sale_price}
                  onChange={(e) => setEditForm({...editForm, sale_price: parseFloat(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">On Sale</label>
                <select
                  value={editForm.is_on_sale ? 'true' : 'false'}
                  onChange={(e) => setEditForm({...editForm, is_on_sale: e.target.value === 'true'})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Featured</label>
                <select
                  value={editForm.is_featured ? 'true' : 'false'}
                  onChange={(e) => setEditForm({...editForm, is_featured: e.target.value === 'true'})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Management Dialog */}
      {showImageDialog && imageDialogData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              {imageDialogData.type === 'remove' && (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              )}
              {imageDialogData.type === 'primary' && (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {imageDialogData.type === 'info' && (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{imageDialogData.title}</h3>
            </div>
            
            <p className="text-gray-600 mb-6">{imageDialogData.message}</p>
            
            <div className="flex space-x-3">
              {imageDialogData.type === 'info' ? (
                <button
                  onClick={() => {
                    setShowImageDialog(false)
                    setImageDialogData(null)
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowImageDialog(false)
                      setImageDialogData(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (imageDialogData.type === 'remove') {
                        confirmRemoveImage()
                      } else if (imageDialogData.type === 'primary') {
                        confirmSetPrimaryImage()
                      }
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-white ${
                      imageDialogData.type === 'remove' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {imageDialogData.type === 'remove' ? 'Remove' : 'Set as Primary'}
                  </button>
                </>
              )}
            </div>
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
    </div>
  )
}
