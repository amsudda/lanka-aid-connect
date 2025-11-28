import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

export const needPostValidation = [
  body('victim_name').trim().notEmpty().withMessage('Victim name is required'),
  body('phone_number').trim().notEmpty().withMessage('Phone number is required'),
  body('location_district').trim().notEmpty().withMessage('District is required'),
  body('category').isIn(['food', 'dry_rations', 'baby_items', 'medical', 'clothes', 'other'])
    .withMessage('Invalid category'),
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('quantity_needed').isInt({ min: 1 }).withMessage('Quantity needed must be at least 1'),
  validate
];

export const donationValidation = [
  body('donor_name').trim().notEmpty().withMessage('Donor name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

export const emergencyCenterValidation = [
  body('name').trim().notEmpty().withMessage('Center name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  validate
];

export const flagValidation = [
  body('reason').optional().trim(),
  validate
];

export const uuidValidation = [
  param('id').isUUID().withMessage('Invalid ID format'),
  validate
];
