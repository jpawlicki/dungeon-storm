#!/bin/bash
(find . -not -path '*/.*' -type d | sed 's/.*/mkdir pawlicki.kaelri.com\/ds\/\0\nchmod 755 pawlicki.kaelri.com\/ds\/\0/'; find . -not -path '*/.*' -type f -not -name '*.sh' | sed 's/.*/put \0 pawlicki.kaelri.com\/ds\/\0\nchmod 0644 pawlicki.kaelri.com\/ds\/\0/') | sftp jpawlick@ps561277.dreamhostps.com
