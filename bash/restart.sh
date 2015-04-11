#!/bin/bash

# restart with git and forever

echo 'starting BandPad with forever'

    echo "Stoping node thread"
    forever stop hendrix-bandpad.js

    echo "Restarting Hendrix BandPad"
    # user
    forever start hendrix-bandpad.js --production


