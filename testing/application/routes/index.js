var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res, next) {
        res.render('dashboard');
});

router.get('/dashboard/client', function(req, res, next) {
        res.render('client', {title: 'Client Portal'});
});

router.get('/dashboard/doctor', function(req, res, next) {
        res.render('doctor', {title: 'Doctor Portal'});
});



module.exports = router;
