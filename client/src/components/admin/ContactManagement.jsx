import React, { useState, useEffect } from 'react'
import { Eye, Search, Filter, ChevronLeft, ChevronRight, MessageSquare, Mail, Phone, Calendar, User } from 'lucide-react'

const ContactManagement = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setContacts(data.data.contacts)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update contact status
  const updateContactStatus = async (contactId, status, adminNotes = '') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes })
      })

      if (response.ok) {
        fetchContacts()
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact({ ...selectedContact, status, adminNotes })
        }
      }
    } catch (error) {
      console.error('Error updating contact:', error)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
    fetchContacts()
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      new: { bg: 'bg-blue-500', text: 'New' },
      in_progress: { bg: 'bg-yellow-500', text: 'In Progress' },
      resolved: { bg: 'bg-green-500', text: 'Resolved' }
    }
    
    const config = statusConfig[status] || statusConfig.new
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${config.bg}`}>
        {config.text}
      </span>
    )
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    fetchContacts()
  }, [filters.page, filters.status])

  return (
    <div className="p-6 bg-zinc-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Contact Management</h1>

        {/* Filters */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold">Contact Submissions</h2>
                <p className="text-sm text-gray-400">
                  {pagination.totalContacts || 0} total submissions
                </p>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-400">Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No contact submissions found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className={`p-4 hover:bg-zinc-700 cursor-pointer transition-colors ${
                        selectedContact?._id === contact._id ? 'bg-zinc-700' : ''
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{contact.fullName}</h3>
                            <StatusBadge status={contact.status} />
                          </div>
                          <p className="text-sm text-gray-400 mb-1">{contact.email}</p>
                          <p className="text-sm text-gray-300 line-clamp-2">{contact.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(contact.createdAt)}
                          </p>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 bg-zinc-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-600 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={!pagination.hasNextPage}
                      className="p-2 bg-zinc-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800 rounded-lg overflow-hidden sticky top-6">
              {selectedContact ? (
                <div>
                  <div className="p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold">Contact Details</h2>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{selectedContact.fullName}</p>
                        <p className="text-sm text-gray-400">Full Name</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{selectedContact.email}</p>
                        <p className="text-sm text-gray-400">Email</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{selectedContact.mobile}</p>
                        <p className="text-sm text-gray-400">Mobile</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{formatDate(selectedContact.createdAt)}</p>
                        <p className="text-sm text-gray-400">Submitted</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-2">Category</p>
                      <p className="font-medium">{selectedContact.category}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-2">Message</p>
                      <p className="text-sm bg-zinc-700 p-3 rounded-lg">{selectedContact.message}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-2">Status</p>
                      <StatusBadge status={selectedContact.status} />
                    </div>

                    {/* Status Update */}
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">Update Status</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateContactStatus(selectedContact._id, 'new')}
                          className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                        >
                          New
                        </button>
                        <button
                          onClick={() => updateContactStatus(selectedContact._id, 'in_progress')}
                          className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => updateContactStatus(selectedContact._id, 'resolved')}
                          className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                        >
                          Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a contact to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactManagement
