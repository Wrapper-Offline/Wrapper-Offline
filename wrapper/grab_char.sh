#!/bin/bash
start=$1;end=$2;
offset=${3:-$start};

for (( i = 0; i <= end - start; i++ ))
do
	num=$(echo 000000$((i + offset)) | tail -c 8)
	curl "http://localhost:4343/characters/c-$((i + start))" -o "_SAVED/char-$num.xml" -s;
	if [ ! -s "_SAVED/char-$num.xml" ]; then rm "_SAVED/char-$num.xml"; break; fi
	echo $((i + offset));
done
