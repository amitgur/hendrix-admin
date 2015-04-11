#!/bin/bash

# restart with git and forever

echo 'starting BandPad with forever'

    echo "Stoping node thread"
    forever stop hendrix-admin.js

    echo "Restarting Hendrix BandPad"
    # user
    forever start hendrix-admin.js --production


