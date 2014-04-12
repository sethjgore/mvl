<?php

/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/general.php
 */

return array(
    '*' => array(
      'omitScriptNameInUrls'=>true
    ),
    '0.0.0.0' => array(
      'devMode' => true,
      'useCompressedJs' => false,
      'environmentVariables' => array(
            'siteUrl'        => 'http://0.0.0.0:9999/clients/mvl/site',
            'fileSystemPath' => '/'
        )
    ),
    '192.168.0.6' => array(
      'devMode' => true,
      'useCompressedJs' => false,
      'environmentVariables' => array(
            'siteUrl'        => 'http://192.0.168.6:9999/clients/mvl/site',
            'fileSystemPath' => '/'
        )
    ),
    'clients.sjgore.com' => array(
      'useCompressedJs' => false,
      'environmentVariables' => array(
            'siteUrl'        => 'http://clients.sjgore.com/',
            'fileSystemPath' => '/'
        )
    )

);
