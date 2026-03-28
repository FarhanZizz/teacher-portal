<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$route['default_controller'] = 'welcome';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

// Auth Routes
$route['api/auth/register']['POST']  = 'Auth/register';
$route['api/auth/login']['POST']     = 'Auth/login';
$route['api/auth/logout']['POST']    = 'Auth/logout';
$route['api/auth/me']['GET']         = 'Auth/me';

// Teacher Routes (protected)
$route['api/teachers']['GET']        = 'Teachers/index';
$route['api/teachers']['POST']       = 'Teachers/create';
$route['api/teachers/(:num)']['GET'] = 'Teachers/show/$1';
$route['api/teachers/(:num)']['PUT'] = 'Teachers/update/$1';
$route['api/teachers/(:num)']['DELETE'] = 'Teachers/delete/$1';

// Auth users route (protected)
$route['api/users']['GET']           = 'Users/index';
$route['api/users/(:num)']['GET']    = 'Users/show/$1';

// OPTIONS preflight
$route['api/(.+)']['OPTIONS']        = 'Options/preflight';
