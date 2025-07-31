#!/bin/bash

template_name="$1"
workspace_root="$(git rev-parse --show-toplevel)"

if [ -z "$template_name" ]; then
    echo "Usage: yarn dev-template <template_name>"
    echo "No templates available"
	exit 1
fi

echo "Templates have been removed from this repository" 
