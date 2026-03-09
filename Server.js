const mongoose = require('mongoose')
const News = require("./Details")
const User = require("./User.js")
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 8000
const API_KEY = process.env.API_KEY
const fs = require('fs'); 


const multer = require('multer');
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploded-images');
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('file');

app.use(express.json())   

let uri = `mongodb+srv://developer0exe:321321@insights.c5adzzl.mongodb.net/`
mongoose.connect(uri)


const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
    cloud_name: 'drxhp8vhx', 
    api_key: '341522599126842', 
    api_secret: '-1LqPTfukFg0WnRQFnWAfufLiYQ' // Click 'View API Keys' above to copy your API secret
});

const allowedOrigins = [
  'https://frontend-w71v.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
}));

app.listen(port , () =>{
    console.log(`example app listening at http://localhost:${port}`)
})

app.get('/',(req , res) =>{
    console.log("server running on port",port)
    res.json({"connection" : true})
})


app.get('/news',async(req , res) =>{
    await mongoose.connect(uri)
    console.log("server running on /news")  
    let length = await News.countDocuments()
    let newss = await News.find({})
    console.log(newss,length)
    let newnews = newss.reverse()
    res.status(200).json(newss)
})


app.get('/news/:id',async(req , res) =>{
    await mongoose.connect(uri)
    console.log("server running on /news/:id",port)
    console.log(req.params.id)
    console.log(req.url,req.params)
    let input = req.params.id
    let newss = await News.find({_id:input})
    console.log(newss)
    if(!!newss){
        res.status(200).json(newss)
        console.log('completed')
    }

})

app.post('/add' ,async(req,res)=>{
    console.log("server running on /add")
    await mongoose.connect(uri)
    console.log(req.body)

    let input = req.body
    const user = new News({ headlines:input.headlines , content : input.content  , date : input.time, AuthorName : input.author , email : input.authorEmail , URL : input.Imageurl})
    await user.save()   
})

app.post('/delete', async (req, res) => {
  try {
      console.log("Server running on /delete");

      await mongoose.connect(uri);
      console.log(req.body);

      let input = req.body;

      const news = await News.findOne({ _id: input.id });
      console.log(news);

      if (news) {
         
          if (news.email === input.mail) {
              console.log("Deleting the news item...");
              await News.deleteOne({ _id: input.id });
              console.log("Deleted successfully");

             
              res.status(200).json({ message: "News item deleted successfully" });
          } else {
              console.log("Email does not match the one associated with this article");
              res.status(400).json({ message: "Email mismatch" });
          }
      } else {
          console.log("News item not found");
          res.status(404).json({ message: "News item not found" });
      }
  } catch (error) {
      console.error("Error during deletion:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});



// **********************************************************************************************************************************
let cloudinary_Generated_Url_of_Image;
async function getfile_url(fileroute) {
  try {
    const result = await cloudinary.uploader.upload(fileroute);
    console.log('Uploaded image URL:', result.secure_url); // Log the URL of the uploaded image
    cloudinary_Generated_Url_of_Image = result.secure_url;
    return result.secure_url; // Return the secure URL from Cloudinary
  } catch (error) {
    throw new Error('Error uploading image to Cloudinary');
  }
}


app.post('/upload', async (req, res) => {
    console.log("Uploading data...");
  
    // Use multer to handle the upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      // Path of the uploaded file
      let fileroute = req.file.path;
  
      try {
        // Upload to Cloudinary and get URL
        const cloudinaryUrl = await getfile_url(fileroute);
        res.json({imageUrl: cloudinary_Generated_Url_of_Image}); // Return the Cloudinary image URL as a response
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
      }

      fs.unlink(fileroute, (deleteErr) => {
        if (deleteErr) {
          console.error('Error deleting local file:', deleteErr);
        } else {
          console.log('Local file deleted successfully');
        }
    })


    });

    

});

