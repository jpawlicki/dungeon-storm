#!/bin/bash
tools/build.sh;
(find . -not -path '*/.*' -type d | sed 's/.*/mkdir pawlicki.kaelri.com\/ds\/\0\nchmod 755 pawlicki.kaelri.com\/ds\/\0/'; tools/list_upload_files.sh | sed 's/.*/put \0 pawlicki.kaelri.com\/ds\/\0\nchmod 0644 pawlicki.kaelri.com\/ds\/\0/') | sftp jpawlick@ps561277.dreamhostps.com
