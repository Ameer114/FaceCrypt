const express = require("express");
const fs = require("fs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const { log } = require("console");
const { conn } = require("./dbcon.js");
const app = express();
const PORT = 5000;



let savedEmail = ""; 
app.use(cors());
app.use(express.json());

app.post('/save-email', (req, res) => {
    const { email } = req.body;
    console.log(email);
    
    savedEmail = email;
    console.log("Received email:", email);

    // You can save it to DB or just log it for now
    res.send("Email saved successfully");
})

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ameernagarasi6@gmail.com",
      pass: "toqbuyswhlzedvtl" // NOT your Gmail password
    },
  });
  

  app.post("/register-face", (req, res) => {
      const { name, image } = req.body;
  
      if (!name || !image) {
          return res.status(400).send("Name or image missing");
      }
  
      // Clean name from spaces and unsafe characters
      const safeName = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  
      // Remove the base64 prefix
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  
      // Destination directory (make sure it exists)
      const destDir = path.join(__dirname, "../python model/KnownFaces");
  
      // Ensure directory exists
      fs.mkdirSync(destDir, { recursive: true });
  
      // File path to save image
      const filePath = path.join(destDir, `${safeName}.jpg`);
  
      fs.writeFile(filePath, base64Data, 'base64', (err) => {
          if (err) {
              console.error("Failed to save image:", err);
              return res.status(500).send("Error saving image");
          }
  
          console.log(`Image saved at: ${filePath}`);
          res.send("Face registered successfully");
      });
  });
  
app.use('/images', express.static('images'));
app.get("/latest-image", (req, res) => {
    const directory = "./images";

    fs.readdir(directory, (err, files) => {
        if (err) {
            return res.status(500).send("Error reading images folder");
        }

        const jpgFiles = files.filter(file => file.endsWith(".jpg"));

        if (jpgFiles.length === 0) {
            return res.status(404).send("No images found");
        }

        const sortedFiles = jpgFiles.sort((a, b) => {
            return fs.statSync(`${directory}/${b}`).mtime - fs.statSync(`${directory}/${a}`).mtime;
        });

        const latestFile = sortedFiles[0];
        const filePath = `${directory}/${latestFile}`;
        const stats = fs.statSync(filePath);

        res.send({
            imageUrl: `/images/${latestFile}`,
            modifiedTime: stats.mtimeMs  // send modified time in milliseconds
        });
    });
});

// Middleware to handle raw binary file data
app.use(express.raw({ type: "image/jpeg", limit: "10mb" }));

app.post("/upload", async(req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("No image received");
    }

    const timestamp = Date.now();
    const filename = `received_image_${timestamp}.jpg`; // just the file name
    const filepath = `${__dirname}/images/${filename}`; // absolute path for saving
    const imageURL = `/images/${filename}`; // public URL (used in DB or frontend)
    const date = new Date();
    const formattedTime = date.toLocaleString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour12: true,
    });
    try {
        const query = "INSERT INTO records (image, tm) VALUES (?, ?)";
        const values = [imageURL, formattedTime];
        await conn.execute(query, values);
        console.log("Image path and time saved to DB");
    } catch (err) {
        console.error("Failed to insert into DB:", err);
        return res.status(500).send("Image saved but DB insert failed");
    }



    fs.writeFileSync(filepath, req.body);
    console.log(`Image received and saved as ${filename}`);
    const mailOptions = {
        from: "ameernagarasi6@gmail.com",
        to: savedEmail,
        subject: "📸 An Unknown Face Detected!",
        text: "Hey! A new face has been captured. Check the image attached.",
        attachments: [
            {
                filename: filename,
                path:  filepath
            }
        ]
    };
    console.log("Sending to:", savedEmail);

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).send(`Failed to send email: ${error.message}`);
        }
        console.log("Email sent:", info.response);
        res.send("Image saved and email sent!");
    });

    
});

app.get("/getimg",async(req,res)=>{
    const query="select * from records";
    try {
        const [data]=await conn.execute(query);
        res.status(200).json(data);
        
    } catch (error) {
        res.status(500).json({error:error});
        
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
