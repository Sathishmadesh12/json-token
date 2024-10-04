const express = require('express');
const regesterRoute = require('./regester.route');
// const regesterRoute = require('./course.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/regester',
    route: regesterRoute,
  },
  {
    path: '/login',
    route: regesterRoute,
  },
  // {
  //   path: '/change-password',
  //   route:regesterRoute,
  // },
  // {
  //   path: '/number',
  //   route:numberRoute,
  // },
  // {
  //   path: '/customer',
  //   route:customerRoute,
  // },
  // {
  //   path: '/student',
  //   route:studentRoute,
  // },
];
defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
