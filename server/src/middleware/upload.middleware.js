const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// KYC document storage
const kycStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cgp/kyc-documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 1200, crop: 'limit' }],
    resource_type: 'auto',
  },
});

// Deposit proof storage
const depositStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cgp/deposit-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 1200, crop: 'limit' }],
    resource_type: 'auto',
  },
});

// Profile picture storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cgp/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
  }
};

// Upload instances
const uploadKyc = multer({
  storage: kycStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadDeposit = multer({
  storage: depositStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = {
  uploadKyc,
  uploadDeposit,
  uploadAvatar,
  cloudinary,
};