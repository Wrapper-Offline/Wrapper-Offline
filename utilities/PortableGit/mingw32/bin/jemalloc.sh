#!/bin/sh

prefix=/mingw32
exec_prefix=/mingw32
libdir=${exec_prefix}/lib

LD_PRELOAD=${libdir}/libjemalloc.dll
export LD_PRELOAD
exec "$@"
