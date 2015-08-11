#!/bin/bash

if [ -z "$CURRENT_TEST" ] then
  CURRENT_TEST=$TEST
else
  if ["$CURRENT_TEST" != "$TEST"] then
    CURRENT_TEST = $TEST
    ##kill locustio respawn will restarted again
  fi
fi
