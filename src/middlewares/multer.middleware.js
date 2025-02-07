import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
  destination : function(req,file,cb) {
    cb(null,"./src/uploads")
  },
  filename : function(req,file,cb){
    cb(null,`${Date.now()}-${file.originalname}`)
  } 
})

class filterFile{
  static check(file){
    const allowfiles = ["mp4","mov","avi","mkv","flv","webm","jpg","jpeg","png","svg"]
    const extensionName = path.extname(file.originalname).replace(".","")
    const mimtype = file.mimetype.split("/")[1]
    // console.log(mimtype)
    if(!allowfiles.includes(extensionName)) return {check : false,msg : "extension not allowed"}
    if(!allowfiles.includes(mimtype)) return {check : false , msg : "this mimtype not allowed"}
    return {check : true,msg : ""}
  }
}

const filter = (req,file,cb)=>{
  try {
    const res = filterFile.check(file)
  if(!res.check){
    cb(res.msg,false)
  }
  cb(null,true)
  } catch (error) {
    console.log(error.message)
  }
}

export const upload = multer({
    storage : storage,
    limits : { fileSize: 5 * 1024 * 1024 },
    fileFilter : filter
})