import multer from 'multer';
import { Request } from 'express';


const fileFilter = (req: Request, file: any, cb: any) => {

    const allowedExtensions = [
        '.pdf', //pdf
        '.png', '.jpeg', '.jpg', '.heic',    //image
        '.doc', '.docx',    //doc
        '.ppt', '.pptx', '.pptm', '.pot', '.potx', '.potm', '.pps', '.ppsx', '.ppsm',    //ppt
        '.webm', '.mkv', '.gif', '.avi', '.mov', '.amv', '.mp4', '.m4p', '.m4v', '.3gp',    //video
        '.zip', '.7z', '.rar', '.tar', '.gz', '.bz2', '.xz', '.tgz', '.tbz', '.txz', '.z', '.lz', '.cab', '.iso', '.jar', '.deb', '.rpm', '.sit', '.sea',   //zip
        '.c', '.cpp', '.pine', '.java', '.py', '.html', '.css', '.js', '.php', '.rb', '.swift', '.go', '.pl', '.sql', '.xml', '.json', '.yaml', '.yml', '.ini', '.cfg', '.conf',    //files
        '.xls', '.xlsx',    //xls
        '.svg', //svg
    ];


    const originalname = file.originalname;
    const fileExtension = originalname.slice(((originalname.lastIndexOf(".") - 1) >>> 0) + 2);


    if (allowedExtensions.includes('.' + fileExtension.toLowerCase())) {

        cb(null, true);
    } else {

        cb(new Error('Invalid file extension'));
    }
};


const storage = multer.memoryStorage();

const uploadFile = {

    upload: multer({
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // Set limit to 10MB
        fileFilter: fileFilter
    })
}


export default uploadFile