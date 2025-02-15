const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const XLSX = require("xlsx"); // Import XLSX library
const moment = require('moment');
const { OpenAI } = require('openai');
const formidable = require("formidable");
const archiver = require('archiver');
const fileUpload = require("express-fileupload");
const axios = require("axios");
// PostgreSQL Connection
const port = process.env.PORT; // Choose your desired port
let pool;
const connectWithRetry = () => {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  pool
    .connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => {
      console.error("Failed to connect, retrying in 5 seconds...", err);
      setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
    });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    pool.end();
    connectWithRetry(); // Reconnect on error
  });

};

connectWithRetry();

//handle file github
// **Setup Multer for File Uploads**
// const uploadss = multer({ dest: "uploads/" });

// const githubToken = "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"; // Replace with your GitHub token

// // **Upload Route**
// app.post("/project-api/gitupload", uploadss.single("file"), async (req, res) => {
//     try {
//         const { organizationName, incidentCategory, projectName } = req.body;
//         const file = req.file;

//         if (!organizationName || !incidentCategory || !projectName || !file) {
//             return res.status(400).json({ error: "Missing required fields" });
//         }

//         const repo = organizationName.replace(/\s+/g, "-");
//         const folderPath = `${incidentCategory.replace(/\s+/g, "-")}/${projectName.replace(/\s+/g, "-")}`;
//         const githubFilePath = `${folderPath}/${file.originalname}`;
//         const fileContent = fs.readFileSync(file.path, { encoding: "base64" });

//         // **GitHub API Upload**
//         const response = await axios.put(
//             `https://api.github.com/repos/${repo}/contents/${githubFilePath}`,
//             {
//                 message: "Uploading file via API",
//                 content: fileContent,
//             },
//             { headers: { Authorization: `token ${githubToken}` } }
//         );

//         fs.unlinkSync(file.path); // Delete temp file after upload

//         res.json({ message: "File uploaded successfully", data: response.data });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to upload file" });
//     }
// });


const jwt = require("jsonwebtoken");
// Connect to PostgreSQL
// // Load the Quantile API key and endpoint from the environment
// const QUANTILE_API_URL = process.env.QUANTILE_API_URL;
// const QUANTILE_API_KEY = process.env.QUANTILE_API_KEY;
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Initialize the transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email provider
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not provided. Unauthorized access." });
  }

  try {
    // Decrypt the token
    const bytes = CryptoJS.AES.decrypt(token, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    // Validate the structure of the decrypted data
    if (
      !decryptedData ||
      !decryptedData.email ||
      decryptedData.isAdmin === undefined ||
      !decryptedData.user_id
    ) {
      return res.status(403).json({ error: "Invalid token structure." });
    }

    // Attach user data to the request object
    req.user = {
      email: decryptedData.email,
      isAdmin: decryptedData.isAdmin,
      user_id: decryptedData.user_id, // Include user_id
    };

    next();
  } catch (error) {
    console.error("Error decrypting token:", error.message);
    res.status(403).json({ error: "Invalid or corrupted token." });
  }
};


// Route to check if the user is an admin
// Route to check if the user is an admin
app.get('/project-api/isAdmin', authenticateToken, async (req, res) => {
  try {
      const userId = req.user.userId;
      const result = await pool.query('SELECT isadmin FROM projectusers WHERE id = $1', [userId]); // Updated column name
      if (result.rows.length > 0) {
          res.json({ isAdmin: result.rows[0].isadmin }); // Updated field name
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});

// Signup Endpoint
app.post("/project-api/signup", async (req, res) => {
  const { email, password, name } = req.body;

  function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  try {
    // Check if user already exists
    const user = await pool.query(
      "SELECT * FROM projectuser WHERE user_email = $1",
      [email]
    );

    if (user.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and set expiry (10 minutes from now)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store user with hashed password, OTP, and expiry in database
    await pool.query(
      "INSERT INTO projectuser (user_email, user_password, user_name, user_otp, otp_expiry) VALUES ($1, $2, $3, $4, $5)",
      [email, hashedPassword, name, otp, otpExpiry]
    );

    // Send OTP to user's email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP for Email Verification",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p>Hello,</p>
          <p>Your OTP for email verification is:</p>
          <h2 style="font-size: 24px; font-weight: bold; color: #ff3131;">${otp}</h2>
          <p>This OTP will expire in 10 minutes. Please use it to verify your email address.</p>
          <p>If you did not request this, please ignore this email.</p>
          <div style="text-align: center; font-size: 14px; color: #888; margin-top: 20px;">
            <p>&copy; ${new Date().getFullYear()} Passion Framework Audit. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please verify your email using the OTP sent to your email.",
    });
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).json({ message: "Error signing up" });
  }
});
app.post("/project-api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Fetch user by email
    const user = await pool.query(
      "SELECT * FROM projectuser WHERE user_email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const userData = user.rows[0];

    // Debugging: log values for OTP and expiry
    console.log("Received OTP:", otp);
    console.log("Stored OTP:", userData.user_otp);
    console.log("Current time:", new Date());
    console.log("OTP Expiry:", new Date(userData.otp_expiry));

    // Trim both OTP values and ensure they're compared as strings
    if (String(userData.user_otp).trim() === String(otp).trim()) {
      const currentTime = new Date().getTime();
      const otpExpiry = new Date(userData.otp_expiry).getTime();

      if (currentTime < otpExpiry) {
        // OTP is valid and not expired

        // Mark user as verified and clear OTP details
        await pool.query(
          "UPDATE projectuser SET is_verified = true, user_otp = NULL, otp_expiry = NULL WHERE user_email = $1",
          [email]
        );

        return res.status(200).json({ message: "User verified successfully. You can now log in." });
      } else {
        // OTP has expired
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }
    } else {
      // OTP does not match
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ message: "Error verifying OTP" });
  }
});



/****************************************UPDATE PASSWORD API************************************************** */

// Forgot Password API
app.post("/project-api/password", async (req, res) => {
  const { user_id, password } = req.body;

  try {
    // Fetch the user from the database by user_id
    const result = await pool.query(
      "SELECT * FROM projectuser WHERE user_id = $1",
      [user_id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(password, 10);

    // Update the password in the database
    await pool.query(
      "UPDATE projectuser SET user_password = $1 WHERE user_id = $2",
      [hashedNewPassword, user_id]
    );

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
});

const secretKey = process.env.JWT_SECRET;
app.post("/project-api/login", async (req, res) => {
  const { encryptedData } = req.body;

  try {
    // Decrypt data received from the client
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    const { email, password } = decryptedData;

    // Find user by email
    const result = await pool.query(
      "SELECT * FROM projectuser WHERE user_email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, result.rows[0].user_password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (result.rows[0].is_verified !== true) {
      return res.status(401).json({ message: "Unverified Account" });
    }

    // Get user info, including isAdmin and user_id from the database
    const tokenData = {
      email: result.rows[0].user_email,    // Use email as the unique identifier
      isAdmin: result.rows[0].isadmin,    // Admin status
      userName: result.rows[0].user_name, // User's name
      user_id: result.rows[0].user_id,    // Include user_id
    };

    // Encrypt the JWT token to send back to the client
    const token = CryptoJS.AES.encrypt(JSON.stringify(tokenData), secretKey).toString();

    res.status(200).json({
      token,
      isAdmin: result.rows[0].isadmin,    // Send isAdmin status
      email: result.rows[0].user_email,  // Send email
      userName: result.rows[0].user_name, // Send user name
      user_id: result.rows[0].user_id,   // Send user_id
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//**************************************************************** */
app.get("/project-api/sectormaster", (req, res) => {
  const sqlGet = "SELECT * from sectorapplication";
  pool.query(sqlGet, (error, result) => {
    res.json(result.rows);
  });
});
//ADD Environment API
app.post("/project-api/sectormasterpost", (req, res) => {
  const { sector, application_type,incidentcategory,incidentname,incidentdescription } = req.body;
  const sqlInsert =
    "INSERT INTO sectorapplication(sector,application_type,incidentcategory,incidentname,incidentdescription) values($1 ,$2, $3, $4, $5";
  const values = [sector, application_type,incidentcategory,incidentname,incidentdescription];
  pool.query(sqlInsert, values, (error, result) => {
    if (error) {
      console.error("error intersting ", error);
      res.status(500).json({ error: "internal server error" });
    } else {
      res.status(200).json({ message: " Sector Inserted sucessfully" });
    }
  });
});
//Delete Environment API
app.delete("/project-api/sectormasterdelete/:sectorid", (req, res) => {
  const { sectorid } = req.params;
  const sqlRemove = "Delete from sectorapplication where sectorid=$1";
  pool.query(sqlRemove, [sectorid], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).send("an error occurred while deleting ");
    }
    res.send("Sector deleted successfully");
  });
});

//Specific Environment API
app.get("/project-api/sectormasterget/:sectorid", async (req, res) => {
  try {
    const { sectorid } = req.params;
    const sqlGet = "SELECT * FROM sectorapplication WHERE sectorid=$1";
    const result = await pool.query(sqlGet, [sectorid]);
    res.send(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("an error occurred while fectching ");
  }
});
//Update Environment API
app.put("/project-api/sectormasterupdate/:sectorid", (req, res) => {
  const { sectorid } = req.params;
  const { sector, application_type, incidentcategory,incidentname,incidentdescription } = req.body;

  const sqlUpdate =
    "UPDATE sectorapplication SET sector=$1, application_type=$2, incidentcategory=$3, incidentname=$4, incidentdescription=$5 WHERE sectorid=$6";
  pool.query(
    sqlUpdate,
    [sector, application_type,incidentcategory,incidentname,incidentdescription, sectorid],
    (error, result) => {
      if (error) {
        console.error("Error updating Sector", error);
        return res.status(500).send("An error occurred while updating");
      }
      res.send("Updated successfully");
    }
  );
});

// API endpoint to handle file upload and insert data into the database
app.post('/project-api/sectoruploadExcel', async (req, res) => {
  const excelData = req.body; // The data sent from the frontend

  // Insert data into the database
  for (const row of excelData) {
      const {
          sector,
          application_type,
          incidentcategory,
          incidentname,
          incidentdescription,
          
      } = row;

      // Insert data into the projectdetails table
      const query = `
          INSERT INTO sectorapplication 
          (sector, application_type, incidentcategory, incidentname, incidentdescription)
          VALUES ($1, $2, $3, $4, $5)
      `;

      try {
          // Insert project data into the database
          await pool.query(query, [
              sector,
              application_type,
              incidentcategory,
              incidentname,
              incidentdescription,
          ]);
      } catch (err) {
          console.error('Error inserting data into the database:', err);
          return res.status(500).send({ error: 'Failed to insert data into the database' });
      }
  }

  // Send response after inserting all data
  res.status(200).send({ message: 'Data uploaded successfully' });
});


//******************************project details********************************** */
app.get("/project-api/projectgroup", (req, res) => {
  const sqlGet = "SELECT * from projectdetails";
  pool.query(sqlGet, (error, result) => {
    res.json(result.rows);
  });
});

// Route to fetch distinct sectors
app.get("/project-api/getorganization", (req, res) => {
  const sqlGet = "SELECT organizationname FROM organizationmaster";
  
  // Use pool.query to query the database
  pool.query(sqlGet, (error, result) => {
    if (error) {
      console.error("Error fetching sectors:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result.rows); // Send the fetched sectors as the response
  });
});
// Route to fetch distinct sectors
app.get("/project-api/getsector", (req, res) => {
  const sqlGet = "SELECT DISTINCT sector FROM sectorapplication";
  
  // Use pool.query to query the database
  pool.query(sqlGet, (error, result) => {
    if (error) {
      console.error("Error fetching sectors:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result.rows); // Send the fetched sectors as the response
  });
});

// Route to fetch incident categories based on sector
app.get("/project-api/getapplicationtype", (req, res) => {
  const sector = req.query.sector; // Extract the sector from the query parameters

  // Validate that the sector parameter is provided
  if (!sector) {
    return res.status(400).json({ error: "Sector parameter is required" });
  }

  const sqlGet = "SELECT DISTINCT application_type FROM sectorapplication WHERE sector=$1";

  // Use pool.query to query the database with the sector parameter
  pool.query(sqlGet, [sector], (error, result) => {
    if (error) {
      console.error("Error fetching incident categories:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result.rows); // Send the fetched incident categories as the response
  });
});

app.get("/project-api/getincidentcategory", (req, res) => {
  const application_type = req.query.application_type; // Extract the sector from the query parameters

  // Validate that the sector parameter is provided
  if (!application_type) {
    return res.status(400).json({ error: "application type parameter is required" });
  }

  const sqlGet = "SELECT DISTINCT incidentcategory FROM sectorapplication WHERE application_type=$1";

  // Use pool.query to query the database with the sector parameter
  pool.query(sqlGet, [application_type], (error, result) => {
    if (error) {
      console.error("Error fetching incident categories:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result.rows); // Send the fetched incident categories as the response
  });
});

app.get("/project-api/getincidentname", (req, res) => {
  const incidentcategory = req.query.incidentcategory; // Extract the sector from the query parameters

  // Validate that the sector parameter is provided
  if (!incidentcategory) {
    return res.status(400).json({ error: "incidentcategory parameter is required" });
  }

  const sqlGet = "SELECT DISTINCT incidentname FROM sectorapplication WHERE incidentcategory=$1";

  // Use pool.query to query the database with the sector parameter
  pool.query(sqlGet, [incidentcategory], (error, result) => {
    if (error) {
      console.error("Error fetching incident categories:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result.rows); // Send the fetched incident categories as the response
  });
});

app.get("/project-api/getincidentdescription", (req, res) => {
  const incidentname = req.query.incidentname; // Extract the sector from the query parameters

  // Validate that the sector parameter is provided
  if (!incidentname) {
    return res.status(400).json({ error: "incidentname is required" });
  }

  const sqlGet = "SELECT DISTINCT incidentdescription FROM sectorapplication WHERE incidentname=$1";

  // Use pool.query to query the database with the sector parameter
  pool.query(sqlGet, [incidentname], (error, result) => {
    if (error) {
      console.error("Error fetching incident categories:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result.rows); // Send the fetched incident categories as the response
  });
});
//ADD project API
app.post("/project-api/projectgrouppost", (req, res) => {
  const {  sector,organizationname,
    projectname,
    projectstatement,
    solutions,
    expectedcomponent,
    socialimpacts,
    departmentnamegroupno,
    studentnames,
    studentmailids,
    contactdetails,
    mentorname,mentormailids } = req.body;
  const sqlInsert =
    "INSERT INTO projectdetails(sector, organizationname,projectname, projectstatement, solutions, expectedcomponent, socialimpacts, departmentnamegroupno, studentnames, studentmailids, contactdetails, mentorname, mentormailids) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12,$13)";
    const values = [
      sector, organizationname,
      projectname,
      projectstatement,
      solutions,
      expectedcomponent,
      socialimpacts,
      departmentnamegroupno,
      studentnames,
      studentmailids,
      contactdetails,
      mentorname,mentormailids
    ];
  pool.query(sqlInsert, values, (error, result) => {
    if (error) {
      console.error("error intersting ", error);
      res.status(500).json({ error: "internal server error" });
    } else {
      res.status(200).json({ message: " Sector Inserted sucessfully" });
    }
  });
});
app.post("/project-api/send-project-email", async (req, res) => {
  try {
      // Create an invite link
      

      const {
          email1,
          sector,
          organizationname,
          projectname,
          projectstatement,
          solutions,
          expectedcomponent,
          socialimpacts,
          departmentnamegroupno,
          studentmailids,
          contactdetails,
          mentorname,
          mentormailids,
      } = req.body;

      // Split email strings into arrays
      const studentEmails = studentmailids.split(',').map(email => email.trim());
      const mentorEmails = mentormailids.split(',').map(email => email.trim());

      // Validate email addresses
      const allEmails = [...studentEmails, ...mentorEmails];
      if (!allEmails.every(email => /\S+@\S+\.\S+/.test(email))) {
          return res.status(400).json({ error: "Invalid email format detected." });
      }

      // Send the project details email directly
      const mailOptions = {
          from: process.env.EMAIL,
          to: studentEmails, // Recipients
          cc: mentorEmails, // Add mentors in CC
          subject: `Project Details: ${projectname}`,
          html: `
              <h3>Project Details: ${projectname}</h3>
              <p><strong>Sector:</strong> ${sector}</p>
              <p><strong>Organization Name:</strong> ${organizationname}</p>
              
              <p><strong>Project Name:</strong> ${projectname}</p>
              <p><strong>Project Statement:</strong> ${projectstatement}</p>
              <p><strong>Proposed Solutions:</strong> ${solutions}</p>
              <p><strong>Expected Components:</strong> ${expectedcomponent}</p>
              <p><strong>Social Impacts:</strong> ${socialimpacts}</p>
              <p><strong>Department Name and Group No:</strong> ${departmentnamegroupno}</p>
              <p><strong>Contact Details:</strong> ${contactdetails}</p>
              <p><strong>Mentor Name:</strong> ${mentorname}</p>
              <p>For further collaboration, Join the Project Framework</a>.</p>
          `
      };

      // Send email
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Project email sent successfully." });
  } catch (error) {
      console.error("Error in /citincident-api/send-project-email:", error);
      res.status(500).json({ error: error.message });
  }
});


//Delete Environment API
app.delete("/project-api/projectgroupdelete/:projectid", (req, res) => {
  const { projectid } = req.params;
  const sqlRemove = "Delete from projectdetails where projectid=$1";
  pool.query(sqlRemove, [projectid], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).send("an error occurred while deleting ");
    }
    res.send("Sector deleted successfully");
  });
});

//Specific Environment API
app.get("/project-api/projectgroupget/:projectid", async (req, res) => {
  try {
    const { projectid } = req.params;

    // Validate projectid
    if (!projectid || isNaN(projectid)) {
      return res.status(400).send("Invalid or missing projectid parameter");
    }

    const sqlGet = "SELECT * FROM projectdetails WHERE projectid=$1";
    const result = await pool.query(sqlGet, [parseInt(projectid, 10)]);

    if (result.rows.length === 0) {
      return res.status(404).send("No project found with the given ID");
    }

    res.send(result.rows);
  } catch (error) {
    console.error("Error fetching project details:", error.message);
    res.status(500).send("An error occurred while fetching project details");
  }
});

//Update Environment API
app.put("/project-api/projectgroupupdate/:projectid", (req, res) => {
  const { projectid } = req.params;
  const { sector,organizationname,
    projectname,
    projectstatement,
    solutions,
    expectedcomponent,
    socialimpacts,
    departmentnamegroupno,
    studentnames,
    studentmailids,
    contactdetails,
    mentorname,mentormailids} = req.body;

  const sqlUpdate =
 "UPDATE projectdetails SET sector = $1, organizationname = $2, projectname = $3, projectstatement = $4, solutions = $5, expectedcomponent = $6, socialimpacts = $7, departmentnamegroupno = $8, studentnames = $9, studentmailids = $10, contactdetails = $11, mentorname = $12, mentormailids=$13 WHERE projectid = $14";
  pool.query(
    sqlUpdate,
    [sector,organizationname,
      projectname,
      projectstatement,
      solutions,
      expectedcomponent,
      socialimpacts,
      departmentnamegroupno,
      studentnames,
      studentmailids,
      contactdetails,
      mentorname, mentormailids, projectid],
    (error, result) => {
      if (error) {
        console.error("Error updating Sector", error);
        return res.status(500).send("An error occurred while updating");
      }
      res.send("Updated successfully");
    }
  );
});


// API endpoint to handle file upload and email sending
app.post('/project-api/uploadExcel', async (req, res) => {
  const excelData = req.body; // The data sent from the frontend

  // Insert data into the database and send email
  for (const row of excelData) {
      const {
          
          sector, organizationname,
          projectname,
          projectstatement,
          solutions,
          expectedcomponent,
          socialimpacts,
          departmentnamegroupno,
          studentnames,
          studentmailids,
          contactdetails,
          mentorname,
          mentormailids,
      } = row;

      // Insert data into the projectdetails table
      const query = `
          INSERT INTO projectdetails 
          ( sector, organizationname, projectname, projectstatement, solutions, expectedcomponent, 
          socialimpacts, departmentnamegroupno, studentnames, studentmailids, contactdetails, mentorname, mentormailids)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      try {
          // Insert project data into the database
          await pool.query(query, [
             
              sector,organizationname,
              projectname,
              projectstatement,
              solutions,
              expectedcomponent,
              socialimpacts,
              departmentnamegroupno,
              studentnames,
              studentmailids,
              contactdetails,
              mentorname,
              mentormailids
          ]);

          // Split the emails by commas and send the email
          const studentsEmailList = studentmailids.split(',').map(email => email.trim());
          const mentorEmailList = mentormailids.split(',').map(email => email.trim()); // Assuming mentorname contains emails.

          const mailOptions = {
              from: 'your-email@gmail.com',
              to: studentsEmailList,
              cc: mentorEmailList,
              subject: `New Project: ${projectname}`,
              text: `Dear Team,\n\nYou have been assigned to the project: ${projectname}. Below are the project details:\n\nSector: ${sector}\nProject Name: ${projectname}\n Project Statement:${projectstatement}\nSolutions: ${solutions}\nExpected Components: ${expectedcomponent}\nDepartment Name no: ${departmentnamegroupno}\n student names: ${studentnames}\nSocial Impact: ${socialimpacts}\n\nBest regards,\nYour Team`,
          };

          await transporter.sendMail(mailOptions);
      } catch (err) {
          console.error('Error inserting data or sending email:', err);
          return res.status(500).send({ error: 'Failed to insert data or send email' });
      }
  }

  // Send response after inserting all data
  res.status(200).send({ message: 'Data uploaded and emails sent successfully' });
});
// Route to get user incidents
app.get("/project-api/user-projects/:email", authenticateToken, (req, res) => {
  const email = req.params.email; // Extract email from route params

  // SQL query to match email in studentmailids using LIKE
  const sqlQuery = `
      SELECT * 
      FROM projectdetails
      WHERE studentmailids LIKE $1
  `;

  // Add wildcards to the email to match it in a comma-separated string
  const emailPattern = `%${email}%`;

  pool.query(sqlQuery, [emailPattern], (error, result) => {
    if (error) {
      console.error("Error fetching incidents:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Check if any rows are returned
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No incidents found for this email" });
    }

    // Send the result rows as the response
    res.status(200).json(result.rows);
  });
});

//Dashboard
app.get('/project-api/graphprojects', authenticateToken, async (req, res) => {
  try {
    // Extract the email from the query parameter
    const { email } = req.query;  // Assuming the email is passed as a query parameter

    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    // Query to fetch projects where the logged-in user's email is in either the studentmailids or mentormailids columns
    const result = await pool.query(`
      SELECT p.projectid, p.projectname, COUNT(p.projectid) as project_count
      FROM projectdetails p
      WHERE
        $1 = ANY(string_to_array(p.studentmailids, ',')) OR
        $1 = ANY(string_to_array(p.mentormailids, ',')) 
      GROUP BY p.projectid;
    `, [email]);  // Use the 'email' parameter here

    res.json(result.rows);  // Return the project count data
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// // Route for generating incident data
// app.post('/project-api/generate-incident', async (req, res) => {
//   const { project } = req.body;

//   if (!project) {
//     return res.status(400).json({ error: 'Project data is required' });
//   }

//   try {
//     // Step 1: Prepare the API input
//     const prompt = `
//       Based on the following project details, generate incident data:

//       Project Name: ${project.projectname}
//       Organization Name: ${project.organizationname}
//       Sector: ${project.sector}
//       Problem Statement: ${project.projectstatement}
//       Solution: ${project.solutions}
//       Expected Components: ${project.expectedcomponent}

//       Provide:
//       - Tag
//       - PBI Number
//       - Incident Name
//       - Incident Description
//     `;

//     // Step 2: Call the Quantile API
//     const quantileResponse = await axios.post(
//       QUANTILE_API_URL,
//       { prompt },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${QUANTILE_API_KEY}`,
//         },
//       }
//     );

//     const data = quantileResponse.data;

//     // Step 3: Structure the response for the frontend
//     const incidentData = {
//       tag: data.tag || 'Default Tag',
//       pbiNumber: data.pbiNumber || 'PBI0001',
//       incidentCategory: data.incidentCategory || 'Default Category',
//       incidentName: data.incidentName || 'Default Incident Name',
//       incidentDescription: data.incidentDescription || 'No description provided',
//       dateTime: new Date(),
//       incidentOwner: 'admin',
//       status: 'Open',
//       priority: 'High',
//       incidentResolver: null,
//     };

//     res.status(200).json(incidentData);
//   } catch (error) {
//     console.error('Error communicating with Quantile API:', error.message);
//     res.status(500).json({ error: 'Failed to generate incident data' });
//   }
// });


// const openai = new OpenAI({
//   apiKey: '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', // OpenAI API Key
// });


// app.post('/project-api/generate-incident', async (req, res) => {
//   const { project } = req.body;

//   if (!project) {
//     return res.status(400).json({ error: 'Project data is required' });
//   }

//   try {
//     // Step 1: Prepare the API input
//     const prompt = `
//       Based on the following project details, generate incident data:

//       Project Name: ${project.projectname}
//       Organization Name: ${project.organizationname}
//       Sector: ${project.sector}
//       Problem Statement: ${project.projectstatement}
//       Solution: ${project.solutions}
//       Expected Components: ${project.expectedcomponent}

//       Provide:
//       - Tag
//       - PBI Number
//       - Incident Name
//       - Incident Description
//     `;

//     // Step 2: Call OpenAI API to generate incident data
//     const response = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo', // Using GPT-3.5 model
//       messages: [{ role: 'user', content: prompt }],
//       max_tokens: 500,
//     });

//     const contentText = response.choices[0]?.message?.content || 'No description provided';

//     // Step 3: Structure the response for the frontend
//     const incidentData = {
//       tag: 'Generated Tag', // Adjust as per your logic
//       pbiNumber: 'PBI0001', // Adjust as per your logic
//       incidentCategory: 'Generated Category', // Adjust as per your logic
//       incidentName: 'Generated Incident Name', // Adjust as per your logic
//       incidentDescription: contentText, // The description generated by OpenAI
//       dateTime: new Date(),
//       incidentOwner: 'admin', // Default or dynamic value
//       status: 'Open', // Default or dynamic value
//       priority: 'High', // Default or dynamic value
//       incidentResolver: null, // Default or dynamic value
//     };

//     res.status(200).json(incidentData);
//   } catch (error) {
//     console.error('Error communicating with OpenAI API:', error.message);
//     res.status(500).json({ error: 'Failed to generate incident data' });
//   }
// });
//*****************************************Organization Master*********************** */
app.get("/project-api/organizationmaster", (req, res) => {
  const sqlGet = "SELECT * from organizationmaster";
  pool.query(sqlGet, (error, result) => {
    res.json(result.rows);
  });
});
//ADD Environment API
app.post("/project-api/organizationmasterpost", (req, res) => {
  console.log("Request Body:", req.body); // Debugging
  const { organizationname, collegename, employeecode, employeeemail, employeename, employeephoneno, country, statey, city } = req.body;
  const sqlInsert =
    "INSERT INTO organizationmaster(organizationname, collegename, employeecode, employeeemail, employeename, employeephoneno, country, statey, city) values($1, $2, $3, $4, $5, $6, $7, $8, $9)";
  const values = [organizationname, collegename, employeecode, employeeemail, employeename, employeephoneno, country, statey, city];
  pool.query(sqlInsert, values, (error, result) => {
    if (error) {
      console.error("Error inserting:", error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.status(200).json({ message: "Organization inserted successfully" });
    }
  });
});

app.delete("/project-api/organizationdelete/:organizationid", (req, res) => {
  const organizationid = parseInt(req.params.organizationid, 10);
  console.log('organizationid:', organizationid); // Log the value of organizationid

  if (isNaN(organizationid)) {
    return res.status(400).json({ error: 'Invalid organization ID' });
  }

  pool.query(
    'DELETE FROM organizationmaster WHERE organizationid = $1',
    [organizationid],
    (err, result) => {
      if (err) {
        console.error('Error deleting organization:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Organization deleted successfully' });
    }
  );
});


//Specific Environment API
app.get("/project-api/organizationmasterget/:organizationid", async (req, res) => {
  try {
    const { organizationid } = req.params;
    const sqlGet = "SELECT * FROM organizationmaster WHERE organizationid=$1";
    const result = await pool.query(sqlGet, [organizationid]);
    res.send(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("an error occurred while fectching ");
  }
});
//Update Environment API
app.put("/project-api/organizationmasterupdate/:organizationid", (req, res) => {
  const { organizationid } = req.params;
  const { organizationname, collegename, employeecode, employeeemail, employeename, employeephoneno, country, statey, city } = req.body;

  const sqlUpdate =
    "UPDATE organizationmaster SET organizationname=$1, collegename=$2, employeecode=$3, employeeemail=$4, employeename=$5, employeephoneno=$6, country=$7, statey=$8, city=$9  WHERE organizationid=$10";
  pool.query(
    sqlUpdate,
    [organizationname, collegename, employeecode, employeeemail, employeename, employeephoneno, country, statey, city, organizationid],
    (error, result) => {
      if (error) {
        console.error("Error updating OrganizationMaster:", error.message, error);
        return res.status(500).send("An error occurred while updating");
      }
      res.send("Updated successfully");
    }
  );
});


// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // Ensure the directory exists
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow only Excel files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.xls' && ext !== '.xlsx') {
    return cb(new Error('Only Excel files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

app.post('/project-api/organizationuploadExcel', upload.single('file'), async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploaded file info:', req.file);

    // Read the uploaded Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log('Parsed Excel data:', excelData);

    // Map Excel keys to database keys
    const mappedData = excelData.map(row => ({
      organizationname: row['Oragnization Name'] || null,
      collegename: row['College Name'] || null,
      employeecode: row['Employee code'] || null,
      employeeemail: row['Employee Email'] || null,
      employeename: row['Employee Name'] || null,
      employeephoneno: row['Employee Phone no'] || null,
      country: row['Country'] || null,
      statey: row['State'] || null,
      city: row['City'] || null,
    }));

    console.log('Mapped Data:', mappedData);

    // Insert data into the database
    const query = `
      INSERT INTO organizationmaster (
        organizationname, collegename, employeecode, 
        employeeemail, employeename, employeephoneno, 
        country, statey, city
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    for (const row of mappedData) {
      const {
        organizationname,
        collegename,
        employeecode,
        employeeemail,
        employeename,
        employeephoneno,
        country,
        statey,
        city,
      } = row;

      try {
        await pool.query(query, [
          organizationname,
          collegename,
          employeecode,
          employeeemail,
          employeename,
          employeephoneno,
          country,
          statey,
          city,
        ]);
      } catch (err) {
        console.error('Error inserting row into database:', row, err.message);
      }
    }

    // Send success response
    res.status(200).json({ message: 'File uploaded and data inserted successfully' });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to process the uploaded file' });
  } finally {
    // Cleanup uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Delete the file after processing
    }
  }
});


//******************************Project Incident************* */
// Directory where your files are stored (updated to `uploads`)
const FILES_DIR = path.join(__dirname, 'uploads');

app.get('/project-api/download-files', async (req, res) => {
  try {
    // Query the database for files
    const result = await pool.query('SELECT file FROM incident WHERE file IS NOT NULL');
    const files = result.rows.map((row) => row.file).filter((file) => file.trim() !== '');

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No files available for download' });
    }

    // Create a ZIP archive
    const zipFileName = 'files.zip';
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`ZIP file created: ${zipFileName}`);
      res.download(zipFileName, (err) => {
        if (err) {
          console.error('Error sending ZIP file:', err);
          res.status(500).send('Error downloading files');
        } else {
          fs.unlinkSync(zipFileName); // Delete the ZIP file after sending
        }
      });
    });

    archive.on('error', (err) => {
      console.error('Error creating ZIP file:', err);
      res.status(500).send('Error creating ZIP file');
    });

    archive.pipe(output);

    // Add files to the ZIP archive (updated to check the `uploads` folder)
    files.forEach((file) => {
      const filePath = path.join(FILES_DIR, file);
      if (fs.existsSync(filePath)) {
        console.log(`Adding file to ZIP: ${filePath}`);
        archive.file(filePath, { name: file }); // Add file to the ZIP archive
      } else {
        console.warn(`File not found, skipping: ${filePath}`);
      }
    });

    archive.finalize(); // Finalize the ZIP archive
  } catch (error) {
    console.error('Error in /project-api/download-files:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/project-api/set-priority-times', async (req, res) => {
  const { critical, veryhigh, high, medium, low } = req.body;

  // Input validation (optional)
  if (typeof critical !== 'string' || typeof veryhigh !== 'string' ||
      typeof high !== 'string' || typeof medium !== 'string' ||
      typeof low !== 'string') {
      return res.status(400).json({ message: 'Invalid input.' });
  }

  try {
      // Use the pool reference to update the priority_times table
      await pool.query(
          `UPDATE priority_times
           SET critical = $1, veryhigh = $2, high = $3, medium = $4, low = $5
           WHERE id = 1`,
          [critical, veryhigh, high, medium, low]
      );
      res.json({ message: 'Priority times updated successfully.' });
  } catch (err) {
      console.error('Error updating priority times:', err);
      res.status(500).json({ message: 'Failed to update priority times.' });
  }
});

app.get('/project-api/get-priority-times', async (req, res) => {
  try {
      // Query to fetch priority times
      const result = await pool.query('SELECT * FROM priority_times WHERE id = 1');
      if (result.rows.length > 0) {
          res.json(result.rows[0]);
      } else {
          res.status(404).json({ message: 'Priority times not found' });
      }
  } catch (err) {
      console.error('Error fetching priority times:', err);
      res.status(500).json({ message: 'Failed to fetch priority times' });
  }
});

app.get("/project-api/incident", (req, res) => {
  const sqlGet = "SELECT * FROM incident";

  pool.query(sqlGet, (error, result) => {
    if (error) {
      console.error("Error executing query:", error.stack);
      return res.status(500).json({ error: "Query execution failed" });
    }

    console.log("Query result:", result);
    res.json(result.rows);
  });
});

app.get("/project-api/user-incidents/:email", authenticateToken, (req, res) => {
  const email = req.params.email; // Correctly access email from req.params

  const sqlGet = "SELECT * FROM incident WHERE incidentresolver = $1";

  pool.query(sqlGet, [email], (error, result) => {
      if (error) {
          console.error("Error fetching incidents:", error);
          return res.status(500).json({ error: "Internal server error" });
      }
      res.json(result.rows);
  });
});
app.get("/project-api/getprojectname", (req, res) => {
  const sqlGet = "SELECT projectname FROM projectdetails";
  
  // Use pool.query to query the database
  pool.query(sqlGet, (error, result) => {
    if (error) {
      console.error("Error fetching sectors:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result.rows); // Send the fetched sectors as the response
  });
});




// Ensure 'uploads' directory exists
const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
    console.log(`Created uploads directory at ${uploadDirectory}`);
} else {
    console.log(`Uploads directory exists at ${uploadDirectory}`);
}
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Saving file: ${file.originalname}`);
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log(`Generated filename: ${uniqueName}`);
    cb(null, uniqueName);
  },
});

const uploading = multer({
  storage: uploadStorage,
});

app.use('/project-api/uploads', express.static(uploadDirectory));

app.post(
  '/project-api/incidentpost',
  uploading.fields([{ name: 'photo', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  async (req, res) => {
    try {
      // Log uploaded files
      console.log('Uploaded Files:', req.files);

      const {
        tagpbinumber,
        pbi,
        organizationname,
        projectname,
        sector,
        application_type,
        incidentcategory,
        incidentname,
        incidentowner,
        incidentdescription,
        'date-time': datetime,
        incidentresolver,
        status,
        priority,
        description,
      } = req.body;

      const photo = req.files?.photo?.[0]?.filename || null;
      const file = req.files?.file?.[0]?.filename || null;

      console.log('Processed photo:', photo);
      console.log('Processed file:', file);

      const query = `
        INSERT INTO incident (
          tagpbinumber, pbi, organizationname, projectname,
          sector, application_type, incidentcategory, incidentname,
          incidentowner, incidentdescription, datetime,
          incidentresolver, status, priority, photo, descriptions, file
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);
      `;

      const values = [
        tagpbinumber || null,
        pbi || null,
        organizationname || null,
        projectname || null,
        sector || null,
        application_type || null,
        incidentcategory || null,
        incidentname || null,
        incidentowner || null,
        incidentdescription || null,
        datetime || null,
        incidentresolver || null,
        status || null,
        priority || null,
        photo,
        description || null,
        file,
      ];

      await pool.query(query, values);

      res.status(201).json({ success: true, message: 'Incident successfully created' });
    } catch (err) {
      console.error('Error during insertion:', err);
      res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
    }
  }
);

app.post("/project-api/send-incident-email",uploading.fields([{ name: 'photo', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
  try {
      const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL, // Your email address
            pass: process.env.EMAIL_PASSWORD,
          },
      });
       // Create an invite link
       
      const {
        email1,
        tagpbinumber,
        pbi,
        organizationname,
        projectname,
        sector,
        application_type,
        incidentcategory,
        incidentname,
        incidentowner,
        incidentdescription,
        datetime,
        incidentresolver,
        status,
        priority,
        descriptions,
         
      } = req.body;

      // Fetch priority times from the database
      const priorityResult = await pool.query('SELECT * FROM priority_times WHERE id = 1');
      const priorityTimes = priorityResult.rows[0];
      const timeFrame = priorityTimes[priority] || "24 hours"; // Default to "24 hours" if priority is not found

       // Process uploaded files
       const photo = req.files?.photo?.[0];
       const file = req.files?.file?.[0];
 
       // Attachments array
       const attachments = [];
 
       if (photo) {
         attachments.push({
           filename: photo.filename, // Uploaded photo file name
           path: photo.path, // Uploaded photo file path
           cid: 'incidentphoto@incidentemail', // Content ID for inline use
         });
       }
 
       if (file) {
         attachments.push({
           filename: file.filename, // Uploaded file name
           path: file.path, // Uploaded file path
         });
       }
 
      // Send the incident report email directly
      const mailOptions = {
          from: incidentowner,
          to: email1,
          subject: `Incident Report: ${incidentname}`,
          html: `
              <p>Resolve this incident within the given time frame: <strong>${timeFrame}</strong>.</p>
              <p>To solve this incident, Join Passion Project Management Framework</a>.</p>

              <h3>Incident Report: ${incidentname}</h3>
               <p><strong>PBI Number:</strong> ${tagpbinumber}</p>
                <p><strong>PBI:</strong> ${pbi}</p>
                  <p><strong>Organization Name:</strong> ${organizationname}</p>
                    <p><strong>Project Name:</strong> ${projectname}</p>
                    <p><strong>Sector:</strong> ${sector}</p>
                    <p><strong>Application Type:</strong> ${application_type}</p>
                    <p><strong>Incident Category:</strong>${incidentcategory}</p>
                    <p><strong>Incident Name:</strong> ${incidentname}</p>
                    <p><strong>Owner:</strong> ${incidentowner}</p>
                    <p><strong>Incident Description:</strong> ${incidentdescription}</p>
                    <p><strong>Resolver:</strong> ${incidentresolver}</p>
                    <p><strong>Status:</strong> ${status}</p>
                    <p><strong>Priority:</strong> ${priority}</p>
                    <p><strong>File Descriptions:<strong>${descriptions}</p>
              
          `,
          attachments, // No attachments if no file uploaded
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Incident email sent successfully." });
  } catch (error) {
      console.error("Error in /project-api/send-incident-email:", error);
      res.status(500).json({ error: error.message });
  }
});




app.get('/project-api/incidentget/:incidentid', async (req, res) => {
  try {
    const { incidentid } = req.params;
    const sqlGet = "SELECT * FROM incident WHERE incidentid=$1";
    const result = await pool.query(sqlGet, [incidentid]);
    res.send(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("an error occurred while fectching ");
  }
});

app.put('/project-api/incidentupdate/:incidentid', uploading.single('photo'), async (req, res) => {
  try {
      const { incidentid } = req.params;
      const { 
          tagpbinumber, 
          pbi,organizationname,projectname, 
          sector, 
          application_type, 
          incidentcategory, 
          incidentname, 
          datetime, 
          status, 
          incidentdescription, 
          incidentowner, 
          incidentresolver, 
          priority 
      } = req.body;

      
      const photo = req.file ? req.file.filename : null;

      const sqlUpdate = `
          UPDATE incident 
          SET 
              tagpbinumber = $1, 
              pbi = $2,
              organizationname = $3,
              projectname = $4 
              sector = $5, 
              application_type = $6, 
              incidentcategory = $7, 
              incidentname = $8, 
              datetime = $9, 
              status = $10, 
              incidentdescription = $11, 
              incidentowner = $12, 
              incidentresolver = $13, 
              priority = $14, 
              photo = COALESCE($14, photo) 
          WHERE incidentid = $16
      `;
      const values = [tagpbinumber, pbi, organizationname, projectname, sector, application_type, incidentcategory, incidentname, datetime, status, incidentdescription, incidentowner, incidentresolver, priority, photo, incidentid];

      await pool.query(sqlUpdate, values);
      res.status(200).json({ message: "Incident updated successfully" });
  } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

app.delete('/project-api/incidentdelete/:incidentid', async (req, res) => {
  try {
      const { incidentid } = req.params;
      const sqlDelete = `DELETE FROM incident WHERE incidentid = $1`;
      await pool.query(sqlDelete, [incidentid]);
      res.status(200).json({ message: "Incident deleted successfully" });
  } catch (error) {
      console.error("Error deleting incident:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});
//upload excel sheet
// API endpoint to handle file upload and email sending
// Helper function to convert Excel date to ISO format
function convertExcelDate(excelDate) {
  const epoch = new Date(1899, 11, 30); // Excel epoch (Dec 30, 1899)
  const msPerDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
  const jsDate = new Date(epoch.getTime() + excelDate * msPerDay);
  return moment(jsDate).format('YYYY-MM-DD HH:mm:ss');
}


app.post('/project-api/incidentuploadExcel', async (req, res) => {
    const excelData = req.body; // The data sent from the frontend

    if (!Array.isArray(excelData) || excelData.length === 0) {
        return res.status(400).send({ error: 'Invalid input data' });
    }

    for (const row of excelData) {
        const {
            'Tag (PBI Number)': tagpbinumber,
            PBI: pbi,
            'Organization Name':organizationname,
            'Project Name': projectname,
            Sector: sector,
            'Application Type': application_type,
            'Incident Category': incidentcategory,
            'Incident Name': incidentname,
            'Date-Time': datetime,
            Status: status,
            'Incident Description': incidentdescription,
            'Incident Owner': incidentowner,
            'Incident Resolver': incidentresolver,
            Priority: priority,
        } = row;

       // Convert Excel date-time numeric value
       const formattedDate = isNaN(datetime)
       ? null
       : convertExcelDate(parseFloat(datetime));

   if (!formattedDate) {
       console.error('Invalid date-time format:', datetime);
       return res.status(400).send({ error: `Invalid date-time format: ${datetime}` });
   }

        try {
            const priorityResult = await pool.query('SELECT * FROM priority_times WHERE id = 1');
            const priorityTimes = priorityResult.rows[0];
            const timeFrame = priorityTimes[priority] || '24 hours';

            const query = `
                INSERT INTO incident (
                    tagpbinumber, pbi, organizationname, projectname, sector, application_type, incidentcategory, 
                    incidentname, datetime, status, incidentdescription, 
                    incidentowner, incidentresolver, priority
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `;

            await pool.query(query, [
                tagpbinumber,
                pbi,organizationname, projectname,
                sector,
                application_type,
                incidentcategory,
                incidentname,
                formattedDate, // Insert formatted date
                status,
                incidentdescription,
                incidentowner,
                incidentresolver,
                priority,
            ]);

            const mailOptions = {
                from: process.env.EMAIL,
                to: incidentresolver,
                subject: `New Incident Report: ${incidentname}`,
                html: `
                    <p>Resolve this incident within the given time frame: <strong>${timeFrame}</strong>.</p>
                    <p><strong>Tag (PBI Number):</strong> ${tagpbinumber}</p>
                    <p><strong>PBI:</strong> ${pbi}</p>
                    <p><strong>organization Name:</strong> ${organizationname}</p>
                    <p><strong>Project Name:</strong> ${projectname}</p>
                    <p><strong>Sector:</strong> ${sector}</p>
                    <p><strong>Application Type:</strong> ${application_type}</p>
                    <p><strong>Incident Category:</strong> ${incidentcategory}</p>
                    <p><strong>Incident Name:</strong> ${incidentname}</p>
                    <p><strong>Description:</strong> ${incidentdescription}</p>
                    <p><strong>Date-Time:</strong> ${formattedDate}</p>
                    <p><strong>Priority:</strong> ${priority}</p>
                    <p><strong>Status:</strong> ${status}</p>
                `,
            };

            await transporter.sendMail(mailOptions);
        } catch (err) {
            console.error('Error inserting data or sending email:', err);
            return res.status(500).send({ error: 'Failed to insert data or send email' });
        }
    }

    res.status(200).send({ message: 'Data uploaded and emails sent successfully' });
});



// Configure Multer for file storage
const storagei = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure 'uploads' directory exists, or Multer will fail
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Store the file with a timestamp + original name to avoid name conflicts
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize multer with storage configuration and no file size limit
const uploads = multer({
  storage: storagei,
  // No file size limit, so no 'limits' option
  // No file type validation, so no 'fileFilter' option
});

// API to resolve incidents and upload a file
app.post('/project-api/resolve', uploads.single('file'), async (req, res) => {
  const {
    incidentid,
    organizationname,
    sector,
    incidentcategory,
    incidentname,
    incidentowner,
    resolutionremark,
    resolvedby,
    resolveddate,
    filedescription,
    user_id,  // Get file description from user input
  } = req.body;

  // Get the filename from the uploaded file (if exists)
  const file = req.file ? req.file.filename : null; // Ensure the file is present

  try {
    // Insert data into the resolve table
    const query = `
      INSERT INTO resolve (
        incidentid,
        organizationname,
        sector,
        incidentcategory,
        incidentname,
        incidentowner,
        resolutionremark,
        resolvedby,
        resolveddate,
        file,
        filedescription,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    const values = [
      incidentid,
      organizationname,
      sector,
      incidentcategory,
      incidentname,
      incidentowner,
      resolutionremark,
      resolvedby,
      resolveddate,
      file, // Store the filename here
      filedescription,user_id, 
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Incident resolved and data inserted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error resolving incident:', error.message);
    res.status(500).json({
      message: 'Failed to resolve the incident',
      error: error.message,
    });
  }
});


app.post(
  "/project-api/send-resolve-email",
  uploads.fields([{ name: "file", maxCount: 1 }]), // Only handle the 'file' field
  async (req, res) => {
    try {
      const {
        incidentid,
        organizationname,
        sector,
        incidentcategory,
        incidentname,
        incidentowner,
        resolutionremark,
        resolvedby,
        resolveddate,
        filedescription,
      } = req.body;

      if (!incidentowner) {
        return res.status(400).json({ message: "Incident owner email is required." });
      }

      console.log("Incident Owner:", incidentowner);

      // Fetch the uploaded file
      const file = req.files?.file?.[0];

      // Prepare attachments
      const attachments = [];

      if (file) {
        attachments.push({
          filename: file.filename, // Uploaded file name
          path: file.path, // Uploaded file path
        });
      }

      // Configure Nodemailer Transporter
      const transporter = nodemailer.createTransport({
        service: "Gmail", // Replace with your email service provider
        auth: {
          user: process.env.EMAIL, // Your email address
          pass: process.env.EMAIL_PASSWORD, // Your email password or app password
        },
      });

      // Compose the email
      const mailOptions = {
        from: process.env.EMAIL, // Sender email
        to: incidentowner, // Recipient email
        subject: `Incident Resolved: ${incidentname}`,
        html: `
          <h3>Incident Resolution Report</h3>
          <p><strong>Incident ID:</strong> ${incidentid}</p>
          <p><strong>Organization Name:</strong> ${organizationname}</p>
          <p><strong>Sector:</strong> ${sector}</p>
          <p><strong>Category:</strong> ${incidentcategory}</p>
          <p><strong>Name:</strong> ${incidentname}</p>
          <p><strong>Owner:</strong> ${incidentowner}</p>
          <p><strong>Resolution Remark:</strong> ${resolutionremark}</p>
          <p><strong>Resolved By:</strong> ${resolvedby}</p>
          <p><strong>Resolved Date:</strong> ${resolveddate}</p>
          <p><strong>File Description:</strong> ${filedescription}</p>
        `,
        attachments, // Attach the uploaded file, if any
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully.");

      // Return success response
      res.status(200).json({ message: "Incident resolution email sent successfully." });
    } catch (error) {
      console.error("Error in /project-api/send-resolve-email:", error);
      res.status(500).json({ error: "Failed to send the incident resolution email." });
    }
  }
);


//Dashboard
app.get('/project-api/graphprojects', authenticateToken, async (req, res) => {
  try {
    // Extract the email from the query parameter
    const { email } = req.query;  // Assuming the email is passed as a query parameter

    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    // Query to fetch projects where the logged-in user's email is in either the studentmailids or mentormailids columns
    const result = await pool.query(`
      SELECT p.projectid, p.projectname, COUNT(p.projectid) as project_count
      FROM projectdetails p
      WHERE
        $1 = ANY(string_to_array(p.studentmailids, ',')) OR
        $1 = ANY(string_to_array(p.mentormailids, ',')) 
      GROUP BY p.projectid;
    `, [email]);  // Use the 'email' parameter here

    res.json(result.rows);  // Return the project count data
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
app.get('/project-api/incidentsbyorganization', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Resolver email is required" });
  }

  try {
    const result = await pool.query(`
      SELECT organizationname, COUNT(*) AS incident_count
      FROM incident
      WHERE incidentresolver = $1
      GROUP BY organizationname
    `, [email]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching incident data by organization:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/project-api/resolvebyorganization', async (req, res) => {
  const { user_id } = req.query;

  // Validate the user_id
  if (!user_id) {
    return res.status(400).json({ error: "Resolver user_id is required" });
  }

  try {
    // Fetch data grouped by organizationname
    const result = await pool.query(`
      SELECT organizationname, COUNT(*) AS resolve_count
      FROM resolve
      WHERE user_id = $1
      GROUP BY organizationname
    `, [user_id]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching resolve data by organization:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/project-api/project-count', async (req, res) => {
  const { email } = req.query; // Get email from query params

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS project_count
      FROM projectdetails p
      WHERE $1 = ANY(string_to_array(p.studentmailids, ','))
      OR $1 = ANY(string_to_array(p.mentormailids, ','))
    `, [email]); // Use email as a parameter for the query

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching project count:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/project-api/incident-count', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS incident_count
      FROM incident
      WHERE incidentresolver = $1
    `, [email]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching incident count:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/project-api/resolve-count', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS resolve_count
      FROM resolve
      WHERE user_id = $1
    `, [user_id]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching resolve count:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Resolution
app.get("/project-api/user-resolve/:user_id", authenticateToken, (req, res) => {
  const user_id = parseInt(req.params.user_id, 10); // Convert to an integer
  if (isNaN(user_id)) {
      return res.status(400).json({ error: "Invalid user_id. Must be an integer." });
  }

  const sqlGet = "SELECT * FROM resolve WHERE user_id = $1";

  pool.query(sqlGet, [user_id], (error, result) => {
      if (error) {
          console.error("Error fetching resolution:", error);
          return res.status(500).json({ error: "Internal server error" });
      }
      res.json(result.rows);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

