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

// Defaults for a new account. A function (not a constant object) so the
// timestamps are taken at registration time, not when the server started.
function userTemplate(now = new Date()) {
  return {
    location: {
      city: "",
      state: "",
      country: "US",
      postal: "",
    },
    avatar: "",
    coverImage: "",
    website: "",
    relationshipStatus: "single",
    isActive: true,
    isBanned: false,
    passwordChangedAt: now,
    lastLoginAt: now,
    lastActiveAt: now,
    bio: "",
    gender: "private",
    privacy: {
      profile: "public",
      email: "friends",
      phone: "friends",
      dateOfBirth: "public",
      location: "public",
      friendsList: "friends",
      work: "friends",
      education: "public",
      relationshipStatus: "public",
      allowFriendRequests: "everyone",
      showOnlineStatus: true,
    },
    consent: {
      termsAcceptedAt: now,
      privacyPolicyAcceptedAt: now,
    },
  };
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

function buildToken(user, exp, secret) {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    age: user.age,
    email: user.email,
  };
  return jwt.sign(payload, secret, { expiresIn: exp });
}

// Sets a fresh refresh-token cookie and returns the body every auth endpoint
// sends: { user, accessToken }. user.toJSON() strips the password.
function startSession(res, user) {
  const refreshToken = buildToken(
    user,
    REFRESH_EXPIRES,
    process.env.JWT_SECRET_REFRESH,
  );
  res.cookie("jwt", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
  const accessToken = buildToken(
    user,
    ACCESS_EXPIRES,
    process.env.JWT_SECRET_ACCESS,
  );
  return { user, accessToken };
}

async function register(req, res) {
  try {
    const { email, password, firstName, lastName, postal, phone, dateOfBirth } =
      req.body;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !postal ||
      !phone ||
      !dateOfBirth
    ) {
      return res.status(400).json({ message: "All fields required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const dob = new Date(dateOfBirth);
    const minDob = new Date();
    minDob.setFullYear(minDob.getFullYear() - MIN_AGE);
    if (Number.isNaN(dob.getTime()) || dob > minDob) {
      return res.status(400).json({
        message: `Invalid date of birth (you must be at least ${MIN_AGE})`,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const profile = userTemplate();
    const user = await User.create({
      ...profile,
      email: normalizedEmail,
      password: await bcryptjs.hash(password, 12),
      firstName,
      lastName,
      dateOfBirth: dob,
      phone: String(phone),
      location: { ...profile.location, postal: String(postal) },
    });

    res.status(201).json(startSession(res, user));
  } catch (err) {
    // Two sign-ups with the same email at once: the unique index catches it
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    // Schema validation (bad phone, postal, email...): show the first message
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ message: first.message });
    }
    console.error(err);
    return res.status(500).json({ message: "user registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });
    // Check the user exists before touching user.password
    if (!user || !(await bcryptjs.compare(password, user.password)))
      return res.status(401).json({ message: "Email or password incorrect" });

    user.lastLoginAt = new Date();
    await user.save();

    res.json(startSession(res, user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "couldn't sign in" });
  }
}

async function refresh(req, res) {
  const cookie = req.cookies?.jwt;
  if (!cookie) {
    return res.status(401).json({ message: "session expired" });
  }

  let decoded;
  try {
    // verify (not decode) checks the signature and expiry
    decoded = jwt.verify(cookie, process.env.JWT_SECRET_REFRESH);
  } catch {
    res.clearCookie("jwt", COOKIE_OPTIONS);
    return res.status(401).json({ message: "session expired" });
  }

  try {
    const user = await User.findById(decoded._id);
    if (!user) {
      res.clearCookie("jwt", COOKIE_OPTIONS);
      return res.status(401).json({ message: "user doesn't exist" });
    }

    user.lastActiveAt = new Date();
    await user.save();

    // Issues a new refresh cookie too, so active users stay signed in
    res.json(startSession(res, user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "couldn't refresh session" });
  }
}

export { register, login, refresh };
