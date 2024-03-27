import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { User } from "./models/user.js";
import crypto from "crypto";

const app = express();
const port = 3000;
import cors from "cors";
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
import jwt from "jsonwebtoken";
import { error } from "console";
import { Post } from "./models/post.js";

mongoose
  .connect("mongodb+srv://writetokhair:y123@cluster0.nul4pct.mongodb.net/")
  .then(() => {
    console.log("Connected to mongoDb");
  })
  .catch((error) => {
    console.log("Eroor Connecting to mongoDB", error);
  });

app.listen(3000, () => {
  console.log("App is running smoothly on port 3000");
});

//end point to register a a user
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exitingUser = await User.findOne({ email });
    if (exitingUser) {
      return res.status(400).json({ message: "Email already Exist " });
    }
    //create a new user
    const newUser = new User({ name, email, password });

    //generate and store the verification token :)
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    //save the user to the backend

    await newUser.save();

    //send the verification email to the user
    sendVerificationEmail(newUser.email, newUser.verificationToken);
    res.status(200).json({
      message:
        "Registration Successfulll, Please Check Email For Verification.",
    });
  } catch (error) {
    console.log("Error registering user", error);
    res.status(500).json({ message: "Error Registering the user" });
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  //create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "writetokhair@gmail.com",
      pass: "urjgwvlwcyoobjve",
    },
  });

  //compose the email message
  const mailOptions = {
    from: "threads.com",
    to: email,
    subject: "Email Verification",
    text: `please click on the following link to verify your email http://localhost:3000/verify/${verificationToken}`,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error sending the email", error);
  }
};

app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({ message: "Email Verified Successfully" });
  } catch (error) {
    console.log("Error getting token", error);
    res.status(500).json({ message: "Email Verification Failer" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretKey();

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    if (user.password != password) {
      return res.status(404).json({ message: "Invalid Password" });
    }
    const token = jwt.sign({ userId: user._id }, secretKey);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Loign Failed" });
  }
});

//endpoint to access all the users except the logged in the user
app.get("/user/:userId", (req, res) => {
  try {
    const loggedInUserId = req.params.userId;

    User.find({ _id: { $ne: loggedInUserId } })
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((error) => {
        console.log("Error: ", error);
        res.status(500).json("errror");
      });
  } catch (error) {
    res.status(500).json({ message: "error getting the users" });
  }
});

//end point to follow a particular user
app.post("/follow", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;
  try {
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { followers: currentUserId },
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error in following a user" });
  }
});

//end point to unfollow a user
app.post("/users/unfollow", async (req, res) => {
  const { loggedInUserId, targetUserId } = req.body;
  try {
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: loggedInUserId },
    });
    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error unfollowing the user" });
  }
});

//end point to create a new post in the backend

app.post("/create-post", async (req, res) => {
  try {
    const { content, userId } = req.body;
    const newPostData = {
      user: userId,
    };
    if (content) {
      newPostData.content = content;
    }

    const newPost = new Post(newPostData);

    await newPost.save();

    res.status(200).json({ message: "Post created Successfully" });
  } catch (error) {
    res.status(500).json({ message: "post creation failed" });
  }
});

//endpoint for liking a particular post
app.put("/posts/:postId/:userId/like", async (req, res) => {
  const postId = req.params.postId;
  const userId = req.params.userId; // Assuming you have a way to get the logged-in user's ID

  try {
    const post = await Post.findById(postId).populate("user", "name");

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } }, // Add user's ID to the likes array
      { new: true } // To return the updated post
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    updatedPost.user = post.user;

    res.json(updatedPost);
  } catch (error) {
    console.error("Error liking post:", error);
    res
      .status(500)
      .json({ message: "An error occurred while liking the post" });
  }
});

//endpoint to unlike a post
app.put("/posts/:postId/:userId/unlike", async (req, res) => {
  const postId = req.params.postId;
  const userId = req.params.userId;

  try {
    const post = await Post.findById(postId).populate("user", "name");

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    updatedPost.user = post.user;

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error("Error unliking post:", error);
    res
      .status(500)
      .json({ message: "An error occurred while unliking the post" });
  }
});

//endpoint to get all the posts
app.get("/get-posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name")
      .sort({ createdAt: 1 });

    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while getting the posts" });
  }
});

app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error while getting the profile" });
  }
});
