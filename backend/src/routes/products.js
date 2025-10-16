const express = require('express');
const { query, body, validationResult } = require('express-validator');
const db = require('../utils/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Get all active products
 * GET /api/products
 */
router.get('/', [
  optionalAuth,
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    
    const { category, limit = 50, offset = 0 } = req.query;
    
    let query = db('products')
      .select('*')
      .where({ status: 'active' });
    
    if (category) {
      query = query.where({ category });
    }
    
    const products = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy('name', 'asc');

    // Get total count for pagination
    let countQuery = db('products')
      .count('id as total')
      .where({ status: 'active' });
    
    if (category) {
      countQuery = countQuery.where({ category });
    }
    
    const totalResult = await countQuery.first();
    const total = parseInt(totalResult.total);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + products.length < total
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


/**
 * Get single product by ID
 * GET /api/products/:id
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await db('products')
      .where({ id, status: 'active' })
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Search products
 * GET /api/products/search
 */
router.get('/search/:query', [
  optionalAuth,
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { query: searchQuery } = req.params;
    const { limit = 20 } = req.query;
    
    const products = await db('products')
      .select('*')
      .where({ status: 'active' })
      .where(function() {
        this.where('name', 'ilike', `%${searchQuery}%`)
            .orWhere('description', 'ilike', `%${searchQuery}%`);
      })
      .limit(parseInt(limit))
      .orderBy('name', 'asc');

    res.json({
      success: true,
      data: products,
      query: searchQuery
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin-only routes below
router.use(authenticate);
router.use(authorize('admin'));

/**
 * Get all products (including inactive) - Admin only
 * GET /api/products/admin/all
 */
router.get('/admin/all', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    let query = db('products').select('*');
    
    if (status) {
      query = query.where({ status });
    }
    
    const products = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .orderBy('created_at', 'desc');

    const totalResult = await db('products')
      .count('id as total')
      .where(status ? { status } : {})
      .first();
    
    const total = parseInt(totalResult.total);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + products.length < total
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Create new product - Admin only
 * POST /api/products
 */
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('description').optional().trim(),
  body('unit').trim().isLength({ min: 1 }).withMessage('Unit is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('is_milk').optional().isBoolean(),
  body('image_url').optional().trim(),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('minimum_stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = req.body;
    
    const [newProduct] = await db('products')
      .insert(productData)
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update product - Admin only
 * PUT /api/products/:id
 */
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('unit').optional().trim().isLength({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('is_milk').optional().isBoolean(),
  body('status').optional().isIn(['active', 'inactive']),
  body('image_url').optional().trim(),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('minimum_stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const product = await db('products').where({ id }).first();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await db('products')
      .where({ id })
      .update(updateData);

    const updatedProduct = await db('products')
      .where({ id })
      .first();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Update product stock - Admin only
 * PUT /api/products/:id/stock
 */
router.put('/:id/stock', [
  body('stock_quantity').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('minimum_stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { stock_quantity, minimum_stock } = req.body;

    const product = await db('products').where({ id }).first();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = { stock_quantity };
    if (minimum_stock !== undefined) {
      updateData.minimum_stock = minimum_stock;
    }

    await db('products')
      .where({ id })
      .update(updateData);

    const updatedProduct = await db('products')
      .where({ id })
      .first();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Delete product - Admin only
 * DELETE /api/products/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db('products').where({ id }).first();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting status to inactive
    await db('products')
      .where({ id })
      .update({ status: 'inactive' });

    res.json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;