import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import { randomUUID } from "crypto"
import fs from "fs"

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const uploadDirectory = path.resolve(currentDir, "../../public/temp")
fs.mkdirSync(uploadDirectory, { recursive: true })

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory)
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${randomUUID()}-${file.originalname}`)
    }
})

const upload = multer({ storage })

export { upload }
