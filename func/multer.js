const mm = require('multer')
const path = require('path')



const multer = mm({
    //저장 공간 위치 (저장할 때)
    
    storage: mm.diskStorage({
        //req : 요청정보
        //file : 업로드된 파일
        //cb : 콜백함수 - 실행
        //ds/업로드파일명
        destination: (req, file, cb)=> {    //저장 위치(폴더)
            cb(null, 'img') //cb : err 또는 null, 'dst' : 저장 폴더, 없으면 실행안됨
        },
        filename: (req, file, cb)=>{        //저장될때 파일명
            const ext = path.extname(file.originalname) //확장자명
            //Date.now() : timestamp
            cb(null, path.basename(file.originalname,ext)+Date.now()+ext)     //cb : error
        }
    }),
    
    //파일 크기 - 단일파일 : array인 경우 각 파일크기 제한임 (전체크기 합산이 아님)
    limits: { fileSize : 5 * 1024 * 1024 },

    //파일 필터링 (저장하기 전)
    fileFilter: (req, file, cb)=>{
        const alllowedTypes = ['image/jpeg', 'image/png']

        console.log(`file.mimetype: ${file.mimetype}`)
        //file.mimetype: 업로드 파일 형식
        if(alllowedTypes.includes(file.mimetype)) {
            //파일 허용
            cb(null, true)
        } else {
            //파일 거부
            cb(new Error('파일형식거부'), false)
        }
    }
})

module.exports = {multer}