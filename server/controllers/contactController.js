import Contact from '../models/Contact.js'

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { category, fullName, email, mobile, message } = req.body

    // Validate required fields
    if (!category || !fullName || !email || !mobile || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    // Validate mobile number (basic validation)
    const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!mobileRegex.test(mobile.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile number'
      })
    }

    // Create new contact submission
    const newContact = new Contact({
      category,
      fullName,
      email,
      mobile,
      message
    })

    await newContact.save()

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: newContact._id,
        submittedAt: newContact.createdAt
      }
    })

  } catch (error) {
    console.error('Error submitting contact form:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get all contact submissions (for admin)
export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query

    // Build query
    let query = {}
    
    if (status && status !== 'all') {
      query.status = status
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Get contacts with pagination
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const totalContacts = await Contact.countDocuments(query)
    const totalPages = Math.ceil(totalContacts / parseInt(limit))

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalContacts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    })

  } catch (error) {
    console.error('Error fetching contacts:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Get single contact by ID
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params

    const contact = await Contact.findById(id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      })
    }

    res.status(200).json({
      success: true,
      data: contact
    })

  } catch (error) {
    console.error('Error fetching contact:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Update contact status (for admin)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNotes } = req.body

    // Validate status
    const validStatuses = ['new', 'in_progress', 'resolved']
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      })
    }

    const updateData = {}
    if (status) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    })

  } catch (error) {
    console.error('Error updating contact:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Delete contact (for admin)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params

    const contact = await Contact.findByIdAndDelete(id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting contact:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
