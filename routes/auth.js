const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const User = require('../models/User.model')

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', (req, res) => {
  const { username, password } = req.body;
  
  //hash the password
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashPassword = bcrypt.hashSync(password, salt);

  if(username == '' || password == '') {
    res.render('signup' , 
    {
      errorMessage: 'Indicate username and password'
    });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if(!regex.test(password)) {
    res.render('signup' , 
    {
      errorMessage: 'Password does not meet the criteria'
    })
    return;
  }

  User.findOne({'username': username})
    .then((user) => {
      if(user) {  
        res.render('auth/signup', {
          errorMessage: 'The username already exists'
        })
        return;
      }
      User.create({ username, password: hashPassword})
      .then(() => {
        res.redirect('/');
      })
      .catch((err) => {  
        if (err.code === 11000) {  
          res.status(500). 
          render('auth/signup', {
            errorMessage: 'Username needs to be unique'
          })
        } else {
          res.render('auth/signup', {
            errorMessage: err
          })
        }
      })
    });
  
});


//LOGIN
router.get('/login', (req, res) => {
  res.render('login');
})
 
router.post('/login', (req, res) => {
 
  const { username, password } = req.body;
 
  if(!username || !password) {
    res.render('login', {
      errorMessage: 'Please enter username and password'
    });
    return;
  }
 
  User.findOne({'username': username})
    .then((user) => {
      if(!user) {
        res.render('login', {
          errorMessage: 'Invalid login'
        })
        return;
      }
 
      if(bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;       
        res.render('index', { user });
        console.log(user);
 
      } else {
        res.render('login', {
          errorMessage: 'Invalid login' 
        })
      }
    });
});

//LOG OUT 
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/')
})


module.exports = router;