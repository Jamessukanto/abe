#! /bin/bash

set -eux

yarn run -T tsx ../../../../frontend/shared/features/annotator/internal/scripts/workers/dev.ts --var ASSET_UPLOAD_ORIGIN:http://localhost:8788
