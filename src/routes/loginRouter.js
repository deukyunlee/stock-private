const router = require("express").Router();
const Usercontroller = require("../controllers/userController");
const account = require('../controllers/verifyToken');

/*#################
    유저관련
###################*/

// url => '/login'

//유저 삭제
router.delete('/',account.verifyToken, Usercontroller.deleteAccount );

// 자동 로그인
router.get('/auto-login', account.verifyToken, Usercontroller.autoLogin)

// 유저 생성 및 회원 정보 요청, social_login
// url => '/login/${social_name}'
router.post('/kakao', Usercontroller.kakaologin);
// router.post('/google', social_login.googlelogin);


module.exports = router;
