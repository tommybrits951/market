import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const VISIBILITY = ["public", "friends", "private"];

const linkSchema = new Schema(
  {
    platform: { type: String, trim: true, maxlength: 50 },
    url: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const friendSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    since: { type: Date, default: Date.now }, // when the request was accepted
    requestSentAt: { type: Date }, // when the original request was sent
  },
  { _id: false },
);

const friendRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    passwordChangedAt: Date,
    passwordResetToken: { type: String, select: false },
    emailVerificationToken: { type: String, select: false },
    lastLoginAt: Date,
    lastActiveAt: Date,
    firstName: { type: String, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },
    bio: { type: String, trim: true, maxlength: 500 },
    gender: {
      type: String,
      enum: ["male", "female", "private"],
    },
    dateOfBirth: Date,
    phone: { type: String, trim: true, maxlength: 25 },
    avatar: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    photos: [{ type: String }],
    languages: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true, lowercase: true }],
    hobbies: [{ type: String, trim: true }],
    website: { type: String, trim: true, maxlength: 300 },
    socialLinks: [linkSchema],
    relationshipStatus: {
      type: String,
      enum: [
        "single",
        "in-a-relationship",
        "engaged",
        "married",
        "complicated",
        "prefer-not-to-say",
      ],
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      timezone: { type: String, trim: true },
    },
    work: [
      {
        company: { type: String, trim: true },
        position: { type: String, trim: true },
        from: Date,
        to: Date,
        current: { type: Boolean, default: false },
      },
    ],
    education: [
      {
        school: { type: String, trim: true },
        degree: { type: String, trim: true },
        fieldOfStudy: { type: String, trim: true },
        from: Date,
        to: Date,
      },
    ],
    friends: [friendSchema],
    friendRequestsSent: [friendRequestSchema],
    friendRequestsReceived: [friendRequestSchema],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    privacy: {
      profile: { type: String, enum: VISIBILITY, default: "public" },
      email: { type: String, enum: VISIBILITY, default: "private" },
      phone: { type: String, enum: VISIBILITY, default: "private" },
      dateOfBirth: { type: String, enum: VISIBILITY, default: "friends" },
      location: { type: String, enum: VISIBILITY, default: "friends" },
      friendsList: { type: String, enum: VISIBILITY, default: "friends" },
      work: { type: String, enum: VISIBILITY, default: "public" },
      education: { type: String, enum: VISIBILITY, default: "public" },
      relationshipStatus: {
        type: String,
        enum: VISIBILITY,
        default: "friends",
      },
      allowFriendRequests: {
        type: String,
        enum: ["everyone", "friends-of-friends", "nobody"],
        default: "everyone",
      },
      showOnlineStatus: { type: Boolean, default: true },
    },
    settings: {
      language: { type: String, default: "en" },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        friendRequests: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
    },
    consent: {
      termsAcceptedAt: Date,
      privacyPolicyAcceptedAt: Date,
      marketingOptIn: { type: Boolean, default: false },
      personalizationOptIn: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({
  firstName: "text",
  lastName: "text",
});

userSchema.virtual("fullName").get(function () {
  return [this.firstName, this.lastName].filter(Boolean).join(" ");
});

userSchema.virtual("friendCount").get(function () {
  return this.friends?.length ?? 0;
});

userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
});

userSchema.methods.isFriendsWith = function (userId) {
  return this.friends.some((f) => f.user.equals(userId));
};

userSchema.methods.friendshipDuration = function (userId) {
  const friend = this.friends.find((f) => f.user.equals(userId));
  if (!friend) return null;
  const ms = Date.now() - friend.since.getTime();
  return {
    since: friend.since,
    requestSentAt: friend.requestSentAt ?? null,
    ms,
    days: Math.floor(ms / 86_400_000),
  };
};

userSchema.methods.hasBlocked = function (userId) {
  return this.blockedUsers.some((id) => id.equals(userId));
};

const pull = (arr, id) => arr.filter((x) => !x.equals(id));

const hasEntry = (arr, id) => arr.some((x) => x.user.equals(id));
const pullEntry = (arr, id) => arr.filter((x) => !x.user.equals(id));

userSchema.methods.sendFriendRequest = async function (other) {
  if (this._id.equals(other._id)) throw new Error("You cannot friend yourself");
  if (this.hasBlocked(other._id) || other.hasBlocked(this._id))
    throw new Error("Unable to send request");
  if (this.isFriendsWith(other._id)) throw new Error("Already friends");
  if (hasEntry(this.friendRequestsSent, other._id))
    throw new Error("Request already sent");

  if (hasEntry(this.friendRequestsReceived, other._id))
    return this.acceptFriendRequest(other);

  const sentAt = new Date();
  this.friendRequestsSent.push({ user: other._id, sentAt });
  other.friendRequestsReceived.push({ user: this._id, sentAt });
  await Promise.all([this.save(), other.save()]);
};

userSchema.methods.acceptFriendRequest = async function (other) {
  const request = this.friendRequestsReceived.find((r) =>
    r.user.equals(other._id),
  );
  if (!request) throw new Error("No request from this user");

  const since = new Date();
  const requestSentAt = request.sentAt;

  this.friendRequestsReceived = pullEntry(
    this.friendRequestsReceived,
    other._id,
  );
  other.friendRequestsSent = pullEntry(other.friendRequestsSent, this._id);
  this.friends.push({ user: other._id, since, requestSentAt });
  other.friends.push({ user: this._id, since, requestSentAt });
  await Promise.all([this.save(), other.save()]);
};

userSchema.methods.declineFriendRequest = async function (other) {
  this.friendRequestsReceived = pullEntry(
    this.friendRequestsReceived,
    other._id,
  );
  other.friendRequestsSent = pullEntry(other.friendRequestsSent, this._id);
  await Promise.all([this.save(), other.save()]);
};

userSchema.methods.cancelFriendRequest = async function (other) {
  this.friendRequestsSent = pullEntry(this.friendRequestsSent, other._id);
  other.friendRequestsReceived = pullEntry(
    other.friendRequestsReceived,
    this._id,
  );
  await Promise.all([this.save(), other.save()]);
};

userSchema.methods.removeFriend = async function (other) {
  this.friends = pullEntry(this.friends, other._id);
  other.friends = pullEntry(other.friends, this._id);
  await Promise.all([this.save(), other.save()]);
};

userSchema.methods.blockUser = async function (other) {
  if (this._id.equals(other._id)) throw new Error("You cannot block yourself");
  if (!this.hasBlocked(other._id)) this.blockedUsers.push(other._id);

  for (const [a, b] of [
    [this, other],
    [other, this],
  ]) {
    a.friends = pullEntry(a.friends, b._id);
    a.friendRequestsSent = pullEntry(a.friendRequestsSent, b._id);
    a.friendRequestsReceived = pullEntry(a.friendRequestsReceived, b._id);
    a.following = pull(a.following, b._id);
    a.followers = pull(a.followers, b._id);
  }
  await Promise.all([this.save(), other.save()]);
};

userSchema.methods.unblockUser = async function (other) {
  this.blockedUsers = pull(this.blockedUsers, other._id);
  await this.save();
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
