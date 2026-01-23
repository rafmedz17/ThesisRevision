const { query } = require('../config/database');
const { generateId, paginate, calculateTotalPages } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

// Get all thesis with pagination and filters
const getTheses = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, program, year, search } = req.query;

    const { limit: pageLimit, offset, page: currentPage } = paginate(page, limit);

    // Build WHERE clause
    const conditions = [];
    const params = [];

    if (department) {
      conditions.push('department = ?');
      params.push(department);
    }

    if (program) {
      conditions.push('program = ?');
      params.push(program);
    }

    if (year) {
      conditions.push('year = ?');
      params.push(parseInt(year));
    }

    if (search) {
      conditions.push('(LOWER(title) LIKE LOWER(?) OR LOWER(authors) LIKE LOWER(?) OR LOWER(abstract) LIKE LOWER(?))');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (req.query.status) {
      conditions.push('status = ?');
      params.push(req.query.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM thesis ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated data
    const dataQuery = `SELECT * FROM thesis ${whereClause} ORDER BY year DESC, title ASC LIMIT ? OFFSET ?`;
    const theses = await query(dataQuery, [...params, pageLimit, offset]);

    // Parse JSON fields
    const formattedTheses = theses.map(thesis => ({
      ...thesis,
      authors: thesis.authors ? JSON.parse(thesis.authors) : [],
      advisors: thesis.advisors ? JSON.parse(thesis.advisors) : []
    }));

    res.json({
      data: formattedTheses,
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages: calculateTotalPages(total, pageLimit)
    });
  } catch (error) {
    console.error('Get theses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single thesis
const getThesis = async (req, res) => {
  try {
    const { id } = req.params;

    const theses = await query('SELECT * FROM thesis WHERE id = ?', [id]);

    if (theses.length === 0) {
      return res.status(404).json({ error: 'Thesis not found' });
    }

    const thesis = theses[0];

    // Parse JSON fields
    thesis.authors = thesis.authors ? JSON.parse(thesis.authors) : [];
    thesis.advisors = thesis.advisors ? JSON.parse(thesis.advisors) : [];

    res.json(thesis);
  } catch (error) {
    console.error('Get thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create thesis
const createThesis = async (req, res) => {
  try {
    const { title, abstract, authors, advisors, department, program, year, shelfLocation } = req.body;

    // Validation
    if (!title || !department) {
      return res.status(400).json({ error: 'Title and department are required' });
    }

    // Generate ID
    const id = generateId();

    // Handle file upload (Cloudinary provides full URL in req.file.path)
    let pdfUrl = null;
    if (req.file) {
      pdfUrl = req.file.path; // Cloudinary URL
    }

    // Parse authors and advisors if they're strings (from FormData)
    const authorsData = typeof authors === 'string' ? JSON.parse(authors) : (authors || []);
    const advisorsData = typeof advisors === 'string' ? JSON.parse(advisors) : (advisors || []);

    // Insert thesis
    await query(
      'INSERT INTO thesis (id, title, abstract, authors, advisors, department, program, year, pdfUrl, shelfLocation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        title,
        abstract || null,
        JSON.stringify(authorsData),
        JSON.stringify(advisorsData),
        department,
        program || null,
        year || null,
        pdfUrl,
        shelfLocation || null,
        'approved'
      ]
    );

    // Get created thesis
    const newThesis = await query('SELECT * FROM thesis WHERE id = ?', [id]);
    const thesis = newThesis[0];

    // Parse JSON fields
    thesis.authors = thesis.authors ? JSON.parse(thesis.authors) : [];
    thesis.advisors = thesis.advisors ? JSON.parse(thesis.advisors) : [];

    res.status(201).json(thesis);
  } catch (error) {
    console.error('Create thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Submit thesis (for students)
const submitThesis = async (req, res) => {
  try {
    const { title, abstract, authors, advisors, department, program, year, shelfLocation } = req.body;

    // Validation
    if (!title || !department) {
      return res.status(400).json({ error: 'Title and department are required' });
    }

    // Generate ID
    const id = generateId();

    // Handle file upload
    let pdfUrl = null;
    if (req.file) {
      pdfUrl = req.file.path; // Cloudinary URL
    }

    // Parse authors and advisors
    const authorsData = typeof authors === 'string' ? JSON.parse(authors) : (authors || []);
    const advisorsData = typeof advisors === 'string' ? JSON.parse(advisors) : (advisors || []);

    // Use provided shelfLocation or default to 'N/A'
    const finalShelfLocation = shelfLocation || 'N/A';

    // Capture authenticated user ID
    const submittedBy = req.user.id;

    // Insert thesis with status pending
    await query(
      'INSERT INTO thesis (id, title, abstract, authors, advisors, department, program, year, pdfUrl, shelfLocation, status, submittedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        title,
        abstract || null,
        JSON.stringify(authorsData),
        JSON.stringify(advisorsData),
        department,
        program || null,
        year || null,
        pdfUrl,
        finalShelfLocation,
        'pending',
        submittedBy
      ]
    );

    // Get created thesis
    const newThesis = await query('SELECT * FROM thesis WHERE id = ?', [id]);
    const thesis = newThesis[0];

    // Parse JSON fields
    thesis.authors = thesis.authors ? JSON.parse(thesis.authors) : [];
    thesis.advisors = thesis.advisors ? JSON.parse(thesis.advisors) : [];

    res.status(201).json(thesis);
  } catch (error) {
    console.error('Submit thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update thesis
const updateThesis = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, abstract, authors, advisors, department, program, year, shelfLocation } = req.body;

    // Check if thesis exists
    const existingTheses = await query('SELECT * FROM thesis WHERE id = ?', [id]);

    if (existingTheses.length === 0) {
      return res.status(404).json({ error: 'Thesis not found' });
    }

    const existingThesis = existingTheses[0];

    // Permission check: Students can only edit their own pending submissions
    if (req.user.role === 'student') {
      if (existingThesis.submittedBy !== req.user.id) {
        return res.status(403).json({ error: 'You can only edit your own submissions' });
      }
      if (existingThesis.status !== 'pending') {
        return res.status(403).json({ error: 'You can only edit pending submissions' });
      }
    }

    // Build update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (abstract !== undefined) {
      updates.push('abstract = ?');
      values.push(abstract);
    }
    if (authors !== undefined) {
      const authorsData = typeof authors === 'string' ? JSON.parse(authors) : authors;
      updates.push('authors = ?');
      values.push(JSON.stringify(authorsData));
    }
    if (advisors !== undefined) {
      const advisorsData = typeof advisors === 'string' ? JSON.parse(advisors) : advisors;
      updates.push('advisors = ?');
      values.push(JSON.stringify(advisorsData));
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }
    if (program !== undefined) {
      updates.push('program = ?');
      values.push(program);
    }
    if (year !== undefined) {
      updates.push('year = ?');
      values.push(year);
    }
    if (shelfLocation !== undefined) {
      updates.push('shelfLocation = ?');
      values.push(shelfLocation);
    }

    // Handle file upload (Cloudinary)
    if (req.file) {
      // Note: Old Cloudinary files can be deleted from Cloudinary dashboard if needed
      // Or implement Cloudinary deletion using cloudinary.uploader.destroy(public_id)
      // For now, we'll just update with new URL

      updates.push('pdfUrl = ?');
      values.push(req.file.path); // Cloudinary URL
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await query(
      `UPDATE thesis SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated thesis
    const updatedThesis = await query('SELECT * FROM thesis WHERE id = ?', [id]);
    const thesis = updatedThesis[0];

    // Parse JSON fields
    thesis.authors = thesis.authors ? JSON.parse(thesis.authors) : [];
    thesis.advisors = thesis.advisors ? JSON.parse(thesis.advisors) : [];

    res.json(thesis);
  } catch (error) {
    console.error('Update thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve thesis
const approveThesis = async (req, res) => {
  try {
    const { id } = req.params;

    await query('UPDATE thesis SET status = ? WHERE id = ?', ['approved', id]);

    res.json({ message: 'Thesis approved successfully' });
  } catch (error) {
    console.error('Approve thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reject thesis
const rejectThesis = async (req, res) => {
  try {
    const { id } = req.params;

    await query('UPDATE thesis SET status = ? WHERE id = ?', ['rejected', id]);

    res.json({ message: 'Thesis rejected successfully' });
  } catch (error) {
    console.error('Reject thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete thesis
const deleteThesis = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if thesis exists
    const existingTheses = await query('SELECT * FROM thesis WHERE id = ?', [id]);

    if (existingTheses.length === 0) {
      return res.status(404).json({ error: 'Thesis not found' });
    }

    const thesis = existingTheses[0];

    // Permission check: Students can only delete their own pending submissions
    if (req.user.role === 'student') {
      if (thesis.submittedBy !== req.user.id) {
        return res.status(403).json({ error: 'You can only delete your own submissions' });
      }
      if (thesis.status !== 'pending') {
        return res.status(403).json({ error: 'You can only delete pending submissions' });
      }
    }

    // Delete PDF file if exists
    if (thesis.pdfUrl) {
      const filePath = path.join(__dirname, '..', thesis.pdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await query('DELETE FROM thesis WHERE id = ?', [id]);

    res.json({ message: 'Thesis deleted successfully' });
  } catch (error) {
    console.error('Delete thesis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unique years from thesis
const getUniqueYears = async (req, res) => {
  try {
    const { department } = req.query;

    let queryStr = 'SELECT DISTINCT year FROM thesis WHERE year IS NOT NULL';
    const params = [];

    if (department) {
      queryStr += ' AND department = ?';
      params.push(department);
    }

    queryStr += ' ORDER BY year DESC';

    const results = await query(queryStr, params);
    const years = results.map(row => row.year);

    res.json(years);
  } catch (error) {
    console.error('Get unique years error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get student's own thesis submissions
const getMySubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM thesis WHERE submittedBy = ?',
      [userId]
    );
    const total = countResult[0].total;

    // Get paginated results
    const theses = await query(
      'SELECT * FROM thesis WHERE submittedBy = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [userId, parseInt(limit), offset]
    );

    // Parse JSON fields
    theses.forEach(thesis => {
      thesis.authors = thesis.authors ? JSON.parse(thesis.authors) : [];
      thesis.advisors = thesis.advisors ? JSON.parse(thesis.advisors) : [];
    });

    res.json({
      data: theses,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTheses,
  getThesis,
  createThesis,
  submitThesis,
  updateThesis,
  approveThesis,
  rejectThesis,
  deleteThesis,
  getUniqueYears,
  getMySubmissions
};
