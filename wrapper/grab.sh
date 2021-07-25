#!/bin/bash
start=$1;end=$2;
offset=${3:-$start};

for (( i = 0; i <= end - start; i++ ))
do
	num=$(echo 000000$((i + offset)) | tail -c 8)
	curl "http://localhost:4343/movies/m-$((i + start))" -o "_SAVED/movie-$num.xml" -s;
	curl "http://localhost:4343/movie_thumbs/m-$((i + start))" -o "_SAVED/thumb-$num.png" -s;
	if [ ! -s "_SAVED/thumb-$num.png" ]; then rm "_SAVED/movie-$num.xml"; rm "_SAVED/thumb-$num.png"; fi
	echo $((i + offset));
done
