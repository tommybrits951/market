import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const MIN_AGE = 13;

// Profile fields a user may set at registration. Anything else in the request
// body (role, isBanned, friends, ...) is ignored so it can't be set by the client.
const REGISTER_FIELDS = [
  "firstName",
  "lastName",
  "bio",
  "gender",
  "dateOfBirth",
  "phone",
  "languages",
  "interests",
  "hobbies",
  "website",
  "relationshipStatus",
  "hometown",
  "location",
];

function buildToken(user, exp, secret) {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    age: user.age,
    email: user.email,
  };
  const options = {
    expiresIn: exp,
  };
  return jwt.sign(payload, secret, options);
}

async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const profile = {};
    for (const field of REGISTER_FIELDS) {
      if (req.body[field] !== undefined) profile[field] = req.body[field];
    }

    if (profile.dateOfBirth !== undefined) {
      const dob = new Date(profile.dateOfBirth);
      const minDob = new Date();
      minDob.setFullYear(minDob.getFullYear() - MIN_AGE);
      if (Number.isNaN(dob.getTime()) || dob > minDob) {
        return res.status(400).json({
          message: `Invalid date of birth (you must be at least ${MIN_AGE})`,
        });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const now = new Date();
    const user = await User.create({
      ...profile,
      email: normalizedEmail,
      password: await bcryptjs.hash(password, 12),
      lastLoginAt: now,
      consent: {
        // Only recorded if the client explicitly sends acceptance
        termsAcceptedAt: req.body.acceptTerms === true ? now : undefined,
        privacyPolicyAcceptedAt:
          req.body.acceptPrivacy === true ? now : undefined,
        marketingOptIn: req.body.marketingOptIn === true,
        personalizationOptIn: req.body.personalizationOptIn === true,
      },
    });

    const accessToken = buildToken(
      user,
      ACCESS_EXPIRES,
      process.env.JWT_SECRET_ACCESS,
    );
    const refreshToken = buildToken(
      user,
      REFRESH_EXPIRES,
      process.env.JWT_SECRET_REFRESH,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    const { password: _password, ...safeUser } = user.toJSON();
    res.status(201).json({ user: safeUser, accessToken });
  } catch (err) {
    return res.status(500).json({ message: "user registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });
    const user = await User.findOne({ email });
    const verified = bcryptjs.compareSync(password, user.password);
    if (!user || !verified)
      return res.status(401).json({ message: "mail or password incorrect" });
    const refreshToken = buildToken(user, "1d", process.env.JWT_SECRET_REFRESH);
    const accessToken = buildToken(user, "1h", process.env.JWT_SECRET_ACCESS);
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.json(accessToken);
  } catch (err) {
    return res.status(500).json({ message: "couldn't sign in" });
  }
}

async function refresh(req, res) {
  try {
    const cookie = req.cookies?.jwt;

    if (!cookie) {
      return res.status(401).json({ message: "session expired" });
    }

    const decoded = jwt.decode(cookie, process.env.JWT_SECRET_REFRESH);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "user doesn't exist" });
    }
  } catch (err) {
    return res.status(500).json({ err });
  }
}

export { register, login, refresh };
