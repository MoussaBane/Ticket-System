const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'First name (nom) is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    prenom: {
      type: String,
      required: [true, 'Last name (prenom) is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'manager', 'normal'],
        message: 'Role must be one of: admin, manager, normal',
      },
      default: 'normal',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Compare password with hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get user profile without sensitive data
 */
userSchema.methods.getProfile = function () {
  const profile = this.toObject();
  delete profile.password;
  return profile;
};

module.exports = mongoose.model('User', userSchema);
