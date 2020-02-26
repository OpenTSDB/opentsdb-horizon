#!/bin/bash -x

yinst_create --debug -t release -clean -target_dir $PUBLISH_DIR  $SOURCE_DIR/yahoo/horizon.yicf
yes | dist_install -batch -identity ~/.ssh/rsa_dist -headless -branch test -nomail $PUBLISH_DIR/*.tgz