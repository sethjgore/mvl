<?php

/**
 * Craft by Pixel & Tonic
 *
 * @package   Craft
 * @author    Pixel & Tonic, Inc.
 * @copyright Copyright (c) 2014, Pixel & Tonic, Inc.
 * @license   http://buildwithcraft.com/license Craft License Agreement
 * @link      http://buildwithcraft.com
 */

/**
 * DO NOT EDIT THIS FILE.
 *
 * This file is subject to be overwritten by a Craft update at any time.
 *
 * If you want to change any of these settings, copy it into
 * craft/config/rediscache.php, and make your change there.
 */

return array(
	/**
	 * Hostname to use for connecting to the redis server. Defaults to 'localhost'.
	 */
	'hostname' => 'localhost',

	/**
	 * The port to use for connecting to the redis server. Default port is 6379.
	 */
	'port' => 6397,

	/**
	 * The password to use to authenticate with the redis server. If not set, no AUTH command will be sent.
	 */
	'password' => '',

	/**
	 * The redis database to use. This is an integer value starting from 0. Defaults to 0.
	 */
	'database' => 0,

	/**
	 * Timeout to use for connection to redis. If not set the timeout set in php.ini will be used: ini_get("default_socket_timeout")
	 */
	'timeout' => null,
);
