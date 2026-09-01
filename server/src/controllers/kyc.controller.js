const prisma = require('../config/database');
const { sendKycApprovedEmail, sendKycRejectedEmail } = require('../utils/email');
const { generateKycId } = require('../utils/generateId');

// ==================== SUBMIT KYC ====================

async function submitKyc(req, res, next) {
  try {
    const userId = req.user.id;
    const { documentType, documentNumber, expiryDate } = req.body;

    // Check if KYC already submitted or approved
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true },
    });

    if (user.kycStatus === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'KYC already approved',
      });
    }

    if (user.kycStatus === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'KYC already submitted and pending review',
      });
    }

    // Check files uploaded
    const files = req.files;
    if (!files || !files.frontImage) {
      return res.status(400).json({
        success: false,
        message: 'Front image of ID is required',
      });
    }

    const frontImage = files.frontImage[0].path;
    const backImage = files.backImage?.[0]?.path || null;
    const selfieImage = files.selfieImage?.[0]?.path || null;

    // Create KYC document record
    await prisma.kycDocument.create({
      data: {
        userId,
        type: documentType,
        frontImage,
        backImage,
        selfieImage,
        documentNumber: documentNumber || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'SUBMITTED',
        kycSubmittedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'KYC_SUBMITTED',
        entityType: 'USER',
        entityId: userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'KYC documents submitted successfully. Pending review.',
    });
  } catch (error) {
    next(error);
  }
}

// ==================== GET KYC STATUS ====================

async function getKycStatus(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        kycStatus: true,
        kycSubmittedAt: true,
        kycVerifiedAt: true,
        kycRejectedAt: true,
        kycRejectionReason: true,
        kycDocuments: {
          select: {
            id: true,
            type: true,
            frontImage: true,
            backImage: true,
            selfieImage: true,
            documentNumber: true,
            expiryDate: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: GET ALL KYC SUBMISSIONS ====================

async function getAllKyc(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.kycStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          kycStatus: true,
          kycSubmittedAt: true,
          kycVerifiedAt: true,
          kycRejectedAt: true,
          kycRejectionReason: true,
          country: true,
          createdAt: true,
          kycDocuments: {
            select: {
              id: true,
              type: true,
              frontImage: true,
              backImage: true,
              selfieImage: true,
              documentNumber: true,
              createdAt: true,
            },
          },
        },
        orderBy: { kycSubmittedAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        submissions: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: GET SINGLE KYC ====================

async function getKycById(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        city: true,
        address: true,
        dateOfBirth: true,
        kycStatus: true,
        kycSubmittedAt: true,
        kycVerifiedAt: true,
        kycRejectedAt: true,
        kycRejectionReason: true,
        createdAt: true,
        kycDocuments: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: APPROVE KYC ====================

async function approveKyc(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.kycStatus !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `KYC status is ${user.kycStatus}, cannot approve`,
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'APPROVED',
        kycVerifiedAt: new Date(),
        kycRejectionReason: null,
      },
    });

    // Send email
    await sendKycApprovedEmail(user.email, user.firstName);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'KYC_APPROVED',
        entityType: 'USER',
        entityId: userId,
        newValue: { kycStatus: 'APPROVED' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'KYC approved successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ==================== ADMIN: REJECT KYC ====================

async function rejectKyc(req, res, next) {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason required (min 10 characters)',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.kycStatus !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `KYC status is ${user.kycStatus}, cannot reject`,
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'REJECTED',
        kycRejectedAt: new Date(),
        kycRejectionReason: reason,
      },
    });

    // Send email
    await sendKycRejectedEmail(user.email, user.firstName, reason);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'KYC_REJECTED',
        entityType: 'USER',
        entityId: userId,
        newValue: { kycStatus: 'REJECTED', reason },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      success: true,
      message: 'KYC rejected',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitKyc,
  getKycStatus,
  getAllKyc,
  getKycById,
  approveKyc,
  rejectKyc,
};