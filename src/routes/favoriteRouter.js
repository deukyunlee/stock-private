const router = require("express").Router();
const account = require('../controllers/verifyToken');
const favorite = require('../controllers/favoriteController');


/*#################
    즐겨찾기 CURD
###################*/

// url => '/favorite'

router.get('/all', account.verifyToken, favorite.list);

router.post('/', account.verifyToken, favorite.add );
router.delete('/', account.verifyToken, favorite.delete );



module.exports = router;
